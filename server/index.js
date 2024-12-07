import express from "express";
import mysql from "mysql";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import multer from "multer";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from 'dotenv';
dotenv.config();
// require('dotenv').config();


dotenv.config({ path: './email.env' });

// Immediately after, add console logs to verify
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Password is set' : 'Password is NOT set');

const app = express();
const port = 8080;
const storage = multer.memoryStorage(); // This stores the file as a buffer
const upload = multer({ storage: storage });

// const nodemailer = require('nodemailer');
// const crypto = require('crypto');

app.use(cors({
  origin: ['http://localhost:5173', 'https://prosi-mobile-kl9c-c722d89cz-otwtajirs-projects.vercel.app'], // Change to your frontend origin
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

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    next(); // Continue if the user is authenticated
  } else {
    // Redirect to the login page if not authenticated
    res.redirect('/login'); // Change this to your actual login route
  }
}


const pool = mysql.createPool({
  host: 'https://pretty-geese-hear.loca.lt', // URL dari LocalTunnel
  port: 3306,                    // Port MySQL
  multipleStatements: true,
  user: "root",
  password: "",
  database: "prosi",
  // host: "127.0.0.1",
});

app.post('/api/login', (req, res) => {
  const { identifier, password } = req.body;

  const query = "SELECT * FROM pengguna WHERE (email = ? OR username = ?) AND password = ?";
  pool.query(query, [identifier, identifier, password], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length > 0) {
      req.session.userId = results[0].id_pengguna;
      res.json({ success: true, message: "Login successful" });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  });
});


const transporter = nodemailer.createTransport({
  // Configure your email service here
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// async function testEmailSend() {
//   try {
//     const info = await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: process.env.TEST, // Send to yourself for testing
//       subject: 'Email Configuration Test',
//       text: 'This is a test email to verify SMTP configuration.'
//     });

//     console.log('Test email sent successfully:', info);
//     console.log('Message ID:', info.messageId);
//   } catch (error) {
//     console.error('Error sending test email:', error);
//   }
// }

// // Call the test function
// testEmailSend();

// Forgot password endpoint
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  // Check if email exists
  const query = "SELECT * FROM pengguna WHERE email = ?";
  pool.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.json({ message: "If an account exists with this email, you will receive a password reset link." });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in database
    const updateQuery = "UPDATE pengguna SET reset_token = ?, reset_token_expires = ? WHERE email = ?";
    pool.query(updateQuery, [token, expiry, email], async (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ message: "Error generating reset token" });
      }

      // Send email
      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <p>Anda telah meminta untuk mengatur ulang kata sandi Anda.</p>
          <p>Silakan klik tautan di bawah ini untuk mengatur ulang kata sandi Anda:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>Tautan ini akan kedaluwarsa dalam 1 jam.</p>
          <p>Jika Anda tidak meminta pengaturan ulang kata sandi, Anda dapat mengabaikan email ini.</p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "If an account exists with this email, you will receive a password reset link." });
      } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ message: "Error sending email" });
      }
    });
  });
});

