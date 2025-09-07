import React from 'react';

const EnrolledCourseCard = ({ course, onClick }) => {
    return (
        <div 
            key={course.id} 
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-white/90 border border-purple-100 group"
            onClick={() => onClick(course)}
        >
            <div>
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                        {course.course_code}
                    </span>
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        ✓ Kayıtlı
                    </span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {course.name}
                </h2>
                <p className="text-gray-600 mt-3 text-sm line-clamp-3 leading-relaxed">
                    {course.description || 'Açıklama mevcut değil.'}
                </p>
            </div>
            <div className="mt-4 flex items-center justify-end text-sm text-purple-500 group-hover:text-purple-700 transition-colors">
                <span>Detayları gör</span>
                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    );
};

export default EnrolledCourseCard;