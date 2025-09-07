import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    date_of_birth: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-100">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Yeni Hesap Oluştur
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Ad</label>
              <input 
                id="first_name" 
                name="first_name" 
                type="text" 
                required 
                value={formData.first_name} 
                onChange={handleChange} 
                className="mt-1 block w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all" 
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Soyad</label>
              <input 
                id="last_name" 
                name="last_name" 
                type="text" 
                required 
                value={formData.last_name} 
                onChange={handleChange} 
                className="mt-1 block w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all" 
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-posta</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              value={formData.email} 
              onChange={handleChange} 
              className="mt-1 block w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all" 
            />
          </div>

          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">Doğum Tarihi</label>
            <input 
              id="date_of_birth" 
              name="date_of_birth" 
              type="date" 
              required 
              value={formData.date_of_birth} 
              onChange={handleChange} 
              className="mt-1 block w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Şifre</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              value={formData.password} 
              onChange={handleChange} 
              className="mt-1 block w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all" 
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-2xl text-sm text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-2xl text-sm text-center">
              {success}
            </div>
          )}
          
          <div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full flex justify-center py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Kaydediliyor...
                </div>
              ) : 'Kayıt Ol'}
            </button>
          </div>
          
          <p className="mt-6 text-center text-sm text-gray-600">
            Zaten bir hesabın var mı?{' '}
            <a href="/login" className="font-medium text-purple-600 hover:text-purple-700 hover:underline">
              Giriş Yap
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;