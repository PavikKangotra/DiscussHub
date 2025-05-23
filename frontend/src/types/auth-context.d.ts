declare module '../contexts/AuthContext' {
  interface User {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
    reputation: number;
    role: string;
  }

  interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
  }

  export function useAuth(): AuthContextType;
  export const AuthProvider: React.FC;
} 