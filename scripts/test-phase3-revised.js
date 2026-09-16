const http = require('http');

const PORT = 3000;
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://localhost:${PORT}${path}`,
      {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(body);
          } catch (e) {}
          resolve({ status: res.statusCode, headers: res.headers, body, json });
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runSuite() {
  console.log('==================================================');
  console.log('TEST SUITE: Phase 3 Revised (Pricing + Content Studio)');
  console.log('==================================================\n');

  try {
    // 1. Material Rates Endpoint
    console.log('--- 1. Raw Material Master Rates ---');
    const matRes = await request('/api/admin/pricing/materials');
    assert(matRes.status === 200, 'GET /api/admin/pricing/materials returned 200 OK');
    assert(matRes.json && matRes.json.success === true, 'Material rates response success is true');
    assert(matRes.json?.data?.length >= 5, `Material rates seeded (${matRes.json?.data?.length} materials)`);

    const woodMat = matRes.json?.data?.find((m) => m.materialName.includes('Solid Hardwood'));
    assert(woodMat && woodMat.costPerUnit > 0, `Solid Hardwood rate exists (${woodMat?.costPerUnit} Birr/meter)`);

    // 2. Category Pricing Templates Endpoint
    console.log('\n--- 2. Category Pricing Templates ---');
    const catRes = await request('/api/admin/pricing/categories');
    assert(catRes.status === 200, 'GET /api/admin/pricing/categories returned 200 OK');
    assert(catRes.json && catRes.json.success === true, 'Category templates response success is true');
    assert(catRes.json?.data?.length >= 5, `Category templates seeded (${catRes.json?.data?.length} categories)`);

    const sofaTpl = catRes.json?.data?.find((t) => t.category === 'Sofas & Couches');
    assert(sofaTpl && sofaTpl.materialInputs?.length >= 3, 'Sofas & Couches template has materials configured');
    assert(sofaTpl?.laborHoursDefault > 0, `Sofas default labor hours set (${sofaTpl?.laborHoursDefault}h)`);

    // 3. Live Pricing Calculation Math
    console.log('\n--- 3. Live Pricing Calculator Math Verification ---');
    const calcPayload = {
      materialInputs: [
        { materialName: 'Solid Hardwood (Oak / Walnut / Wanza)', quantity: 8, costPerUnit: 1800, unit: 'meter' },
        { materialName: 'Premium Cotton / Boucle Upholstery', quantity: 12, costPerUnit: 950, unit: 'meter' },
        { materialName: 'High-Density Foam (32kg/m³)', quantity: 16, costPerUnit: 450, unit: 'kg' },
        { materialName: 'Soft Cushion Dacron Fiber', quantity: 4, costPerUnit: 280, unit: 'kg' },
      ],
      laborHours: 16,
      laborRatePerHour: 250,
      overheadPercent: 15,
      markupMultiplier: 2.1,
    };

    // Expected values:
    // Mat: (8*1800) + (12*950) + (16*450) + (4*280) = 14400 + 11400 + 7200 + 1120 = 34120 Birr
    // Labor: 16 * 250 = 4000 Birr
    // Subtotal: 34120 + 4000 = 38120 Birr
    // Overhead (15%): 38120 * 0.15 = 5718 Birr
    // Total Cost: 38120 + 5718 = 43838 Birr
    // Suggested (2.1x): Math.round(43838 * 2.1) = 92060 Birr

    const calcRes = await request('/api/admin/pricing/calculate', {
      method: 'POST',
      body: calcPayload,
    });
    assert(calcRes.status === 200, 'POST /api/admin/pricing/calculate returned 200 OK');
    const b = calcRes.json?.data?.costBreakdown;
    assert(b?.materialCost === 34120, `Material Cost calculated accurately: ${b?.materialCost} Birr (expected 34,120)`);
    assert(b?.laborCost === 4000, `Labor Cost calculated accurately: ${b?.laborCost} Birr (expected 4,000)`);
    assert(b?.overhead === 5718, `Overhead calculated accurately: ${b?.overhead} Birr (expected 5,718)`);
    assert(b?.totalCost === 43838, `Total Cost calculated accurately: ${b?.totalCost} Birr (expected 43,838)`);
    assert(b?.suggestedPrice === 92060, `Suggested Price calculated accurately: ${b?.suggestedPrice} Birr (expected 92,060)`);

    // 4. Source Studio Workflow (No AI)
    console.log('\n--- 4. Source Studio Simplified Flow (No AI) ---');
    const sourceCreateRes = await request('/api/admin/source-studio', {
      method: 'POST',
      body: {
        name: 'Addis Minimalist Lounge Chair',
        category: 'Dining Chairs',
        imageInput: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
        notes: 'Locally crafted test chair',
      },
    });

    assert(sourceCreateRes.status === 200, 'POST /api/admin/source-studio created piece');
    const sourcedItem = sourceCreateRes.json?.data;
    assert(sourcedItem && sourcedItem.status === 'new', 'Sourced piece starts in "new" status');
    assert(sourcedItem.price === 0, 'Sourced piece is initially unpriced');

    // 5. Price First Server-Side Gate (Part C.1)
    console.log('\n--- 5. Price First Server-Side Gate (Part C.1) ---');
    // Attempt export while unpriced -> must return 403 Forbidden
    const blockedExportRes = await request('/api/admin/content-studio/export', {
      method: 'POST',
      body: {
        targetId: sourcedItem._id,
        targetType: 'SourcedItem',
        platform: 'instagram_feed',
        format: 'image',
      },
    });

    assert(
      blockedExportRes.status === 403,
      `Unpriced item export correctly BLOCKED with 403 Forbidden (status ${blockedExportRes.status})`
    );
    assert(
      blockedExportRes.json?.locked === true,
      'Response confirms locked: true'
    );
    assert(
      blockedExportRes.json?.error?.includes('Set a price for this item before downloading content'),
      'Error message matches spec: "Set a price for this item before downloading content for social media."'
    );

    // Now price the item via Pricing Calculator
    console.log('\n--- 6. Saving Final Price & Unlocking Export ---');
    const savePriceRes = await request('/api/admin/pricing/calculate', {
      method: 'POST',
      body: {
        materialInputs: [
          { materialName: 'Solid Hardwood (Oak / Walnut / Wanza)', quantity: 3.5, costPerUnit: 1800, unit: 'meter' },
          { materialName: 'Premium Cotton / Boucle Upholstery', quantity: 1.5, costPerUnit: 950, unit: 'meter' },
        ],
        laborHours: 5,
        laborRatePerHour: 250,
        overheadPercent: 15,
        markupMultiplier: 2.0,
        saveTarget: {
          type: 'SourcedItem',
          id: sourcedItem._id,
        },
      },
    });

    assert(savePriceRes.status === 200, 'Price saved to SourcedItem');
    const savedPrice = savePriceRes.json?.data?.costBreakdown?.finalPrice;
    assert(savedPrice > 0, `Final price written to SourcedItem: ${savedPrice} Birr`);

    // Retry export on now-priced item -> must succeed with 200 OK
    const allowedExportRes = await request('/api/admin/content-studio/export', {
      method: 'POST',
      body: {
        targetId: sourcedItem._id,
        targetType: 'SourcedItem',
        platform: 'instagram_feed',
        format: 'image',
        settings: {
          canvasDimensions: { width: 1080, height: 1350 },
          watermarkApplied: true,
        },
      },
    });

    assert(allowedExportRes.status === 200, 'Priced item export SUCCEEDED with 200 OK');
    assert(allowedExportRes.json?.data?.priceAtExport === savedPrice, 'Export record verified finalized price');

    // 7. Content Studio Assets (Stickers & Audio)
    console.log('\n--- 7. Content Studio Assets ---');
    const assetRes = await request('/api/admin/content-studio/assets');
    assert(assetRes.status === 200, 'GET /api/admin/content-studio/assets returned 200 OK');
    const stickers = assetRes.json?.data?.filter((a) => a.type === 'sticker');
    const audio = assetRes.json?.data?.filter((a) => a.type === 'audio');
    assert(stickers?.length >= 4, `Sales stickers available (${stickers?.length} stickers)`);
    assert(audio?.length >= 2, `Royalty-free audio tracks available (${audio?.length} tracks)`);

    // 8. Admin Frontend Pages Audit
    console.log('\n--- 8. Admin Frontend Pages Audit (With Admin Session) ---');
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({ userId: '6a89b1234567890123456789', role: 'super_admin', exp: Math.floor(Date.now() / 1000) + 86400 })).toString('base64');
    const adminCookie = `kb_furniture_token=${header}.${payload}.mockSignature`;

    const pages = [
      '/admin/pricing/materials',
      '/admin/pricing/categories',
      '/admin/pricing/calculate',
      '/admin/source-studio',
      '/admin/source-studio/new',
      '/admin/content-studio',
    ];

    for (const p of pages) {
      const pageRes = await request(p, {
        headers: { Cookie: adminCookie },
      });
      assert(pageRes.status === 200, `${p.padEnd(30)} -> 200 OK`);
    }

    console.log('\n==================================================');
    console.log(`SUMMARY: ${passed}/${passed + failed} tests passed`);
    console.log('==================================================');
  } catch (err) {
    console.error('Test runner encountered fatal error:', err);
  }
}

runSuite();
