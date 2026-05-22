'use client';

import { useEffect, useState } from 'react';

interface Props {
  onClose: () => void;
  children: React.ReactNode;
}

export default function HintModal({ onClose, children }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={[
        'fixed inset-0 z-500 flex items-center justify-center px-4 transition-all duration-300',
        visible ? 'bg-black/55 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none',
      ].join(' ')}
      onClick={onClose}
    >
      <div
        className={[
          'w-full max-w-sm rounded-2xl bg-white px-5 pb-6 pt-5 shadow-xl transition-all duration-300',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
