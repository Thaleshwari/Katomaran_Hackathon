import React, { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type} animate-fade`}>
      {type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
      <span>{message}</span>
    </div>
  );
};
