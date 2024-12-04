import { Card, CardContent } from '@/components/ui/card';
import { Brain, Sparkles, Clock, Settings } from 'lucide-react';

const features = [
  {
    title: 'AI-Powered Generation',
    description: 'Leverage advanced AI to automatically generate comprehensive course content.',
    icon: Brain,
  },
  {
    title: 'Smart Topic Breakdown',
    description: 'Automatically break down complex subjects into digestible sub-topics.',
    icon: Sparkles,
  },
  {
    title: 'Time-Saving',
    description: 'Create complete courses in minutes instead of hours or days.',
    icon: Clock,
  },
  {
    title: 'Customizable Content',
    description: 'Easily customize and adjust generated content to match your needs.',
    icon: Settings,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create engaging and comprehensive courses with AI assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">{feature.title}</h3>
                <p className="text-muted-foreground text-center">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}