// Reset password endpoint
app.post('/api/reset-password', (req, res) => {
  const { token, password } = req.body;

  // Verify token and update password
  const query = "SELECT * FROM pengguna WHERE reset_token = ? AND reset_token_expires > NOW()";
  pool.query(query, [token], (err, results) => {
    if (err || results.length === 0) {
      return res.json({ 
        success: false, 
        message: "Invalid or expired reset token" 
      });
    }

    // Update password and clear reset token
    const updateQuery = "UPDATE pengguna SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id_pengguna = ?";
    pool.query(updateQuery, [password, results[0].id_pengguna], (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ 
          success: false, 
          message: "Error updating password" 
        });
      }

      res.json({ 
        success: true, 
        message: "Password successfully reset" 
      });
    });
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
    AND (nama_lapak LIKE ? 
    OR deskripsi_lapak LIKE ? 
    OR kategori_lapak LIKE ? 
    OR lokasi_lapak LIKE ?)
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
      telepon, deskripsiLapak, situs, layanan, 
      latitude, longitude 
    } = req.body;
  
    const jamBuka = JSON.parse(req.body.jamBuka);
    const foto = req.file ? req.file.buffer : null; // Simpan file sebagai buffer untuk BLOB
    const tanggalKlaim = new Date();
  
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
      latitude, longitude, tanggalKlaim, foto], 
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ success: false, message: 'Failed to save lapak' });
        }
  
        const lapakId = results.insertId;
  
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
  

  app.post('/api/edit-lapak', upload.single('foto'), (req, res) => {
    const { 
      userId, lapakId, namaLapak, kategoriLapak, alamat, 
      telepon, deskripsiLapak, situs, layanan
    } = req.body;

    console.log('Received lapakId:', lapakId);
  
    const jamBuka = JSON.parse(req.body.jamBuka);
    const fotoPath = req.file ? req.file.buffer : null;
    const tanggalKlaim = new Date();
  
    if (!userId || !lapakId) {
      return res.status(400).json({ 
        success: false, 
        message: !userId ? 'User ID is required' : 'Lapak ID is required' 
      });
    }
  
    // Tambahkan log untuk memeriksa nilai lapakId
    console.log('Lapak ID:', lapakId);
  
    const insertLapakQuery = `
      INSERT INTO pembaruan_lapak (
        id_pengguna, id_lapak, nama_lapak_pembaruan, 
        kategori_lapak_pembaruan, lokasi_lapak_pembaruan,
        nomor_telepon_pembaruan, deskripsi_lapak_pembaruan, 
        situs_pembaruan, layanan_pembaruan, 
        tanggal_pengajuan_pembaruan, foto_lapak_pembaruan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    pool.query(insertLapakQuery, 
      [userId, lapakId, namaLapak, kategoriLapak, alamat, 
      telepon, deskripsiLapak, situs, layanan, tanggalKlaim, fotoPath], 
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ success: false, message: 'Failed to save lapak' });
        }

        const pembaruanId = results.insertId;
  
        // Insert data jam buka ke tabel 'buka' dan 'hari'
        const insertBukaQuery = `
          INSERT INTO buka_pembaruan (id_lapak, id_hari, id_pembaruan, jam_buka, jam_tutup)
          VALUES (?, (SELECT id_hari FROM hari WHERE nama_hari = ?), ?, ?, ?)
        `;

        const bukaPromises = jamBuka.map(entry => {
          if (entry.buka) {
            return new Promise((resolve, reject) => {
              pool.query(insertBukaQuery, 
                [lapakId, entry.hari, pembaruanId, entry.jamBuka, entry.jamTutup], 
                (err) => {
                  if (err) {
                    console.error(`Error inserting buka data for ${entry.hari}:`, err); // Tambahkan log untuk error
                    return reject(err);
                  }
                  resolve();
                }
              );
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
    const currentDay = new Date().getDay();
    
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
      LEFT JOIN hari h ON b.id_hari = h.id_hari AND h.id_hari = ?
      LEFT JOIN ulasan u ON l.id_lapak = u.id_lapak
      LEFT JOIN pengguna p ON u.id_pengguna = p.id_pengguna
      WHERE l.status_lapak = 'terverifikasi'
      ORDER BY u.tanggal DESC
    `;

    pool.query(query, [currentDay], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        // Handle empty results
        if (!results || results.length === 0) {
            return res.json({ 
                success: true, 
                lapaks: [], 
                message: 'Tidak ada lapak yang buka hari ini' 
            });
        }

        try {
            const convertBlobToBase64 = (blob) => {
                if (!blob) return null;
                try {
                    const base64 = Buffer.from(blob).toString('base64');
                    return `data:image/jpeg;base64,${base64}`;
                } catch (error) {
                    console.error('Error converting blob to base64:', error);
                    return null;
                }
            };

            const lapaks = results.reduce((acc, row) => {
                // Konversi foto ulasan dan lapak
                const ulasan_foto_base64 = convertBlobToBase64(row.ulasan_foto);
                const foto_lapak_base64 = convertBlobToBase64(row.foto_lapak);

                // Buat objek review
                const review = row.id_ulasan ? {
                    id_ulasan: row.id_ulasan,
                    rating: row.rating,
                    tanggal: row.tanggal,
                    deskripsi: row.deskripsi,
                    foto: ulasan_foto_base64,
                    nama_pengguna: row.nama_pengguna
                } : null;

                // Cari lapak yang sudah ada
                const existingLapak = acc.find(l => l.id_lapak === row.id_lapak);

                if (existingLapak) {
                    if (review) {
                        const reviewExists = existingLapak.ulasan.some(u => u.id_ulasan === review.id_ulasan);
                        if (!reviewExists) {
                            existingLapak.ulasan.push(review);
                        }
                    }
                } else {
                    // Buat lapak baru
                    acc.push({
                        id_lapak: row.id_lapak,
                        nama_lapak: row.nama_lapak,
                        lokasi_lapak: row.lokasi_lapak,
                        latitude: row.latitude,
                        longitude: row.longitude,
                        situs: row.situs,
                        foto_lapak: foto_lapak_base64,
                        jam_buka: row.jam_buka,
                        jam_tutup: row.jam_tutup,
                        ulasan: review ? [review] : []
                    });
                }
                return acc;
            }, []);

            // Sort ulasan for each lapak
            lapaks.forEach(lapak => {
                if (lapak.ulasan && lapak.ulasan.length > 0) {
                    lapak.ulasan.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
                }
            });

            // Check if any lapaks were found
            if (lapaks.length === 0) {
                return res.json({ 
                    success: true, 
                    lapaks: [], 
                    message: 'Tidak ada lapak yang buka hari ini' 
                });
            }

            // Return the processed lapaks
            return res.json({ 
                success: true, 
                lapaks,
                message: `${lapaks.length} lapak ditemukan`
            });

        } catch (error) {
            console.error('Error processing data:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error processing data',
                error: error.message 
            });
        }
    });
});

