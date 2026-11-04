import React, { createContext, useContext, useMemo } from 'react';

const AuthContext = createContext({
  currentUser: null,
  isViewer: false,
  isAdmin: false,
  isSuperAdmin: false,
  canEdit: false
});

export function AuthProvider({ currentUser, children }) {
  const value = useMemo(() => {
    const isViewer = currentUser?.role === 'viewer';
    const isSuperAdmin = currentUser?.role === 'super_admin';
    const isAdmin = currentUser?.role === 'admin' || isSuperAdmin;
    const canEdit = !isViewer && (isAdmin || currentUser?.role === 'editor');

    return {
      currentUser,
      isViewer,
      isAdmin,
      isSuperAdmin,
      canEdit
    };
  }, [currentUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
