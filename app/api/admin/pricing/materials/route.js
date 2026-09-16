import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MaterialRate from '@/models/MaterialRate';

export const dynamic = 'force-dynamic';

const DEFAULT_MATERIALS = [
  { materialName: 'Solid Hardwood (Oak / Walnut / Wanza)', unit: 'meter', costPerUnit: 1800, categoryTag: 'Wood', notes: 'Locally seasoned grade-A timber' },
  { materialName: 'MDF / Plywood Sheet (18mm)', unit: 'sq meter', costPerUnit: 1200, categoryTag: 'Wood Panels', notes: 'High density moisture resistant' },
  { materialName: 'Premium Cotton / Boucle Upholstery', unit: 'meter', costPerUnit: 950, categoryTag: 'Fabric', notes: 'Heavy-duty weave 40,000 double rubs' },
  { materialName: 'Genuine Leather Hide', unit: 'sq meter', costPerUnit: 3500, categoryTag: 'Leather', notes: 'Top grain Ethiopian leather' },
  { materialName: 'High-Density Foam (32kg/m³)', unit: 'kg', costPerUnit: 450, categoryTag: 'Foam', notes: 'Sag-resistant high resilience core' },
  { materialName: 'Soft Cushion Dacron Fiber', unit: 'kg', costPerUnit: 280, categoryTag: 'Foam', notes: 'Plush outer wrap layer' },
  { materialName: 'Heavy-Duty Soft-Close Hinges', unit: 'pair', costPerUnit: 350, categoryTag: 'Hardware', notes: 'German mechanism soft-close' },
  { materialName: 'Brushed Brass / Matte Black Handles', unit: 'unit', costPerUnit: 450, categoryTag: 'Hardware', notes: 'Solid metal cabinet pulls' },
  { materialName: 'Powder-Coated Steel Frame / Legs', unit: 'unit', costPerUnit: 2200, categoryTag: 'Metal', notes: 'Welded steel furniture legs' },
  { materialName: 'Tempered Glass Top (8mm)', unit: 'sq meter', costPerUnit: 2800, categoryTag: 'Glass', notes: 'Beveled safety glass' },
  { materialName: 'Polyurethane Wood Finish / Varnish', unit: 'liter', costPerUnit: 650, categoryTag: 'Finish', notes: 'Matte/satin protective coat' },
  { materialName: 'Screws, Dowels & Structural Brackets', unit: 'set', costPerUnit: 250, categoryTag: 'Hardware', notes: 'Fastener kit' },
];

export async function GET(request) {
  try {
    await connectDB();
    let materials = await MaterialRate.find({}).sort({ categoryTag: 1, materialName: 1 }).lean();

    // Auto-seed if empty
    if (materials.length === 0) {
      await MaterialRate.insertMany(DEFAULT_MATERIALS);
      materials = await MaterialRate.find({}).sort({ categoryTag: 1, materialName: 1 }).lean();
    }

    return NextResponse.json({ success: true, data: materials });
  } catch (err) {
    console.error('Error fetching material rates:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.materialName || body.costPerUnit === undefined) {
      return NextResponse.json(
        { success: false, error: 'Material name and cost per unit are required' },
        { status: 400 }
      );
    }

    const material = await MaterialRate.create({
      materialName: body.materialName.trim(),
      unit: body.unit || 'unit',
      costPerUnit: Number(body.costPerUnit),
      categoryTag: body.categoryTag || 'General',
      notes: body.notes || '',
    });

    return NextResponse.json({ success: true, data: material }, { status: 201 });
  } catch (err) {
    console.error('Error creating material rate:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