// Endpoint untuk menambahkan lapak favorit
app.post('/api/lapak/favorit', (req, res) => {
  const { lapakId } = req.body;

  if (!lapakId) {
    return res.status(400).json({ success: false, message: "lapakId is required" });
  }

  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "Silakan login terlebih dahulu" });
  }

  const query = "INSERT INTO lapak_favorit (id_pengguna, id_lapak) VALUES (?, ?)";
  pool.query(query, [req.session.userId, lapakId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, message: `Database error: ${err.message}` });
    }
    res.json({ success: true, message: "Lapak ditambahkan ke favorit" });
  });
});

// Endpoint untuk menghapus lapak favorit
app.delete('/api/lapak/favorit', (req, res) => {
  const { lapakId } = req.body;

  if (!lapakId) {
    return res.status(400).json({ success: false, message: "lapakId is required" });
  }

  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "Silakan login terlebih dahulu" });
  }

  const query = "DELETE FROM lapak_favorit WHERE id_pengguna = ? AND id_lapak = ?";
  pool.query(query, [req.session.userId, lapakId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, message: `Database error: ${err.message}` });
    }
    res.json({ success: true, message: "Lapak dihapus dari favorit" });
  });
});

app.get('/api/lapak/favorite/:userId', (req, res) => {
  const userId = req.params.userId;
  const currentDay = new Date().getDay();

  // Log untuk debugging
  console.log('Request for user ID:', userId);
  console.log('Current day:', currentDay);

  const query = `
    SELECT DISTINCT
      l.id_lapak, 
      l.nama_lapak, 
      l.lokasi_lapak,
      b.jam_buka,
      b.jam_tutup
    FROM lapak_favorit lf
    JOIN lapak l ON lf.id_lapak = l.id_lapak
    LEFT JOIN buka b ON l.id_lapak = b.id_lapak
    WHERE lf.id_pengguna = ?
    AND l.status_lapak = 'terverifikasi'
    ORDER BY l.nama_lapak ASC
  `;

  // Log query untuk debugging
  console.log('Query:', query);
  console.log('Parameters:', [userId]);

  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    // Log results untuk debugging
    console.log('Query results:', results);

    // Pastikan results adalah array
    const lapaks = Array.isArray(results) ? results : [];

    res.json({ 
      success: true, 
      lapaks: lapaks
    });
  });
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

//=================================================== Vincent
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

