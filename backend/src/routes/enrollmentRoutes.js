const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Bu rotaların tamamı giriş yapmayı gerektirir.
router.use(protect);

// Bu rotalara sadece giriş yapmış öğrenci erişebilir
router.get('/my-courses', protect, enrollmentController.getMyEnrolledCourses);
router.post('/', protect, enrollmentController.enrollInCourse);
router.delete('/:courseId', protect, enrollmentController.withdrawFromCourse);


// === ADMIN ROTLARI (Yeni Kısım) ===
// Bu rotalara sadece Admin erişebilir
router.post('/admin', protect, isAdmin, enrollmentController.createEnrollmentByAdmin);
router.delete(
    '/admin/:studentId/:courseId', // ID'leri parametre olarak alıyoruz
    protect,
    isAdmin,
    enrollmentController.deleteEnrollmentByAdmin
);

module.exports = router;