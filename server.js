const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
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

// Create users table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    handle TEXT,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create admin user if it doesn't exist (username: admin, password: admin123)
  db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, user) => {
    if (err) {
      console.error('Error checking for admin user:', err);
      return;
    }

    if (!user) {
      const passwordHash = crypto.createHash('sha256').update('admin123').digest('hex');
      db.run('INSERT INTO users (username, password, is_admin) VALUES (?, ?, 1)',
        ['admin', passwordHash],
        (err) => {
          if (err) {
            console.error('Error creating admin user:', err);
          } else {
            console.log('Admin user created successfully');
          }
        }
      );
    }
  });
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configure middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'algotrack_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Helper function to hash passwords
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper function to verify passwords
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login.html');
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.is_admin === 1) {
    return next();
  }
  res.status(403).send('Access denied');
};

// Serve static files
app.use(express.static(path.join(__dirname)));

// Auth routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Store user in session
    req.session.user = {
      id: user.id,
      username: user.username,
      handle: user.handle,
      is_admin: user.is_admin
    };

    res.json({ success: true, isAdmin: user.is_admin === 1 });
  });
});

app.post('/api/register', (req, res) => {
  const { username, password, handle } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const passwordHash = hashPassword(password);

  db.run('INSERT INTO users (username, password, handle) VALUES (?, ?, ?)',
    [username, passwordHash, handle || null],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Username already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      // Store user in session
      req.session.user = {
        id: this.lastID,
        username,
        handle,
        is_admin: 0
      };

      res.json({ success: true });
    }
  );
});

app.post('/api/update-handle', isAuthenticated, (req, res) => {
  const { handle } = req.body;

  if (!handle) {
    return res.status(400).json({ error: 'Handle is required' });
  }

  db.run('UPDATE users SET handle = ? WHERE id = ?',
    [handle, req.session.user.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Update session
      req.session.user.handle = handle;

      res.json({ success: true });
    }
  );
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging out' });
    }
    res.redirect('/');
  });
});

// User info route
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json({
      isAuthenticated: true,
      user: {
        id: req.session.user.id,
        username: req.session.user.username,
        handle: req.session.user.handle,
        isAdmin: req.session.user.is_admin === 1
      }
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Admin routes
app.get('/admin', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/api/admin/users', isAdmin, (req, res) => {
  db.all('SELECT id, username, handle, is_admin, created_at FROM users ORDER BY created_at DESC', (err, users) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(users);
  });
});

// Route to get user credentials (for admin only)
app.get('/api/admin/user-credentials', isAdmin, (req, res) => {
  db.all('SELECT id, username, password, handle, is_admin, created_at FROM users ORDER BY created_at DESC', (err, users) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(users);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the application`);
  console.log('Default admin credentials:');
  console.log('Username: admin');
  console.log('Password: admin123');
});
