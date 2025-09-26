'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, SkipForward, SkipBack } from 'lucide-react';

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

  const handleFastIncrement = useCallback(() => {
    const step = Math.max(1, Math.floor(maxPanels / 10));
    onPanelCountChange(Math.min(panelCount + step, maxPanels));
  }, [panelCount, maxPanels, onPanelCountChange]);

  const handleFastDecrement = useCallback(() => {
    const step = Math.max(1, Math.floor(maxPanels / 10));
    onPanelCountChange(Math.max(panelCount - step, 0));
  }, [panelCount, maxPanels, onPanelCountChange]);



  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">Panel Count</h3>
          <p className="text-xs text-gray-600">Use buttons or drag slider to adjust</p>
        </div>
        <div className="text-right">
          <motion.div 
            className="text-2xl font-bold text-green-600"
            animate={{ scale: isDragging ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {panelCount}
          </motion.div>
          <div className="text-xs text-gray-500">of {maxPanels}</div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3 mb-6">
        {/* Fast Decrement */}
        <motion.button
          onClick={handleFastDecrement}
          disabled={disabled || panelCount <= 0}
          whileHover={!disabled && panelCount > 0 ? { scale: 1.05 } : {}}
          whileTap={!disabled && panelCount > 0 ? { scale: 0.95 } : {}}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            disabled || panelCount <= 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-green-600 hover:bg-gray-300 shadow-sm hover:shadow-md'
          }`}
        >
          <SkipBack size={14} />
        </motion.button>
        
        <motion.button
          onClick={handleDecrement}
          disabled={disabled || panelCount <= 0}
          whileHover={!disabled && panelCount > 0 ? { scale: 1.05 } : {}}
          whileTap={!disabled && panelCount > 0 ? { scale: 0.95 } : {}}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            disabled || panelCount <= 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg'
          }`}
        >
          <Minus size={18} />
        </motion.button>

        {/* Enhanced Slider Container */}
        <div className="flex-1 relative px-2">
          {/* Slider Track */}
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            {/* Progress Fill */}
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full shadow-sm"
              initial={{ width: '0%' }}
              animate={{ width: `${maxPanels > 0 ? (panelCount / maxPanels) * 100 : 0}%` }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
            
            {/* Enhanced Slider Thumb */}
            <motion.div
              className={`absolute top-1/2 transform -translate-y-1/2 w-7 h-7 rounded-full shadow-lg z-20 cursor-grab active:cursor-grabbing ${
                disabled 
                  ? 'bg-gray-400 border-2 border-gray-300' 
                  : 'bg-white border-2 border-green-500 hover:border-green-600'
              }`}
              style={{
                left: `calc(${maxPanels > 0 ? (panelCount / maxPanels) * 100 : 0}% - 14px)`
              }}
              animate={{ 
                scale: isDragging ? 1.3 : 1,
                boxShadow: isDragging 
                  ? '0 8px 25px rgba(34, 197, 94, 0.4)' 
                  : '0 4px 15px rgba(0, 0, 0, 0.2)'
              }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              whileHover={{ scale: 1.1 }}
            >
              {/* Thumb Inner Dot */}
              <div className={`absolute inset-0 rounded-full ${
                disabled ? 'bg-gray-300' : 'bg-green-500'
              } transform scale-50`} />
            </motion.div>
            
            {/* Invisible Native Slider Input */}
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
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-30"
              style={{
                WebkitAppearance: 'none',
                appearance: 'none',
                background: 'transparent'
              }}
            />
          </div>

          {/* Enhanced Range Labels */}
          <div className="flex justify-between mt-3">
            <span className="text-xs font-medium text-gray-600">0</span>
            <span className="text-xs font-medium text-gray-600">{maxPanels}</span>
          </div>
          
          {/* Progress Indicators */}
          <div className="flex justify-center mt-2">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => {
                const threshold = (i + 1) * (maxPanels / 5);
                return (
                  <motion.div
                    key={i}
                    className={`w-2 h-1 rounded-full transition-colors ${
                      panelCount >= threshold ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                    animate={{
                      scale: panelCount >= threshold ? 1.2 : 1
                    }}
                    transition={{ duration: 0.2 }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <motion.button
          onClick={handleIncrement}
          disabled={disabled || panelCount >= maxPanels}
          whileHover={!disabled && panelCount < maxPanels ? { scale: 1.05 } : {}}
          whileTap={!disabled && panelCount < maxPanels ? { scale: 0.95 } : {}}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            disabled || panelCount >= maxPanels
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg'
          }`}
        >
          <Plus size={18} />
        </motion.button>
        
        {/* Fast Increment */}
        <motion.button
          onClick={handleFastIncrement}
          disabled={disabled || panelCount >= maxPanels}
          whileHover={!disabled && panelCount < maxPanels ? { scale: 1.05 } : {}}
          whileTap={!disabled && panelCount < maxPanels ? { scale: 0.95 } : {}}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            disabled || panelCount >= maxPanels
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-green-600 hover:bg-gray-300 shadow-sm hover:shadow-md'
          }`}
        >
          <SkipForward size={14} />
        </motion.button>
      </div>

      {/* Live Solar Data - 4 small boxes */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        <div className="bg-yellow-50 rounded-lg p-2 text-center">
          <div className="text-xs text-yellow-600 font-medium mb-1">Energy</div>
          <div className="text-sm font-bold text-gray-800">{panelCount * 400}</div>
          <div className="text-xs text-gray-500">kWh/yr</div>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <div className="text-xs text-green-600 font-medium mb-1">Coverage</div>
          <div className="text-sm font-bold text-gray-800">{Math.round((panelCount * 400 / 4500) * 100)}</div>
          <div className="text-xs text-gray-500">% home</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <div className="text-xs text-blue-600 font-medium mb-1">System</div>
          <div className="text-sm font-bold text-gray-800">{(panelCount * 0.4).toFixed(1)}</div>
          <div className="text-xs text-gray-500">kW</div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-2 text-center">
          <div className="text-xs text-emerald-600 font-medium mb-1">CO₂</div>
          <div className="text-sm font-bold text-gray-800">{(panelCount * 400 * 0.295 / 1000).toFixed(1)}</div>
          <div className="text-xs text-gray-500">t/year</div>
        </div>
      </div>

    </div>
  );
};

export default PanelSlider;