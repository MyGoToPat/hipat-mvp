import React from 'react';
import { Auth } from '../components/Auth';

export const LoginPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 border-4 border-red-500">
      <div className="w-full max-w-md absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-4 border-green-500 shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black">LOGIN CARD VISIBLE TEST</h1>
          <p className="text-black">Your personal fitness companion</p>
        </div>
        <div className="bg-white rounded-2xl p-8 border-4 border-blue-500">
          <Auth />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;