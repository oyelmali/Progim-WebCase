import React, { createContext, useReducer, useEffect } from 'react';

// 1. Initial State: Uygulama ilk yüklendiğinde localStorage'ı kontrol et
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
};


try {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (storedToken && storedUser) {
    initialState.token = storedToken;
    initialState.user = JSON.parse(storedUser);
    initialState.isAuthenticated = true;
  }
} catch (error) {
  console.error("Failed to parse user from localStorage", error);
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}


// 2. Reducer Fonksiyonu: State güncellemelerini yönetir
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    default:
      return state;
  }
};

// 3. Context'i Oluşturma
export const AuthContext = createContext(initialState);

// 4. Provider Bileşeni: Uygulamayı sarmalayacak olan ana bileşen
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 5. localStorage'ı State ile senkronize tutma
  useEffect(() => {
    if (state.token && state.user) {
      localStorage.setItem('token', state.token);
      localStorage.setItem('user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [state.token, state.user]);

  // 6. Context üzerinden paylaşılacak fonksiyonlar
  const login = (userData) => {
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: {
        user: userData.user,
        token: userData.token,
      },
    });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };
  
  // 7. Paylaşılacak değerleri Provider'a verme
  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};