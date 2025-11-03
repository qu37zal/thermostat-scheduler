// Toast notification utility
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  timestamp: number;
}

let toasts: Toast[] = [];
let listeners: ((toasts: Toast[]) => void)[] = [];

export const showToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
  const id = `${Date.now()}-${Math.random()}`;
  const toast: Toast = {
    id,
    message,
    type,
    timestamp: Date.now(),
  };

  toasts = [...toasts, toast];
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
};

export const removeToast = (id: string) => {
  toasts = toasts.filter(t => t.id !== id);
  notifyListeners();
};

export const subscribe = (listener: (toasts: Toast[]) => void) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

const notifyListeners = () => {
  listeners.forEach(listener => listener([...toasts]));
};

export const success = (message: string) => showToast(message, 'success');
export const error = (message: string) => showToast(message, 'error', 4000);
export const info = (message: string) => showToast(message, 'info');
export const warning = (message: string) => showToast(message, 'warning');
