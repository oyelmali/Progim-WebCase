import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import CourseModal from './CourseModal';
import CourseInfoModal from './CourseInfoModal';
import AdminStudentManagerModal from './AdminStudentManagerModal';
import Pagination from '../../components/Pagination';

const AdminCoursesPage = () => {
    // --- STATE'LER ---
    const [courses, setCourses] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Modallar için state yönetimi
    const [editModalState, setEditModalState] = useState({ isOpen: false, course: null });
    const [infoModalState, setInfoModalState] = useState({ isOpen: false, course: null });
    const [studentManagerModalState, setStudentManagerModalState] = useState({ isOpen: false, course: null, students: [], loading: false });

    // --- VERİ ÇEKME ---
    const fetchCourses = useCallback(async (page) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/courses?page=${page}&limit=10`);
            const { data, pagination } = response.data;
            if (Array.isArray(data) && pagination) {
                setCourses(data);
                setPaginationInfo(pagination);
            } else {
                throw new Error("API'den gelen veri formatı beklenmedik.");
            }
        } catch (err) {
            setError('Dersler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCourses(currentPage); }, [currentPage, fetchCourses]);

    // --- HANDLER'LAR ---
    const handlePageChange = (page) => setCurrentPage(page);

    // Ekle/Düzenle Modal Handler'ları
    const handleOpenEditModal = (course = null) => setEditModalState({ isOpen: true, course });
    const handleCloseEditModal = () => setEditModalState({ isOpen: false, course: null });
    
    const handleSaveCourse = async (courseData) => {
    try {

        const dataToSend = {
            ...courseData,
            duration_hours: courseData.duration_hours ? parseInt(courseData.duration_hours) : null
        };
        
        
        
        if (editModalState.course) {
            
            const response = await api.put(`/courses/${editModalState.course.id}`, dataToSend);
            
            alert('Ders başarıyla güncellendi!');
        } else {
            // Yeni ders ekleme
            const response = await api.post('/courses', dataToSend);
            
            alert('Ders başarıyla eklendi!');
        }
        
        // Modal'ı kapat ve listeyi yenile
        handleCloseEditModal();
        fetchCourses(currentPage);
    } catch (err) {
        console.error('Error saving course:', err);
        console.error('Error response:', err.response?.data); 
        alert(err.response?.data?.message || 'Ders kaydedilirken bir hata oluştu.');
    }
};
    
    const handleDeleteCourse = async (courseId) => {
        if (window.confirm('Bu dersi ve tüm kayıtlarını silmek istediğinizden emin misiniz?')) {
            try {
                await api.delete(`/courses/${courseId}`);
                fetchCourses(currentPage);
                alert('Ders başarıyla silindi!');
            } catch (err) {
                setError('Ders silinirken bir hata oluştu.');
            }
        }
    };

    // Basit Bilgi Modalı Handler'ları
    const handleOpenInfoModal = (course) => setInfoModalState({ isOpen: true, course });
    const handleCloseInfoModal = () => setInfoModalState({ isOpen: false, course: null });
    
    // Öğrenci Yönetim Modalı Handler'ları
    const handleOpenStudentManager = async (course) => {
        setStudentManagerModalState(prev => ({ ...prev, isOpen: true, course, loading: true }));
        try {
            const response = await api.get(`/courses/${course.id}/students`);
            setStudentManagerModalState(prev => ({ ...prev, students: response.data, loading: false }));
        } catch (err) {
            console.error('Kayıtlı öğrenciler çekilirken hata:', err);
            setStudentManagerModalState(prev => ({ ...prev, students: [], loading: false }));
        }
    };
    const handleCloseStudentManager = () => setStudentManagerModalState({ isOpen: false, course: null, students: [], loading: false });
    
    const handleEnrollmentChange = async (action, studentId) => {
        const courseId = studentManagerModalState.course.id;
        try {
            if (action === 'add') {
                await api.post('/enrollments/admin', { studentId, courseId });
            } else if (action === 'remove') {
                await api.delete(`/enrollments/admin/${studentId}/${courseId}`);
            }
            const response = await api.get(`/courses/${courseId}/students`);
            setStudentManagerModalState(prev => ({ ...prev, students: response.data }));
        } catch (err) { 
            alert(err.response?.data?.message || 'İşlem sırasında bir hata oluştu.'); 
        }
    };

    // --- RENDER ---
    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                <div className="animate-pulse flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-4 h-4 bg-pink-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                </div>
                <p className="text-purple-600 mt-4 font-medium">Yükleniyor...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                <p className="text-red-400 font-medium">⚠️ {error}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
            <div className="container mx-auto p-4 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Ders Yönetimi
                    </h1>
                    <button 
                        onClick={() => handleOpenEditModal()} 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                    >
                        + Yeni Ders Ekle
                    </button>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl overflow-scroll border border-purple-100">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-purple-50">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                                    Ders Adı
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                                    Ders Kodu
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                                    Süre(Saat)
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-purple-700 uppercase tracking-wider">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-100">
                            {courses.map((course) => (
                                <tr key={course.id} className="hover:bg-purple-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button 
                                            onClick={() => handleOpenInfoModal(course)} 
                                            className="font-medium text-purple-600 hover:text-purple-800 text-left hover:underline"
                                        >
                                            {course.name}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                            {course.course_code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                        {course.duration_hours ? (
                                            <span className="flex items-center gap-1">
                                                <span className="text-purple-500">⏱️</span>
                                                {course.duration_hours}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                                        <button 
                                            onClick={() => handleOpenStudentManager(course)} 
                                            className="font-medium text-green-600 hover:text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-full transition-all"
                                        >
                                            Öğrenciler
                                        </button>
                                        <button 
                                            onClick={() => handleOpenEditModal(course)} 
                                            className="font-medium text-yellow-600 hover:text-yellow-700 bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded-full transition-all"
                                        >
                                            Düzenle
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteCourse(course.id)} 
                                            className="font-medium text-red-600 hover:text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full transition-all"
                                        >
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {paginationInfo?.totalPages > 1 && (
                    <div className="mt-8">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={paginationInfo.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
                
                <CourseModal 
                    isOpen={editModalState.isOpen}
                    onClose={handleCloseEditModal}
                    onSave={handleSaveCourse}
                    course={editModalState.course}
                />
                <CourseInfoModal 
                    isOpen={infoModalState.isOpen} 
                    onClose={handleCloseInfoModal} 
                    course={infoModalState.course} 
                />
                <AdminStudentManagerModal 
                    isOpen={studentManagerModalState.isOpen} 
                    onClose={handleCloseStudentManager} 
                    course={studentManagerModalState.course} 
                    students={studentManagerModalState.students}
                    loadingStudents={studentManagerModalState.loading}
                    onEnrollmentChange={handleEnrollmentChange} 
                />
            </div>
        </div>
    );
};

export default AdminCoursesPage;