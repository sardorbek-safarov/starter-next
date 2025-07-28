import Image from 'next/image';
import { User } from '../model';

interface UserCardProps {
  user: User;
  className?: string;
}

export function UserCard({ user, className = '' }: UserCardProps) {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border ${className}`}
    >
      {user.avatar && (
        <Image
          src={user.avatar}
          alt={`${user.name} avatar`}
          width={40}
          height={40}
          className='rounded-full'
        />
      )}
      <div>
        <h3 className='font-medium'>{user.name}</h3>
        <p className='text-sm text-gray-600'>{user.email}</p>
      </div>
    </div>
  );
}
