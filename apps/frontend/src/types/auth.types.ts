export interface User {
  id: string;
  username: string;
  email: string;
  roles: UserRole[];
}

export type UserRole = 'USER' | 'SELLER' | 'ADMIN';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}