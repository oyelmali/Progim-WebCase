import React from 'react';

const CourseDetailModal = ({ course, isOpen, onClose, onWithdraw }) => {
    // Modal açık değilse veya kurs bilgisi yoksa hiçbir şey render etme
    if (!isOpen || !course) {
        return null;
    }

    const handleWithdrawClick = () => {
        // Ana bileşene (sayfaya) hangi kursun bırakılacağını bildir
        onWithdraw(course.id);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50"
            onClick={onClose} // Dışarıya tıklayınca modal'ı kapat
        >
           
            <div 
                className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()} // İçeriğe tıklayınca kapanmasını engeller
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
                    <p className="text-gray-700 leading-relaxed">
                        {course.description || 'Bu ders için bir açıklama bulunmamaktadır.'}
                    </p>
                    {course.duration_hours && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-purple-500">⏱️</span>
                            <strong>Tahmini Süre:</strong> {course.duration_hours} saat
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-purple-100 flex justify-end">
                    <button
                        onClick={handleWithdrawClick}
                        className="bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        Dersten Çekil
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailModal;