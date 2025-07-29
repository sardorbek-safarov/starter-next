'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '../context/AuthContext';

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => void;
  className?: string;
}

export function LoginForm({ onSubmit, className = '' }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const t = useTranslations('Auth');
  const { login, isLoading, error: authError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // If onSubmit prop is provided, use it (for custom handling)
      if (onSubmit) {
        onSubmit(email, password);
      } else {
        // Otherwise use the auth context
        await login(email, password);
      }
    } catch (err) {
      // Error is now handled by TanStack Query and available in authError
      console.error('Login error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label htmlFor='email' className='block text-sm font-medium mb-1'>
          {t('email')}
        </label>
        <input
          type='email'
          id='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
        />
      </div>
      <div>
        <label htmlFor='password' className='block text-sm font-medium mb-1'>
          {t('password')}
        </label>
        <input
          type='password'
          id='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
        />
      </div>
      <button
        type='submit'
        disabled={isLoading}
        className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50'
      >
        {isLoading ? 'Signing in...' : t('login.signIn')}
      </button>
    </form>
  );
}
