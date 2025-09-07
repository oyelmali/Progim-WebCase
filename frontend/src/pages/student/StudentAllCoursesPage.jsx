import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import Pagination from '../../components/Pagination';

const StudentAllCoursesPage = () => {
    // State'ler 
    const [courses, setCourses] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Veri çekme 
    const fetchCourses = useCallback(async (page) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/courses/student-view?page=${page}&limit=9`);
            
            
            
            const { data, pagination } = response.data;
            
            if (Array.isArray(data) && pagination) {
                setCourses(data);
                setPaginationInfo(pagination);
            } else {
                
                if (Array.isArray(response.data)) {
                   
                    
                    const allCourses = response.data;
                    const itemsPerPage = 9;
                    const totalPages = Math.ceil(allCourses.length / itemsPerPage);
                    const indexOfLastItem = page * itemsPerPage;
                    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                    const currentCourses = allCourses.slice(indexOfFirstItem, indexOfLastItem);
                    
                    setCourses(currentCourses);
                    setPaginationInfo({
                        currentPage: page,
                        totalPages: totalPages,
                        totalItems: allCourses.length,
                        itemsPerPage: itemsPerPage
                    });
                } else {
                    throw new Error("API'den gelen veri formatı beklenmedik.");
                }
            }
        } catch (err) {
            console.error('Fetch Error:', err); 
            setError('Dersler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses(currentPage);
    }, [currentPage, fetchCourses]);

    // Handler'lar
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleEnroll = async (courseId) => {
        try {
            await api.post('/enrollments', { courseId });
            alert('Derse başarıyla kaydoldunuz!');
            fetchCourses(currentPage); 
        } catch (err) {
            alert(err.response?.data?.message || 'Kayıt işlemi sırasında bir hata oluştu.');
        }
    };

    
    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                <div className="animate-pulse flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-4 h-4 bg-pink-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                </div>
                <p className="text-purple-600 mt-4 font-medium">Dersler yükleniyor...</p>
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
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Tüm Dersler
                    </h1>
                    <p className="text-gray-600 mt-2">Kendini geliştirmek için yeni dersler keşfet 🌟</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-purple-100">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                                        {course.course_code}
                                    </span>
                                    {course.duration_hours && (
                                        <span className="text-xs font-medium text-gray-500">
                                            ⏱️ {course.duration_hours} saat
                                        </span>
                                    )}
                                </div>
                                
                                <h2 className="text-xl font-bold text-gray-800 mb-3">
                                    {course.name}
                                </h2>
                                
                                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                                    {course.description || 'Bu ders için henüz açıklama eklenmemiş.'}
                                </p>
                            </div>
                            
                            <div className="mt-6">
                                <button
                                    onClick={() => handleEnroll(course.id)}
                                    disabled={course.is_enrolled}
                                    className={`w-full py-3 px-4 rounded-2xl font-semibold transition-all duration-300 transform ${
                                        course.is_enrolled
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:-translate-y-0.5'
                                    }`}
                                >
                                    {course.is_enrolled ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Kayıtlısın
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Derse Kaydol
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {paginationInfo?.totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={paginationInfo.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAllCoursesPage;