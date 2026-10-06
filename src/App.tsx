import React from 'react';
import { MotionConfig } from 'motion/react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './app/AuthContext';
import { router } from './app/router';

export function App() {
  return (
    /**
     * `reducedMotion="user"` — toda a animação de transformação é desligada
     * quando o sistema do utilizador pede menos movimento; os fades mantêm-se
     * (são funcionais e não provocam desconforto vestibular).
     */
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MotionConfig>
  );
}

export default App;
