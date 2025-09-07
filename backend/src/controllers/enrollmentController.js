const db = require('../config/db');

// Öğrencinin bir derse kaydolması
exports.enrollInCourse = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id; // Token'dan gelen kullanıcı ID'si

  try {
    // Kullanıcı ID'sinden öğrenci ID'sini bul
    const student = await db.query('SELECT id FROM students WHERE user_id = $1', [userId]);
    if (student.rows.length === 0) {
      return res.status(404).json({ message: 'Öğrenci profili bulunamadı.' });
    }
    const studentId = student.rows[0].id;

    // Dersin var olup olmadığını kontrol et
    const course = await db.query('SELECT id FROM courses WHERE id = $1', [courseId]);
    if (course.rows.length === 0) {
      return res.status(404).json({ message: 'Ders bulunamadı.' });
    }

    // Kayıt işlemini yap (veritabanındaki primary key kısıtlaması tekrar kaydı engelleyecektir)
    await db.query(
      'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)',
      [studentId, courseId]
    );

    res.status(201).json({ message: 'Derse başarıyla kaydoldunuz.' });
  } catch (err) {
    if (err.code === '23505') { // Unique constraint violation
      return res.status(400).json({ message: 'Bu derse zaten kayıtlısınız.' });
    }
    console.error(err.message);
    res.status(500).send('Sunucu hatası');
  }
};

// Öğrencinin bir dersten kaydını silmesi
exports.withdrawFromCourse = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  try {
    const student = await db.query('SELECT id FROM students WHERE user_id = $1', [userId]);
    if (student.rows.length === 0) {
      return res.status(404).json({ message: 'Öğrenci profili bulunamadı.' });
    }
    const studentId = student.rows[0].id;

    const deleteResult = await db.query(
      'DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [studentId, courseId]
    );
    
    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: 'Bu derse ait bir kaydınız bulunamadı.' });
    }

    res.json({ message: 'Dersten kaydınız başarıyla silindi.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu hatası');
  }
};


// Giriş yapmış öğrencinin kayıtlı olduğu dersleri getirir
exports.getMyEnrolledCourses = async (req, res) => {
    const userId = req.user.id;
    try {
        const student = await db.query('SELECT id FROM students WHERE user_id = $1', [userId]);
        if (student.rows.length === 0) {
            return res.status(404).json({ message: 'Öğrenci profili bulunamadı.' });
        }
        const studentId = student.rows[0].id;

        const query = `
            SELECT c.* 
            FROM courses c
            JOIN enrollments e ON c.id = e.course_id
            WHERE e.student_id = $1
            ORDER BY c.name;
        `;
        const courses = await db.query(query, [studentId]);
        res.json(courses.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu hatası');
    }
};



exports.getAllEnrollments = async (req, res) => {
    try {
        const query = `
            SELECT 
                e.student_id,
                e.course_id,
                s.first_name, 
                s.last_name,
                u.email,
                c.course_code,
                c.name as course_name
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN courses c ON e.course_id = c.id
            ORDER BY s.last_name, c.name;
        `;
        const enrollments = await db.query(query);
        res.json(enrollments.rows);
    } catch (err) {
        console.error("Tüm kayıtlar alınırken hata:", err.message);
        res.status(500).send('Sunucu hatası');
    }
};


// Admin tarafından manuel olarak kayıt oluşturma
exports.createEnrollmentByAdmin = async (req, res) => {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
        return res.status(400).json({ message: 'Öğrenci ID ve Ders ID alanları zorunludur.' });
    }

    try {
        // Not: Foreign key kısıtlamaları sayesinde, var olmayan bir studentId veya courseId
        // girilirse veritabanı zaten hata verecektir.
        await db.query(
            'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)',
            [studentId, courseId]
        );
        res.status(201).json({ message: 'Kayıt başarıyla oluşturuldu.' });
    } catch (err) {
        if (err.code === '23505') { // Unique constraint violation
            return res.status(409).json({ message: 'Bu öğrenci bu derse zaten kayıtlı.' });
        }
        console.error("Admin kayıt oluştururken hata:", err.message);
        res.status(500).send('Sunucu hatası');
    }
};

// Admin tarafından manuel olarak kayıt silme
exports.deleteEnrollmentByAdmin = async (req, res) => {
    // ID'leri req.body yerine req.params'ten alıyoruz
    const { studentId, courseId } = req.params; 

    // req.body kontrolü artık gereksiz
    if (!studentId || !courseId) {
        // Bu kontrol aslında gereksiz çünkü rota bu parametreler olmadan eşleşmez,
        // ama yine de güvenlik katmanı olarak kalabilir.
        return res.status(400).json({ message: 'Öğrenci ID ve Ders ID gereklidir.' });
    }

    try {
        const deleteResult = await db.query(
            'DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2',
            [studentId, courseId]
        );
        
        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ message: 'Belirtilen kriterlere uygun kayıt bulunamadı.' });
        }

        res.json({ message: 'Kayıt başarıyla silindi.' });
    } catch (err) {
        console.error("Admin kayıt silerken hata:", err.message);
        res.status(500).send('Sunucu hatası');
    }
};