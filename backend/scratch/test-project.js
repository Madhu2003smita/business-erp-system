const BASE_URL = "http://localhost:5000/api"; // Change if your port is different

const runTests = async () => {
  console.log("🚀 Starting Project Module Integration Tests...\n");

  try {
    // ---------------------------------------------------------
    // SETUP: Get Auth Tokens
    // ---------------------------------------------------------
    console.log("🔐 Logging in to get tokens...");
    
    const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@acme.com", password: "password123" })
    });

    console.log("Server responded with status:", adminLogin.status);
    console.log("Server response body:", await adminLogin.clone().text());
    const adminData = await adminLogin.json();
    const adminToken = adminData.data.token;

    const empLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "employee@acme.com", password: "password123" })
    });
    const empData = await empLogin.json();
    const empToken = empData.data.token;

    if (!adminToken || !empToken) throw new Error("Failed to login. Did you run the seed script recently?");

    const adminHeaders = { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` };
    const empHeaders = { "Content-Type": "application/json", "Authorization": `Bearer ${empToken}` };

    // ---------------------------------------------------------
    // TEST 1: Missing Fields (Expect 400)
    // ---------------------------------------------------------
    const test1 = await fetch(`${BASE_URL}/projects`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ description: "Missing name and budget" })
    });
    if (test1.status === 400) console.log("✅ Test 1 Passed: Caught missing fields (400)");
    else console.log(`❌ Test 1 Failed: Expected 400, got ${test1.status}`);


    // ---------------------------------------------------------
    // TEST 2: Invalid Dates (Expect 400)
    // ---------------------------------------------------------
    const test2 = await fetch(`${BASE_URL}/projects`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ 
        name: "Time Travel Project", 
        budget: 5000, 
        startDate: "2026-06-01", 
        endDate: "2026-05-01" // End date is BEFORE start date!
      })
    });
    if (test2.status === 400) console.log("✅ Test 2 Passed: Caught invalid dates (400)");
    else console.log(`❌ Test 2 Failed: Expected 400, got ${test2.status}`);


    // ---------------------------------------------------------
    // SETUP FOR TESTS 3, 4, 5: Create a Valid Project
    // ---------------------------------------------------------
    const createRes = await fetch(`${BASE_URL}/projects`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ 
        name: "Alpha ERP Migration", 
        budget: 10000, 
        startDate: "2026-05-01", 
        endDate: "2026-12-01" 
      })
    });
    const projectData = await createRes.json();
    console.log('Server creation response:', projectData);
    if (!createRes.ok) {
      throw new Error('Project creation failed: ' + JSON.stringify(projectData));
    }
    const projectId = projectData.data._id; // Adjust if your response structure is different (e.g., projectData.project._id)


    // ---------------------------------------------------------
    // TEST 3: Budget Overrun Alert (Expect 200 with Alert)
    // ---------------------------------------------------------
    const test3 = await fetch(`${BASE_URL}/projects/${projectId}`, {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({ actualCost: 11100 }) // Exactly 11% over the 10000 budget
    });
    const test3Data = await test3.json();
    console.log('Test 3 Server Response:', JSON.stringify(test3Data, null, 2));
    if (test3.status === 200 && test3Data.overrunAlert === true) {
      console.log("✅ Test 3 Passed: Triggered budget overrun alert successfully");
    } else {
      console.log(`❌ Test 3 Failed: Expected 200 & overrunAlert:true. Got ${test3.status}`);
    }


    // ---------------------------------------------------------
    // SETUP FOR TEST 4: Create and Complete a Milestone
    // ---------------------------------------------------------
    const milestoneRes = await fetch(`${BASE_URL}/projects/${projectId}/milestones`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ name: "Phase 1 Setup", dueDate: "2026-06-01" })
    });
    const milestoneData = await milestoneRes.json();
    console.log('Milestone creation response:', milestoneData);
    if (!milestoneRes.ok) {
      throw new Error('Milestone creation failed: ' + JSON.stringify(milestoneData));
    }
    const milestoneId = milestoneData.data._id; // Adjust based on your JSON structure

    // Complete it the first time (Should be 200 OK)
    await fetch(`${BASE_URL}/projects/${projectId}/milestones/${milestoneId}/complete`, {
      method: "PATCH", headers: adminHeaders
    });


    // ---------------------------------------------------------
    // TEST 4: Complete an already completed milestone (Expect 400)
    // ---------------------------------------------------------
    const test4 = await fetch(`${BASE_URL}/projects/${projectId}/milestones/${milestoneId}/complete`, {
      method: "PATCH", headers: adminHeaders
    });
    if (test4.status === 400) console.log("✅ Test 4 Passed: Prevented double-completion of milestone (400)");
    else console.log(`❌ Test 4 Failed: Expected 400, got ${test4.status}`);


    // ---------------------------------------------------------
    // TEST 5: Employee trying to DELETE a project (Expect 403)
    // ---------------------------------------------------------
    const test5 = await fetch(`${BASE_URL}/projects/${projectId}`, {
      method: "DELETE",
      headers: empHeaders // Using the Employee token!
    });
    if (test5.status === 403) console.log("✅ Test 5 Passed: Employee blocked from deleting project (403)");
    else console.log(`❌ Test 5 Failed: Expected 403, got ${test5.status}`);


    console.log("\n🏁 All tests complete!");

  } catch (error) {
    console.error("\n💥 Error running tests:", error.message);
    console.log("Double check that your server is running and the BASE_URL is correct.");
  }
};

runTests();