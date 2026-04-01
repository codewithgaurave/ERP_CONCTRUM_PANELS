// Test Multiple Asset Assignment
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NGQ1ZjRhNTNiZmVlYjFlZTg4ZjhmZiIsImVtYWlsIjoiaHJpdGlraHIuZGlnaWNvZGVyc0BnbWFpbC5jb20iLCJyb2xlIjoiSFJfTWFuYWdlciIsImlhdCI6MTc2NzM5NTI1MCwiZXhwIjoxNzY3NDgxNjUwfQ.F1PJ5tdwsChwy-JvHiX_7du5h1Kg46MLiJl70hKcYMY';

async function testMultipleAssignment() {
  try {
    console.log('🔄 Testing Multiple Asset Assignment...\n');
    
    // Test 1: Try to assign same asset to different employee
    console.log('1️⃣ Assigning Mouse (AST0015) to Prince captain...');
    const response1 = await axios.post(
      `${BASE_URL}/assets/694fcf776a1ce7b542ec437a/assign`,
      { employeeId: '694f9b46171e123e1c061de7' },
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    
    if (response1.data.success) {
      console.log('✅ SUCCESS: Asset assigned to multiple employees!');
      console.log('👥 Current assignments:', response1.data.asset.assignedTo.filter(a => a.isActive).length);
    }
    
  } catch (error) {
    console.log('❌ ERROR:', error.response?.data?.message || error.message);
    
    if (error.response?.data?.message === 'Asset is already assigned to another employee') {
      console.log('🔧 Code changes not applied yet. Backend needs restart.');
    }
  }
}

testMultipleAssignment();