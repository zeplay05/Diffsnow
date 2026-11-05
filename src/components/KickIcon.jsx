import React from 'react';

// Compact, inline Kick app mark so every screen uses the same logo without an external image.
export function KickIcon({ size = 16, color = 'currentColor', title = 'Kick' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={title}>
      <rect x="1" y="1" width="22" height="22" rx="3" fill="#071000" />
      <path fill={color} d="M5 4h6v5h3V4h5v6h-4v4h4v6h-5v-5h-3v5H5V4Zm6 8v1h3v-1h-3Z" />
    </svg>
  );
}
