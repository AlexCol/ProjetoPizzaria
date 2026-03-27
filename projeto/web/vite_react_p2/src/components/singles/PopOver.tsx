import { useEffect, useRef, useState, type ReactNode } from 'react';
import ReactDOM from 'react-dom';

type PopoverProps = {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  positionClass?: string;
  usePortal?: boolean;
  keepOpenOnClick?: boolean;
};

export default function PopOver({
  trigger,
  children,
  className = '',
  positionClass = '',
  usePortal = false,
  keepOpenOnClick = false,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  //?????????????????????????????????????????????????????????????????????????????????
  //? useEffects
  //?????????????????????????????????????????????????????????????????????????????????
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open && triggerRef.current && usePortal) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [open, usePortal]);

  return (
    <div className='relative'>
      <div ref={triggerRef} onClick={() => setOpen((v) => !v)} className='cursor-pointer'>
        {trigger}
      </div>
      {open &&
        (usePortal ? (
          ReactDOM.createPortal(
            <div
              ref={popoverRef}
              className={`fixed z-9999 bg-background border border-border rounded shadow-lg p-2 ${className}`}
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
              }}
            >
              {children}
            </div>,
            document.body,
          )
        ) : (
          <div
            ref={popoverRef}
            className={`absolute z-50 bg-background border border-border rounded shadow-lg p-2 ${positionClass} ${className}`}
            onClick={() => (keepOpenOnClick ? undefined : setOpen(false))}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
