import React from 'react';
import { Users, Code, BookOpen, Zap } from 'lucide-react';

const Features: React.FC = () => {
  return (
    <section className="py-20 bg-charcoal text-white-linen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-medium mb-6">How we help you learn</h2>
          <div className="w-16 h-1 bg-moss-green mx-auto mb-8"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="flex flex-col items-center text-center">
            <Users className="h-8 w-8 text-moss-green mb-5" />
            <h3 className="text-lg font-medium mb-3">Community Learning</h3>
            <p className="text-white-linen/70 text-sm">
              Connect with peers and mentors in a collaborative environment.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <Code className="h-8 w-8 text-moss-green mb-5" />
            <h3 className="text-lg font-medium mb-3">Practical Projects</h3>
            <p className="text-white-linen/70 text-sm">
              Build real applications that solve actual problems.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <BookOpen className="h-8 w-8 text-moss-green mb-5" />
            <h3 className="text-lg font-medium mb-3">Learning Resources</h3>
            <p className="text-white-linen/70 text-sm">
              Access curated materials to support your coding journey.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <Zap className="h-8 w-8 text-moss-green mb-5" />
            <h3 className="text-lg font-medium mb-3">AI Tools</h3>
            <p className="text-white-linen/70 text-sm">
              Use modern AI tools to enhance your learning experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
