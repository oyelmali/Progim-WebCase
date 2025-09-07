import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

const AdminStudentManagerModal = ({ course, students, isOpen, onClose, onEnrollmentChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Debouncing: Kullanıcının yazmayı bırakmasını beklemek için
    useEffect(() => {
        
        if (!isOpen || !course) {
            return;
        }

        if (searchTerm.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await api.get(`/students/search?q=${searchTerm}&courseId=${course.id}`);
                setSearchResults(response.data);
            } catch (error) {
                console.error("Arama sırasında hata oluştu", error);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, course, isOpen]); 
    
    if (!isOpen || !course) return null;

    const handleAddStudent = async (studentId) => {
        await onEnrollmentChange('add', studentId);
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleRemoveStudent = (studentId) => {
        onEnrollmentChange('remove', studentId);
    };
    
    // Modal kapandığında arama state'ini sıfırla
    const handleClose = () => {
        setSearchTerm('');
        setSearchResults([]);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50" onClick={handleClose}>
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-3xl transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {course.name}
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">Öğrenci Yönetimi</p>
                    </div>
                    <button 
                        onClick={handleClose} 
                        className="text-gray-400 hover:text-gray-600 text-3xl rounded-full hover:bg-gray-100 w-10 h-10 flex items-center justify-center transition-all"
                    >
                        ×
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="text-purple-500 mr-2">👥</span>
                            Kayıtlı Öğrenciler ({students.length})
                        </h3>
                        <div className="bg-purple-50 rounded-2xl max-h-80 overflow-y-auto">
                            {students.length > 0 ? (
                                <ul className="divide-y divide-purple-100">
                                    {students.map(student => (
                                        <li key={student.id} className="p-4 flex justify-between items-center hover:bg-purple-100 transition-colors">
                                            <div>
                                                <p className="font-medium text-gray-800">{student.first_name} {student.last_name}</p>
                                                <p className="text-sm text-gray-600">{student.email}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveStudent(student.id)} 
                                                className="text-red-500 hover:text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full text-xs font-semibold transition-all"
                                            >
                                                Çıkar
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center p-8">Bu derse kayıtlı öğrenci yok.</p>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="text-pink-500 mr-2">➕</span>
                            Derse Öğrenci Ekle
                        </h3>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Ad, soyad veya e-posta ile ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all"
                            />
                            {isSearching && (
                                <p className="text-xs text-gray-500 mt-2 flex items-center">
                                    <span className="inline-block w-3 h-3 bg-pink-400 rounded-full animate-pulse mr-1"></span>
                                    Aranıyor...
                                </p>
                            )}
                            {searchResults.length > 0 && (
                                <ul className="absolute w-full bg-white border border-purple-200 rounded-2xl mt-2 max-h-48 overflow-y-auto shadow-xl z-10">
                                    {searchResults.map(student => (
                                        <li 
                                            key={student.id} 
                                            onClick={() => handleAddStudent(student.id)} 
                                            className="p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer transition-all"
                                        >
                                            <p className="font-medium text-gray-800">{student.first_name} {student.last_name}</p>
                                            <p className="text-sm text-gray-600">{student.email}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={handleClose} 
                        className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold rounded-2xl transition-all"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminStudentManagerModal;