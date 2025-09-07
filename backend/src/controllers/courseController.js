const db = require('../config/db');

// Yeni bir ders oluştur
exports.createCourse = async (req, res) => {
    // 1. Gerekli alanları request body'den alalım (credit çıkarıldı)
    const { course_code, name, description, duration_hours } = req.body;

    // 2. Doğrulama (validation) yapalım (credit kontrolü kaldırıldı)
    if (!course_code || !name) {
        return res.status(400).json({ message: 'Ders Kodu ve Ders Adı alanları zorunludur.' });
    }
    if (duration_hours && isNaN(parseFloat(duration_hours))) {
        return res.status(400).json({ message: 'Ders Saati alanı sayısal bir değer olmalıdır.' });
    }

    try {
        // 3. Ders Kodu ve Ders Adı'nın benzersiz olup olmadığını kontrol et
        const existingCourse = await db.query(
            'SELECT * FROM courses WHERE course_code = $1 OR name = $2',
            [course_code, name]
        );

        if (existingCourse.rows.length > 0) {
            if (existingCourse.rows[0].course_code === course_code) {
                return res.status(409).json({ message: 'Bu Ders Kodu zaten kullanılıyor.' });
            }
            if (existingCourse.rows[0].name === name) {
                return res.status(409).json({ message: 'Bu Ders Adı zaten mevcut.' });
            }
        }
        
        // 4. Veritabanına yeni dersi ekle (INSERT sorgusu güncellendi)
        const newCourse = await db.query(
            `INSERT INTO courses (course_code, name, description, duration_hours) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [course_code, name, description || null, duration_hours ? parseFloat(duration_hours) : null]
        );

        // 5. Başarılı yanıtı gönder
        res.status(201).json(newCourse.rows[0]);

    } catch (err) {
        console.error("Ders oluşturulurken hata:", err.message);
        res.status(500).send('Sunucu hatası');
    }
};

// Tüm dersleri sayfalanmış olarak getir
exports.getAllCourses = async (req, res) => {
    // 1. Query parametrelerini al ve varsayılan değerleri ata
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Varsayılan limit 20

    // 2. Sayfalama için 'offset' değerini hesapla
    const offset = (page - 1) * limit;

    try {
        // 3. İki sorguyu aynı anda çalıştır: toplam ders sayısı ve o sayfadaki dersler
        const totalCoursesQuery = db.query('SELECT COUNT(*) FROM courses');
        const coursesQuery = db.query(
            'SELECT * FROM courses ORDER BY id ASC LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        const [totalResult, coursesResult] = await Promise.all([
            totalCoursesQuery,
            coursesQuery
        ]);
        
        // 4. Toplam ders sayısını al
        const total = parseInt(totalResult.rows[0].count, 10);
        
        // 5. Toplam sayfa sayısını hesapla
        const totalPages = Math.ceil(total / limit);

        // 6. Frontend'in beklediği formatta yanıtı oluştur ve gönder
        res.status(200).json({
            data: coursesResult.rows,
            pagination: {
                total,
                page,
                limit,
                totalPages
            }
        });

    } catch (err) {
        console.error("Dersler çekilirken hata oluştu:", err.message);
        res.status(500).send('Sunucu hatası.');
    }
};



// Bir dersi güncelle
exports.updateCourse = async (req, res) => {
  const { course_code, name, description, duration_hours } = req.body; // course_code ve duration_hours eklendi
  const { id } = req.params;

  try {
    // Dersin var olup olmadığını kontrol et
    const course = await db.query('SELECT * FROM courses WHERE id = $1', [id]);
    if (course.rows.length === 0) {
      return res.status(404).json({ message: 'Güncellenecek ders bulunamadı.' });
    }

    // Eğer isim değiştiriliyorsa, yeni ismin başka bir derse ait olup olmadığını kontrol et
    if (name && name !== course.rows[0].name) {
      const existingCourse = await db.query('SELECT * FROM courses WHERE name = $1 AND id != $2', [name, id]);
      if (existingCourse.rows.length > 0) {
        return res.status(400).json({ message: 'Bu isimde başka bir ders zaten mevcut.' });
      }
    }

    // Eğer ders kodu değiştiriliyorsa, yeni kodun başka bir derse ait olup olmadığını kontrol et
    if (course_code && course_code !== course.rows[0].course_code) {
      const existingCode = await db.query('SELECT * FROM courses WHERE course_code = $1 AND id != $2', [course_code, id]);
      if (existingCode.rows.length > 0) {
        return res.status(400).json({ message: 'Bu ders kodu başka bir derse ait.' });
      }
    }

    // duration_hours'u integer'a çevir (eğer geliyorsa)
    const durationHoursValue = duration_hours !== undefined && duration_hours !== null && duration_hours !== '' 
      ? parseInt(duration_hours) 
      : course.rows[0].duration_hours;

    const updatedCourse = await db.query(
      'UPDATE courses SET course_code = $1, name = $2, description = $3, duration_hours = $4 WHERE id = $5 RETURNING *',
      [
        course_code || course.rows[0].course_code,
        name || course.rows[0].name, 
        description !== undefined ? description : course.rows[0].description, // boş string gönderilirse null olarak kaydet
        durationHoursValue,
        id
      ]
    );

    res.json(updatedCourse.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
};



// Bir dersi sil
exports.deleteCourse = async (req, res) => {
  try {
    const deleteResult = await db.query('DELETE FROM courses WHERE id = $1 RETURNING *', [req.params.id]);
    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: 'Silinecek ders bulunamadı.' });
    }
    res.json({ message: 'Ders başarıyla silindi.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu hatası');
  }
};


// Öğrenci için tüm dersleri ve kayıt durumunu getirir
exports.getAllCoursesForStudentView = async (req, res) => {
    const userId = req.user.id; // authMiddleware'den gelen kullanıcı ID'si
    try {
        // user_id ile ilişkili student_id'yi bul
        const student = await db.query('SELECT id FROM students WHERE user_id = $1', [userId]);
        
        // Eğer öğrenci profili bulunamazsa (örneğin giriş yapan admin ise)
        // boş bir dizi dönebilir veya hata verebiliriz. Hata daha doğru.
        if (student.rows.length === 0) {
            return res.status(404).json({ message: 'Giriş yapan kullanıcıya ait öğrenci profili bulunamadı.' });
        }
        const studentId = student.rows[0].id;

        const query = `
            SELECT 
                c.*,
                CASE WHEN e.student_id IS NOT NULL THEN true ELSE false END AS is_enrolled
            FROM 
                courses c
            LEFT JOIN 
                enrollments e ON c.id = e.course_id AND e.student_id = $1
            ORDER BY c.name;
        `;
        const courses = await db.query(query, [studentId]);
        res.json(courses.rows);
    } catch (err) {
        console.error("Öğrenci için dersler alınırken hata:", err.message);
        res.status(500).send('Sunucu hatası');
    }
};


// Belirli bir derse kayıtlı öğrencileri getirir
exports.getEnrolledStudentsForCourse = async (req, res) => {
    const { id } = req.params; // Dersin ID'si
    try {
        const query = `
            SELECT 
                s.id, 
                s.first_name, 
                s.last_name, 
                u.email
            FROM students s
            JOIN users u ON s.user_id = u.id
            JOIN enrollments e ON s.id = e.student_id
            WHERE e.course_id = $1
            ORDER BY s.last_name, s.first_name;
        `;
        const result = await db.query(query, [id]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Derse kayıtlı öğrenciler alınırken hata:", err.message);
        res.status(500).send('Sunucu hatası.');
    }
};

exports.searchCoursesForStudent = async (req, res) => {
    const { q, studentId } = req.query;

    if (!q || q.trim().length < 2) {
        return res.json([]);
    }

    const studentIdInt = parseInt(studentId);
    
    if (!studentIdInt || isNaN(studentIdInt)) {
        return res.status(400).json({ error: 'Geçerli bir studentId gerekli' });
    }

    try {
        // Önce öğrencinin kayıtlı olduğu dersleri kontrol edelim
        const enrolledCoursesQuery = `
            SELECT course_id 
            FROM enrollments 
            WHERE student_id = $1
        `;
        
        const enrolledResult = await db.query(enrolledCoursesQuery, [studentIdInt]);
    
        const searchTerm = `%${q}%`;

        // Ana sorguyu çalıştır
        const query = `
            SELECT 
                c.id, 
                c.name, 
                c.course_code,
                CASE 
                    WHEN e.student_id IS NULL THEN false 
                    ELSE true 
                END as is_enrolled
            FROM courses c
            LEFT JOIN enrollments e ON c.id = e.course_id AND e.student_id = $2
            WHERE 
                (c.name ILIKE $1 OR c.course_code ILIKE $1)
                AND e.student_id IS NULL
            LIMIT 10;
        `;

        const result = await db.query(query, [searchTerm, studentIdInt]);
        
        
        
        res.status(200).json(result.rows);

    } catch (err) {
        console.error("Öğrenci için ders aranırken hata:", err.message);
        res.status(500).send('Sunucu hatası.');
    }
};


