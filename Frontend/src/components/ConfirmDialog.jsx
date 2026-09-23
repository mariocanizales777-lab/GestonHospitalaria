import { createContext, useCallback, useContext, useState } from 'react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [pregunta, setPregunta] = useState(null); // { mensaje, resolver }

  const pedirConfirmacion = useCallback((mensaje) => {
    return new Promise((resolve) => {
      setPregunta({ mensaje, resolver: resolve });
    });
  }, []);

  function responder(valor) {
    pregunta?.resolver(valor);
    setPregunta(null);
  }

  return (
    <ConfirmContext.Provider value={pedirConfirmacion}>
      {children}
      {pregunta && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>{pregunta.mensaje}</p>
            <div className="confirm-actions">
              <button className="btn-modificar" onClick={() => responder(true)}>Confirmar</button>
              <button className="btn-cancelar" onClick={() => responder(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de <ConfirmProvider>');
  return ctx;
}
