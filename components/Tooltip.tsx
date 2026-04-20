import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  className?: string;
}

// Accessible tooltip wrapper.
// - Hover / focus shows; blur / mouseleave / ESC hides.
// - Works on touch: tapping the trigger toggles; tapping outside hides.
// - Sets aria-describedby on the trigger so screen readers pick up the content.
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const tooltipId = `tooltip-${id}`;
  const wrapperRef = useRef<HTMLSpanElement>(null);

  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen(o => !o), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    const onDocClick = (e: MouseEvent | TouchEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        hide();
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('touchstart', onDocClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
    };
  }, [open, hide]);

  const trigger = React.cloneElement(children, {
    'aria-describedby': open ? tooltipId : undefined,
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
    onClick: (e: React.MouseEvent) => {
      toggle();
      const origOnClick = (children.props as { onClick?: (e: React.MouseEvent) => void }).onClick;
      if (typeof origOnClick === 'function') origOnClick(e);
    },
  });

  return (
    <span ref={wrapperRef} className={`relative inline-block ${className ?? ''}`}>
      {trigger}
      {open && (
        <span
          role="tooltip"
          id={tooltipId}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 max-w-[80vw] rounded-md bg-stone-950 border border-stone-700 px-3 py-2 text-xs text-stone-100 shadow-lg leading-relaxed"
        >
          {content}
        </span>
      )}
    </span>
  );
};
