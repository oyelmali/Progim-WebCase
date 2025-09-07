import React, { useState, useEffect } from 'react';

const StudentModal = ({ isOpen, onClose, onSave, student }) => {
  const initialFormState = {
    first_name: '',
    last_name: '',
    email: '',
    date_of_birth: '',
    password: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  // Doğum tarihi için max değer hesaplama (bugünden 10 yıl önce)
  const getMaxDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 10);
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (student) {
      setFormData({
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        email: student.email || '',
        date_of_birth: student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : '',
        password: '',
      });
    } else {
      setFormData(initialFormState);
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    
    
    // Form validasyonu
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.date_of_birth) {
      alert('Lütfen tüm zorunlu alanları doldurun!');
      return;
    }
    
    // Yeni öğrenci için şifre kontrolü
    if (!student && !formData.password) {
      alert('Yeni öğrenci için şifre zorunludur!');
      return;
    }
    
    if (typeof onSave === 'function') {
      onSave(formData);
    } else {
      console.error('onSave prop is not a function');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-all">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          {student ? 'Öğrenciyi Düzenle' : 'Yeni Öğrenci Oluştur'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                Ad <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="first_name"
                name="first_name" 
                value={formData.first_name} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all" 
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                Soyad <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="last_name"
                name="last_name" 
                value={formData.last_name} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all" 
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-posta <span className="text-red-500">*</span>
            </label>
            <input 
              type="email" 
              id="email"
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all" 
            />
          </div>
          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
              Doğum Tarihi <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              id="date_of_birth"
              name="date_of_birth" 
              value={formData.date_of_birth} 
              onChange={handleChange} 
              max={getMaxDate()}
              required 
              className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all" 
            />
            <p className="text-xs text-gray-500 mt-1 ml-2">En az 10 yaşında olmalıdır.</p>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Şifre {!student && <span className="text-red-500">*</span>}
            </label>
            <input 
              type="password" 
              id="password"
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required={!student} 
              placeholder={student ? 'Değiştirmek için doldurun' : ''} 
              className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all" 
            />
            {!student && (
              <p className="text-xs text-gray-500 mt-1 ml-2">Yeni öğrenci için şifre zorunludur.</p>
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button 
              type="button" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }} 
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all"
            >
              İptal
            </button>
            <button 
              type="submit" 
              onClick={(e) => {
                e.stopPropagation();
              }}
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

export default StudentModal;