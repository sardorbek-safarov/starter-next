'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@/shared/hooks/useToast';

export function RegisterForm() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const { showError } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { register, isRegistering } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!name.trim()) {
      showError('Name is required');
      return;
    }

    if (!email.trim()) {
      showError('Email is required');
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    try {
      await register({ name, email, password });
    } catch (error) {
      // Error is already handled by the auth context
      console.error('Registration error:', error);
    }
  };

  return (
    <div className='sm:mx-auto sm:w-full sm:max-w-md'>
      <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
        {t('register.title')}
      </h2>

      <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
        <div className='space-y-4'>
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-700'
            >
              {t('name')}
            </label>
            <input
              id='name'
              name='name'
              type='text'
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            />
          </div>

          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'
            >
              {t('email')}
            </label>
            <input
              id='email'
              name='email'
              type='email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            />
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700'
            >
              {t('password')}
            </label>
            <input
              id='password'
              name='password'
              type='password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            />
          </div>

          <div>
            <label
              htmlFor='confirmPassword'
              className='block text-sm font-medium text-gray-700'
            >
              {t('confirmPassword')}
            </label>
            <input
              id='confirmPassword'
              name='confirmPassword'
              type='password'
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
        </div>

        <div>
          <button
            type='submit'
            disabled={isRegistering}
            className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isRegistering ? t('registering') : t('register.signUp')}
          </button>
        </div>
      </form>
    </div>
  );
}
