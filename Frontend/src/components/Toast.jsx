import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

let contadorId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const quitar = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const mostrar = useCallback((mensaje, tipo = 'info') => {
    const id = ++contadorId;
    setToasts((prev) => [...prev, { id, mensaje, tipo }]);
    timers.current[id] = setTimeout(() => quitar(id), 4000);
  }, [quitar]);

  const api = {
    exito: (mensaje) => mostrar(mensaje, 'exito'),
    error: (mensaje) => mostrar(mensaje, 'error'),
    info: (mensaje) => mostrar(mensaje, 'info'),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.tipo}`} onClick={() => quitar(t.id)}>
            {t.mensaje}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
