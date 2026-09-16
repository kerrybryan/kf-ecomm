const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

function makeRequest(method, path, body = null, cookie = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (cookie) {
      options.headers['Cookie'] = cookie;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
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
  console.log('🧪 RUNNING AUTOMATED TEST SUITE: PHASES 5, 6 & 7');
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
    // 1. Admin Authentication
    console.log('--- 1. Admin Authentication & Session ---');
    const loginRes = await makeRequest('POST', '/api/admin/auth/login', {
      email: 'admin@kbfurniture.com',
      password: 'password123',
    });
    assert(loginRes.status === 200 && loginRes.data.success, 'Super Admin login successful');

    const setCookie = loginRes.headers['set-cookie'];
    const adminCookie = Array.isArray(setCookie)
      ? setCookie.map((c) => c.split(';')[0]).join('; ')
      : '';
    assert(Boolean(adminCookie), 'Session auth cookie acquired');

    // -----------------------------------------------------------------
    // 2. PHASE 5: MANUFACTURING PROCESS TRACKER
    // -----------------------------------------------------------------
    console.log('\n--- 2. Phase 5: Manufacturing Process Tracker ---');

    // List Production Orders
    const prodOrdersRes = await makeRequest('GET', '/api/admin/manufacturing/production', null, adminCookie);
    assert(prodOrdersRes.status === 200 && prodOrdersRes.data.success, 'GET /api/admin/manufacturing/production returns 200');
    assert(Array.isArray(prodOrdersRes.data.data) && prodOrdersRes.data.data.length > 0, 'Production orders returned');
    assert(prodOrdersRes.data.stageCounts !== undefined, 'Grouped stageCounts present for Kanban');

    // Create Raw Material
    const addMatRes = await makeRequest(
      'POST',
      '/api/admin/manufacturing/materials',
      {
        name: 'Smoked Nordic Ash 8/4',
        sku: `TEST-ASH-${Date.now().toString().slice(-4)}`,
        category: 'timber',
        inStock: 150,
        unit: 'bdft',
        unitCost: 16.5,
        reorderThreshold: 30,
        supplier: 'Scandinavian Sustainable Forest Co.',
      },
      adminCookie
    );
    assert(addMatRes.status === 201 && addMatRes.data.success, 'POST /api/admin/manufacturing/materials creates raw material (201)');
    const createdMaterial = addMatRes.data.data;

    // List Raw Materials
    const materialsRes = await makeRequest('GET', '/api/admin/manufacturing/materials', null, adminCookie);
    assert(materialsRes.status === 200 && materialsRes.data.success, 'GET /api/admin/manufacturing/materials lists inventory');
    assert(materialsRes.data.totalValuation > 0, 'Total inventory valuation computed');

    // Adjust Material Stock
    const updateMatRes = await makeRequest(
      'PUT',
      `/api/admin/manufacturing/materials/${createdMaterial._id}`,
      { inStock: 175 },
      adminCookie
    );
    assert(updateMatRes.status === 200 && updateMatRes.data.data.inStock === 175, 'PUT /api/admin/manufacturing/materials/[id] adjusts stock');

    // Fetch a catalog product for linking
    const prodListRes = await makeRequest('GET', '/api/admin/products?limit=1', null, adminCookie);
    const linkedProduct = prodListRes.data?.data?.[0];

    // Create Workshop Production Order
    const createJobRes = await makeRequest(
      'POST',
      '/api/admin/manufacturing/production',
      {
        productId: linkedProduct?._id,
        productName: linkedProduct?.name || 'Valhalla Executive Armchair',
        priority: 'rush',
        leadCraftsman: 'Lars Lindqvist',
        workshopBench: 'Bench 2 - Master Joinery',
        materialsRequired: [
          { materialId: createdMaterial._id, name: createdMaterial.name, quantity: 12, unit: 'bdft' },
        ],
        targetDays: 10,
      },
      adminCookie
    );
    assert(createJobRes.status === 201 && createJobRes.data.success, 'POST /api/admin/manufacturing/production creates job (201)', JSON.stringify(createJobRes.data));
    assert(createJobRes.data.data?.currentStage === 'timber_selection', 'Initial stage is timber_selection');
    const createdJob = createJobRes.data.data;

    // Advance Stage & Auto-Deduct Material
    const advanceJobRes = await makeRequest(
      'PUT',
      `/api/admin/manufacturing/production/${createdJob._id}`,
      {
        newStage: 'cutting_joinery',
        notes: 'Timber selection verified; CNC milling commenced.',
      },
      adminCookie
    );
    assert(advanceJobRes.status === 200 && advanceJobRes.data.success, 'PUT /api/admin/manufacturing/production/[id] advances stage');
    assert(advanceJobRes.data.data.currentStage === 'cutting_joinery', 'Order currentStage updated');
    assert(advanceJobRes.data.data.stageHistory.length >= 2, 'Stage audit timeline appended');
    assert(advanceJobRes.data.data.materialsRequired[0].deducted === true, 'Materials auto-deducted upon cutting/joinery transition');

    // Real Bottleneck Analytics
    const analyticsRes = await makeRequest('GET', '/api/admin/manufacturing/analytics', null, adminCookie);
    assert(analyticsRes.status === 200 && analyticsRes.data.success, 'GET /api/admin/manufacturing/analytics computes stage durations');
    assert(Array.isArray(analyticsRes.data.data.stageAverages) && analyticsRes.data.data.stageAverages.length > 0, 'Stage averages calculated');
    assert(analyticsRes.data.data.primaryBottleneck !== undefined, 'Slowest bottleneck stage identified');
    assert(analyticsRes.data.data.metrics.onTimeRate >= 0, 'Workshop on-time rate computed');

    // -----------------------------------------------------------------
    // 3. PHASE 6: DELIVERY & FULFILLMENT
    // -----------------------------------------------------------------
    console.log('\n--- 3. Phase 6: Delivery & Fulfillment ---');

    // Fetch existing order
    const ordersRes = await makeRequest('GET', '/api/admin/orders?limit=1', null, adminCookie);
    assert(ordersRes.status === 200 && ordersRes.data.data.length > 0, 'Orders list retrieved for fulfillment testing');
    const sampleOrder = ordersRes.data.data[0];

    // Delivery Zones
    const zonesRes = await makeRequest('GET', '/api/admin/fulfillment/zones', null, adminCookie);
    assert(zonesRes.status === 200 && zonesRes.data.success, 'GET /api/admin/fulfillment/zones returns delivery zones');
    assert(zonesRes.data.data.length >= 4, 'All regional zones (Seattle, PNW, US, Offshore) present');

    // Create Shipment
    const createShipRes = await makeRequest(
      'POST',
      '/api/admin/fulfillment/shipments',
      {
        orderId: sampleOrder._id,
        carrier: 'KB Furniture White-Glove Fleet',
        driverName: 'Erik Holmgren',
        driverPhone: '+1 (206) 555-0144',
        vehicleId: 'Van #4 (Sprinter EV)',
        deliveryZone: 'Greater Seattle & Puget Sound',
        deliveryWindow: {
          timeSlot: '09:00 - 13:00',
          instructions: 'Call gate buzzer #402.',
        },
      },
      adminCookie
    );
    assert(createShipRes.status === 201 && createShipRes.data.success, 'POST /api/admin/fulfillment/shipments creates shipment (201)');
    assert(createShipRes.data.data.trackingNumber.startsWith('NORD-LOG-'), 'Tracking number generated');
    const createdShipment = createShipRes.data.data;

    // List Shipments
    const listShipRes = await makeRequest('GET', '/api/admin/fulfillment/shipments', null, adminCookie);
    assert(listShipRes.status === 200 && listShipRes.data.success, 'GET /api/admin/fulfillment/shipments lists dispatch queue');
    assert(listShipRes.data.counts !== undefined, 'Dispatch counts by status present');

    // Record Digital Proof of Delivery
    const recordPodRes = await makeRequest(
      'PUT',
      `/api/admin/fulfillment/shipments/${createdShipment._id}`,
      {
        status: 'delivered',
        proofOfDelivery: {
          recipientName: 'Freja Lindqvist',
          signatureUrl: 'sig_pad_verified_client',
          conditionNotes: 'Delivered in pristine condition and assembled on site.',
        },
      },
      adminCookie
    );
    assert(recordPodRes.status === 200 && recordPodRes.data.success, 'PUT /api/admin/fulfillment/shipments/[id] records Proof of Delivery');
    assert(recordPodRes.data.data.status === 'delivered', 'Shipment status marked delivered');
    assert(recordPodRes.data.data.proofOfDelivery?.recipientName === 'Freja Lindqvist', 'POD recipient recorded');

    // Submit Warranty Claim
    const submitClaimRes = await makeRequest(
      'POST',
      '/api/admin/fulfillment/warranty',
      {
        orderId: sampleOrder._id,
        customerName: 'Klara Blom',
        customerEmail: 'klara.blom@archstudio.se',
        productName: 'Stockholm Master Credenza',
        claimType: 'transit_damage',
        description: 'Small scratch on right drawer handle.',
      },
      adminCookie
    );
    assert(submitClaimRes.status === 201 && submitClaimRes.data.success, 'POST /api/admin/fulfillment/warranty submits claim (201)');
    assert(submitClaimRes.data.data.claimNumber.startsWith('CLAIM-'), 'Claim number generated');
    const createdClaim = submitClaimRes.data.data;

    // Resolve Warranty Claim
    const resolveClaimRes = await makeRequest(
      'PUT',
      `/api/admin/fulfillment/warranty/${createdClaim._id}`,
      {
        status: 'resolved',
        assignedArtisan: 'Lars Lindqvist',
        resolutionNotes: 'Hardware replacement shipped to client via expedited parcel.',
      },
      adminCookie
    );
    assert(resolveClaimRes.status === 200 && resolveClaimRes.data.success, 'PUT /api/admin/fulfillment/warranty/[id] resolves claim');
    assert(resolveClaimRes.data.data.status === 'resolved', 'Claim marked as resolved');

    // -----------------------------------------------------------------
    // 4. PHASE 7: ACCOUNTING & FINANCE
    // -----------------------------------------------------------------
    console.log('\n--- 4. Phase 7: Accounting & Finance ---');

    // General Ledger
    const ledgerRes = await makeRequest('GET', '/api/admin/finance/ledger', null, adminCookie);
    assert(ledgerRes.status === 200 && ledgerRes.data.success, 'GET /api/admin/finance/ledger returns general ledger');
    assert(Array.isArray(ledgerRes.data.data) && ledgerRes.data.data.length > 0, 'General ledger entries returned');
    assert(ledgerRes.data.totals.totalCredits >= 0 && ledgerRes.data.totals.totalDebits >= 0, 'Ledger debits/credits totals computed');

    // Record Expense (Zero Double Entry test)
    const recordExpenseRes = await makeRequest(
      'POST',
      '/api/admin/finance/expenses',
      {
        title: 'Bespoke CNC Router Bit Replacement Kit',
        category: 'hardware_joinery',
        amount: 850,
        vendor: 'Festool Industrial Tooling',
        paymentMethod: 'credit_card',
      },
      adminCookie
    );
    assert(recordExpenseRes.status === 201 && recordExpenseRes.data.success, 'POST /api/admin/finance/expenses creates expense (201)');
    assert(recordExpenseRes.data.ledgerEntry !== undefined, 'Ledger entry automatically posted (zero double entry)');
    assert(recordExpenseRes.data.ledgerEntry.debit === 850, 'Ledger entry debit matches expense amount');

    // List Expenses
    const listExpensesRes = await makeRequest('GET', '/api/admin/finance/expenses', null, adminCookie);
    assert(listExpensesRes.status === 200 && listExpensesRes.data.success, 'GET /api/admin/finance/expenses lists expenses');
    assert(listExpensesRes.data.totalExpenses > 0, 'Total recorded expenses computed');

    // Batch Agent Commission Payout
    const batchPayoutRes = await makeRequest(
      'POST',
      '/api/admin/finance/payouts/batch',
      { notes: 'Automated Commission Batch Test' },
      adminCookie
    );
    assert(batchPayoutRes.status === 200 && batchPayoutRes.data.success, 'POST /api/admin/finance/payouts/batch executes commission payout');

    // Financial Reports & P&L
    const reportsRes = await makeRequest('GET', '/api/admin/finance/reports', null, adminCookie);
    assert(reportsRes.status === 200 && reportsRes.data.success, 'GET /api/admin/finance/reports computes P&L');
    assert(reportsRes.data.data.pnl.totalRevenue >= 0, 'P&L total revenue computed');
    assert(reportsRes.data.data.pnl.grossProfit !== undefined, 'P&L gross profit computed');
    assert(reportsRes.data.data.pnl.netOperatingProfit !== undefined, 'P&L net operating profit computed');
    assert(Array.isArray(reportsRes.data.data.productMargins), 'Product gross margin ranking computed');
    assert(reportsRes.data.data.taxSummary.totalTaxCollected >= 0, 'Sales tax collection liabilities computed');

    // Printable Luxury Studio Invoice
    const invoiceRes = await makeRequest('GET', `/api/admin/finance/invoices/${sampleOrder._id}`, null, adminCookie);
    assert(invoiceRes.status === 200 && invoiceRes.data?.success, 'GET /api/admin/finance/invoices/[id] returns invoice', JSON.stringify(invoiceRes.data));
    assert(invoiceRes.data?.data?.invoiceNumber?.startsWith('INV-'), 'Studio invoice number generated');
    assert(Array.isArray(invoiceRes.data?.data?.items) && invoiceRes.data.data.items.length > 0, 'Invoice line items formatted');

    console.log('\n=============================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED / ${failed} FAILED`);
    console.log('=============================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal suite runner error:', err);
    process.exit(1);
  }
}

runTests();
