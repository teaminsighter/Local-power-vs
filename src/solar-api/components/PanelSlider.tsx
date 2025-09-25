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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">Panel Count</h3>
          <p className="text-xs text-gray-600">Adjust to see live calculations</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-primary">{panelCount}</div>
          <div className="text-xs text-gray-500">of {maxPanels}</div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3 mb-4">
        {/* Fast Decrement */}
        <motion.button
          onClick={handleFastDecrement}
          disabled={disabled || panelCount <= 0}
          whileHover={!disabled && panelCount > 0 ? { scale: 1.05 } : {}}
          whileTap={!disabled && panelCount > 0 ? { scale: 0.95 } : {}}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            disabled || panelCount <= 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-primary hover:bg-gray-300 shadow-sm hover:shadow-md'
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
              : 'bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg'
          }`}
        >
          <Minus size={18} />
        </motion.button>

        {/* Slider Container */}
        <div className="flex-1 relative">
          {/* Slider Track */}
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            {/* Progress Fill */}
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${maxPanels > 0 ? (panelCount / maxPanels) * 100 : 0}%` }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            />
            
            {/* Slider Input */}
            <input
              type="range"
              min="0"
              max={maxPanels}
              value={panelCount}
              onChange={handleSliderChange}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              disabled={disabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            
            {/* Slider Thumb */}
            <motion.div
              className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full shadow-lg transition-colors ${
                disabled ? 'bg-gray-400' : 'bg-white border-2 border-primary'
              }`}
              animate={{ 
                left: `calc(${maxPanels > 0 ? (panelCount / maxPanels) * 100 : 0}% - 12px)`,
                scale: isDragging ? 1.2 : 1 
              }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            />
          </div>

          {/* Range Labels */}
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">0</span>
            <span className="text-xs text-gray-500">{maxPanels}</span>
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
              : 'bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg'
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
              : 'bg-gray-200 text-primary hover:bg-gray-300 shadow-sm hover:shadow-md'
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
          <div className="text-xs text-green-600 font-medium mb-1">Savings</div>
          <div className="text-sm font-bold text-gray-800">€{Math.round(panelCount * 400 * 0.25 / 12)}</div>
          <div className="text-xs text-gray-500">/month</div>
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