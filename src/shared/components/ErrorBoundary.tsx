'use client';

import React, { Component, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// Error Fallback Component
function ErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  const t = useTranslations('ErrorBoundary');

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <div className='mx-auto h-12 w-12 text-red-500'>
            <svg
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>

          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
            {t('title')}
          </h2>

          <p className='mt-2 text-sm text-gray-600'>{t('description')}</p>

          {process.env.NODE_ENV === 'development' && error && (
            <details className='mt-4 text-left'>
              <summary className='cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900'>
                {t('technicalDetails')}
              </summary>
              <div className='mt-2 p-4 bg-red-50 rounded-md border border-red-200'>
                <pre className='text-xs text-red-800 whitespace-pre-wrap overflow-auto'>
                  {error.stack}
                </pre>
              </div>
            </details>
          )}
        </div>

        <div className='space-y-4'>
          <button
            onClick={resetError}
            className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            {t('tryAgain')}
          </button>

          <button
            onClick={() => (window.location.href = '/')}
            className='group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            {t('goHome')}
          </button>

          <button
            onClick={() => window.location.reload()}
            className='group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            {t('refresh')}
          </button>
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      if (this.state.error) {
        return (
          <ErrorFallback
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
