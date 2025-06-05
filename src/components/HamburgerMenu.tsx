import React from 'react';

export default function HamburgerMenu() {
  return (
    <button
      aria-label="Menu"
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        background: 'transparent',
        color: '#fff',
        fontSize: 24,
        border: 'none',
        cursor: 'pointer'
      }}
    >
      ☰
    </button>
  );
}
