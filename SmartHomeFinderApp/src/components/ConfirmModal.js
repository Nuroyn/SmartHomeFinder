import React, { useEffect, useRef, useCallback } from 'react';

const backdropStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};

const boxStyle = {
  background: '#fff',
  padding: 16,
  borderRadius: 8,
  width: '90%',
  maxWidth: 480,
  boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
};

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', cancelLabel = 'Cancel' }) {
  const boxRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Save focus on open, restore on close
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;
      // Focus the first button inside the modal after render
      setTimeout(() => {
        const focusable = boxRef.current?.querySelectorAll('button');
        if (focusable?.length) focusable[0].focus();
      }, 0);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  // Trap focus within modal + ESC to close
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onCancel();
      return;
    }
    if (e.key === 'Tab') {
      const focusable = boxRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  }, [onCancel]);

  if (!open) return null;

  return (
    <div style={backdropStyle} role="alertdialog" aria-modal="true" aria-labelledby="confirm-modal-title" aria-describedby="confirm-modal-desc" onKeyDown={handleKeyDown}>
      <div style={boxStyle} ref={boxRef}>
        {title && <h3 id="confirm-modal-title" style={{ marginTop: 0 }}>{title}</h3>}
        <p id="confirm-modal-desc" style={{ marginBottom: 16 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onCancel} style={{ padding: '8px 12px' }}>{cancelLabel}</button>
          <button onClick={onConfirm} style={{ padding: '8px 12px', background: '#0a74ff', color: '#fff', borderRadius: 6 }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
