'use client';

import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import useStore, { StateType } from '@/store/useStore';

const StateSelection = () => {
  const { selectedState, setSelectedState, setCurrentStep } = useStore();

  const states = [
    { 
      code: 'NSW' as StateType, 
      name: 'New South Wales',
      rebate: 'Up to $2,400 rebate',
      description: 'Leading solar incentives'
    },
    { 
      code: 'QLD' as StateType, 
      name: 'Queensland',
      rebate: 'Up to $3,500 rebate',
      description: 'Excellent solar conditions'
    },
    { 
      code: 'VIC' as StateType, 
      name: 'Victoria',
      rebate: 'Up to $1,400 rebate',
      description: 'Solar homes program'
    },
    { 
      code: 'SA' as StateType, 
      name: 'South Australia',
      rebate: 'Up to $6,000 rebate',
      description: 'Battery subsidies available'
    },
  ];

  const handleStateSelect = (state: StateType) => {
    setSelectedState(state);
    setCurrentStep(2);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Select Your Location
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Choose your state to see available rebates and incentives for your solar installation
          </p>
        </motion.div>

        {/* State Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {states.map((state, index) => (
            <motion.div
              key={state.code}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 cursor-pointer border-2 ${
                selectedState === state.code
                  ? 'border-primary shadow-primary/20'
                  : 'border-gray-100 hover:border-primary/30'
              }`}
              onClick={() => handleStateSelect(state.code)}
            >
              {/* State Icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    selectedState === state.code
                      ? 'bg-primary text-white'
                      : 'bg-surface text-primary'
                  } transition-all duration-300`}
                >
                  <MapPin size={28} />
                </motion.div>
              </div>

              {/* State Info */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-text-primary mb-2">
                  {state.code}
                </h3>
                <p className="text-sm text-text-muted mb-4">
                  {state.name}
                </p>
                
                {/* Rebate Badge */}
                <div className="bg-accent/20 text-accent-dark rounded-full px-4 py-2 text-sm font-semibold mb-3">
                  {state.rebate}
                </div>
                
                <p className="text-text-secondary text-sm mb-6">
                  {state.description}
                </p>

                {/* Get Started Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 px-6 rounded-full font-bold transition-all duration-300 ${
                    selectedState === state.code
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-100 text-text-primary hover:bg-primary hover:text-white'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStateSelect(state.code);
                  }}
                >
                  GET STARTED
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-text-muted">
            Don't see your state? <a href="#contact" className="text-primary hover:underline">Contact us</a> for availability
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default StateSelection;