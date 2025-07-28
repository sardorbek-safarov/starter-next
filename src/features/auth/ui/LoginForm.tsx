'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => void;
  className?: string;
}

export function LoginForm({ onSubmit, className = '' }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const t = useTranslations('Auth');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(email, password);
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
        className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium'
      >
        {t('signIn')}
      </button>
    </form>
  );
}
