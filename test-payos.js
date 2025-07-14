require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');

// Test PayOS configuration
async function testPayOS() {
  console.log('🔍 Testing PayOS Configuration...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('PAYOS_CLIENT_ID:', process.env.PAYOS_CLIENT_ID ? '✅ Set' : '❌ Missing');
  console.log('PAYOS_API_KEY:', process.env.PAYOS_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('PAYOS_CHECKSUM_KEY:', process.env.PAYOS_CHECKSUM_KEY ? '✅ Set' : '❌ Missing');
  
  if (!process.env.PAYOS_CLIENT_ID || !process.env.PAYOS_API_KEY || !process.env.PAYOS_CHECKSUM_KEY) {
    console.log('\n❌ Missing PayOS environment variables!');
    console.log('Please set the following in your .env file:');
    console.log('PAYOS_CLIENT_ID=your_client_id');
    console.log('PAYOS_API_KEY=your_api_key');
    console.log('PAYOS_CHECKSUM_KEY=your_checksum_key');
    return;
  }
  
  // Test data
  const testData = {
    amount: 100000,
    description: 'Test order',
    orderCode: Date.now(),
    returnUrl: 'https://your-domain.com/payment-success.html',
    cancelUrl: 'https://your-domain.com/payment-success.html?cancel=1'
  };
  
  // Generate signature
  const dataString = `amount=${testData.amount}&cancelUrl=${testData.cancelUrl}&description=${testData.description}&orderCode=${testData.orderCode}&returnUrl=${testData.returnUrl}`;
  const signature = crypto.createHmac('sha256', process.env.PAYOS_CHECKSUM_KEY).update(dataString).digest('hex');
  
  console.log('\n📤 Sending test request to PayOS...');
  console.log('Request data:', {
    amount: testData.amount,
    description: testData.description,
    orderCode: testData.orderCode,
    cancelUrl: testData.cancelUrl,
    returnUrl: testData.returnUrl,
    signature: signature.substring(0, 20) + '...'
  });
  
  try {
    const response = await axios.post('https://api-merchant.payos.vn/v2/payment-requests', {
      amount: testData.amount,
      description: testData.description,
      orderCode: testData.orderCode,
      cancelUrl: testData.cancelUrl,
      returnUrl: testData.returnUrl,
      signature
    }, {
      headers: {
        'x-client-id': process.env.PAYOS_CLIENT_ID,
        'x-api-key': process.env.PAYOS_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ PayOS API Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.data && response.data.data.checkoutUrl) {
      console.log('\n🎉 PayOS integration is working!');
      console.log('Checkout URL:', response.data.data.checkoutUrl);
    } else {
      console.log('\n❌ PayOS response missing checkout URL');
    }
    
  } catch (error) {
    console.log('\n❌ PayOS API Error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Run test
testPayOS(); 