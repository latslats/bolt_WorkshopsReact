import React from 'react';
import { Code, Users, Calendar, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    name: 'Expert-led workshops',
    description:
      'Learn from subject matter experts inside ER.',
    icon: Code,
    color: 'bg-gradient-to-r from-forest-green to-spring-garden',
  },
  {
    name: 'Community-driven',
    description:
      'Join a supportive community of learners at all skill levels.',
    icon: Users,
    color: 'bg-gradient-to-r from-spring-garden to-lemon-yellow',
  },
  {
    name: 'Real-world projects',
    description:
      'Work on real-world projects that are relevant to your career.',
    icon: Calendar,
    color: 'bg-gradient-to-r from-moss-green to-forest-green',
  },
  {
    name: 'Skill certification',
    description:
      'Earn certificates to showcase your newly acquired skills to employers.',
    icon: Award,
    color: 'bg-gradient-to-r from-lemon-yellow to-moss-green',
  },
];

const Features: React.FC = () => {
  return (
    <div className="py-16 bg-gradient-to-b from-white to-white-linen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:text-center"
        >
          <h2 className="text-base text-spring-garden font-semibold tracking-wide uppercase">Why Choose Us</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-forest-green sm:text-4xl">
            Not your average learning platform
          </p>
          <p className="mt-4 max-w-2xl text-xl text-charcoal lg:mx-auto">
            We're committed to providing value via accessible education for everyone.
          </p>
        </motion.div>

        <div className="mt-16">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.name} 
                className="relative p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`absolute top-0 left-0 transform -translate-y-1/2 flex items-center justify-center h-14 w-14 rounded-full ${feature.color} text-white-linen shadow-lg`}>
                  <feature.icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-bold text-forest-green">{feature.name}</p>
                <p className="mt-2 ml-16 text-base text-charcoal">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
