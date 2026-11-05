import React, { useEffect, useState } from 'react';

export const SnowEffect = () => {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const flakes = [];
    for (let i = 0; i < 35; i++) {
      const size = Math.random() * 3.5 + 1.5;
      flakes.push({
        id: i,
        size: `${size}px`,
        left: `${Math.random() * 100}vw`,
        animationDuration: `${Math.random() * 10 + 6}s`,
        animationDelay: `${Math.random() * 5}s`,
        opacity: Math.random() * 0.7 + 0.3
      });
    }
    setSnowflakes(flakes);
  }, []);

  return (
    <div id="snow-wrapper">
      {snowflakes.map(f => (
        <div
          key={f.id}
          className="snowflake"
          style={{
            width: f.size,
            height: f.size,
            left: f.left,
            animationDuration: f.animationDuration,
            animationDelay: f.animationDelay,
            opacity: f.opacity
          }}
        />
      ))}
    </div>
  );
};
