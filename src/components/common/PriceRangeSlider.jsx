import { useState, useEffect, useRef } from 'react';

export default function PriceRangeSlider({ 
  min = 0, 
  max = 100000, 
  step = 1000, 
  value = [0, 100000], 
  onChange, 
  formatPrice = (price) => `₦${price.toLocaleString()}`,
  className = ""
}) {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSliderChange = (index, newValue) => {
    const newValues = [...localValue];
    newValues[index] = parseInt(newValue);
    
    // Ensure min slider doesn't exceed max slider
    if (index === 0 && newValues[0] > newValues[1]) {
      newValues[0] = newValues[1];
    }
    // Ensure max slider doesn't go below min slider
    if (index === 1 && newValues[1] < newValues[0]) {
      newValues[1] = newValues[0];
    }
    
    setLocalValue(newValues);
    onChange && onChange(newValues);
  };

  const handleMouseDown = (index) => {
    setIsDragging(true);
    setActiveHandle(index);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setActiveHandle(null);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || activeHandle === null || !sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newValue = Math.round(min + percent * (max - min));
    const steppedValue = Math.round(newValue / step) * step;
    
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    handleSliderChange(activeHandle, clampedValue);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, activeHandle]);

  // Calculate percentage positions for visual indicators
  const minPercent = ((localValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100;

  return (
    <div className={`price-range-slider ${className}`}>
      {/* Price Display */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium text-gray-700">
          {formatPrice(localValue[0])}
        </div>
        <div className="text-sm font-medium text-gray-700">
          {formatPrice(localValue[1])}
        </div>
      </div>

      {/* Slider Container */}
      <div ref={sliderRef} className="relative h-8 flex items-center">
        {/* Track Background */}
        <div className="absolute w-full h-2 bg-gray-200 rounded-full"></div>
        
        {/* Active Range */}
        <div 
          className="absolute h-2 bg-blue-500 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`
          }}
        ></div>

        {/* Slider Thumbs */}
        <div
          className="absolute w-6 h-6 bg-blue-500 rounded-full shadow-lg border-2 border-white transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform select-none"
          style={{
            left: `${minPercent}%`,
            top: '50%',
            zIndex: 30
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleMouseDown(0);
          }}
        ></div>
        
        <div
          className="absolute w-6 h-6 bg-blue-500 rounded-full shadow-lg border-2 border-white transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform select-none"
          style={{
            left: `${maxPercent}%`,
            top: '50%',
            zIndex: 30
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleMouseDown(1);
          }}
        ></div>
      </div>

      {/* Min/Max Labels */}
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}+</span>
      </div>
    </div>
  );
}
