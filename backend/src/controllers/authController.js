const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// --- Helper Fonksiyon: JWT Oluşturma ---
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// --- Controller Fonksiyonları ---

exports.register = async (req, res) => {
  const { first_name, last_name, email, password, date_of_birth } = req.body;

  // Temel doğrulama
  if (!first_name || !last_name || !email || !password || !date_of_birth) {
    return res.status(400).json({ message: 'Lütfen tüm alanları doldurun.' });
  }

  try {
    // Kullanıcı mevcut mu?
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor.' });
    }

    // Şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Veritabanı transaction başlat
    const client = await db.pool.connect(); // Pool'dan bir client almamız gerekiyor
    try {
      await client.query('BEGIN');

      // 1. `users` tablosuna ekle
      const newUserQuery = 'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id';
      const newUserResult = await client.query(newUserQuery, [email, password_hash]);
      const userId = newUserResult.rows[0].id;

      // 2. `students` tablosuna ekle
      const newStudentQuery = 'INSERT INTO students (user_id, first_name, last_name, date_of_birth) VALUES ($1, $2, $3, $4)';
      await client.query(newStudentQuery, [userId, first_name, last_name, date_of_birth]);
      
      await client.query('COMMIT');

      res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu.' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu hatası.');
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Kullanıcıyı bul
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Geçersiz kimlik bilgileri.' });
    }
    const user = userResult.rows[0];

    // Şifreyi karşılaştır
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Geçersiz kimlik bilgileri.' });
    }

    // Token oluştur ve gönder
    const token = generateToken(user.id, user.role);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu hatası.');
  }
};



