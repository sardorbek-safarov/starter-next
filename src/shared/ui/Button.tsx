import Image from 'next/image';
import { ReactNode } from 'react';

interface ButtonProps {
  href: string;
  variant?: 'primary' | 'secondary';
  target?: string;
  rel?: string;
  children: ReactNode;
  icon?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  className?: string;
}

export function Button({
  href,
  variant = 'secondary',
  target,
  rel,
  children,
  icon,
  className = '',
}: ButtonProps) {
  const baseClasses =
    'rounded-full border border-solid transition-colors flex items-center justify-center font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5';

  const variantClasses = {
    primary:
      'border-transparent bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] sm:w-auto',
    secondary:
      'border-black/[.08] dark:border-white/[.145] hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent w-full sm:w-auto md:w-[158px]',
  };

  return (
    <a
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      href={href}
      target={target}
      rel={rel}
    >
      {icon && (
        <Image
          className='dark:invert'
          src={icon.src}
          alt={icon.alt}
          width={icon.width}
          height={icon.height}
        />
      )}
      {children}
    </a>
  );
}
