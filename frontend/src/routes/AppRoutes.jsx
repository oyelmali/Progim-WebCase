import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import MainLayout from '../components/layout/MainLayout';

// Sayfalar
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage'; // Burası hatalı olabilir, pages/RegisterPage olmalı
import DashboardPage from '../pages/DashboardPage';
import AdminCoursesPage from '../pages/admin/CoursesPage';
import StudentMyCoursesPage from '../pages/student/StudentMyCoursesPage';
import NotFoundPage from '../pages/NotFoundPage';

// Koruyucular
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import AdminStudentsPage from '../pages/admin/StudentsPage';
import StudentAllCoursesPage from '../pages/student/StudentAllCoursesPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Tüm sayfaları MainLayout ile sarmala */}
      <Route path="/" element={<MainLayout />}>
        {/* Public Rotalar */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        
        {/* Ana dizini dashboard'a yönlendir (giriş yapılmışsa), yoksa login'e */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Korumalı Rotalar */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="mycourses"
          element={
            <ProtectedRoute>
              <StudentMyCoursesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="courses"
          element={
            <ProtectedRoute>
              <StudentAllCoursesPage />
            </ProtectedRoute>
          }
        />

        
        {/* Admin'e Özel Rotalar */}
        <Route
          path="admin-courses"
          element={
            <AdminRoute>
              <AdminCoursesPage />
            </AdminRoute>
          }
        />
        <Route
          path="admin-students"
          element={<AdminRoute><AdminStudentsPage /></AdminRoute>}
        />


        {/* 404 Sayfası */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;