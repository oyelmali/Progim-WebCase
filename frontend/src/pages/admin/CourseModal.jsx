import React, { useState, useEffect } from 'react';

const CourseModal = ({ isOpen, onClose, onSave, course }) => {
  const initialFormState = {
    course_code: '',
    name: '',
    description: '',
    duration_hours: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (course) {
      setFormData({
        course_code: course.course_code || '',
        name: course.name || '',
        description: course.description || '',
        duration_hours: course.duration_hours ? parseInt(course.duration_hours).toString() : '',
      });
    } else {
      setFormData(initialFormState);
    }
  }, [course, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'duration_hours') {

      const intValue = value.replace(/[^0-9]/g, '');
      setFormData({ ...formData, [name]: intValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      duration_hours: formData.duration_hours ? parseInt(formData.duration_hours) : null
    };
    
    
    onSave(dataToSave);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div 
        className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-all" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          {course ? 'Dersi Düzenle' : 'Yeni Ders Oluştur'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="course_code" className="block text-sm font-medium text-gray-700 mb-1">
              Ders Kodu <span className="text-red-500">*</span>
            </label>
            <input 
                type="text" 
                id="course_code"
                name="course_code" 
                value={formData.course_code} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all" 
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Ders Adı <span className="text-red-500">*</span>
            </label>
            <input 
                type="text" 
                id="name"
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all" 
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea 
                id="description"
                name="description" 
                rows="3"
                value={formData.description} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none" 
            />
          </div>
          <div>
            <label htmlFor="duration_hours" className="block text-sm font-medium text-gray-700 mb-1">
              Ders Saati (Opsiyonel)
            </label>
            <input 
                type="number" 
                id="duration_hours"
                name="duration_hours" 
                value={formData.duration_hours} 
                onChange={handleChange} 
                min="0"
                step="1" 
                placeholder="Örn: 40"
                className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all" 
            />
            <p className="text-xs text-gray-500 mt-1 ml-2">Sadece tam sayı giriniz</p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all"
            >
                İptal
            </button>
            <button 
                type="submit" 
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
                Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;