// Endpoint to submit a report with photo upload
app.post('/api/laporLapak', upload.single('foto'), (req, res) => {
  const { alasan_lapak, id_lapak } = req.body;
  const userId = req.session.userId; // Get user ID from session

  // Check if all required fields are present
  if (!id_lapak || !userId || !alasan_lapak || !req.file) {
    return res.status(400).json({ success: false, message: 'All fields are required, including photo' });
  }

  // Fetch user data based on userId
  pool.query(
    `SELECT * FROM pengguna WHERE id_pengguna = ?`,
    [userId],
    (error, results) => {
      if (error) {
        console.error('Error fetching user data:', error);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (!results.length) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const user = results[0]; // Get the first (and expected) user result
      console.log(user);
      // Now you can proceed to insert the report
      pool.query(
        `INSERT INTO laporan (id_pengguna, id_lapak, tanggal, status, nomor_telp) 
         VALUES (?, ?, NOW(), 'pending', ?)`,
        [user.id_pengguna, id_lapak, user.nomor_telepon],
        (error, result) => {
          if (error) {
            console.error('Error inserting report:', error);
            return res.status(500).json({ error: 'Database error' });
          }

          const reportId = result.insertId; // Get the ID of the inserted report

          // Handle photo upload
          const foto = req.file.buffer; // Get the photo buffer
          // Insert into laporan_lapak with required photo
          pool.query(
            `INSERT INTO laporan_lapak (id_laporan, alasan_lapak, foto) 
             VALUES (?, ?, ?)`,
            [reportId, alasan_lapak, foto],
            (error) => {
              if (error) {
                console.error('Error inserting attachment:', error);
                return res.status(500).json({ error: 'Database error' });
              }
              res.json({ success: true, message: 'Report submitted successfully with photo' });
            }
          );
        }
      );
    }
  );
});


// Endpoint to retrieve reports for a specific lapak
app.get('/api/laporLapak/:id_lapak', (req, res) => {
  const id_lapak = req.params.id_lapak; // Get id_lapak from URL parameter
  console.log(id_lapak);
  if (isNaN(id_lapak)) {
    return res.status(400).json({ success: false, message: 'Invalid lapak ID' });
  }

  // SQL query to fetch reports for the specific lapak
  const query = `
    SELECT 
      l.id_laporan,
      l.tanggal,
      l.alasan_lapak,
      l.foto,
      p.nama_lengkap AS nama_pengguna
    FROM laporan l
    LEFT JOIN pengguna p ON l.id_pengguna = p.id_pengguna
    WHERE l.id_lapak = ?
    ORDER BY l.tanggal DESC
  `;

  // Execute query
  pool.query(query, [id_lapak], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ success: false, message: 'No reports found' });
    }

    const reports = results.map(({ id_laporan, tanggal, alasan_lapak, foto, nama_pengguna }) => ({
      id_laporan,
      tanggal,
      alasan_lapak,
      foto,
      nama_pengguna,
    }));

    return res.json({ success: true, reports });
  });
});




