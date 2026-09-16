/**
 * Test Suite for Phase 4 Revised: Publishing Queue (No OAuth, No AI)
 */

const BASE_URL = 'http://localhost:3000';

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`[PASS] ${message}`);
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const contentType = res.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  return { status: res.status, data, headers: res.headers };
}

async function runTests() {
  console.log('==================================================');
  console.log('TEST SUITE: Phase 4 Revised (Publishing Queue)');
  console.log('==================================================\n');

  let passed = 0;
  let total = 0;

  function record(fn, name) {
    total++;
    try {
      fn();
      passed++;
    } catch (e) {
      console.error(`❌ Error in ${name}:`, e.message);
    }
  }

  try {
    // 1. Caption Templates Seeding & CRUD
    console.log('--- 1. Caption Templates API & Seeding ---');
    const tplGetRes = await request('/api/admin/publishing/templates');
    record(() => assert(tplGetRes.status === 200, 'GET /api/admin/publishing/templates returned 200 OK'), '1.1');
    record(() => assert(tplGetRes.data.success === true, 'Templates response success is true'), '1.2');
    record(() => assert(Array.isArray(tplGetRes.data.data) && tplGetRes.data.data.length >= 5, `Templates seeded (${tplGetRes.data.data.length} templates found)`), '1.3');

    // Create custom template
    const createTplRes = await request('/api/admin/publishing/templates', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Flash Weekend Promo',
        platform: 'instagram',
        template: '🚨 Weekend Special: {productName} now {price} Birr! Crafted with {materials}. DM to order!',
        description: 'Promo test template',
      }),
    });
    record(() => assert(createTplRes.status === 200, 'POST /api/admin/publishing/templates created template'), '1.4');
    const customTplId = createTplRes.data.data._id;

    // 2. Placeholder Substitution Logic
    console.log('\n--- 2. Placeholder Substitution Verification ---');
    const { substitutePlaceholders } = await import('../lib/publishing.js');
    const sampleProduct = {
      name: 'Adama Solid Teak Dining Table',
      category: 'Dining Room',
      materials: ['Solid Teak Wood', 'Matte Sealant'],
      price: 54000,
      description: 'Handmade 8-seater dining table.',
    };
    const rendered = substitutePlaceholders(
      'New: {productName} in {category}! Made with {materials} for {price} Birr. {description}',
      sampleProduct
    );
    record(() => assert(rendered.includes('Adama Solid Teak Dining Table'), 'Substituted {productName}'), '2.1');
    record(() => assert(rendered.includes('Dining Room'), 'Substituted {category}'), '2.2');
    record(() => assert(rendered.includes('Solid Teak Wood, Matte Sealant'), 'Substituted {materials}'), '2.3');
    record(() => assert(rendered.includes('54,000'), 'Substituted {price}'), '2.4');

    // 3. Publishing Queue Creation & Filtering
    console.log('\n--- 3. Publishing Queue Item Lifecycle ---');
    const queueCreateRes = await request('/api/admin/publishing/queue', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Launch Post: Adama Dining Table',
        mediaUrl: 'https://picsum.photos/seed/adama-table/800/800',
        mediaType: 'image',
        platform: 'instagram',
        captionTemplateId: customTplId,
        customCaption: rendered,
        plannedDate: new Date().toISOString(),
      }),
    });

    record(() => assert(queueCreateRes.status === 200, 'POST /api/admin/publishing/queue created queue item'), '3.1');
    record(() => assert(queueCreateRes.data.success === true, 'Queue item creation success is true'), '3.2');
    record(() => assert(queueCreateRes.data.data.status === 'queued', 'Queue item initial status is "queued"'), '3.3');

    const queueItemId = queueCreateRes.data.data._id;

    // GET Queue with filter
    const queueGetRes = await request('/api/admin/publishing/queue?status=queued');
    record(() => assert(queueGetRes.status === 200, 'GET /api/admin/publishing/queue returned 200 OK'), '3.4');
    record(() => assert(queueGetRes.data.counts?.queued >= 1, `Counts object returned (${queueGetRes.data.counts?.queued} queued)`), '3.5');

    // 4. Status Transitions: Posted & Skipped
    console.log('\n--- 4. "Ready to Post" Status Transitions ---');
    const markPostedRes = await request(`/api/admin/publishing/queue/${queueItemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'posted' }),
    });
    record(() => assert(markPostedRes.status === 200, 'PATCH /api/admin/publishing/queue/[id] returned 200 OK'), '4.1');
    record(() => assert(markPostedRes.data.data.status === 'posted', 'Item status updated to "posted"'), '4.2');
    record(() => assert(Boolean(markPostedRes.data.data.postedAt), 'postedAt timestamp successfully recorded'), '4.3');

    // Transition to skipped
    const markSkippedRes = await request(`/api/admin/publishing/queue/${queueItemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'skipped' }),
    });
    record(() => assert(markSkippedRes.data.data.status === 'skipped', 'Item status updated to "skipped"'), '4.4');

    // Clean up test template
    await request(`/api/admin/publishing/templates/${customTplId}`, { method: 'DELETE' });

    // 5. Part G: Automatic Queue Suggestion on Product Publish
    console.log('\n--- 5. Part G: Auto-Queue Suggestion on Product Publish ---');
    const loginRes = await request('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@kbfurniture.com', password: 'password123' }),
    });

    let adminCookie = '';
    const cookieHeader = loginRes.headers.get('set-cookie');
    if (cookieHeader) {
      adminCookie = cookieHeader.split(';')[0];
    }

    const newProdRes = await request('/api/admin/products', {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({
        name: `Auto Queue Sofa ${Date.now().toString().slice(-4)}`,
        category: 'living-room',
        description: 'Premium handcrafted solid pine living room sofa with deep comfort.',
        price: 49000,
        status: 'published', // Published status triggers auto-queue
        materials: ['Solid Pine', 'Bouclé Fabric'],
        images: ['https://picsum.photos/seed/auto-queue-sofa/800/800'],
      }),
    });

    record(() => assert(newProdRes.status === 201, 'Created published product'), '5.1');

    // Verify auto-created draft in queue
    const autoQueueCheck = await request('/api/admin/publishing/queue?status=queued');
    const foundAutoDraft = autoQueueCheck.data.data.find(
      (q) => q.title.includes('New Arrival') && q.finalCaption.includes('49,000')
    );
    record(() => assert(Boolean(foundAutoDraft), 'Auto-queue draft created for published product with "New Arrival" template'), '5.2');

    // 6. Admin Frontend Pages Audit
    console.log('\n--- 6. Admin Frontend Pages Audit (With Admin Session) ---');
    const pages = [
      '/admin/publishing',
      '/admin/publishing/templates',
      '/admin/publishing/new',
      '/admin/content-studio',
      '/admin',
    ];

    for (const p of pages) {
      const pageRes = await request(p, {
        headers: { Cookie: adminCookie },
      });
      record(() => assert(pageRes.status === 200, `${p.padEnd(30)} -> 200 OK`), `Page: ${p}`);
    }

  } catch (err) {
    console.error('Fatal test error:', err);
  }

  console.log('\n==================================================');
  console.log(`SUMMARY: ${passed}/${total} tests passed`);
  console.log('==================================================');
}

runTests();
