import React from 'react';
import { Button } from '@/components/ui/button';
import { useRightDrawer } from '@/contexts/RightDrawerContext';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  className?: string;
  hideWhenFullscreen?: boolean;
  isFullscreen?: boolean;
}

export function FloatingActionButton({
  onClick,
  icon,
  label,
  className = '',
  hideWhenFullscreen = true,
  isFullscreen = false
}: FloatingActionButtonProps) {
  const { isRightDrawerOpen } = useRightDrawer();

  // Ocultar quando modal direito estiver aberto OU quando em fullscreen (se configurado)
  const shouldHide = isRightDrawerOpen || (hideWhenFullscreen && isFullscreen);

  if (shouldHide) {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 transition-colors duration-200 ${className}`}
      style={{
        backgroundColor: '#021529',
        borderColor: '#021529'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#001122';
        e.currentTarget.style.borderColor = '#001122';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#021529';
        e.currentTarget.style.borderColor = '#021529';
      }}
      title={label}
    >
      {icon}
    </Button>
  );
}
