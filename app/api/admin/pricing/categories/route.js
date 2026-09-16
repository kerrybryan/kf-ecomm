import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CategoryPricingTemplate from '@/models/CategoryPricingTemplate';

export const dynamic = 'force-dynamic';

const DEFAULT_TEMPLATES = [
  {
    category: 'Sofas & Couches',
    slug: 'sofas-and-couches',
    description: 'Living room modular, 3-seater, and corner sectionals',
    materialInputs: [
      { materialName: 'Solid Hardwood (Oak / Walnut / Wanza)', unitLabel: 'meters', defaultQuantity: 8, helpText: 'Internal frame timber' },
      { materialName: 'Premium Cotton / Boucle Upholstery', unitLabel: 'meters', defaultQuantity: 12, helpText: 'Outer upholstery fabric' },
      { materialName: 'High-Density Foam (32kg/m³)', unitLabel: 'kg', defaultQuantity: 16, helpText: 'Seat base cushioning' },
      { materialName: 'Soft Cushion Dacron Fiber', unitLabel: 'kg', defaultQuantity: 4, helpText: 'Plush back pillow batting' },
      { materialName: 'Screws, Dowels & Structural Brackets', unitLabel: 'sets', defaultQuantity: 1, helpText: 'Joinery fasteners' },
    ],
    laborHoursDefault: 16,
    laborRatePerHour: 250,
    overheadPercentDefault: 15,
    markupMultiplierDefault: 2.1,
  },
  {
    category: 'Cabinets & Credenzas',
    slug: 'cabinets-and-credenzas',
    description: 'Storage credenzas, sideboards, wardrobes, and media consoles',
    materialInputs: [
      { materialName: 'MDF / Plywood Sheet (18mm)', unitLabel: 'sq meters', defaultQuantity: 6, helpText: 'Carcase & internal shelving' },
      { materialName: 'Solid Hardwood (Oak / Walnut / Wanza)', unitLabel: 'meters', defaultQuantity: 3, helpText: 'Face frame and solid top' },
      { materialName: 'Heavy-Duty Soft-Close Hinges', unitLabel: 'pairs', defaultQuantity: 4, helpText: 'Door mechanism' },
      { materialName: 'Brushed Brass / Matte Black Handles', unitLabel: 'units', defaultQuantity: 4, helpText: 'Cabinet hardware pulls' },
      { materialName: 'Polyurethane Wood Finish / Varnish', unitLabel: 'liters', defaultQuantity: 2, helpText: 'Protective satin seal' },
      { materialName: 'Screws, Dowels & Structural Brackets', unitLabel: 'sets', defaultQuantity: 1, helpText: 'Assembly kit' },
    ],
    laborHoursDefault: 14,
    laborRatePerHour: 250,
    overheadPercentDefault: 15,
    markupMultiplierDefault: 2.0,
  },
  {
    category: 'Dining Tables',
    slug: 'dining-tables',
    description: 'Solid wood family dining tables and conference tables',
    materialInputs: [
      { materialName: 'Solid Hardwood (Oak / Walnut / Wanza)', unitLabel: 'meters', defaultQuantity: 11, helpText: 'Solid timber tabletop & apron' },
      { materialName: 'Powder-Coated Steel Frame / Legs', unitLabel: 'units', defaultQuantity: 1, helpText: 'Steel base or turned wooden legs' },
      { materialName: 'Polyurethane Wood Finish / Varnish', unitLabel: 'liters', defaultQuantity: 3, helpText: 'Heat & stain resistant table top coat' },
      { materialName: 'Screws, Dowels & Structural Brackets', unitLabel: 'sets', defaultQuantity: 1, helpText: 'Heavy structural bolts' },
    ],
    laborHoursDefault: 12,
    laborRatePerHour: 250,
    overheadPercentDefault: 15,
    markupMultiplierDefault: 2.0,
  },
  {
    category: 'Dining Chairs',
    slug: 'dining-chairs',
    description: 'Upholstered and solid wood dining chairs',
    materialInputs: [
      { materialName: 'Solid Hardwood (Oak / Walnut / Wanza)', unitLabel: 'meters', defaultQuantity: 3.5, helpText: 'Chair frame and legs' },
      { materialName: 'Premium Cotton / Boucle Upholstery', unitLabel: 'meters', defaultQuantity: 1.5, helpText: 'Seat upholstery' },
      { materialName: 'High-Density Foam (32kg/m³)', unitLabel: 'kg', defaultQuantity: 2, helpText: 'Seat foam pad' },
      { materialName: 'Polyurethane Wood Finish / Varnish', unitLabel: 'liters', defaultQuantity: 0.5, helpText: 'Wood finish' },
      { materialName: 'Screws, Dowels & Structural Brackets', unitLabel: 'sets', defaultQuantity: 1, helpText: 'Joinery kit' },
    ],
    laborHoursDefault: 5,
    laborRatePerHour: 250,
    overheadPercentDefault: 15,
    markupMultiplierDefault: 2.0,
  },
  {
    category: 'Beds & Headboards',
    slug: 'beds-and-headboards',
    description: 'King, queen, and platform beds with upholstered headboards',
    materialInputs: [
      { materialName: 'Solid Hardwood (Oak / Walnut / Wanza)', unitLabel: 'meters', defaultQuantity: 10, helpText: 'Bed frame rails & legs' },
      { materialName: 'MDF / Plywood Sheet (18mm)', unitLabel: 'sq meters', defaultQuantity: 4, helpText: 'Solid mattress support slats' },
      { materialName: 'Premium Cotton / Boucle Upholstery', unitLabel: 'meters', defaultQuantity: 5, helpText: 'Padded headboard fabric' },
      { materialName: 'High-Density Foam (32kg/m³)', unitLabel: 'kg', defaultQuantity: 4, helpText: 'Headboard cushioning' },
      { materialName: 'Screws, Dowels & Structural Brackets', unitLabel: 'sets', defaultQuantity: 2, helpText: 'Corner bed bracket hardware' },
    ],
    laborHoursDefault: 15,
    laborRatePerHour: 250,
    overheadPercentDefault: 15,
    markupMultiplierDefault: 2.0,
  },
  {
    category: 'Interior Doors',
    slug: 'interior-doors',
    description: 'Solid core and architectural modern panel doors',
    materialInputs: [
      { materialName: 'Solid Hardwood (Oak / Walnut / Wanza)', unitLabel: 'meters', defaultQuantity: 5, helpText: 'Door frame stile & rail' },
      { materialName: 'MDF / Plywood Sheet (18mm)', unitLabel: 'sq meters', defaultQuantity: 4, helpText: 'Door panels' },
      { materialName: 'Heavy-Duty Soft-Close Hinges', unitLabel: 'pairs', defaultQuantity: 2, helpText: 'Hinge hardware set' },
      { materialName: 'Polyurethane Wood Finish / Varnish', unitLabel: 'liters', defaultQuantity: 2, helpText: 'Weatherproof clear coat' },
    ],
    laborHoursDefault: 8,
    laborRatePerHour: 250,
    overheadPercentDefault: 15,
    markupMultiplierDefault: 2.0,
  },
  {
    category: 'Coffee Tables',
    slug: 'coffee-tables',
    description: 'Living room accent and coffee tables',
    materialInputs: [
      { materialName: 'Solid Hardwood (Oak / Walnut / Wanza)', unitLabel: 'meters', defaultQuantity: 4, helpText: 'Table base and trim' },
      { materialName: 'Tempered Glass Top (8mm)', unitLabel: 'sq meters', defaultQuantity: 1, helpText: 'Tabletop surface' },
      { materialName: 'Polyurethane Wood Finish / Varnish', unitLabel: 'liters', defaultQuantity: 1, helpText: 'Finish coat' },
      { materialName: 'Screws, Dowels & Structural Brackets', unitLabel: 'sets', defaultQuantity: 1, helpText: 'Fasteners' },
    ],
    laborHoursDefault: 6,
    laborRatePerHour: 250,
    overheadPercentDefault: 15,
    markupMultiplierDefault: 2.0,
  },
];

export async function GET(request) {
  try {
    await connectDB();
    let templates = await CategoryPricingTemplate.find({}).sort({ category: 1 }).lean();

    if (templates.length === 0) {
      await CategoryPricingTemplate.insertMany(DEFAULT_TEMPLATES);
      templates = await CategoryPricingTemplate.find({}).sort({ category: 1 }).lean();
    }

    return NextResponse.json({ success: true, data: templates });
  } catch (err) {
    console.error('Error fetching category templates:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.category) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    const slug = body.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const template = await CategoryPricingTemplate.create({
      category: body.category.trim(),
      slug,
      description: body.description || '',
      materialInputs: body.materialInputs || [],
      laborHoursDefault: Number(body.laborHoursDefault || 10),
      laborRatePerHour: Number(body.laborRatePerHour || 250),
      overheadPercentDefault: Number(body.overheadPercentDefault || 15),
      markupMultiplierDefault: Number(body.markupMultiplierDefault || 2.0),
    });

    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch (err) {
    console.error('Error creating category template:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
