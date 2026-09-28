function formatearFechaReceta(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function RecetaCard({ receta, mostrarDoctor = false, mostrarPaciente = false, accion = null }) {
  const folio = receta._id ? receta._id.toString().slice(-6).toUpperCase() : '------';

  return (
    <div className={`receta-card ${receta.esControlado ? 'receta-card-controlada' : ''}`}>
      <div className="receta-card-header">
        <span className="receta-card-titulo">Receta médica</span>
        <span className="receta-card-folio">Folio #{folio}</span>
      </div>

      <div className="receta-card-cuerpo">
        <div className="receta-card-medicamento">
          <strong>{receta.medicamento?.nombre ?? 'Medicamento no disponible'}</strong>
          <span>{receta.cantidad} unidades</span>
        </div>

        <div className="receta-card-detalles">
          {mostrarDoctor && (
            <p>
              Emitida por: <strong>{receta.emitidoPor?.nombre ?? 'Doctor'}</strong>
            </p>
          )}
          {mostrarPaciente && (
            <p>
              Paciente: <strong>{receta.paciente?.nombre ?? '—'}</strong>
            </p>
          )}
          <p>Fecha de emisión: {formatearFechaReceta(receta.createdAt)}</p>

          <div className="receta-card-badges">
            {receta.esControlado && <span className="receta-badge receta-badge-controlado">Controlado</span>}
            {typeof receta.surtida === 'boolean' && (
              <span className={`receta-badge ${receta.surtida ? 'receta-badge-surtida' : 'receta-badge-vigente'}`}>
                {receta.surtida ? 'Surtida' : 'Vigente'}
              </span>
            )}
          </div>
        </div>
      </div>

      {accion && <div className="receta-card-accion">{accion}</div>}
    </div>
  );
}