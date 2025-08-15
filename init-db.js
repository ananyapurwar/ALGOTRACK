const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// Initialize SQLite database
const db = new sqlite3.Database(path.join(dbDir, 'users.db'));

// Helper function to hash passwords
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Create users table and admin user
db.serialize(() => {
  // Drop the table if it exists
  db.run('DROP TABLE IF EXISTS users');
  
  // Create the users table with the correct schema
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    handle TEXT,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  // Create admin user
  const adminPassword = hashPassword('admin123');
  db.run('INSERT INTO users (username, password, is_admin) VALUES (?, ?, 1)', 
    ['admin', adminPassword], 
    (err) => {
      if (err) {
        console.error('Error creating admin user:', err);
      } else {
        console.log('Admin user created successfully');
      }
      
      // Create a test user
      const testPassword = hashPassword('test123');
      db.run('INSERT INTO users (username, password, handle) VALUES (?, ?, ?)', 
        ['test', testPassword, 'testhandle'], 
        (err) => {
          if (err) {
            console.error('Error creating test user:', err);
          } else {
            console.log('Test user created successfully');
          }
          
          // Close the database connection
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err);
            } else {
              console.log('Database initialized successfully');
            }
          });
        }
      );
    }
  );
});
