import express from "express";
import mysql from "mysql";
import bodyParser from "body-parser";
import cors from "cors";
import multer from 'multer';


const app = express();
const port = 8080;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const pool = mysql.createPool({
  multipleStatements: true,
  user: "root",
  password: "",
  database: "prosi",
  host: "127.0.0.1",
});

// Login endpoint
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  console.log("Received login request:", email, password);

  const query = "SELECT * FROM pengguna WHERE email = ? AND password = ?";
  pool.query(query, [email, password], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length > 0) {
      res.json({ success: true, message: "Login successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  });
});

// Signup endpoint
app.post("/api/signup", (req, res) => {
  const { username, password, fullName, email, phone } = req.body;

  // Ensure no field is empty
  if (!username || !password || !fullName || !email || !phone) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const checkUserQuery = "SELECT * FROM pengguna WHERE email = ?";
  const insertUserQuery = `
    INSERT INTO pengguna (username, password, nama_lengkap, email, role, nomor_telepon)
    VALUES (?, ?, ?, ?, 'pengguna', ?)
  `;

  // Check if user already exists
  pool.query(checkUserQuery, [email], (err, results) => {
    if (err) {
      console.error("Database error during user check:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    if (results.length > 0) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Insert new user into the database
    pool.query(insertUserQuery, [username, password, fullName, email, phone], (err, results) => {
      if (err) {
        console.error("Database error during user insertion:", err);
        return res.status(500).json({ success: false, message: "Failed to register user" });
      }

      res.json({ success: true, message: "Signup successful" });
    });
  });
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Report lapak endpoint (for submitting reports with file upload)
app.post("/api/laporLapak", upload.single("foto"), (req, res) => {
  const { alasan_lapak } = req.body;
  const foto = req.file ? req.file.buffer : null; // Get the uploaded file buffer

  // Check if the required field is provided
  if (!alasan_lapak) {
    return res.status(400).json({ success: false, message: "Alasan lapak is required" });
  }

  const insertQuery = `
    INSERT INTO laporan_lapak (alasan_lapak, foto)
    VALUES (?, ?)
  `;

  // Insert new report into the database
  pool.query(insertQuery, [alasan_lapak, foto], (err, results) => {
    if (err) {
      console.error("Database error during report insertion:", err);
      return res.status(500).json({ success: false, message: "Failed to submit report" });
    }

    res.json({ success: true, message: "Report submitted successfully" });
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


// Get user profile endpoint
app.get("/api/profile/:email", (req, res) => {
  const { email } = req.params;

  const query = "SELECT username, nama_lengkap AS fullName, email, nomor_telepon AS phone FROM pengguna WHERE email = ?";
  
  pool.query(query, [email], (err, results) => {
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
});


app.listen(port, () => {
console.log(`Server running on http://localhost:${port}`);
});