app.post('/api/review', upload.single('foto'), (req, res) => {
  console.log("Received request body:", req.body);
  console.log("Received file:", req.file);

  const { id_lapak, id_pengguna, rating, deskripsi } = req.body;

  // Validasi input wajib
  if (!id_lapak || !id_pengguna || !rating || !deskripsi) {
    return res.status(400).json({
      success: false,
      message: 'Semua kolom wajib diisi kecuali foto',
      missing: {
        id_lapak: !id_lapak,
        id_pengguna: !id_pengguna,
        rating: !rating,
        deskripsi: !deskripsi,
      },
    });
  }

  // Set foto sebagai buffer jika ada, atau null jika tidak ada
  const foto = req.file ? req.file.buffer : null;

  const query = `
    INSERT INTO ulasan (id_lapak, id_pengguna, rating, tanggal, deskripsi, foto) 
    VALUES (?, ?, ?, NOW(), ?, ?)
  `;

  // Eksekusi query dengan nilai foto yang dinamis
  pool.query(query, [id_lapak, id_pengguna, rating, deskripsi, foto], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.sqlMessage || err.message,
      });
    }

    res.json({
      success: true,
      message: 'Review berhasil dikirim',
      reviewId: result.insertId,
    });
  });
});
  
  app.get('/api/lapak-summary', (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: 'User not logged in' });
    }
  
    const userId = req.session.userId;
  
    const query = `
      SELECT id_lapak, nama_lapak, lokasi_lapak, status_lapak
      FROM lapak
      WHERE id_pengguna = ?
      AND status_lapak IN ('terverifikasi', 'terblokir', 'menunggu')
    `;
  
    pool.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
  
      console.log('Database results:', results); // Log hasil query
  
      const lapaks = results.map(row => ({
        id: row.id_lapak,
        name: row.nama_lapak,
        address: row.lokasi_lapak,
        status: row.status_lapak // Changed from status_lapak to status for consistency
      }));
  
      res.json({ success: true, lapaks });
    });
  });

  
  app.delete('/api/lapak/:id', (req, res) => {
    const lapakId = req.params.id;
    const userId = req.session.userId;
  
    console.log(`Attempting to delete/deactivate lapak with ID: ${lapakId} for user ID: ${userId}`);
  
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Database connection error:', err);
        return res.status(500).json({ success: false, message: 'Database connection error' });
      }
  
      connection.beginTransaction(err => {
        if (err) {
          console.error('Transaction error:', err);
          connection.release();
          return res.status(500).json({ success: false, message: 'Transaction error' });
        }
  
        // Memeriksa status lapak terlebih dahulu
        const checkStatusQuery = `SELECT status_lapak FROM lapak WHERE id_lapak = ? AND id_pengguna = ?`;
        connection.query(checkStatusQuery, [lapakId, userId], (err, statusResult) => {
          if (err) {
            console.error('Error checking lapak status:', err);
            return connection.rollback(() => {
              connection.release();
              return res.status(500).json({ success: false, message: 'Error checking lapak status' });
            });
          }
  
          if (statusResult.length === 0) {
            return connection.rollback(() => {
              connection.release();
              return res.status(404).json({ success: false, message: 'Lapak tidak ditemukan' });
            });
          }
  
          const lapakStatus = statusResult[0].status_lapak;
  
          // Jika status "menunggu", maka hapus lapak
          if (lapakStatus === 'menunggu') {
            const queries = [
              `DELETE FROM laporan_lapak WHERE id_laporan IN (SELECT id_laporan FROM laporan WHERE id_lapak = ?);`,
              `DELETE FROM laporan WHERE id_lapak = ?`,
              `DELETE FROM buka WHERE id_lapak = ?`,
              `DELETE FROM buka_pembaruan WHERE id_lapak = ?`,
              `DELETE FROM lapak_favorit WHERE id_lapak = ?`,
              `DELETE FROM pembaruan_lapak WHERE id_lapak = ?`,
              `DELETE FROM ulasan WHERE id_lapak = ?`,
              `DELETE FROM lapak WHERE id_lapak = ? AND id_pengguna = ?`
            ];
  
            const deletePromises = queries.map((query, index) => {
              return new Promise((resolve, reject) => {
                const params = query.includes('id_pengguna') ? [lapakId, userId] : [lapakId];
                connection.query(query, params, (err, results) => {
                  if (err) {
                    console.error(`Error executing query ${index + 1}: ${query}`, err);
                    return reject(err);
                  }
                  resolve(results);
                });
              });
            });
  
            Promise.all(deletePromises)
              .then(() => {
                connection.commit(err => {
                  if (err) {
                    console.error('Transaction commit error:', err);
                    return connection.rollback(() => {
                      connection.release();
                      return res.status(500).json({ success: false, message: 'Transaction commit error' });
                    });
                  }
                  connection.release();
                  console.log(`Lapak and related records for ID ${lapakId} deleted successfully.`);
                  res.json({ success: true, message: 'Lapak and related records deleted successfully' });
                });
              })
              .catch(err => {
                console.error('Error during deletion:', err);
                connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ success: false, message: 'Failed to delete records', error: err.message });
                });
              });
          } else if (lapakStatus !== 'menunggu') {
            // Jika status "terverifikasi", maka ubah status menjadi "nonaktif"
            const updateStatusQuery = `UPDATE lapak SET status_lapak = 'nonaktif' WHERE id_lapak = ? AND id_pengguna = ?`;
            connection.query(updateStatusQuery, [lapakId, userId], (err, updateResult) => {
              if (err) {
                console.error('Error updating lapak status:', err);
                return connection.rollback(() => {
                  connection.release();
                  return res.status(500).json({ success: false, message: 'Error updating lapak status' });
                });
              }
  
              if (updateResult.affectedRows === 0) {
                return connection.rollback(() => {
                  connection.release();
                  return res.status(404).json({ success: false, message: 'Lapak tidak ditemukan' });
                });
              }
  
              connection.commit(err => {
                if (err) {
                  console.error('Transaction commit error:', err);
                  return connection.rollback(() => {
                    connection.release();
                    return res.status(500).json({ success: false, message: 'Transaction commit error' });
                  });
                }
                connection.release();
                console.log(`Lapak with ID ${lapakId} deactivated successfully.`);
                res.json({ success: true, message: 'Lapak deactivated successfully' });
              });
            });
          } else {
            // Status lapak tidak sesuai, batalkan transaksi
            return connection.rollback(() => {
              connection.release();
              return res.status(400).json({ success: false, message: 'Status lapak tidak valid' });
            });
          }
        });
      });
    });
  });
  
