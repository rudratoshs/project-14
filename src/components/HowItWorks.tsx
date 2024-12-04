import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Sparkles, Video, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const steps = [
  {
    title: 'Enter Course Title',
    description: 'Start by entering your course topic or title. Our AI will analyze and understand your requirements.',
    icon: FileText,
    gradient: 'from-blue-500 to-cyan-500',
    image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&q=80&w=500'
  },
  {
    title: 'AI Generates Sub-Topics',
    description: 'Our advanced AI breaks down the topic into comprehensive sub-topics and learning objectives.',
    icon: Sparkles,
    gradient: 'from-purple-500 to-pink-500',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=500'
  },
  {
    title: 'Complete Course Generation',
    description: 'Get a fully structured course with video scripts, theory content, and interactive elements.',
    icon: Video,
    gradient: 'from-orange-500 to-red-500',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=500'
  }
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div ref={containerRef} className="container mx-auto px-4 relative">
        <div className={cn(
          "text-center mb-16 transition-all duration-700 transform",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create comprehensive courses in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Steps List */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: isInView ? 1 : 0,
                  x: isInView ? 0 : -20,
                  scale: activeStep === index ? 1.05 : 1
                }}
                transition={{ 
                  duration: 0.5,
                  delay: index * 0.2,
                  scale: { duration: 0.3 }
                }}
              >
                <Card 
                  className={cn(
                    "transition-all duration-300 cursor-pointer border-2",
                    activeStep === index 
                      ? "border-primary/50 shadow-lg bg-white"
                      : "border-transparent hover:border-primary/20 bg-white/50"
                  )}
                  onClick={() => setActiveStep(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={cn(
                        "rounded-full p-3 bg-gradient-to-br",
                        step.gradient
                      )}>
                        <step.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 flex items-center">
                          {step.title}
                          {activeStep === index && (
                            <ArrowRight className="ml-2 h-4 w-4 text-primary animate-pulse" />
                          )}
                        </h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Interactive Preview */}
          <div className="relative aspect-square rounded-2xl overflow-hidden">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: activeStep === index ? 1 : 0,
                  scale: activeStep === index ? 1 : 0.9,
                  zIndex: activeStep === index ? 1 : 0
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/60" />
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className={cn(
                    "inline-flex items-center space-x-2 rounded-full px-4 py-2 text-sm bg-gradient-to-br",
                    step.gradient
                  )}>
                    <step.icon className="h-4 w-4" />
                    <span>Step {index + 1}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}