import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

const AdminCourseManagerModal = ({ student, courses, isOpen, onClose, onEnrollmentChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!isOpen || !student) return;
        
        
        
        if (searchTerm.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        
        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const url = `/courses/search-for-student?q=${searchTerm}&studentId=${student.id}`; 
                const response = await api.get(url);

                setSearchResults(response.data);
            } catch (error) { 
                console.error("Arama hatası detayı:", error.response || error); 
            }
            finally { 
                setIsSearching(false); 
            }
        }, 500);
        
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, student, isOpen]);

    if (!isOpen || !student) return null;

    const handleAddCourse = async (courseId) => {
        await onEnrollmentChange('add', courseId);
        setSearchTerm('');
        setSearchResults([]);
    };
    
    const handleRemoveCourse = (courseId) => onEnrollmentChange('remove', courseId);
    const handleClose = () => { setSearchTerm(''); setSearchResults([]); onClose(); };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50" onClick={handleClose}>
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-3xl transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {student.first_name} {student.last_name}
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">Ders Yönetimi</p>
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
                            <span className="text-purple-500 mr-2">📚</span>
                            Kayıtlı Olduğu Dersler ({courses.length})
                        </h3>
                        <div className="bg-purple-50 rounded-2xl max-h-80 overflow-y-auto">
                            {courses.length > 0 ? (
                                <ul className="divide-y divide-purple-100">
                                    {courses.map(course => (
                                        <li key={course.id} className="p-4 flex justify-between items-center hover:bg-purple-100 transition-colors">
                                            <div>
                                                <p className="font-medium text-gray-800">{course.name}</p>
                                                <p className="text-sm text-purple-600">{course.course_code}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveCourse(course.id)} 
                                                className="text-red-500 hover:text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full text-xs font-semibold transition-all"
                                            >
                                                Çıkar
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center p-8">Öğrenci hiçbir derse kayıtlı değil.</p>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="text-pink-500 mr-2">➕</span>
                            Yeni Ders Ekle
                        </h3>
                        <div className="relative">
                                                        <input 
                                type="text" 
                                placeholder="Ders adı veya kodu ile ara..." 
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
                                    {searchResults.map(course => (
                                        <li 
                                            key={course.id} 
                                            onClick={() => handleAddCourse(course.id)} 
                                            className="p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer transition-all"
                                        >
                                            <p className="font-medium text-gray-800">{course.name}</p>
                                            <p className="text-sm text-purple-600">{course.course_code}</p>
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

export default AdminCourseManagerModal;