// Route untuk mengambil daftar semua lapak
// Endpoint untuk mengambil data lapak berdasarkan lapakId
app.get('/api/lapak/:lapakId', (req, res) => {
  const { lapakId } = req.params;
  console.log(`Mengambil data lapak untuk lapakId: ${lapakId}`);

  const getLapakQuery = `
  SELECT 
      lapak.id_lapak, 
      lapak.nama_lapak, 
      lapak.kategori_lapak, 
      lapak.lokasi_lapak AS alamat, 
      lapak.nomor_telepon AS telepon, 
      lapak.deskripsi_lapak, 
      lapak.situs, 
      lapak.layanan, 
      lapak.latitude, 
      lapak.longitude, 
      lapak.tanggal_pengajuan, 
      lapak.foto_lapak, 
      GROUP_CONCAT(
          CONCAT(
              hari.nama_hari, 
              ':', 
              IFNULL(buka.jam_buka, ''), 
              '-', 
              IFNULL(buka.jam_tutup, '')
          ) 
          ORDER BY hari.id_hari ASC
      ) AS jamBuka 
  FROM lapak 
  LEFT JOIN buka ON lapak.id_lapak = buka.id_lapak 
  LEFT JOIN hari ON buka.id_hari = hari.id_hari 
  WHERE lapak.id_lapak = ? 
  GROUP BY lapak.id_lapak
  `;

  pool.query(getLapakQuery, [lapakId], (err, results) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ 
              success: false, 
              message: 'Failed to retrieve lapak data' 
          });
      }

      if (results.length === 0) {
          console.log("Lapak tidak ditemukan.");
          return res.status(404).json({ 
              success: false, 
              message: 'Lapak not found' 
          });
      }

      const lapak = results[0];
      console.log("Data lapak ditemukan:", lapak);

      // Convert foto_lapak blob to base64
      const fotoBase64 = lapak.foto_lapak 
          ? `data:image/jpeg;base64,${lapak.foto_lapak.toString('base64')}` 
          : null;

      const jamBukaArray = lapak.jamBuka ? lapak.jamBuka.split(',').map(entry => {
          const [hari, jam] = entry.split(':');
          const [jamBuka, jamTutup] = jam.split('-');
          return { 
              hari, 
              buka: Boolean(jamBuka && jamTutup), 
              jamBuka, 
              jamTutup 
          };
      }) : [];

      const responseData = {
          idLapak: lapak.id_lapak,
          namaLapak: lapak.nama_lapak,
          kategoriLapak: lapak.kategori_lapak,
          alamat: lapak.alamat,
          telepon: lapak.telepon,
          deskripsiLapak: lapak.deskripsi_lapak,
          situs: lapak.situs,
          layanan: lapak.layanan,
          latitude: lapak.latitude,
          longitude: lapak.longitude,
          tanggalPengajuan: lapak.tanggal_pengajuan,
          fotoUrl: fotoBase64,
          jamBuka: jamBukaArray
      };

      res.json({ 
          success: true, 
          data: responseData 
      });
  });
});



