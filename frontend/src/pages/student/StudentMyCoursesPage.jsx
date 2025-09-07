import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import Pagination from '../../components/Pagination'; 
import CourseDetailModal from './CourseDetailModal';
import EnrolledCourseCard from './EnrolledCourseCard';

const StudentMyCoursesPage = () => {
    // State'ler
    const [allMyCourses, setAllMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Modal state'leri
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Sayfalama state'leri
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9; // 3x3 bir grid için
    // Sadece kayıtlı olunan dersleri çeken fonksiyon
    const fetchMyCourses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/enrollments/my-courses');
            setAllMyCourses(response.data);
        } catch (err) {
            setError('Kayıtlı dersleriniz yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyCourses();
    }, [fetchMyCourses]);
    
    // --- Event Handler'lar ---

    // Karta tıklandığında modal'ı açar
    const handleCardClick = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    // Modal'ı kapatır
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    // Dersten çekilme işlemini yönetir
    const handleWithdraw = async (courseId) => {
        if (window.confirm('Bu dersten kaydınızı silmek istediğinizden emin misiniz?')) {
            try {
                await api.delete(`/enrollments/${courseId}`);
                alert('Dersten kaydınız başarıyla silindi.');
                handleCloseModal(); // Modal'ı kapat
                fetchMyCourses(); // Listeyi güncelle
            } catch (err) {
                alert(err.response?.data?.message || 'Kayıt silme işlemi sırasında bir hata oluştu.');
            }
        }
    };

    // Sayfa değiştirme
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // --- Sayfalama Mantığı ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCourses = allMyCourses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(allMyCourses.length / itemsPerPage);

    // --- Render Mantığı ---

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
            <div className="container mx-auto p-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                    Kayıtlı Olduğum Dersler
                </h1>
                
                {allMyCourses.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentCourses.map(course => (
                                <EnrolledCourseCard 
                                    key={course.id} 
                                    course={course} 
                                    onClick={handleCardClick} 
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center">
                        <div className="bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-xl inline-block">
                            <div className="text-6xl mb-4">📚</div>
                            <p className="text-gray-600 text-lg">Henüz hiçbir derse kayıtlı değilsiniz.</p>
                            <p className="text-gray-500 text-sm mt-2">Hemen yeni dersler keşfetmeye başlayın!</p>
                        </div>
                    </div>
                )}

                <CourseDetailModal
                    isOpen={isModalOpen}
                    course={selectedCourse}
                    onClose={handleCloseModal}
                    onWithdraw={handleWithdraw}
                />
            </div>
        </div>
    );
};

export default StudentMyCoursesPage;