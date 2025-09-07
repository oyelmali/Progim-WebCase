const db = require('../config/db');
const bcrypt = require('bcryptjs');

// @desc    Tüm öğrencileri listele
// @route   GET /api/students
// @access  Private/Admin
exports.getAllStudents = async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Varsayılan limit 20
    const offset = (page - 1) * limit;
    try {
        // students ve users tablolarını birleştirerek gerekli tüm bilgileri çekiyoruz.

        const totalResult = await db.query('SELECT COUNT(*) FROM students');
        const total = parseInt(totalResult.rows[0].count);

        const query = `
            SELECT 
                s.id, 
                s.first_name, 
                s.last_name, 
                s.date_of_birth, 
                u.email
            FROM students s
            JOIN users u ON s.user_id = u.id
            ORDER BY s.id ASC
            LIMIT $1 OFFSET $2;
        `;
        
        const studentsResult = await db.query(query, [limit, offset]);

        // Frontend'e doğrudan öğrenci dizisini gönderiyoruz.
        res.status(200).json({
            data: studentsResult.rows,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu hatası.');
    }
};



exports.createStudent = async (req, res) => {
  // Frontend'deki StudentModal'dan gelen veriler
  const { first_name, last_name, email, password, date_of_birth } = req.body;

  // Doğrulama
  if (!first_name || !last_name || !email || !password || !date_of_birth) {
    return res.status(400).json({ message: 'Lütfen tüm alanları doldurun.' });
  }

  try {
    // E-posta zaten var mı kontrol et
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor.' });
    }

    // Şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Veritabanı transaction'ı ile güvenli kayıt
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. users tablosuna ekle
      const newUserQuery = 'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id';
      // Yeni kullanıcıyı varsayılan olarak 'student' rolüyle ekliyoruz
      const newUserResult = await client.query(newUserQuery, [email, password_hash, 'student']);
      const userId = newUserResult.rows[0].id;

      // 2. students tablosuna ekle
      const newStudentQuery = 'INSERT INTO students (user_id, first_name, last_name, date_of_birth) VALUES ($1, $2, $3, $4)';
      await client.query(newStudentQuery, [userId, first_name, last_name, date_of_birth]);
      
      await client.query('COMMIT');

      res.status(201).json({ message: 'Öğrenci başarıyla oluşturuldu.' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error; // Hatanın genel catch bloğuna gitmesini sağla
    } finally {
      client.release(); // Bağlantıyı havuza geri bırak
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu hatası.');
  }
};

// Bir öğrencinin bilgilerini güncelle
exports.updateStudent = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, date_of_birth } = req.body;

  // Doğrulama
  if (!first_name || !last_name || !date_of_birth) {
    return res.status(400).json({ message: 'Tüm alanlar zorunludur.' });
  }
  if (new Date(date_of_birth) > new Date()) {
    return res.status(400).json({ message: 'Doğum tarihi gelecekte bir tarih olamaz.' });
  }

  try {
    const updatedStudent = await db.query(
      'UPDATE students SET first_name = $1, last_name = $2, date_of_birth = $3 WHERE id = $4 RETURNING *',
      [first_name, last_name, date_of_birth, id]
    );

    if (updatedStudent.rowCount === 0) {
      return res.status(404).json({ message: 'Güncellenecek öğrenci bulunamadı.' });
    }

    res.json(updatedStudent.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu hatası');
  }
};

// Bir öğrenciyi sil (Hem users hem de students tablosundan)
exports.deleteStudent = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Önce öğrencinin user_id'sini bulalım
    const student = await db.query('SELECT user_id FROM students WHERE id = $1', [id]);
    if (student.rows.length === 0) {
      return res.status(404).json({ message: 'Silinecek öğrenci bulunamadı.' });
    }
    const userId = student.rows[0].user_id;

    // `users` tablosundan kullanıcıyı sil. Veritabanı şemasındaki 'ON DELETE CASCADE'
    // sayesinde bu işlemle ilişkili student ve enrollment kayıtları da otomatik silinecektir.
    await db.query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ message: 'Öğrenci başarıyla silindi.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu hatası');
  }
};


