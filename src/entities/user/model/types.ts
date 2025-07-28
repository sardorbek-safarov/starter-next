export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export type UserCreateDto = Omit<User, 'id'>;
export type UserUpdateDto = Partial<UserCreateDto>;
