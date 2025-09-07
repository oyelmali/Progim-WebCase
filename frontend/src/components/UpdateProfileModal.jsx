import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const UpdateProfileModal = ({ isOpen, onClose, studentData, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Modal her açıldığında veya veri değiştiğinde, formu güncel bilgilerle doldurur.
    if (studentData) {
      setFormData({
        first_name: studentData.first_name || '',
        last_name: studentData.last_name || '',
        date_of_birth: studentData.date_of_birth ? new Date(studentData.date_of_birth).toISOString().split('T')[0] : '',
      });
    }
  }, [isOpen, studentData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Yeni ve güvenli endpoint'i kullanıyoruz
      const response = await api.put(`/students/${studentData.id}`, formData);
      
      if (response.data.success) {
        // 1. Dashboard'u yeni veriyle haberdar et (Dashboard yenilenecek)
        onUpdateSuccess(response.data.data);
        // 2. Ana component'e kapanma isteği gönder (Modal kapanacak)
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Güncelleme sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white/95 p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          Profil Bilgilerini Düzenle
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="text-black w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"/>
            </div>
            <div className="w-1/2">
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="text-black w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"/>
            </div>
          </div>
          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi</label>
            <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required className="text-black w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"/>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl">
              İptal
            </button>
            <button type="submit" disabled={loading} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg disabled:opacity-50">
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfileModal;