const http = require('http');

async function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost:3000');
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json,
        });
      });
    });

    req.on('error', (e) => reject(e));

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runAdminTestSuite() {
  console.log('====================================================');
  console.log('🚀 NORDIKA STUDIO: PHASE 2 ADMIN VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(title, condition, extraInfo = '') {
    if (condition) {
      console.log(`✅ PASS: ${title} ${extraInfo ? `(${extraInfo})` : ''}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${title} ${extraInfo ? `(${extraInfo})` : ''}`);
      failed++;
    }
  }

  try {
    // 1. Test Unauthenticated Access Redirection / Protection
    console.log('\n--- 1. Route Protection & Auth ---');
    const unauthCheck = await makeRequest('/api/admin/dashboard');
    assert(
      'Protect /api/admin/dashboard from unauthenticated access',
      unauthCheck.status === 401,
      `Status: ${unauthCheck.status}`
    );

    // 2. Test Admin Login (Super Admin)
    const loginRes = await makeRequest('/api/admin/auth/login', 'POST', {
      email: 'admin@nordika.com',
      password: 'password123',
    });
    assert(
      'Login as Super Admin',
      loginRes.status === 200 && loginRes.body.success,
      `Role: ${loginRes.body.data?.role}`
    );

    const cookieHeader = loginRes.headers['set-cookie']
      ? loginRes.headers['set-cookie'][0].split(';')[0]
      : '';
    const authHeaders = { Cookie: cookieHeader };

    // 3. Test /api/admin/auth/me
    const meRes = await makeRequest('/api/admin/auth/me', 'GET', null, authHeaders);
    assert(
      'Verify Session via /api/admin/auth/me',
      meRes.status === 200 && meRes.body.data?.email === 'admin@nordika.com',
      `User: ${meRes.body.data?.name}`
    );

    // 4. Test Dashboard Metrics Aggregations
    console.log('\n--- 2. Dashboard KPIs & Aggregations ---');
    const dashRes = await makeRequest('/api/admin/dashboard', 'GET', null, authHeaders);
    assert(
      'Fetch Dashboard Aggregations',
      dashRes.status === 200 && dashRes.body.success,
      `Total Revenue: ${dashRes.body.data?.kpis?.totalSales?.formatted}`
    );
    assert(
      'Sales 30-Day Trend Points Available',
      Array.isArray(dashRes.body.data?.salesTrend) && dashRes.body.data.salesTrend.length > 0,
      `Points: ${dashRes.body.data?.salesTrend?.length}`
    );
    assert(
      'Top 5 Sold Products Aggregated',
      Array.isArray(dashRes.body.data?.topProducts),
      `Top count: ${dashRes.body.data?.topProducts?.length}`
    );

    // 5. Test Products Management API & CSV Import
    console.log('\n--- 3. Product Catalog & CSV Import ---');
    const prodList = await makeRequest('/api/admin/products?limit=5', 'GET', null, authHeaders);
    assert(
      'List Catalog Products with Pagination',
      prodList.status === 200 && prodList.body.data?.length > 0,
      `Total: ${prodList.body.pagination?.total}`
    );

    // Test CSV Import API
    const sampleCsv = `name,category,price,description,stock_count,status\n"Oslo Boucle Armchair","living-room",1250,"Minimalist Nordic lounge chair with textured bouclé upholstery.",12,"published"`;
    const importRes = await makeRequest(
      '/api/admin/products/import',
      'POST',
      { csvText: sampleCsv },
      authHeaders
    );
    assert(
      'Bulk CSV Product Import',
      importRes.status === 200 && importRes.body.success,
      `Inserted: ${importRes.body.stats?.insertedCount}`
    );

    // 6. Test Orders Management, Status Stepper & Timeline
    console.log('\n--- 4. Orders Fulfillment & Audit Timeline ---');
    const ordersList = await makeRequest('/api/admin/orders?limit=5', 'GET', null, authHeaders);
    assert(
      'List Fulfillment Orders',
      ordersList.status === 200 && ordersList.body.data?.length > 0,
      `Orders count: ${ordersList.body.data?.length}`
    );

    const firstOrderId = ordersList.body.data[0]._id;
    const orderDetail = await makeRequest(`/api/admin/orders/${firstOrderId}`, 'GET', null, authHeaders);
    assert(
      'Fetch Single Order Detail with Timeline',
      orderDetail.status === 200 && Array.isArray(orderDetail.body.data?.timeline),
      `Timeline entries: ${orderDetail.body.data?.timeline?.length}`
    );

    // Update Status & Audit Log
    const statusUpdate = await makeRequest(
      `/api/admin/orders/${firstOrderId}`,
      'PUT',
      {
        status: 'shipped',
        note: 'Dispatched with White-Glove Seattle Freight Carrier',
      },
      authHeaders
    );
    assert(
      'Update Order Status and Append Audit Log',
      statusUpdate.status === 200 && statusUpdate.body.data?.status === 'shipped',
      `New Status: ${statusUpdate.body.data?.status}`
    );

    // 7. Test Custom Quotes & Wholesale Inquiries
    console.log('\n--- 5. Custom Quotes & Wholesale CRM ---');
    const inqList = await makeRequest('/api/admin/inquiries', 'GET', null, authHeaders);
    assert(
      'List Custom Quotes & Inquiries',
      inqList.status === 200 && inqList.body.data?.length > 0,
      `Total: ${inqList.body.pagination?.total}`
    );

    if (inqList.body.data?.length > 0) {
      const firstInqId = inqList.body.data[0]._id;
      const addNote = await makeRequest(
        `/api/admin/inquiries/${firstInqId}/notes`,
        'POST',
        { note: 'Sent wood swatch kit for architectural review.' },
        authHeaders
      );
      assert(
        'Add Internal CRM Memo to Inquiry',
        addNote.status === 200 && addNote.body.success,
        `Notes count: ${addNote.body.data?.length}`
      );
    }

    // 8. Test Trade Agents & Commission Payouts
    console.log('\n--- 6. Trade Agents & Commission Payouts ---');
    const agentsList = await makeRequest('/api/admin/agents?status=approved', 'GET', null, authHeaders);
    assert(
      'List Active Trade Partners',
      agentsList.status === 200 && agentsList.body.data?.length > 0,
      `Active: ${agentsList.body.counts?.approved}`
    );

    if (agentsList.body.data?.length > 0) {
      const firstAgent = agentsList.body.data[0];
      const payoutRes = await makeRequest(
        `/api/admin/agents/${firstAgent._id}/payout`,
        'POST',
        {
          amount: 250,
          reference: 'TEST-WIRE-01',
          notes: 'Test quarterly payout execution',
        },
        authHeaders
      );
      if (payoutRes.status !== 200) {
        console.log('DEBUG Payout response error:', payoutRes.status, payoutRes.body);
      }
      assert(
        'Record Commission Payout to Agent',
        payoutRes.status === 200 && payoutRes.body.success,
        `Remaining owed: $${payoutRes.body.data?.commissionOwed}`
      );
    }

    // 9. Test Customer CRM Profile & Memos
    console.log('\n--- 7. Customer CRM Directory ---');
    const custList = await makeRequest('/api/admin/customers', 'GET', null, authHeaders);
    assert(
      'List Customer Directory with Spend Metrics',
      custList.status === 200 && custList.body.data?.length > 0,
      `Count: ${custList.body.data?.length}`
    );

    if (custList.body.data?.length > 0) {
      const firstCustId = custList.body.data[0]._id;
      const custDetail = await makeRequest(`/api/admin/customers/${firstCustId}`, 'GET', null, authHeaders);
      assert(
        'Fetch Customer Profile, Order History & Wishlist',
        custDetail.status === 200 && custDetail.body.data?.orders !== undefined,
        `Customer: ${custDetail.body.data?.name}`
      );
    }

    // 10. Test Content & Visual Merchandising
    console.log('\n--- 8. Content Merchandising & Subscribers ---');
    const catList = await makeRequest('/api/admin/content/categories', 'GET', null, authHeaders);
    assert(
      'List Categories for Ordering Manager',
      catList.status === 200 && catList.body.data?.length > 0,
      `Categories: ${catList.body.data?.length}`
    );

    const subList = await makeRequest('/api/admin/content/subscribers', 'GET', null, authHeaders);
    assert(
      'List Newsletter Subscribers',
      subList.status === 200 && Array.isArray(subList.body.data),
      `Subscribers: ${subList.body.data?.length}`
    );

    // 11. Test Store Settings & RBAC Users
    console.log('\n--- 9. Store Settings & Staff RBAC ---');
    const settingsRes = await makeRequest('/api/admin/settings', 'GET', null, authHeaders);
    assert(
      'Fetch Store Settings (Shipping, Taxes, Currency)',
      settingsRes.status === 200 && settingsRes.body.data?.shippingRules !== undefined,
      `Threshold: $${settingsRes.body.data?.shippingRules?.freeShippingThreshold}`
    );

    const usersRes = await makeRequest('/api/admin/settings/users', 'GET', null, authHeaders);
    assert(
      'List Admin Staff Accounts (Super Admin Only)',
      usersRes.status === 200 && usersRes.body.data?.length > 0,
      `Staff count: ${usersRes.body.data?.length}`
    );

    // 12. Test Role-Based Access Control Restrictions (Support Staff)
    console.log('\n--- 10. Role-Based Access Control (RBAC) Enforcement ---');
    const supportLogin = await makeRequest('/api/admin/auth/login', 'POST', {
      email: 'support@nordika.com',
      password: 'password123',
    });
    const supportCookie = supportLogin.headers['set-cookie'][0].split(';')[0];
    const supportHeaders = { Cookie: supportCookie };

    // Support staff trying to access Super Admin user management API should receive 403 Forbidden
    const rbacDenied = await makeRequest('/api/admin/settings/users', 'GET', null, supportHeaders);
    assert(
      'Enforce RBAC 403 Forbidden for Support role on /settings/users',
      rbacDenied.status === 403,
      `Status: ${rbacDenied.status}`
    );

    // Support staff can view orders
    const supportOrders = await makeRequest('/api/admin/orders', 'GET', null, supportHeaders);
    assert(
      'Allow Support role to view customer orders',
      supportOrders.status === 200,
      `Status: ${supportOrders.status}`
    );

    console.log('\n====================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('Fatal test error:', err);
  }
}

runAdminTestSuite();
