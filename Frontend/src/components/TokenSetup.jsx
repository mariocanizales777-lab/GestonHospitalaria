import { useState } from 'react';
import { saveToken } from '../api';

export default function TokenSetup({ onGuardar }) {
  const [token, setToken] = useState('');

  function handleGuardar() {
    if (!token.trim()) return;
    saveToken(token.trim());
    onGuardar();
  }

  return (
    <div className="token-setup">
      <label htmlFor="tokenInput">Token (temporal, hasta que exista login):</label>
      <input
        id="tokenInput"
        type="text"
        placeholder="Pega aquí tu JWT"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <button onClick={handleGuardar}>Guardar token</button>
    </div>
  );
}