import React from 'react';
import { Code, Users, Calendar, Award } from 'lucide-react';

const features = [
  {
    name: 'Expert-led workshops',
    description:
      'Learn from industry professionals with years of experience in their fields.',
    icon: Code,
  },
  {
    name: 'Community-driven',
    description:
      'Join a supportive community of developers at all skill levels.',
    icon: Users,
  },
  {
    name: 'Regular sessions',
    description:
      'New workshops every week covering the latest technologies and practices.',
    icon: Calendar,
  },
  {
    name: 'Skill certification',
    description:
      'Earn certificates to showcase your newly acquired skills to employers.',
    icon: Award,
  },
];

const Features: React.FC = () => {
  return (
    <div className="py-12 bg-white-linen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-spring-garden font-semibold tracking-wide uppercase">Why Choose Us</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-forest-green sm:text-4xl">
            Not your average coding platform
          </p>
          <p className="mt-4 max-w-2xl text-xl text-charcoal lg:mx-auto">
            We're committed to providing high-quality, accessible coding education for everyone.
          </p>
        </div>

        <div className="mt-10">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-forest-green text-white-linen">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-forest-green">{feature.name}</p>
                <p className="mt-2 ml-16 text-base text-charcoal">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
