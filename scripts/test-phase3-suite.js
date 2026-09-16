const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(method, path, body = null, cookie = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { Cookie: cookie } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PHASE 3 AUTOMATED TEST SUITE: SOURCE & IMAGE STUDIO');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${testName} ${detail ? `-> ${detail}` : ''}`);
      failed++;
    }
  }

  try {
    // 1. Admin Login
    console.log('\n--- 1. Admin Authentication & Session ---');
    const loginRes = await makeRequest('POST', '/api/admin/auth/login', {
      email: 'admin@kbfurniture.com',
      password: 'password123',
    });
    assert(loginRes.status === 200 && loginRes.data.success, 'Super Admin login successful');

    const setCookie = loginRes.headers['set-cookie'];
    const adminCookie = Array.isArray(setCookie) ? setCookie.map((c) => c.split(';')[0]).join('; ') : '';
    assert(Boolean(adminCookie), 'Session auth cookie acquired');

    // 2. Fetch Sourced Items List
    console.log('\n--- 2. Source Studio Directory & KPI Counts ---');
    const listRes = await makeRequest('GET', '/api/admin/source-studio', null, adminCookie);
    assert(listRes.status === 200 && listRes.data.success, 'Fetch SourcedItems list (200 OK)');
    assert(Array.isArray(listRes.data.data) && listRes.data.data.length >= 3, 'SourcedItems returned with >= 3 seeded items');
    assert(typeof listRes.data.counts?.total === 'number', 'KPI metrics returned (total, analyzing, reviewed, converted, discarded)');

    // Filter by status
    const filterRes = await makeRequest('GET', '/api/admin/source-studio?status=reviewed', null, adminCookie);
    assert(filterRes.status === 200 && filterRes.data.data.every((i) => i.status === 'reviewed'), 'Status filter ?status=reviewed works accurately');

    // 3. Create / Import New Sourced Item
    console.log('\n--- 3. Inspiration Import & Vision Analysis ---');
    const importRes = await makeRequest(
      'POST',
      '/api/admin/source-studio',
      {
        imageInput: 'https://picsum.photos/seed/test-nordic-chair/800/800',
        sourceUrl: 'https://pinterest.com/pin/architectural-scandinavian-chair',
        notes: 'Automated test inspiration upload',
      },
      adminCookie
    );
    assert(importRes.status === 200 && importRes.data.success, 'Import inspiration image via URL (200 OK)');
    const newSourcedItem = importRes.data.data;
    assert(Boolean(newSourcedItem._id), 'New SourcedItem created with unique Mongo ObjectId');
    assert(newSourcedItem.isReferenceOnly === true, 'Imported item initialized with isReferenceOnly = true');
    assert(Boolean(newSourcedItem.aiAnalysis?.furnitureType), 'Claude Vision AI analysis successfully generated furnitureType');
    assert(Array.isArray(newSourcedItem.aiAnalysis?.materials), 'Claude Vision returned array of joinery materials');
    assert(newSourcedItem.aiAnalysis?.suggestedPriceMin > 0, 'Claude Vision generated market price range min > 0');

    // 4. Re-run AI Analysis endpoint
    console.log('\n--- 4. Explicit AI Re-analysis Endpoint ---');
    const analyzeRes = await makeRequest(
      'POST',
      '/api/admin/source-studio/analyze',
      { id: newSourcedItem._id },
      adminCookie
    );
    assert(analyzeRes.status === 200 && analyzeRes.data.success, 'Trigger AI re-analysis route (200 OK)');
    assert(analyzeRes.data.data.status === 'reviewed', 'Item status updated to "reviewed"');

    // 5. Update Workshop Cost Formulas
    console.log('\n--- 5. Manufacturing Cost & Margin Calculator ---');
    const updateCostRes = await makeRequest(
      'PUT',
      `/api/admin/source-studio/${newSourcedItem._id}`,
      {
        manualOverride: {
          materialCost: 350,
          laborHours: 10,
          laborRate: 50,
          overheadPercent: 20,
          markupMultiplier: 2.5,
          finalPrice: 2550,
        },
      },
      adminCookie
    );
    assert(updateCostRes.status === 200 && updateCostRes.data.success, 'Update manufacturing formulas in SourcedItem (200 OK)');
    assert(updateCostRes.data.data.manualOverride.calculatedCost === 1020, 'Calculated cost accurately matches: (350 + 500) * 1.20 = 1020');
    assert(updateCostRes.data.data.manualOverride.finalPrice === 2550, 'Final price override accurately stored as 2550');

    // 6. Convert SourcedItem to Draft Product
    console.log('\n--- 6. Draft Product Conversion & Linkage ---');
    const convertRes = await makeRequest(
      'POST',
      `/api/admin/source-studio/${newSourcedItem._id}/convert`,
      null,
      adminCookie
    );
    assert(convertRes.status === 200 && convertRes.data.success, 'Convert SourcedItem to Product (200 OK)');
    const createdProduct = convertRes.data.data?.product;
    assert(Boolean(createdProduct?._id), 'Created Product document in MongoDB');
    assert(createdProduct.status === 'draft', 'New converted product created with status = "draft"');
    assert(createdProduct.price === 2550, 'Product price matches workshop calculator finalPrice');
    assert(createdProduct.isReferenceImage === true, 'Product flagged with isReferenceImage = true');

    // 7. Test Reference Image Publishing Safeguard (MUST BLOCK!)
    console.log('\n--- 7. Reference Image Publishing Safeguard Protection ---');
    const tryPublishRes = await makeRequest(
      'PUT',
      `/api/admin/products/${createdProduct._id}`,
      { status: 'published' },
      adminCookie
    );
    assert(
      tryPublishRes.status === 400 && tryPublishRes.data.isReferenceImage === true,
      'Publishing BLOCKED (400) when primary image is unedited reference photo',
      tryPublishRes.data.error
    );

    // 8. Edit & Brand Image in Image Studio
    console.log('\n--- 8. Image Studio Save & Safeguard Clearance ---');
    const mockEditedCanvasDataUrl =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const saveStudioRes = await makeRequest(
      'POST',
      '/api/admin/image-studio/save',
      {
        imageDataUrl: mockEditedCanvasDataUrl,
        productId: createdProduct._id,
        sourceItemId: newSourcedItem._id,
        replacePrimary: true,
      },
      adminCookie
    );
    assert(saveStudioRes.status === 200 && saveStudioRes.data.success, 'Image Studio composite image saved (200 OK)');
    assert(saveStudioRes.data.data.product?.isReferenceImage === false, 'Product isReferenceImage flag CLEARED to false');
    assert(saveStudioRes.data.data.sourcedItem?.isReferenceOnly === false, 'SourcedItem isReferenceOnly flag CLEARED to false');

    // 9. Publish Product Now That Image is Branded (MUST SUCCEED!)
    console.log('\n--- 9. Product Publishing Verification After Studio Branding ---');
    const publishSuccessRes = await makeRequest(
      'PUT',
      `/api/admin/products/${createdProduct._id}`,
      { status: 'published' },
      adminCookie
    );
    assert(
      publishSuccessRes.status === 200 && publishSuccessRes.data.data.status === 'published',
      'Product successfully published to storefront after Image Studio branding'
    );

    console.log('\n======================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('\n❌ Test Suite encountered fatal error:', err);
    process.exit(1);
  }
}

runTests();
