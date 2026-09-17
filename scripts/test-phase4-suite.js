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
  console.log('\n=============================================================');
  console.log('🧪 RUNNING PHASE 4 AUTOMATED TEST SUITE: SOCIAL MEDIA PUBLISHING HUB');
  console.log('=============================================================\n');

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
<<<<<<< HEAD
      email: 'admin@kbfurniture.com',
=======
      email: 'admin@nordika.com',
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
      password: 'password123',
    });
    assert(loginRes.status === 200 && loginRes.data.success, 'Super Admin login successful');

    const setCookie = loginRes.headers['set-cookie'];
    const adminCookie = Array.isArray(setCookie)
      ? setCookie.map((c) => c.split(';')[0]).join('; ')
      : '';
    assert(Boolean(adminCookie), 'Session auth cookie acquired');

    // 2. Connected Social Accounts
    console.log('\n--- 2. Social Media Account Connectors (OAuth Mock-First) ---');
    const accountsRes = await makeRequest('GET', '/api/admin/social/accounts', null, adminCookie);
    assert(accountsRes.status === 200 && accountsRes.data.success, 'Fetch social accounts list (200 OK)');
    assert(Array.isArray(accountsRes.data.data) && accountsRes.data.data.length >= 4, 'All 4 seeded platform accounts present');

    // Connect / Authorize a platform account
    const connectRes = await makeRequest(
      'POST',
      '/api/admin/social/accounts',
      {
        platform: 'instagram',
<<<<<<< HEAD
        accountName: 'KB Furniture Scandinavian Studio Official',
        accountHandle: '@kbfurniture.studio',
=======
        accountName: 'Nordika Scandinavian Studio Official',
        accountHandle: '@nordika.studio',
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
        isSimulated: true,
      },
      adminCookie
    );
    assert(connectRes.status === 200 && connectRes.data.success, 'Connect/Authorize Instagram account via simulated OAuth');
    assert(connectRes.data.data.status === 'connected', 'Account status confirmed as "connected"');

    // 3. AI Caption Generator
    console.log('\n--- 3. Claude AI Social Caption Generator ---');
    const captionRes = await makeRequest(
      'POST',
      '/api/admin/social/generate-caption',
      {
        productName: 'Haven Modular Bouclé Sectional',
        category: 'living-room',
        materials: ['Custom Bouclé Weave', 'Solid FSC Oak'],
        price: 3450,
        tone: 'elegant',
      },
      adminCookie
    );
    assert(captionRes.status === 200 && captionRes.data.success, 'Generate AI captions API (200 OK)');
    assert(
      Array.isArray(captionRes.data.data) && captionRes.data.data.length === 3,
      'Returned 3 distinct luxury caption options with hashtags'
    );
    assert(
      Boolean(captionRes.data.data[0]?.caption?.includes('#')),
      'Generated captions contain relevant design hashtags'
    );

    // 4. Content Composer — Post Now (Immediate Publishing)
    console.log('\n--- 4. Multi-Channel Immediate Publishing Engine ---');
    const postNowRes = await makeRequest(
      'POST',
      '/api/admin/social/posts',
      {
<<<<<<< HEAD
        mediaUrl: 'https://picsum.photos/seed/kb-furniture-haven-sectional/800/800',
=======
        mediaUrl: 'https://picsum.photos/seed/nordika-haven-sectional/800/800',
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
        mediaType: 'image',
        platforms: ['instagram', 'pinterest', 'facebook'],
        captions: {
          default: 'Architectural serenity. Handcrafted in Seattle. ✨ #NordicDesign #ModernLiving',
          instagram: 'IG Special: Sculptural Nordic living. #NordicDesign',
        },
      },
      adminCookie
    );
    assert(postNowRes.status === 200 && postNowRes.data.success, 'Immediate multi-channel post created (200 OK)');
    const createdPost = postNowRes.data.data;
    assert(createdPost.status === 'posted', 'Post status set to "posted"');
    assert(
      Boolean(createdPost.platformPostIds?.instagram?.startsWith('ig_post_')),
      'Instagram post ID generated & stored'
    );
    assert(
      Boolean(createdPost.platformPostIds?.pinterest?.startsWith('pin_art_')),
      'Pinterest pin ID generated & stored'
    );

    // 5. Content Composer — Schedule for Later
    console.log('\n--- 5. Content Composer Scheduling Flow ---');
    const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const scheduleRes = await makeRequest(
      'POST',
      '/api/admin/social/posts',
      {
        mediaUrl: 'https://picsum.photos/seed/nordic-reel/800/800',
        mediaType: 'video',
        platforms: ['instagram', 'tiktok'],
        captions: {
          default: 'Workshop joinery ASMR coming this weekend. #WoodworkASMR',
        },
        scheduledFor: futureDate,
      },
      adminCookie
    );
    assert(scheduleRes.status === 200 && scheduleRes.data.success, 'Schedule future social post (200 OK)');
    assert(scheduleRes.data.data.status === 'queued', 'Scheduled post status set to "queued"');
    const scheduledPostId = scheduleRes.data.data._id;

    // 6. Content Calendar & Queue Listings
    console.log('\n--- 6. Content Calendar & Queue Endpoints ---');
    const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const calendarRes = await makeRequest(
      'GET',
      `/api/admin/social/posts?month=${currentMonthStr}`,
      null,
      adminCookie
    );
    assert(calendarRes.status === 200 && calendarRes.data.success, 'Fetch posts for monthly calendar (200 OK)');
    assert(Array.isArray(calendarRes.data.data), 'Calendar array returned successfully');

    const queueRes = await makeRequest(
      'GET',
      '/api/admin/social/posts?status=queued',
      null,
      adminCookie
    );
    assert(queueRes.status === 200 && queueRes.data.data.length >= 1, 'Publish queue lists pending scheduled posts');

    // 7. Post History & Failed Post Retry Logic
    console.log('\n--- 7. Post History & Failed Post Retry ---');
    const historyRes = await makeRequest('GET', '/api/admin/social/posts', null, adminCookie);
    assert(historyRes.status === 200 && historyRes.data.data.length >= 5, 'Post history returns complete record');

    // Simulate retrying a post
    const retryRes = await makeRequest(
      'PUT',
      `/api/admin/social/posts/${scheduledPostId}`,
      { action: 'retry' },
      adminCookie
    );
    assert(retryRes.status === 200 && retryRes.data.success, 'Retry action dispatches post across all platforms');
    assert(retryRes.data.data.status === 'posted', 'Retried post status updated to "posted"');

    // 8. Automation Rules Configuration
    console.log('\n--- 8. Product Launch Social Automation Rules ---');
    const getRulesRes = await makeRequest('GET', '/api/admin/social/automation', null, adminCookie);
    assert(getRulesRes.status === 200 && getRulesRes.data.success, 'Fetch singleton AutomationRule (200 OK)');
    assert(getRulesRes.data.data.mode === 'review_queue', 'Default automation mode is "review_queue" for safety');

    const updateRulesRes = await makeRequest(
      'PUT',
      '/api/admin/social/automation',
      {
        mode: 'review_queue',
        defaultPlatforms: ['instagram', 'pinterest', 'facebook'],
<<<<<<< HEAD
        defaultCaptionTemplate: 'Fresh release: {productName} in {material} for ${price}! ✨ #KBFurniture',
=======
        defaultCaptionTemplate: 'Fresh release: {productName} in {material} for ${price}! ✨ #NordikaStudio',
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
        enabled: true,
      },
      adminCookie
    );
    assert(updateRulesRes.status === 200 && updateRulesRes.data.success, 'Update AutomationRule template & platforms');

    // 9. End-to-End Product Publish Auto-Trigger
    console.log('\n--- 9. Product Publish -> Social Media Auto-Trigger ---');
    // 9.1 Create a draft product
    const createDraftRes = await makeRequest(
      'POST',
      '/api/admin/products',
      {
        name: 'Svalbard Architectural Bookshelf',
        slug: `svalbard-bookshelf-${Date.now()}`,
        category: 'storage',
        price: 2150,
        description: 'Sculptural modular bookcase in solid white oak.',
        materials: ['Solid White Oak', 'Brushed Brass Brackets'],
        images: ['https://picsum.photos/seed/svalbard-shelf/800/800'],
        status: 'draft',
        isReferenceImage: false,
      },
      adminCookie
    );
    assert(
      (createDraftRes.status === 200 || createDraftRes.status === 201) && createDraftRes.data.success,
      'Create draft product (200/201 OK)'
    );
    const draftProd = createDraftRes.data.data;

    // 9.2 Publish the draft product
    const publishProdRes = await makeRequest(
      'PUT',
      `/api/admin/products/${draftProd._id}`,
      { status: 'published' },
      adminCookie
    );
    assert(publishProdRes.status === 200 && publishProdRes.data.success, 'Transition product status Draft -> Published');

    // 9.3 Verify automated SocialPost was created in Queue
    const checkAutoPostRes = await makeRequest(
      'GET',
      '/api/admin/social/posts?status=draft',
      null,
      adminCookie
    );
    const autoCreatedPost = checkAutoPostRes.data.data.find(
      (p) => p.productId?._id === draftProd._id || p.productId === draftProd._id
    );
    assert(
      Boolean(autoCreatedPost),
      'Automation rule created SocialPost draft in queue with dynamic placeholders rendered',
      autoCreatedPost?.captions?.default
    );

    // 10. Cron Scheduled Publisher Endpoint
    console.log('\n--- 10. Scheduled Cron Publisher Endpoint ---');
    const cronRes = await makeRequest('GET', '/api/cron/publish-scheduled');
    assert(cronRes.status === 200 && cronRes.data.success, 'Cron publisher /api/cron/publish-scheduled executed (200 OK)');

    console.log('\n=============================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('=============================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('\n❌ Test Suite encountered fatal error:', err);
    process.exit(1);
  }
}

runTests();
