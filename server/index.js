import express from "express";
import mysql from "mysql";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import multer from "multer";


const app = express();
const port = 8080;


const storage = multer.memoryStorage(); // This stores the file as a buffer
const upload = multer({ storage: storage });


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

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// const upload = multer({ storage });

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

  // Add this to your server's index.js file

app.get('/api/search', (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ success: false, message: 'Search query is required' });
  }

  const searchQuery = `
    SELECT * FROM lapak
    Where status_lapak = "terverifikasi" 
    AND nama_lapak LIKE ? 
    OR deskripsi_lapak LIKE ? 
    OR kategori_lapak LIKE ? 
    OR lokasi_lapak LIKE ?
    LIMIT 20
  `;

  const searchTerm = `%${query}%`;

  pool.query(searchQuery, [searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error('Database error during search:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, results });
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
      LEFT JOIN hari h ON b.id_hari = h.id_hari AND h.id_hari = ? -- Kondisi h.id_hari dipindah ke sini
      LEFT JOIN ulasan u ON l.id_lapak = u.id_lapak
      LEFT JOIN pengguna p ON u.id_pengguna = p.id_pengguna
      WHERE l.status_lapak = 'terverifikasi'
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
  
      // Jika tidak ada lapak yang buka pada hari ini
      if (lapaks.length === 0) {
        return res.json({ success: true, lapaks: [], message: 'Tidak ada lapak yang buka hari ini' });
      }
  
      res.json({ success: true, lapaks });
    });
  });
  
  

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.get('/api/user-ticket', (req, res) => {
  const userId = req.session.userId; // Assuming you have user sessions
  pool.query(
    'SELECT * FROM support_tickets WHERE user_id = ? AND status = "open" ORDER BY created_at DESC LIMIT 1',
    [userId],
    (error, results) => {
      if (error) {
        console.error('Error fetching user ticket:', error);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      res.json({ ticket: results[0] || null });
    }
  );
});

// Create a new ticket
app.post('/api/create-ticket', (req, res) => {
  const userId = req.session.userId; // Assuming you have user sessions
  const { subject } = req.body;
  pool.query(
    'INSERT INTO support_tickets (user_id, subject, status, created_at, updated_at) VALUES (?, ?, "open", NOW(), NOW())',
    [userId, subject],
    (error, result) => {
      if (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      res.json({ ticket: { ticket_id: result.insertId, subject, status: 'open' } });
    }
  );
});

// Fetch messages for a ticket
app.get('/api/messages/:ticketId', (req, res) => {
  const { ticketId } = req.params;
  pool.query(
    `SELECT m.*, a.file_path, a.file_type
     FROM messages m 
     LEFT JOIN attachments a ON m.message_id = a.message_id
     WHERE m.ticket_id = ? 
     ORDER BY m.created_at`,
    [ticketId],
    (error, results) => {
      if (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      res.json(results);
    }
  );
});

// Send a new message
app.post('/api/send-message', (req, res) => {
  const { ticketId, text, senderType } = req.body;
  const senderId = req.session.userId; // Assuming you have user sessions
  pool.query(
    `INSERT INTO messages (ticket_id, sender_id, sender_type, message, created_at) 
     VALUES (?, ?, ?, ?, NOW())`,
    [ticketId, senderId, senderType, text],
    (error, result) => {
      if (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      res.json({ message: 'Message sent successfully' });
    }
  );
});

// End chat (close ticket)
app.post('/api/end-chat/:ticketId', (req, res) => {
  const { ticketId } = req.params;
  pool.query(
    'UPDATE support_tickets SET status = "closed", updated_at = NOW() WHERE ticket_id = ?',
    [ticketId],
    (error) => {
      if (error) {
        console.error('Error closing ticket:', error);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      res.json({ message: 'Chat ended successfully' });
    }
  );
});

// Upload a photo
app.post('/api/send-photo', upload.single('photo'), (req, res) => {
  const { ticketId } = req.body;
  const senderId = req.session.userId; // Assuming you have user sessions
  const photo = req.file.buffer;
  pool.query(
    `INSERT INTO messages (ticket_id, sender_id, sender_type, created_at) 
     VALUES (?, ?, 'user', NOW())`,
    [ticketId, senderId],
    (error, result) => {
      if (error) {
        console.error('Error inserting message:', error);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      const messageId = result.insertId;
      pool.query(
        `INSERT INTO attachments (message_id, file_path, file_type, uploaded_at) 
         VALUES (?, ?, ?, NOW())`,
        [messageId, photo, req.file.mimetype],
        (error) => {
          if (error) {
            console.error('Error inserting attachment:', error);
            res.status(500).json({ error: 'Database error' });
            return;
          }
          res.json({ message: 'Photo uploaded successfully' });
        }
      );
    }
  );
});

// Serve image
app.get('/api/image/:messageId', (req, res) => {
  const { messageId } = req.params;
  pool.query(
    'SELECT file_path, file_type FROM attachments WHERE message_id = ?',
    [messageId],
    (error, results) => {
      if (error) {
        console.error('Error fetching image:', error);
        res.status(500).send('Error fetching image');
        return;
      }
      if (results.length === 0) {
        res.status(404).send('Image not found');
        return;
      }
      const { file_path, file_type } = results[0];
      res.contentType(file_type);
      res.send(file_path);
    }
  );
});
      
