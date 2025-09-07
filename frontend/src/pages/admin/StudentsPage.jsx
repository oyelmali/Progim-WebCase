import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import StudentModal from './StudentModal';
import SimpleStudentInfoModal from './SimpleStudentInfoModal';
import AdminCourseManagerModal from './AdminCourseManagerModal';
import Pagination from '../../components/Pagination';

const AdminStudentsPage = () => {
    // --- STATE'LER ---
    const [students, setStudents] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Modal state'leri
    const [editModal, setEditModal] = useState({ isOpen: false, student: null });
    const [infoModal, setInfoModal] = useState({ isOpen: false, student: null });
    const [courseManagerModal, setCourseManagerModal] = useState({ isOpen: false, student: null, courses: [], loading: false });

    // --- VERİ ÇEKME ---
    const fetchStudents = useCallback(async (page) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/students?page=${page}&limit=10`);
            const { data, pagination } = response.data;
            setStudents(data);
            setPaginationInfo(pagination);
        } catch (err) { 
            setError('Öğrenciler yüklenirken bir hata oluştu.'); 
        } finally { 
            setLoading(false); 
        }
    }, []);

    useEffect(() => { 
        fetchStudents(currentPage); 
    }, [currentPage, fetchStudents]);

    // --- HANDLER'LAR ---
    const handlePageChange = (page) => setCurrentPage(page);

    // Ekle/Düzenle Modal
    const handleOpenEditModal = (student = null) => setEditModal({ isOpen: true, student });
    const handleCloseEditModal = () => setEditModal({ isOpen: false, student: null });
    
    const handleSaveStudent = async (studentData) => {
        try {
            if (editModal.student) {
                // Güncelleme işlemi
                await api.put(`/students/${editModal.student.id}`, studentData);
                alert('Öğrenci başarıyla güncellendi!');
            } else {
                // Yeni öğrenci ekleme
                await api.post('/students', studentData);
                alert('Öğrenci başarıyla eklendi!');
            }
            
            // Modal'ı kapat ve listeyi yenile
            handleCloseEditModal();
            fetchStudents(currentPage);
        } catch (err) {
            console.error('Error saving student:', err);
            alert(err.response?.data?.message || 'Öğrenci kaydedilirken bir hata oluştu.');
        }
    };
    
    // Basit Bilgi Modalı
    const handleOpenInfoModal = (student) => setInfoModal({ isOpen: true, student });
    const handleCloseInfoModal = () => setInfoModal({ isOpen: false, student: null });

    // Ders Yönetim Modalı
    const handleOpenCourseManager = async (student) => {
        setCourseManagerModal(prev => ({ ...prev, isOpen: true, student, loading: true }));
        try {
            const response = await api.get(`/students/${student.id}/courses`);
            setCourseManagerModal(prev => ({ ...prev, courses: response.data, loading: false }));
        } catch (err) {
            console.error('Öğrencinin dersleri çekilirken hata:', err);
            setCourseManagerModal(prev => ({ ...prev, courses: [], loading: false }));
        }
    };
    const handleCloseCourseManager = () => setCourseManagerModal({ isOpen: false, student: null, courses: [], loading: false });
    
    // Ders Ekleme/Çıkarma
    const handleEnrollmentChange = async (action, courseId) => {
        const studentId = courseManagerModal.student.id;
        try {
            if (action === 'add') {
                await api.post('/enrollments/admin', { studentId, courseId });
            } else if (action === 'remove') {
                await api.delete(`/enrollments/admin/${studentId}/${courseId}`);
            }
            const response = await api.get(`/students/${studentId}/courses`);
            setCourseManagerModal(prev => ({ ...prev, courses: response.data }));
        } catch (err) { 
            alert(err.response?.data?.message || 'İşlem hatası.'); 
        }
    };

    // Öğrenci silme fonksiyonu (opsiyonel)
    const handleDeleteStudent = async (studentId) => {
        if (window.confirm('Bu öğrenciyi silmek istediğinize emin misiniz?')) {
            try {
                await api.delete(`/students/${studentId}`);
                alert('Öğrenci başarıyla silindi!');
                fetchStudents(currentPage);
            } catch (err) {
                alert(err.response?.data?.message || 'Öğrenci silinirken bir hata oluştu.');
            }
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
                        Öğrenci Yönetimi
                    </h1>
                    <button 
                        onClick={() => handleOpenEditModal()} 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                    >
                        + Yeni Öğrenci Ekle
                    </button>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl overflow-scroll border border-purple-100">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-purple-50">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                                    Ad Soyad
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                                    E-posta
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-purple-700 uppercase tracking-wider">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-100">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-purple-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button 
                                            onClick={() => handleOpenInfoModal(student)} 
                                            className="font-medium text-purple-600 hover:text-purple-800 text-left hover:underline"
                                        >
                                            {student.first_name} {student.last_name}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                        {student.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                                        <button 
                                            onClick={() => handleOpenCourseManager(student)} 
                                            className="font-medium text-green-600 hover:text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-full transition-all"
                                        >
                                            Dersler
                                        </button>
                                        <button 
                                            onClick={() => handleOpenEditModal(student)} 
                                            className="font-medium text-yellow-600 hover:text-yellow-700 bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded-full transition-all"
                                        >
                                            Düzenle
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteStudent(student.id)}
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
                
                <StudentModal 
                    isOpen={editModal.isOpen}
                    onClose={handleCloseEditModal}
                    onSave={handleSaveStudent}
                    student={editModal.student}
                />
                
                <SimpleStudentInfoModal 
                    isOpen={infoModal.isOpen} 
                    onClose={handleCloseInfoModal} 
                    student={infoModal.student} 
                />
                
                <AdminCourseManagerModal 
                    isOpen={courseManagerModal.isOpen} 
                    onClose={handleCloseCourseManager} 
                    student={courseManagerModal.student} 
                    courses={courseManagerModal.courses} 
                    onEnrollmentChange={handleEnrollmentChange} 
                />
            </div>
        </div>
    );
};

export default AdminStudentsPage;