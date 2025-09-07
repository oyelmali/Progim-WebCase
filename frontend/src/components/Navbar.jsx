import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex-shrink-0">
            <Link to={isAuthenticated ? "/dashboard" : "/login"} className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Dashboard
            </Link>
          </div>
          
         
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              // --- GİRİŞ YAPMIŞ KULLANICI GÖRÜNÜMÜ ---
              <>
                {user?.role === 'ADMIN' && (
                  <>
                    <Link to="admin-courses" className="text-gray-600 hover:bg-purple-100 hover:text-purple-700 px-4 py-2 rounded-full text-sm font-medium transition-all">
                      Kursları Yönet
                    </Link>
                    <Link to="admin-students" className="text-gray-600 hover:bg-purple-100 hover:text-purple-700 px-4 py-2 rounded-full text-sm font-medium transition-all">
                      Öğrencileri Yönet
                    </Link>
        
                  </>
                )}
                 {user?.role === 'student' && (
                  <>
                    <Link to="/courses" className="text-gray-600 hover:bg-purple-100 hover:text-purple-700 px-4 py-2 rounded-full text-sm font-medium transition-all">
                      Kurs Bul
                    </Link>
                    <Link to="/mycourses" className="text-gray-600 hover:bg-purple-100 hover:text-purple-700 px-4 py-2 rounded-full text-sm font-medium transition-all">
                      Kurslarım
                    </Link>
                  </>
                )}
                <span className="text-gray-600">
                  Hoş geldin, <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{user?.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-lg"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              // --- GİRİŞ YAPMAMIŞ KULLANICI GÖRÜNÜMÜ ---
              <>
                <Link to="/login" className="text-gray-600 hover:bg-purple-100 hover:text-purple-700 px-4 py-2 rounded-full text-sm font-medium transition-all">
                  Giriş Yap
                </Link>
                <Link to="/register" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-lg">
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;