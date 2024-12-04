import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Brain, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    text: "Create AI-Powered Courses",
    icon: Brain,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    text: "Generate Sub-Topics in Seconds",
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    text: "Build Interactive Learning Paths",
    icon: Rocket,
    gradient: "from-orange-500 to-red-500"
  }
];

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  const [featureIndex, setFeatureIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFeatureIndex((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentFeature = features[featureIndex];

  return (
    <div ref={heroRef} className="relative min-h-screen flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-cyan-500/5" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float",
              i % 3 === 0 ? "bg-primary" : i % 3 === 1 ? "bg-purple-500" : "bg-cyan-500"
            )}
            style={{
              width: `${Math.random() * 200 + 50}px`,
              height: `${Math.random() * 200 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      <div className="container relative px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              AI Course Generator
            </span>
          </motion.h1>

          {/* Animated Feature Text */}
          <div className="h-20 mb-8 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                key={featureIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center space-x-3 text-2xl md:text-3xl text-gray-800"
              >
                <currentFeature.icon className={cn(
                  "h-8 w-8 bg-gradient-to-br bg-clip-text text-transparent",
                  currentFeature.gradient
                )} />
                <span>{currentFeature.text}</span>
              </motion.div>
            </div>
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Revolutionize your learning journey with our AI Course Generator. 
            Create engaging and personalized courses tailored to your needs in minutes.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={onGetStarted}
              className="min-w-[200px] bg-gradient-to-r from-primary via-purple-500 to-cyan-500 hover:opacity-90 transition-all duration-300 group"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-w-[200px] border-2 hover:bg-gray-50/50 transition-all duration-300"
            >
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8"
          >
            {[
              { label: "Active Users", value: "10K+" },
              { label: "Courses Created", value: "50K+" },
              { label: "Success Rate", value: "95%" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}