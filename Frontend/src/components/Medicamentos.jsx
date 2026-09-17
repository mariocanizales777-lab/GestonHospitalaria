const MEDICAMENTOS = [
  { nombre: 'Paracetamol 500mg', categoria: 'Analgésico', precio: 12.5, disponible: true, requiereReceta: false },
  { nombre: 'Ibuprofeno 400mg', categoria: 'Antiinflamatorio', precio: 18.9, disponible: true, requiereReceta: false },
  { nombre: 'Loratadina 10mg', categoria: 'Antialérgico', precio: 25.0, disponible: true, requiereReceta: false },
  { nombre: 'Omeprazol 20mg', categoria: 'Protector gástrico', precio: 32.0, disponible: true, requiereReceta: false },
  { nombre: 'Amoxicilina 500mg', categoria: 'Antibiótico', precio: 45.0, disponible: true, requiereReceta: false },
  { nombre: 'Tramadol 50mg', categoria: 'Analgésico controlado', precio: 60.0, disponible: true, requiereReceta: true },
  { nombre: 'Diazepam 10mg', categoria: 'Ansiolítico controlado', precio: 55.0, disponible: false, requiereReceta: true },
];

export default function Medicamentos() {
  return (
    <section className="panel">
      <h2>Catálogo de Medicamentos</h2>
      <p className="nota-receta">
        Los medicamentos controlados requieren receta médica válida para su entrega.
      </p>
      <ul className="medicamentos-list">
        {MEDICAMENTOS.map((med) => (
          <li key={med.nombre} className="medicamento-item">
            <div>
              <strong>{med.nombre}</strong>
              <span className="med-categoria">{med.categoria}</span>
            </div>
            <div className="med-precio">${med.precio.toFixed(2)}</div>
            <div className="med-etiquetas">
              <span className={`med-estado ${med.disponible ? 'disponible' : 'agotado'}`}>
                {med.disponible ? 'Disponible' : 'Agotado'}
              </span>
              {med.requiereReceta && <span className="med-receta">Requiere receta</span>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}