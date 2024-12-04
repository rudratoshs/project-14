import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onToggleMode: (mode: 'signin' | 'signup') => void;
}

export default function AuthModal({ isOpen, onClose, mode, onToggleMode }: AuthModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 bg-white/80 backdrop-blur-sm">
        <div className="relative overflow-hidden p-6">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-cyan-500/5" />
          
          {/* Animated Background Shapes */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "absolute rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float",
                  i === 0 ? "bg-primary" : i === 1 ? "bg-purple-500" : "bg-cyan-500"
                )}
                style={{
                  width: `${Math.random() * 200 + 100}px`,
                  height: `${Math.random() * 200 + 100}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative">
            <AnimatePresence mode="wait" initial={false} onExitComplete={() => setIsAnimating(false)}>
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === 'signin' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'signin' ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                onAnimationStart={() => setIsAnimating(true)}
              >
                {mode === 'signin' ? (
                  <SignInForm onToggleMode={() => !isAnimating && onToggleMode('signup')} />
                ) : (
                  <SignUpForm onToggleMode={() => !isAnimating && onToggleMode('signin')} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}