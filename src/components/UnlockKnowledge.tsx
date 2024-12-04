import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function UnlockKnowledge() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 to-purple-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Unlock Infinite Knowledge</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Craft compelling courses effortlessly with our platform, enabling you to create engaging
              content on any topic. Seamlessly integrate video and theory lectures for a comprehensive
              learning experience.
            </p>
            <Button size="lg" className="group">
              Start Creating
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"
              alt="People learning"
              className="rounded-lg shadow-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}