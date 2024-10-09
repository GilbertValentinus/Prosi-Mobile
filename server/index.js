import express from "express";
import mysql from "mysql";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import multer from 'multer';


const app = express();
const port = 8080;

app.use(cors({
  origin: 'http://localhost:5173', // Change to your frontend origin
  credentials: true // Allow credentials to be sent
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'secret', // Replace with a strong secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
  }
}));

const pool = mysql.createPool({
  multipleStatements: true,
  user: "root",
  password: "",
  database: "prosi",
  host: "127.0.0.1",
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    console.log("Received login request:", email, password);
  
    const query = "SELECT * FROM pengguna WHERE email = ? AND password = ?";
    pool.query(query, [email, password], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (results.length > 0) {
        req.session.userId = results[0].id_pengguna;

        console.log("User logged in with ID:", req.session.userId);

        console.log(results);

        res.json({ success: true, message: "Login successful" });
      } else {
        res.json({ success: false, message: "Invalid email or password" });
      }
    });
  });

// Logout route to clear the session
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ success: true, message: "Logout successful" });
  });
});

// Route to check if the user is logged in and get user info
app.get('/api/user', (req, res) => {
  if (req.session.userId) {
    const query = "SELECT * FROM pengguna WHERE id_pengguna = ?";
    pool.query(query, [req.session.userId], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (results.length > 0) {
        res.json({ success: true, user: results[0] });
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
    });
  } else {
    res.status(401).json({ success: false, message: "Not logged in" });
  }
});


  app.post('/api/signup', (req, res) => {
    const { username, password, fullName, email, phone } = req.body;
  
    // Make sure none of the fields are empty
    if (!username || !password || !fullName || !email || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
  
    const checkUserQuery = "SELECT * FROM pengguna WHERE email = ?";
    const insertUserQuery = `
      INSERT INTO pengguna (username, password, nama_lengkap, email, role, nomor_telepon)
      VALUES (?, ?, ?, ?, 'pengguna', ?)
    `;
  
    // Check if user already exists
    pool.query(checkUserQuery, [email], (err, results) => {
      if (err) {
        console.error('Database error during user check:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      if (results.length > 0) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }
  
      // Insert new user into the database
      pool.query(insertUserQuery, [username, password, fullName, email, phone], (err, results) => {
        if (err) {
          console.error('Database error during user insertion:', err);
          return res.status(500).json({ success: false, message: 'Failed to register user' });
        }
  
        res.json({ success: true, message: 'Signup successful' });
      });
    });
  });
  
  
app.get('/api/test-db', (req, res) => {
    pool.query('SELECT 1 + 1 AS result', (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database connection failed' });
      }
      res.json({ success: true, message: 'Connected to the database', result: results });
    });
  });
  
  app.post('/api/claim-lapak', upload.single('foto'), (req, res) => {
    const { 
      userId, namaLapak, kategoriLapak, alamat, 
      telepon, deskripsiLapak
    } = req.body;
    const fotoPath = req.file ? req.file.path : null;
  
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
  
    const insertLapakQuery = `
      INSERT INTO lapak (id_pengguna, nama_lapak, kategori_lapak, lokasi_lapak,
                        nomor_telepon, deskripsi_lapak, foto_lapak)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
  
    pool.query(insertLapakQuery, 
      [userId, namaLapak, kategoriLapak, alamat, 
       telepon, deskripsiLapak, fotoPath],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ success: false, message: 'Failed to save lapak' });
        }
        res.json({ success: true, message: 'Lapak saved successfully' });
      }
    );
  });
  

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});