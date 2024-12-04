import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: '0',
    period: 'forever',
    features: [
      'Generate 5 Sub-Topics',
      'Lifetime access',
      'Theory & Image Course',
      'Create unlimited Course',
      'Video & Theory Course',
    ],
  },
  {
    name: 'Pro',
    description: 'Best for professionals',
    price: '9',
    period: 'month',
    popular: true,
    features: [
      'Generate 10 Sub-Topics',
      '1 Month Access',
      'Theory & Image Course',
      'Create unlimited Course',
      'Video & Theory Course',
      'Priority Support',
      'Advanced Analytics',
    ],
  },
  {
    name: 'Enterprise',
    description: 'For serious educators',
    price: '99',
    period: 'year',
    features: [
      'Generate unlimited Sub-Topics',
      '1 Year Access',
      'Theory & Image Course',
      'Create unlimited Course',
      'Video & Theory Course',
      'Priority Support',
      'Advanced Analytics',
      'Custom Branding',
      'API Access',
    ],
  },
];

interface PricingProps {
  onGetStarted: () => void;
}

export default function Pricing({ onGetStarted }: PricingProps) {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white/90 -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your educational journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={cn(
                "relative group transition-all duration-300 hover:shadow-xl",
                plan.popular && "border-primary/50 shadow-lg scale-105 md:scale-110"
              )}
            >
              {plan.popular && (
                <Badge 
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-8 py-1 bg-primary hover:bg-primary"
                >
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-8 pt-6">
                <div className="mb-4 font-medium text-sm text-muted-foreground">
                  {plan.description}
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <div className="rounded-full p-1 bg-primary/10 text-primary">
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={cn(
                    "w-full transition-all",
                    plan.popular 
                      ? "bg-primary hover:bg-primary/90" 
                      : "bg-gray-900 hover:bg-gray-800"
                  )}
                  onClick={onGetStarted}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            All plans include 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}