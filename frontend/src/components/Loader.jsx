import React from 'react';

export default function Loader({ size = 'md' }) {
  return (
    <div className="loader-dots" aria-hidden="true">
      <span style={{ width: size === 'md' ? 8 : 6, height: size === 'md' ? 8 : 6 }} />
      <span style={{ width: size === 'md' ? 8 : 6, height: size === 'md' ? 8 : 6 }} />
      <span style={{ width: size === 'md' ? 8 : 6, height: size === 'md' ? 8 : 6 }} />
    </div>
  );
}
