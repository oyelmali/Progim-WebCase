import api from './axiosConfig';

const userService = {
  // Kullanıcı profil bilgilerini getir
  getProfile: async () => {
    try {
      const response = await api.get('/students/profile');
      return response.data;
    } catch (error) {
      console.error('Profil bilgileri alınamadı:', error);
      throw error;
    }
  },

  // Kullanıcı bilgilerini güncelle
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/user/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Profil güncellenemedi:', error);
      throw error;
    }
  }
};

export default userService;