import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';
import UpdateProfileModal from '../components/UpdateProfileModal';

const DashboardPage = () => {
  const { user } = useAuth();
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStudentInfo = async () => {
    if (!user || !user.id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/students/user/${user.id}`);
      setStudentInfo(response.data.success ? response.data.data : null);
    } catch (err) {
      setError('Bilgiler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentInfo();
  }, [user]);

  const handleUpdateSuccess = (updatedStudentData) => {
   
    setStudentInfo(updatedStudentData);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Yükleniyor...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-purple-100">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Kontrol Paneline Hoş Geldiniz!
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            Merhaba <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {studentInfo ? `${studentInfo.first_name} ${studentInfo.last_name}` : user?.email}
            </span>, sistemdesin.
          </p>
          
          <div className="mt-6 border-t border-purple-100 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Hesap Bilgilerin</h3>
              {studentInfo && (
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:opacity-80">
                  Bilgileri Güncelle
                </button>
              )}
            </div>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600">E-posta: {user?.email}</li>
              {studentInfo && (
                <>
                  <li className="flex items-center text-gray-600">Ad: {studentInfo.first_name}</li>
                  <li className="flex items-center text-gray-600">Soyad: {studentInfo.last_name}</li>
                  <li className="flex items-center text-gray-600">
                    Doğum Tarihi: {new Date(studentInfo.date_of_birth).toLocaleDateString('tr-TR')}
                  </li>
                </>
              )}
              <li className="flex items-center text-gray-600">Rol: {user?.role}</li>
            </ul>
          </div>
          {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
        </div>
      </main>

      <UpdateProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        studentData={studentInfo}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default DashboardPage;