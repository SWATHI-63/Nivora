import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Load users from localStorage
    const storedUsers = localStorage.getItem('nivora-users');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      setUsers(parsedUsers);

      // Check if user is logged in and sync with latest user data
      const loggedInUser = localStorage.getItem('nivora-current-user');
      if (loggedInUser) {
        const currentUserData = JSON.parse(loggedInUser);
        // Find the user in stored users to get the latest data
        const latestUserData = parsedUsers.find(u => u.id === currentUserData.id);
        if (latestUserData) {
          const userWithoutPassword = {
            id: latestUserData.id,
            email: latestUserData.email,
            name: latestUserData.name,
            photo: latestUserData.photo || null,
            bio: latestUserData.bio || '',
            coverPhoto: latestUserData.coverPhoto || null
          };
          setCurrentUser(userWithoutPassword);
          localStorage.setItem('nivora-current-user', JSON.stringify(userWithoutPassword));
        } else {
          setCurrentUser(currentUserData);
        }
      }
    } else {
      // Check if user is logged in
      const loggedInUser = localStorage.getItem('nivora-current-user');
      if (loggedInUser) {
        setCurrentUser(JSON.parse(loggedInUser));
      }
    }
  }, []);

  const register = (email, password, name) => {
    // Check if user already exists
    if (users.some(user => user.email === email)) {
      return { success: false, message: 'User already exists' };
    }

    const newUser = {
      id: Date.now(),
      email,
      password, // In production, this should be hashed
      name,
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('nivora-users', JSON.stringify(updatedUsers));

    return { success: true, message: 'Registration successful' };
  };

  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      const userWithoutPassword = { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        photo: user.photo || null,
        bio: user.bio || '',
        coverPhoto: user.coverPhoto || null
      };
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('nivora-current-user', JSON.stringify(userWithoutPassword));
      return { success: true, message: 'Login successful' };
    }

    return { success: false, message: 'Invalid email or password' };
  };

  const updateProfile = (updates) => {
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    localStorage.setItem('nivora-current-user', JSON.stringify(updatedUser));

    // Update in users array
    const updatedUsers = users.map(u => 
      u.id === currentUser.id ? { ...u, ...updates } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('nivora-users', JSON.stringify(updatedUsers));

    return { success: true, message: 'Profile updated successfully' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nivora-current-user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
