import { useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import UnlockKnowledge from '@/components/UnlockKnowledge';
import Pricing from '@/components/Pricing';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import AuthModal from '@/components/auth/AuthModal';
import AdminLayout from '@/components/admin/AdminLayout';
import Dashboard from '@/components/admin/Dashboard';
import AdminLogin from '@/components/admin/AdminLogin';
import UserList from '@/components/admin/users/UserList';
import RoleList from '@/components/admin/roles/RoleList';
import PermissionList from '@/components/admin/permissions/PermissionList';
import CourseList from '@/components/admin/courses/CourseList';
import CourseDetails from '@/components/admin/courses/CourseDetails';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <AuthProvider>
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/users" element={<UserList />} />
                      <Route path="/roles" element={<RoleList />} />
                      <Route path="/permissions" element={<PermissionList />} />
                      <Route path="/courses" element={<CourseList />} />
                      <Route path="/courses/:id" element={<CourseDetails />} />
                      <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Public Routes */}
            <Route
              path="/"
              element={
                <div className="min-h-screen bg-background">
                  <Navbar onSignIn={() => openAuthModal('signin')} onSignUp={() => openAuthModal('signup')} />
                  <main>
                    <Hero onGetStarted={() => openAuthModal('signup')} />
                    <Features />
                    <HowItWorks />
                    <UnlockKnowledge />
                    <Pricing onGetStarted={() => openAuthModal('signup')} />
                    <Testimonials />
                  </main>
                  <Footer />
                  <AuthModal 
                    isOpen={showAuthModal} 
                    onClose={() => setShowAuthModal(false)}
                    mode={authMode}
                    onToggleMode={(mode) => setAuthMode(mode)}
                  />
                  <Toaster />
                </div>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;