// Öğrencileri isme, soyisme veya e-postaya göre arar ve belirli bir derse
// zaten kayıtlı olanları sonuçlardan çıkarır.
exports.searchStudents = async (req, res) => {
    const { q, courseId } = req.query; // q: arama terimi, courseId: hariç tutulacak ders

    if (!q) {
        return res.json([]); // Arama terimi yoksa boş dizi dön
    }

    try {
        const searchTerm = `%${q}%`; // PostgreSQL'de ILIKE ile kullanılacak format

        const query = `
            SELECT 
                s.id, s.first_name, s.last_name, u.email
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE 
                (s.first_name ILIKE $1 OR s.last_name ILIKE $1 OR u.email ILIKE $1)
            AND s.id NOT IN (
                SELECT student_id FROM enrollments WHERE course_id = $2
            )
            LIMIT 10;
        `;

        const result = await db.query(query, [searchTerm, courseId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Öğrenci aranırken hata:", err.message);
        res.status(500).send('Sunucu hatası.');
    }
};


// Belirli bir öğrencinin kayıtlı olduğu dersleri getirir
exports.getEnrolledCoursesForStudent = async (req, res) => {
    const { id } = req.params; // Bu, students tablosunun ID'si
    try {
        const query = `
            SELECT c.* 
            FROM courses c
            JOIN enrollments e ON c.id = e.course_id
            WHERE e.student_id = $1
            ORDER BY c.name;
        `;
        const result = await db.query(query, [id]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Öğrencinin dersleri alınırken hata:", err.message);
        res.status(500).send('Sunucu hatası.');
    }
};

exports.searchUnenrolledCoursesForStudent = async (req, res) => {
    // Frontend'den gelen arama terimini (q) ve öğrenci ID'sini (studentId) alıyoruz.
    const { q, studentId } = req.query;

    // Gerekli parametreler gelmemişse hata döndür.
    if (!q || !studentId) {
        return res.status(400).json({ message: 'Arama terimi (q) ve öğrenci ID (studentId) gereklidir.' });
    }

    try {
        const searchTerm = `%${q}%`; // PostgreSQL'de ILIKE ile kullanılacak format

        // SQL Sorgusu:
        // 1. Adı (name) veya kodu (course_code) arama terimiyle eşleşen DERSLERİ SEÇ.
        // 2. VE bu derslerin ID'si, verilen studentId için enrollments tablosunda OLMAYANLARI SEÇ.
        // 3. Sonuçları 10 ile sınırla.
        const query = `
            SELECT 
                c.id, c.name, c.course_code
            FROM 
                courses c
            WHERE 
                (c.name ILIKE $1 OR c.course_code ILIKE $1)
            AND 
                c.id NOT IN (
                    SELECT course_id FROM enrollments WHERE student_id = $2
                )
            LIMIT 10;
        `;

        const result = await db.query(query, [searchTerm, studentId]);
        res.status(200).json(result.rows);

    } catch (err) {
        console.error("Ders aranırken hata:", err.message);
        res.status(500).send('Sunucu hatası.');
    }
};


// Kullanıcı ID'sine göre student bilgilerini getir
exports.getStudentByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // URL'den gelen user id
    

    // Basit sorgu - sadece student bilgileri
    const query = `
      SELECT 
        s.id,
        s.first_name,
        s.last_name,
        s.date_of_birth,
        s.user_id
      FROM students s
      WHERE s.user_id = $1
    `;

    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.json({ 
        success: false,
        message: 'Öğrenci kaydı bulunamadı' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Hata:', error);
    res.status(500).json({ 
      success: false,
      message: 'Sunucu hatası' 
    });
  }
};


// @desc    Giriş yapmış kullanıcının kendi öğrenci profilini günceller
// @route   PUT /api/students/:studentId
// @access  Private
exports.updateMyStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { first_name, last_name, date_of_birth } = req.body;
    const loggedInUserId = req.userId; // authMiddleware'den gelen ID

    // 1. Gerekli veriler var mı?
    if (!first_name || !last_name || !date_of_birth) {
      return res.status(400).json({ success: false, message: 'Lütfen tüm alanları doldurun.' });
    }

    // 2. Güvenlik Kontrolü: Kullanıcı bu profili güncelleyebilir mi?
    const studentResult = await db.query('SELECT user_id FROM students WHERE id = $1', [studentId]);

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Güncellenecek öğrenci profili bulunamadı.' });
    }

    const studentOwnerId = studentResult.rows[0].user_id;

    if (studentOwnerId !== loggedInUserId) {
      // Başkasının profilini güncellemeye çalışıyor!
      return res.status(403).json({ success: false, message: 'Bu işlemi yapmaya yetkiniz yok.' });
    }

    // 3. Veritabanını Güncelle
    const updateQuery = `
      UPDATE students
      SET first_name = $1, last_name = $2, date_of_birth = $3
      WHERE id = $4
      RETURNING *; 
    `;
    // RETURNING * sayesinde güncellenmiş veriyi geri alıyoruz

    const updatedStudentResult = await db.query(updateQuery, [first_name, last_name, date_of_birth, studentId]);

    res.json({
      success: true,
      message: 'Profil başarıyla güncellendi.',
      data: updatedStudentResult.rows[0]
    });

  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası oluştu.' });
  }
};