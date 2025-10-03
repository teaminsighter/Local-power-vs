import React from 'react';

type SunIconProps = {
  className?: string;
  size?: number;
};

// Helper function to generate the points for the starburst polygon
const generateStarburstPoints = (points: number, innerRadius: number, outerRadius: number): string => {
    let pointsStr = '';
    const angleStep = (Math.PI * 2) / points;

    for (let i = 0; i < points; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = angleStep * i - (Math.PI / 2); // Start from the top
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        pointsStr += `${x.toFixed(2)},${y.toFixed(2)} `;
    }
    return pointsStr.trim();
};

const SunIconComponent: React.FC<SunIconProps> = ({ className, size = 70 }) => {
  const starburstPoints = generateStarburstPoints(56, 25, 45);

  return (
    <svg
      width={size}
      height={size}
      viewBox="-110 -110 220 220"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <radialGradient id="solarCore">
          <stop offset="0%" stopColor="#FFD75C" />
          <stop offset="60%" stopColor="#F5A623" />
          <stop offset="100%" stopColor="#D5891F" />
        </radialGradient>
      </defs>
      <g id="sun-icon">
        {/* Layer 1: Outer concentric energy rings */}
        <g className="animate-spin" style={{ animationDuration: '20s', animationTimingFunction: 'linear' }}>
          <circle r="68" stroke="#FFD75C" strokeWidth="2" fill="none" strokeDasharray="60 30 50 40 45 35" />
        </g>
        <g className="animate-spin" style={{ animationDuration: '22s', animationTimingFunction: 'linear', animationDirection: 'reverse' }}>
          <circle r="76" stroke="#FFD75C" strokeWidth="2" fill="none" strokeDasharray="55 28 48 38 42 33" />
        </g>
        <g className="animate-spin" style={{ animationDuration: '25s', animationTimingFunction: 'linear' }}>
          <circle r="84" stroke="#F5A623" strokeWidth="2" fill="none" strokeDasharray="50 26 44 36 38 31" />
        </g>
        <g className="animate-spin" style={{ animationDuration: '28s', animationTimingFunction: 'linear', animationDirection: 'reverse' }}>
          <circle r="92" stroke="#F5A623" strokeWidth="2" fill="none" strokeDasharray="45 24 40 34 34 29" />
        </g>
        <g className="animate-spin" style={{ animationDuration: '32s', animationTimingFunction: 'linear' }}>
          <circle r="100" stroke="#D5891F" strokeWidth="2" fill="none" strokeDasharray="40 22 36 32 30 27" />
        </g>
        
        {/* Layer 2: Inner disc */}
        <circle r="50" fill="url(#solarCore)" stroke="#155941" strokeWidth="2" />
        
        {/* Layer 3: Central starburst */}
        <polygon points={starburstPoints} fill="#FFFFFF" stroke="none" />
      </g>
    </svg>
  );
};

export const SunIcon = React.memo(SunIconComponent);