app.get('/api/review/:id_lapak', (req, res) => {
  const id_lapak = req.params.id_lapak; // Get id_lapak from URL parameter

  if (isNaN(id_lapak)) {
    return res.status(400).json({ success: false, message: 'Invalid lapak ID' });
  }

  // SQL query to fetch reviews for the specific lapak
  const query = `
      SELECT 
        u.id_ulasan,
        u.rating,
        u.tanggal,
        u.deskripsi,
        u.foto AS ulasan_foto,
        p.nama_lengkap AS nama_pengguna
      FROM ulasan u
      LEFT JOIN pengguna p ON u.id_pengguna = p.id_pengguna
      WHERE u.id_lapak = ?
      ORDER BY u.tanggal DESC
    `;

  // Execute query
  pool.query(query, [id_lapak], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ success: false, message: 'No reviews found' });
    }

    const reviews = results.map(({ id_ulasan, rating, tanggal, deskripsi, ulasan_foto, nama_pengguna }) => ({
      id_ulasan,
      rating,
      tanggal,
      deskripsi,
      ulasan_foto,
      nama_pengguna,
    }));

    return res.json({ success: true, reviews });
  });
});


// Backend (server.js)

app.post('/api/laporUlasan', (req, res) => {
  console.log("req.body:", req.body);

  const { alasan_ulasan, id_ulasan, id_lapak } = req.body;
  const userId = req.session.userId;

  console.log("Received data:", { id_lapak, userId, id_ulasan, alasan_ulasan });

  // Check if all required fields are present
  if (!id_lapak || !userId || !id_ulasan || !alasan_ulasan) {
    return res.status(400).json({
      success: false,
      message: 'Semua field harus diisi'
    });
  }

  // Fetch user data based on userId
  pool.query(
    `SELECT * FROM pengguna WHERE id_pengguna = ?`,
    [userId],
    (error, results) => {
      if (error) {
        console.error('Error fetching user data:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (!results.length) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      const user = results[0];

      // Start transaction
      pool.getConnection((err, connection) => {
        if (err) {
          console.error('Error getting connection:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        connection.beginTransaction(err => {
          if (err) {
            connection.release();
            return res.status(500).json({
              success: false,
              message: 'Database error'
            });
          }

          // Insert into laporan table
          connection.query(
            `INSERT INTO laporan (id_pengguna, id_lapak, tanggal, status, nomor_telp) 
             VALUES (?, ?, NOW(), 'pending', ?)`,
            [user.id_pengguna, id_lapak, user.nomor_telepon],
            (error, result) => {
              if (error) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({
                    success: false,
                    message: 'Gagal menyimpan laporan'
                  });
                });
              }

              const reportId = result.insertId;

              // Insert into laporan_ulasan table
              connection.query(
                `INSERT INTO laporan_ulasan (id_laporan, id_ulasan, alasan_ulasan) 
                 VALUES (?, ?, ?)`,
                [reportId, id_ulasan, alasan_ulasan],
                (error) => {
                  if (error) {
                    return connection.rollback(() => {
                      connection.release();
                      res.status(500).json({
                        success: false,
                        message: 'Gagal menyimpan detail laporan'
                      });
                    });
                  }

                  // Commit transaction
                  connection.commit(err => {
                    if (err) {
                      return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({
                          success: false,
                          message: 'Gagal menyimpan data'
                        });
                      });
                    }

                    connection.release();
                    res.json({
                      success: true,
                      message: 'Laporan berhasil dikirim'
                    });
                  });
                }
              );
            }
          );
        });
      });
    }
  );
});


// Endpoint to retrieve reports for a specific lapak
app.get('/api/laporUlasan/:id_ulasan', (req, res) => {
  const id_ulasan = req.params.id_ulasan; // Get id_lapak from URL parameter

  if (isNaN(id_ulasan)) {
    return res.status(400).json({ success: false, message: 'Invalid lapak ID' });
  }

  // SQL query to fetch reports for the specific lapak
  const query = `
    SELECT 
      u.id_ulasan,
      u.tanggal,
      u.alasan_ulasan,
      p.nama_lengkap AS nama_pengguna
    FROM ulasan u
    LEFT JOIN pengguna p ON u.id_pengguna = p.id_pengguna
    WHERE u.id_ulasan = ?
    ORDER BY u.tanggal DESC
  `;

  // Execute query
  pool.query(query, [id_ulasan], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ success: false, message: 'No reports found' });
    }

    const reports = results.map(({ id_ulasan, tanggal, alasan_ulasan,
      nama_pengguna }) => ({
        id_ulasan,
        tanggal,
        alasan_ulasan,
        nama_pengguna,
      }));

    return res.json({ success: true, reports });
  });
});

// ===============vincent
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
