import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MaterialRate from '@/models/MaterialRate';
import Product from '@/models/Product';
import SourcedItem from '@/models/SourcedItem';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      materialInputs = [],
      laborHours = 0,
      laborRatePerHour = 250,
      overheadPercent = 15,
      markupMultiplier = 2.0,
      customPriceOverride = null,
      saveTarget = null, // { type: 'Product' | 'SourcedItem', id: '...' }
    } = body;

    // Fetch all current material rates from database
    const allRates = await MaterialRate.find({}).lean();
    const rateMap = new Map();
    allRates.forEach((r) => {
      rateMap.set(r.materialName.toLowerCase().trim(), r);
    });

    // Calculate material cost item by item
    let materialCost = 0;
    const items = [];

    for (const input of materialInputs) {
      const nameKey = (input.materialName || '').toLowerCase().trim();
      const dbRate = rateMap.get(nameKey);
      const costPerUnit = Number(input.costPerUnit !== undefined ? input.costPerUnit : (dbRate?.costPerUnit || 0));
      const quantity = Math.max(0, Number(input.quantity || 0));
      const total = Math.round(quantity * costPerUnit);

      materialCost += total;
      items.push({
        materialName: input.materialName || 'Custom Material',
        quantity,
        unit: input.unit || dbRate?.unit || 'unit',
        costPerUnit,
        total,
      });
    }

    const hours = Math.max(0, Number(laborHours));
    const rate = Math.max(0, Number(laborRatePerHour));
    const laborCost = Math.round(hours * rate);

    const subtotal = materialCost + laborCost;
    const overheadPct = Math.max(0, Number(overheadPercent));
    const overhead = Math.round(subtotal * (overheadPct / 100));

    const totalCost = subtotal + overhead;
    const markup = Math.max(1.0, Number(markupMultiplier));
    const suggestedPrice = Math.round(totalCost * markup);
    const finalPrice = customPriceOverride !== null && Number(customPriceOverride) > 0
      ? Math.round(Number(customPriceOverride))
      : suggestedPrice;

    const profitMarginBirr = finalPrice - totalCost;
    const marginPercent = finalPrice > 0 ? Math.round((profitMarginBirr / finalPrice) * 100) : 0;

    const costBreakdown = {
      materialCost,
      laborCost,
      subtotal,
      overhead,
      overheadPercent: overheadPct,
      totalCost,
      markupMultiplier: markup,
      suggestedPrice,
      finalPrice,
      profitMarginBirr,
      marginPercent,
      items,
      laborHours: hours,
      laborRatePerHour: rate,
      calculatedAt: new Date(),
    };

    // If saveTarget is specified, persist to database
    let savedTargetDoc = null;
    if (saveTarget?.type && saveTarget?.id) {
      if (saveTarget.type === 'Product') {
        savedTargetDoc = await Product.findByIdAndUpdate(
          saveTarget.id,
          {
            price: finalPrice,
            costBreakdown,
          },
          { new: true }
        );
      } else if (saveTarget.type === 'SourcedItem') {
        savedTargetDoc = await SourcedItem.findByIdAndUpdate(
          saveTarget.id,
          {
            price: finalPrice,
            costBreakdown,
            status: 'priced',
          },
          { new: true }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        costBreakdown,
        savedTarget: savedTargetDoc ? { id: savedTargetDoc._id, name: savedTargetDoc.name, price: finalPrice } : null,
      },
    });
  } catch (err) {
    console.error('Pricing calculation error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
