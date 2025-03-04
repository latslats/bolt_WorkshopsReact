import React from 'react';

const testimonials = [
  {
    content: "The React workshop was incredibly helpful. I went from barely understanding components to building my own app in just a few sessions.",
    author: "Sarah J.",
    role: "Frontend Developer"
  },
  {
    content: "The instructors are knowledgeable and patient. They take time to explain complex concepts in a way that's easy to understand.",
    author: "Michael T.",
    role: "CS Student"
  },
  {
    content: "I've tried many online courses, but nothing compares to the interactive nature of these workshops. Highly recommended!",
    author: "Priya K.",
    role: "Software Engineer"
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-12 bg-moss-green/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-forest-green sm:text-4xl">
            What Our Community Says
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-charcoal sm:mt-4">
            Don't just take our word for it
          </p>
        </div>
        
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md p-6 border border-moss-green/10"
            >
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-forest-green flex items-center justify-center text-white-linen font-bold text-xl">
                  {testimonial.author.charAt(0)}
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-forest-green">{testimonial.author}</h4>
                  <p className="text-charcoal/70">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-charcoal italic">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
