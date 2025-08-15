const http = require('http');

// Function to make a POST request
function makePostRequest(path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(JSON.stringify(data));
    req.end();
  });
}

// Test admin login
async function testAdminLogin() {
  console.log('Testing admin login...');
  try {
    const response = await makePostRequest('/api/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('Status Code:', response.statusCode);
    console.log('Response:', response.data);
    
    if (response.statusCode === 200 && response.data.success) {
      console.log('Admin login successful!');
    } else {
      console.log('Admin login failed!');
    }
  } catch (error) {
    console.error('Error testing admin login:', error);
  }
}

// Test test user login
async function testUserLogin() {
  console.log('\nTesting test user login...');
  try {
    const response = await makePostRequest('/api/login', {
      username: 'test',
      password: 'test123'
    });
    
    console.log('Status Code:', response.statusCode);
    console.log('Response:', response.data);
    
    if (response.statusCode === 200 && response.data.success) {
      console.log('Test user login successful!');
    } else {
      console.log('Test user login failed!');
    }
  } catch (error) {
    console.error('Error testing test user login:', error);
  }
}

// Test registration
async function testRegistration() {
  console.log('\nTesting user registration...');
  try {
    const response = await makePostRequest('/api/register', {
      username: 'newuser',
      password: 'newpass123',
      handle: 'newhandle'
    });
    
    console.log('Status Code:', response.statusCode);
    console.log('Response:', response.data);
    
    if (response.statusCode === 200 && response.data.success) {
      console.log('User registration successful!');
    } else {
      console.log('User registration failed!');
    }
  } catch (error) {
    console.error('Error testing user registration:', error);
  }
}

// Run the tests
async function runTests() {
  await testAdminLogin();
  await testUserLogin();
  await testRegistration();
}

runTests();
