export default function NavbarRol({ titulo, tabs, tabActual, onCambiarTab, usuario, onCerrarSesion }) {
  return (
    <nav className="navbar">
      <h2>
        Farma<span>Citas</span> · {titulo}
      </h2>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={tabActual === tab ? 'active' : ''}
            onClick={() => onCambiarTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="user-badge">
        <span className="user-nombre">{usuario.nombre}</span>
        <span>({usuario.rol})</span>
        <button onClick={onCerrarSesion}>Cerrar sesión</button>
      </div>
    </nav>
  );
}
