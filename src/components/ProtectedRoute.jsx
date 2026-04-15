import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userProfile = localStorage.getItem('user_profile');
  
  // 1. Kiểm tra tài khoản đã đăng nhập chưa
  if (!token || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  try {
    const profile = JSON.parse(userProfile);
    const userRole = (profile.role || 'customer').toLowerCase(); 

    // 2. Chặn điều hướng nếu không đúng phân quyền
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      if (userRole === 'admin') {
        return <Navigate to="/addpage" replace />;
      }
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (error) {
    console.error("Lỗi khi đọc thông tin phần quyền user:", error);
    // Nếu cache profile bị lỗi hỏng thì ép đăng nhập lại
    localStorage.removeItem('token');
    localStorage.removeItem('user_profile');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
