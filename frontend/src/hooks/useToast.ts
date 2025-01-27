import { useCallback } from 'react';
import { toast } from 'react-toastify';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface UseToastReturn {
  showToast: (message: string, type?: ToastType) => void;
}

export const useToast = (): UseToastReturn => {
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    toast[type](message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  }, []);

  return { showToast };
}; 