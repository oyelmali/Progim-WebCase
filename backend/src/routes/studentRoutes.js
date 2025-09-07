const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Bu rotaların tamamı Admin yetkisi gerektirir.
router.use(protect, isAdmin);

// @route   GET /api/students/search
// @desc    Öğrencileri arama (Admin için)
router.get('/search', studentController.searchStudents);

// @route   GET /api/students/:id/courses
// @desc    Belirli bir öğrencinin kayıtlı olduğu dersleri getir (Admin)
router.get('/:id/courses', studentController.getEnrolledCoursesForStudent);


// @route   GET /api/students
// @desc    Tüm öğrencileri listele (Sadece Admin)
// @access  Private/Admin
router.get('/', studentController.getAllStudents);

// @route   POST /api/students
// @desc    Admin tarafından yeni bir öğrenci oluştur (Admin)
router.post('/', studentController.createStudent);



// @route   PUT /api/students/:id
// @desc    Bir öğrencinin bilgilerini güncelle (Sadece Admin)
// @access  Private/Admin
router.put('/:id', studentController.updateStudent);

// @route   DELETE /api/students/:id
// @desc    Bir öğrenciyi sil (Sadece Admin)
// @access  Private/Admin
router.delete('/:id', studentController.deleteStudent);

// User ID'ye göre student bilgilerini getir
router.get('/user/:userId', studentController.getStudentByUserId);

// @desc    Giriş yapmış kullanıcının kendi öğrenci profilini günceller
// @route   PUT /api/students/:studentId
// @access  Private
router.put('/:studentId', studentController.updateMyStudentProfile);

// Not: Yeni öğrenci oluşturma işlemini 'register' endpoint'i üzerinden yaptığımız için
// burada ayrı bir POST /api/students rotasına şimdilik gerek yok.
// İstenirse, sadece adminlerin öğrenci profili oluşturacağı bir yapı da eklenebilir.

module.exports = router;