/**
 * Comprehensive Test Suite for Gemini AI Assistant Features:
 * Part A: Product Description Writer (Plain English, fast/cheap, no fancy words)
 * Part B: Multi-Platform AI Video Generator (Image-to-video / Text-to-video, async polling, role & rate limits)
 * Part C: Quick Calculation Assistant (Stateless scratchpad, clear disclaimer, zero pricing engine mutation)
 * Part D: Audit & Usage Logging (AiUsageLog, AiVideoJob)
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
  console.log('TEST SUITE: Gemini AI Assistant Features');
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
    // 1. Part A: Product Description Writer
    console.log('--- 1. Part A: AI Description Writer ---');
    const descRes = await request('/api/admin/ai/generate-description', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Wondo Minimalist Sofa',
        category: 'Living Room',
        materials: ['Solid European Oak', 'Bouclé Fabric', 'Dense Foam'],
        dimensions: '220cm × 95cm × 75cm',
        price: 45000,
      }),
    });

    record(() => assert(descRes.status === 200, 'POST /api/admin/ai/generate-description returned 200 OK'), '1.1');
    record(() => assert(descRes.data.success === true, 'Description generation success is true'), '1.2');
    record(() => assert(typeof descRes.data.description === 'string' && descRes.data.description.length > 20, 'Description text is populated'), '1.3');

    // Verify plain English rules (no banned jargon)
    const bannedWords = ['elegant', 'timeless', 'curated', 'bespoke', 'sophisticated', 'luxurious', 'opulent'];
    const descLower = descRes.data.description.toLowerCase();
    const hasBannedWords = bannedWords.some((w) => descLower.includes(w));
    record(() => assert(!hasBannedWords, 'Description adheres to plain English rules (no banned jargon)'), '1.4');
    record(() => assert(descRes.data.note.includes('AI-drafted'), 'AI-drafted review label returned'), '1.5');

    // 2. Part B: Role-Based Access Control on Video Generation
    console.log('\n--- 2. Part B: Role & Quota Access Control ---');
    const unauthorizedRoleRes = await request('/api/admin/ai/generate-video', {
      method: 'POST',
      body: JSON.stringify({
        type: 'text_to_video',
        prompt: 'Modern table scene',
        adminRole: 'support', // Restricted role
      }),
    });

    record(() => assert(unauthorizedRoleRes.status === 403, 'Restricted roles blocked from video generation (403 Forbidden)'), '2.1');
    record(() => assert(unauthorizedRoleRes.data.error.includes('restricted'), 'Role restriction message returned'), '2.2');

    // 3. Part B: AI Video Clip Generation & Polling (Super Admin)
    console.log('\n--- 3. Part B: AI Video Job Creation & Async Polling ---');
    const videoJobRes = await request('/api/admin/ai/generate-video', {
      method: 'POST',
      body: JSON.stringify({
        type: 'image_to_video',
        prompt: 'Smooth cinematic pan over hardwood grain',
        sourceImageUrl: 'https://picsum.photos/seed/kb-coffee/800/800',
        adminRole: 'super_admin',
        adminEmail: 'admin@kbfurniture.et',
      }),
    });

    record(() => assert(videoJobRes.status === 200, 'POST /api/admin/ai/generate-video returned 200 OK'), '3.1');
    record(() => assert(videoJobRes.data.success === true, 'Video job initiation success is true'), '3.2');
    record(() => assert(typeof videoJobRes.data.jobId === 'string' && videoJobRes.data.jobId.startsWith('veo_'), 'Generated valid Veo jobId format'), '3.3');

    const jobId = videoJobRes.data.jobId;

    // Poll status immediately
    const pollRes1 = await request(`/api/admin/ai/video-status/${jobId}`);
    record(() => assert(pollRes1.status === 200, `GET /api/admin/ai/video-status/${jobId} returned 200 OK`), '3.4');
    record(() => assert(pollRes1.data.data.status === 'processing' || pollRes1.data.data.status === 'completed', 'Job is in active/completed state'), '3.5');

    // Wait 4.5 seconds for video completion simulation
    console.log('Waiting 4.5s for video processing simulation...');
    await new Promise((r) => setTimeout(r, 4500));

    const pollRes2 = await request(`/api/admin/ai/video-status/${jobId}`);
    record(() => assert(pollRes2.data.data.status === 'completed', 'Job transitioned to "completed" state'), '3.6');
    record(() => assert(pollRes2.data.data.progressPercent === 100, 'Job progress reached 100%'), '3.7');
    record(() => assert(typeof pollRes2.data.data.resultVideoUrl === 'string' && pollRes2.data.data.resultVideoUrl.endsWith('.mp4'), 'Result video mp4 URL returned for Content Studio'), '3.8');

    // 4. Part C: Quick Calculation Assistant (Stateless Scratchpad)
    console.log('\n--- 4. Part C: Quick Calculation Assistant ---');
    const calcRes = await request('/api/admin/ai/quick-calc', {
      method: 'POST',
      body: JSON.stringify({
        query: 'Wood 450 Birr/meter (8 meters), Fabric 300/meter (12 meters), Labor 20h @ 150/h, Overhead 15%. Total at 2x markup?',
      }),
    });

    record(() => assert(calcRes.status === 200, 'POST /api/admin/ai/quick-calc returned 200 OK'), '4.1');
    record(() => assert(calcRes.data.success === true, 'Quick calc response success is true'), '4.2');
    record(() => assert(typeof calcRes.data.data.answer === 'string' && calcRes.data.data.answer.length > 20, 'Math breakdown text returned'), '4.3');
    record(() => assert(calcRes.data.data.disclaimer.includes('Quick estimate only — not saved anywhere'), 'Mandatory scratchpad disclaimer verified'), '4.4');

    // 5. Admin Frontend Pages Audit (With Admin Session)
    console.log('\n--- 5. Admin Frontend Pages Audit ---');
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({ userId: '6a89b1234567890123456789', role: 'super_admin', exp: Math.floor(Date.now() / 1000) + 86400 })).toString('base64');
    const adminCookie = `kb_furniture_token=${header}.${payload}.mockSignature`;

    const pages = [
      '/admin/products/new',
      '/admin/content-studio',
      '/admin/pricing/calculate',
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
