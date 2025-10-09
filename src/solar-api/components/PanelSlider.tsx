'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

interface PanelSliderProps {
  panelCount: number;
  maxPanels: number;
  onPanelCountChange: (count: number) => void;
  disabled?: boolean;
}

const PanelSlider = ({ 
  panelCount, 
  maxPanels, 
  onPanelCountChange,
  disabled = false 
}: PanelSliderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleSliderChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = parseInt(event.target.value);
    onPanelCountChange(newCount);
  }, [onPanelCountChange]);

  const handleIncrement = useCallback(() => {
    if (panelCount < maxPanels) {
      onPanelCountChange(Math.min(panelCount + 1, maxPanels));
    }
  }, [panelCount, maxPanels, onPanelCountChange]);

  const handleDecrement = useCallback(() => {
    if (panelCount > 0) {
      onPanelCountChange(Math.max(panelCount - 1, 0));
    }
  }, [panelCount, onPanelCountChange]);

  const percentage = maxPanels > 0 ? (panelCount / maxPanels) * 100 : 0;

  return (
    <div className="w-full">
      {/* Energy Stats */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Solar System Performance</h4>
        <div className="grid grid-cols-4 gap-2">
        <div className="bg-yellow-50 rounded-lg p-2 text-center border border-yellow-200">
          <div className="text-xs text-yellow-800 font-medium mb-1">Energy</div>
          <div className="text-sm font-bold text-gray-800">{panelCount * 400}</div>
          <div className="text-xs text-gray-500">kWh/yr</div>
        </div>
        <div className="bg-[#156644]/5 rounded-lg p-2 text-center border border-[#156644]/20">
          <div className="text-xs text-[#156644] font-medium mb-1">Coverage</div>
          <div className="text-sm font-bold text-gray-800">{Math.round((panelCount * 400 / 4500) * 100)}</div>
          <div className="text-xs text-gray-500">% home</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-200">
          <div className="text-xs text-blue-800 font-medium mb-1">System</div>
          <div className="text-sm font-bold text-gray-800">{(panelCount * 0.4).toFixed(1)}</div>
          <div className="text-xs text-gray-500">kW</div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-2 text-center border border-emerald-200">
          <div className="text-xs text-emerald-600 font-medium mb-1">CO₂</div>
          <div className="text-sm font-bold text-gray-800">{(panelCount * 400 * 0.295 / 1000).toFixed(1)}</div>
          <div className="text-xs text-gray-500">t/year</div>
        </div>
        </div>
      </div>

      {/* Panel Count Display */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Solar Panels</h3>
        <span className="text-2xl font-bold text-orange-600">{panelCount}</span>
      </div>

      {/* Compact Sun Slider */}
      <div className="flex items-center gap-3">
        {/* Decrement Button */}
        <motion.button
          onClick={handleDecrement}
          disabled={disabled || panelCount <= 0}
          whileHover={!disabled && panelCount > 0 ? { scale: 1.1 } : {}}
          whileTap={!disabled && panelCount > 0 ? { scale: 0.9 } : {}}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            disabled || panelCount <= 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-primary hover:text-primary-dark'
          }`}
        >
          <Minus size={20} strokeWidth={3} />
        </motion.button>

        {/* Simple Green Slider */}
        <div className="flex-1 relative">
          {/* Track */}
          <div className="relative h-2 bg-gray-200 rounded-full">
            {/* Progress Fill */}
            <motion.div
              className="absolute left-0 top-0 h-full bg-primary rounded-full"
              style={{
                width: `${percentage}%`,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
            
            {/* Yellow Slider Handle */}
            <motion.div
              className="absolute w-5 h-5 bg-yellow-500 border-2 border-white rounded-full shadow-lg cursor-pointer z-20"
              style={{
                left: `calc(${percentage}% - 10px)`, // Subtract half width to center horizontally
                top: '50%',
                marginTop: '-10px', // Subtract half height to center vertically
              }}
              animate={{
                left: `calc(${percentage}% - 10px)`,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
            
            {/* Hidden Input */}
            <input
              type="range"
              min="0"
              max={maxPanels}
              value={panelCount}
              onChange={handleSliderChange}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onTouchStart={() => setIsDragging(true)}
              onTouchEnd={() => setIsDragging(false)}
              disabled={disabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              style={{
                WebkitAppearance: 'none',
                appearance: 'none',
                background: 'transparent'
              }}
            />
          </div>

          {/* Range Labels */}
          <div className="flex justify-between px-1 mt-2 text-xs text-gray-400">
            <span>0</span>
            <span>{maxPanels}</span>
          </div>
        </div>

        {/* Increment Button */}
        <motion.button
          onClick={handleIncrement}
          disabled={disabled || panelCount >= maxPanels}
          whileHover={!disabled && panelCount < maxPanels ? { scale: 1.1 } : {}}
          whileTap={!disabled && panelCount < maxPanels ? { scale: 0.9 } : {}}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            disabled || panelCount >= maxPanels
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-primary hover:text-primary-dark'
          }`}
        >
          <Plus size={20} strokeWidth={3} />
        </motion.button>
      </div>

    </div>
  );
};

export default PanelSlider;