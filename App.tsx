// App.tsx
import React from 'react';
import { AuthProvider } from './app/context/AuthContext'; // adjust path if needed
import AppNavigator from './app/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
