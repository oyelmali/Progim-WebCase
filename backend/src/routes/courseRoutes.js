const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect, isAdmin } = require('../middleware/authMiddleware');


// @route   GET /api/courses/search-for-student
// @desc    Belirli bir öğrencinin kayıtlı OLMADIĞI dersleri ara (Admin)
router.get('/search-for-student', protect, isAdmin, courseController.searchCoursesForStudent);


// @route   POST /api/courses
// @desc    Yeni bir ders oluştur (Sadece Admin)
// @access  Private/Admin
router.post('/', protect, isAdmin, courseController.createCourse);

// @route   GET /api/courses
// @desc    Tüm dersleri listele (Tüm giriş yapmış kullanıcılar)
// @access  Private
router.get('/', protect, courseController.getAllCourses);

// Spesifik bir derse kayıtlı öğrencileri getirir (Admin için)
// Bu rotayı /:id rotasından ÖNCE tanımlamak en güvenlisidir, ama yapısı farklı olduğu için sorun yaratmaz.
router.get('/:id/students', protect, isAdmin, courseController.getEnrolledStudentsForCourse);

// @route   GET /api/courses/student-view
// @desc    Öğrenci için tüm dersleri kayıt durumuyla listele
// @access  Private
router.get('/:id', protect, courseController.getAllCoursesForStudentView);


// @route   PUT /api/courses/:id
// @desc    Bir dersi güncelle (Sadece Admin)
// @access  Private/Admin
router.put('/:id', protect, isAdmin, courseController.updateCourse);

// @route   DELETE /api/courses/:id
// @desc    Bir dersi sil (Sadece Admin)
// @access  Private/Admin
router.delete('/:id', protect, isAdmin, courseController.deleteCourse);



router.get(
    '/search', 
    protect, isAdmin,
    courseController.searchCoursesForStudent // VEYA searchUnenrolledCoursesForStudent
);

// @route   GET /api/courses/:id/students
// @desc    Belirli bir derse kayıtlı öğrencileri getirir
// BU ROUTE ZATEN VAR OLMALI (çalışan kısım olduğu için)
router.get(
    '/:id/students',
    // protect, admin,
    courseController.getEnrolledStudentsForCourse
);

module.exports = router;