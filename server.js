const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Improved database setup with better error handling
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        console.error('Full error details:', err);
    } else {
        console.log('✅ Connected to SQLite database on macOS');
        console.log('📁 Database file location:', path.join(__dirname, 'users.db'));
        
        // Create users table with better error handling
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('❌ Error creating table:', err.message);
            } else {
                console.log('✅ Users table ready');
            }
        });
    }
});

// Serve the registration form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle registration form submission WITH DETAILED LOGGING
app.post('/register', (req, res) => {
    console.log('📨 Registration request received');
    console.log('Request body:', req.body);
    
    const { fullName, email, phone, password } = req.body;
    
    // Log what we received
    console.log('📝 Form data received:');
    console.log('  Full Name:', fullName);
    console.log('  Email:', email);
    console.log('  Phone:', phone);
    console.log('  Password:', password ? '***' : 'MISSING');
    
    // Validation
    if (!fullName || !email || !password) {
        console.log('❌ Validation failed - missing required fields');
        return res.status(400).json({ 
            success: false, 
            message: 'Please fill all required fields' 
        });
    }

    console.log('✅ Validation passed, attempting database insert...');

    // Insert into database
    const sql = `INSERT INTO users (full_name, email, phone, password) 
                 VALUES (?, ?, ?, ?)`;
    
    console.log('📊 Executing SQL:', sql);
    console.log('📊 With values:', [fullName, email, phone, password]);
    
    db.run(sql, [fullName, email, phone, password], function(err) {
        if (err) {
            console.error('❌ Database insertion error:', err.message);
            console.error('Full error:', err);
            
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email already registered' 
                });
            }
            return res.status(500).json({ 
                success: false, 
                message: 'Database error: ' + err.message 
            });
        }
        
        console.log('✅ User inserted successfully!');
        console.log('📋 Inserted user ID:', this.lastID);
        console.log('📋 Rows affected:', this.changes);
        
        res.json({ 
            success: true, 
            message: 'Registration successful!',
            userId: this.lastID 
        });
    });
});

// API endpoint to view all users (for testing)
app.get('/users', (req, res) => {
    db.all("SELECT id, full_name, email, phone, created_at FROM users", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// macOS-specific: Listen on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌐 To access from other devices:`);
    console.log(`   http://YOUR_MAC_IP:${PORT}`);
    console.log(`\n💡 Find your IP address by running:`);
    console.log(`   ifconfig | grep "inet " | grep -v 127.0.0.1`);
});
