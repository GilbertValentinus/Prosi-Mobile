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
        telepon, deskripsiLapak, situs, layanan, 
        latitude, longitude // gunakan latitude dan longitude
      } = req.body;
    
      const jamBuka = JSON.parse(req.body.jamBuka); // Parse jamBuka yang dikirim dalam format JSON
      const fotoPath = req.file ? req.file.path : null;
      const tanggalKlaim = new Date(); // Tanggal klaim otomatis diisi oleh server
    
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }
    
      const insertLapakQuery = `
        INSERT INTO lapak (id_pengguna, nama_lapak, kategori_lapak, lokasi_lapak,
                          nomor_telepon, deskripsi_lapak, situs, layanan, 
                          latitude, longitude, tanggal_pengajuan, foto_lapak)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
    
      pool.query(insertLapakQuery, 
        [userId, namaLapak, kategoriLapak, alamat, 
        telepon, deskripsiLapak, situs, layanan, 
        latitude, longitude, tanggalKlaim, fotoPath], 
        (err, results) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: 'Failed to save lapak' });
          }
    
          const lapakId = results.insertId; // Ambil ID lapak yang baru saja dimasukkan
    
          // Insert data jam buka ke tabel 'buka' dan 'hari'
          const insertBukaQuery = `
            INSERT INTO buka (id_lapak, id_hari, jam_buka, jam_tutup)
            VALUES (?, (SELECT id_hari FROM hari WHERE nama_hari = ?), ?, ?)
          `;
    
          const bukaPromises = jamBuka.map(entry => {
            if (entry.buka) {
              return new Promise((resolve, reject) => {
                pool.query(insertBukaQuery, 
                  [lapakId, entry.hari, entry.jamBuka, entry.jamTutup], 
                  (err) => {
                    if (err) {
                      return reject(err);
                    }
                    resolve();
                  });
              });
            }
            return Promise.resolve();
          });
    
          Promise.all(bukaPromises)
            .then(() => {
              res.json({ success: true, message: 'Lapak and buka times saved successfully' });
            })
            .catch(err => {
              console.error("Error saving buka times:", err);
              res.status(500).json({ success: false, message: 'Failed to save buka times' });
            });
        }
      );
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
    
    app.get('/api/lapak-summary', (req, res) => {
      // Ensure the user is logged in
      if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'User not logged in' });
      }
    
      const userId = req.session.userId; // Get the logged-in user ID from session
    
      const query = `
        SELECT nama_lapak, lokasi_lapak 
        FROM lapak
        WHERE id_pengguna = ? AND status_lapak = 'terverifikasi'
      `;
    
      pool.query(query, [userId], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }
    
        // Send only the name and address of each lapak
        const lapaks = results.map(row => ({
          name: row.nama_lapak,
          address: row.lokasi_lapak
        }));
    
        res.json({ success: true, lapaks });
      });
    });
    
    

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });