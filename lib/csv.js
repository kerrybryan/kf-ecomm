import Papa from 'papaparse';

/**
 * Parses raw CSV text into validated product records ready for insertion/update
 * @param {string} csvText Raw CSV string
 * @returns {{ valid: Array, errors: Array }}
 */
export function parseProductCSV(csvText) {
  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim().toLowerCase().replace(/[\s_-]+/g, '_'),
  });

  const valid = [];
  const errors = [];

  results.data.forEach((row, index) => {
    const rowNum = index + 2; // +1 for 0-index, +1 for header line
    const name = row.name || row.product_name || row.title;
    const priceStr = row.price || row.unit_price;
    const category = row.category || row.collection || 'living-room';

    if (!name || !name.trim()) {
      errors.push({ row: rowNum, error: 'Product name is required' });
      return;
    }

    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
      errors.push({ row: rowNum, error: `Invalid price: "${priceStr}"` });
      return;
    }

    const originalPrice = row.original_price ? parseFloat(row.original_price) : null;
    const stockCount = row.stock_count ? parseInt(row.stock_count, 10) : 15;
    const inStock = row.in_stock !== undefined ? String(row.in_stock).toLowerCase() !== 'false' : stockCount > 0;

    // Parse array columns (comma, pipe, or semicolon separated)
    const splitArray = (val) => {
      if (!val) return [];
      return String(val)
        .split(/[,|;]/)
        .map((s) => s.trim())
        .filter(Boolean);
    };

    const images = splitArray(row.images || row.image_urls || row.image);
    const materials = splitArray(row.materials || row.material);
    const colors = splitArray(row.colors || row.color);

    const slug = (row.slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const productDoc = {
      name: name.trim(),
      slug,
      category: category.toLowerCase().trim(),
      price,
      originalPrice: isNaN(originalPrice) ? null : originalPrice,
      description: row.description || `${name} handcrafted with premium finishes.`,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'],
      materials,
      colors,
      specs: {
        dimensions: row.dimensions || '',
        weight: row.weight || '',
        materialDetails: row.material_details || '',
        warranty: row.warranty || '5-Year Manufacturer Warranty',
        assembly: row.assembly || 'Minimal assembly required',
        care: row.care || 'Wipe clean with a soft dry cloth.',
      },
      stockCount: isNaN(stockCount) ? 15 : stockCount,
      inStock,
      status: (row.status || 'published').toLowerCase() === 'draft' ? 'draft' : 'published',
      isFeatured: String(row.is_featured || row.featured).toLowerCase() === 'true',
      isBestSeller: String(row.is_best_seller || row.bestseller).toLowerCase() === 'true',
      trending: String(row.trending).toLowerCase() === 'true',
    };

    valid.push(productDoc);
  });

  return { valid, errors };
}

/**
 * Converts array of objects to CSV string
 * @param {Array<Object>} rows
 * @param {Array<{ key: string, label: string }>} columns
 * @returns {string}
 */
export function generateCSV(rows, columns) {
  const formattedData = rows.map((row) => {
    const formattedRow = {};
    columns.forEach((col) => {
      let val = row[col.key];
      if (val instanceof Date) {
        val = val.toISOString().split('T')[0];
      } else if (Array.isArray(val)) {
        val = val.join(', ');
      } else if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      }
      formattedRow[col.label || col.key] = val !== undefined && val !== null ? val : '';
    });
    return formattedRow;
  });

  return Papa.unparse(formattedData);
}
