import React from 'react';

const SimpleCourseInfoModal = ({ course, isOpen, onClose }) => {
    if (!isOpen || !course) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-40" 
            onClick={onClose}
        >
            <div 
                className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-lg transform transition-all" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                            {course.course_code}
                        </span>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                            {course.name}
                        </h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 text-3xl rounded-full hover:bg-gray-100 w-10 h-10 flex items-center justify-center transition-all"
                    >
                        ×
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div className="bg-purple-50 p-6 rounded-2xl">
                        <p className="text-gray-700 leading-relaxed">
                            {course.description || 'Bu ders için açıklama mevcut değil.'}
                        </p>
                    </div>
                    
                    {course.duration_hours && (
                        <div className="flex items-center bg-pink-50 p-4 rounded-2xl">
                            <span className="text-pink-500 mr-3 text-xl">⏱️</span>
                            <div>
                                <p className="text-sm text-gray-600">Ders Süresi</p>
                                <p className="font-medium text-gray-800">{course.duration_hours} saat</p>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold rounded-2xl transition-all"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SimpleCourseInfoModal;