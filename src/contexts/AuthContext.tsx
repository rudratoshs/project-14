import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '@/lib/types/user';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '@/lib/api/auth';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // If no token, just finish initialization
        if (!token) {
          setInitialized(true);
          setLoading(false);
          return;
        }

        const userData = await getCurrentUser();
        setUser(userData);

        // If on login page and authenticated, redirect to admin
        if (location.pathname === '/admin/login') {
          navigate('/admin', { replace: true });
        }
      } catch (error) {
        // Clear invalid token
        localStorage.removeItem('token');
        
        // Only redirect to login if on admin routes (except login page)
        if (!location.pathname.includes('/login') && location.pathname.includes('/admin')) {
          navigate('/admin/login', { 
            replace: true,
            state: { from: location }
          });
        }
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, [navigate, location.pathname]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const { user: userData, token } = await apiLogin({ email, password });
      
      if (token) {
        localStorage.setItem('token', token);
      }
      
      setUser(userData);

      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      // Redirect to the intended page or admin dashboard
      const from = (location.state as any)?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to login';
      setError(message);
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiLogout();
      setUser(null);
      localStorage.removeItem('token');
      navigate('/admin/login', { replace: true });
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while initializing
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}