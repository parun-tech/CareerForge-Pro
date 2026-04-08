const axios = require('axios');
async function testReg() {
  try {
    const email = `test_${Date.now()}@test.com`;
    console.log("Registering", email);
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      name: "Test User",
      email: email,
      password: "password123"
    });
    console.log("SUCCESS RESPONSE:", res.data);
  } catch (err) {
    console.error("ERROR:", err.response ? err.response.data : err.message);
  }
}
testReg();
