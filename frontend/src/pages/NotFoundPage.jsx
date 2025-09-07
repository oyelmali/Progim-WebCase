import React from 'react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 border border-purple-100">
          <div className="text-8xl mb-4">🔍</div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <p className="text-xl text-gray-700 mb-6">Aradığınız sayfa bulunamadı</p>
          <a 
            href="/dashboard" 
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;