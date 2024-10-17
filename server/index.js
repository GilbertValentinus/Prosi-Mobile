import express from "express";
import mysql from "mysql";
import bodyParser from "body-parser";
import cors from "cors";

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
        res.json({ success: true, message: "Login successful" });
      } else {
        res.json({ success: false, message: "Invalid email or password" });
      }
    });
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

  app.get('/api/lapak', (req, res) => {
    const currentDay = new Date().getDay(); // Hari saat ini (0=Sunday, 1=Monday, ..., 6=Saturday)
    
    const query = `
      SELECT 
        l.id_lapak, 
        l.nama_lapak, 
        l.lokasi_lapak, 
        l.latitude, 
        l.longitude, 
        l.situs, 
        l.foto_lapak,
        b.jam_buka,
        b.jam_tutup,
        u.id_ulasan,
        u.rating,
        u.tanggal,
        u.deskripsi,
        u.foto AS ulasan_foto,
        p.nama_lengkap AS nama_pengguna
      FROM lapak l
      LEFT JOIN buka b ON l.id_lapak = b.id_lapak
      LEFT JOIN hari h ON b.id_hari = h.id_hari
      LEFT JOIN ulasan u ON l.id_lapak = u.id_lapak
      LEFT JOIN pengguna p ON u.id_pengguna = p.id_pengguna
      WHERE l.status_lapak = 'terverifikasi' AND h.id_hari = ?
    `;
    
    pool.query(query, [currentDay], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
    
      const lapaks = results.reduce((acc, row) => {
        const lapak = acc.find(l => l.id_lapak === row.id_lapak);
        const review = {
          id_ulasan: row.id_ulasan,
          rating: row.rating,
          tanggal: row.tanggal,
          deskripsi: row.deskripsi,
          ulasan_foto: row.ulasan_foto,
          nama_pengguna: row.nama_pengguna,
        };
    
        // Convert foto_lapak (BLOB) to base64 if it exists
        const foto_lapak_base64 = row.foto_lapak ? Buffer.from(row.foto_lapak).toString('base64') : null;
    
        if (lapak) {
          lapak.ulasan.push(review);
        } else {
          acc.push({
            id_lapak: row.id_lapak,
            nama_lapak: row.nama_lapak,
            lokasi_lapak: row.lokasi_lapak,
            latitude: row.latitude,
            longitude: row.longitude,
            situs: row.situs,
            foto_lapak: foto_lapak_base64 ? `data:image/jpeg;base64,${foto_lapak_base64}` : null,
            jam_buka: row.jam_buka,
            jam_tutup: row.jam_tutup,
            ulasan: row.id_ulasan ? [review] : [], // If ulasan exists, add it to array
          });
        }
        return acc;
      }, []);
    
      res.json({ success: true, lapaks });
    });
  });

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
