import Image from 'next/image';
import { ReactNode } from 'react';

interface LinkProps {
  href: string;
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

export function Link({
  href,
  target,
  rel,
  children,
  icon,
  className = '',
}: LinkProps) {
  return (
    <a
      className={`flex items-center gap-2 hover:underline hover:underline-offset-4 ${className}`}
      href={href}
      target={target}
      rel={rel}
    >
      {icon && (
        <Image
          aria-hidden
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
