import React, { useState } from 'react';
import AdminDashboard from '../admin/AdminDashboard';
import AdminLogin from '../admin/AdminLogin';

export const AdminDashboardPage = ({ onNavigateToPublic }) => {
  const [isAuthed, setIsAuthed] = useState(() => {
    return sessionStorage.getItem('triples_admin_auth') === 'true' ||
           sessionStorage.getItem('diffsnow_admin_authed') === 'true';
  });

  const handleLoginSuccess = () => {
    sessionStorage.setItem('triples_admin_auth', 'true');
    sessionStorage.setItem('diffsnow_admin_authed', 'true');
    setIsAuthed(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('triples_admin_auth');
    sessionStorage.removeItem('diffsnow_admin_authed');
    setIsAuthed(false);
    if (onNavigateToPublic) onNavigateToPublic();
  };

  if (!isAuthed) {
    return (
      <AdminLogin 
        onLoginSuccess={handleLoginSuccess}
        onBackToHome={onNavigateToPublic}
      />
    );
  }

  return (
    <AdminDashboard 
      onLogout={handleLogout}
      onGoToLiveSite={onNavigateToPublic}
    />
  );
};

export default AdminDashboardPage;
