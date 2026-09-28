import { useEffect, useState } from 'react';
import { fetchAutenticado } from '../api';
import { useToast } from './Toast';

export default function Reportes() {
  const toast = useToast();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  async function cargarReporte() {
    setCargando(true);
    const res = await fetchAutenticado('/reportes/resumen');
    if (res.ok) {
      setDatos(await res.json());
    } else {
      toast.error('No se pudo cargar el reporte.');
    }
    setCargando(false);
  }

  useEffect(() => {
    cargarReporte();
  }, []);

  if (cargando) {
    return (
      <section className="panel">
        <h2>Reportes</h2>
        <p>Cargando…</p>
      </section>
    );
  }

  if (!datos) {
    return (
      <section className="panel">
        <h2>Reportes</h2>
        <p>No hay datos disponibles.</p>
      </section>
    );
  }

  const totalCitas = datos.citasPorEstado.reduce((acc, c) => acc + c.total, 0);
  const totalPedidos = datos.pedidosPorEstado.reduce((acc, p) => acc + p.total, 0);
  const maxCitasDoctor = Math.max(1, ...datos.citasPorDoctor.map((d) => d.total));
  const maxMedRecetado = Math.max(1, ...datos.medicamentosMasRecetados.map((m) => m.vecesRecetado));

  return (
    <section className="panel">
      <h2>Reportes</h2>
      <p className="nota-receta">Vista general del sistema: citas, doctores, medicamentos y pedidos.</p>

      <div className="reportes-grid">
        <div className="reporte-tarjeta">
          <h4>Citas por estado</h4>
          <ul className="reporte-lista">
            {datos.citasPorEstado.length === 0 && <li>Sin citas registradas.</li>}
            {datos.citasPorEstado.map((c) => (
              <li key={c.estado}>
                <span>{c.estado}</span>
                <span>{c.total} ({totalCitas > 0 ? Math.round((c.total / totalCitas) * 100) : 0}%)</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="reporte-tarjeta">
          <h4>Citas por doctor</h4>
          <ul className="reporte-lista">
            {datos.citasPorDoctor.length === 0 && <li>Sin citas asignadas a doctores.</li>}
            {datos.citasPorDoctor.map((d) => (
              <li key={d.doctor}>
                <span>{d.doctor}</span>
                <div className="reporte-barra-fondo">
                  <div className="reporte-barra" style={{ width: `${(d.total / maxCitasDoctor) * 100}%` }} />
                </div>
                <span>{d.total}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="reporte-tarjeta">
          <h4>Medicamentos más recetados</h4>
          <ul className="reporte-lista">
            {datos.medicamentosMasRecetados.length === 0 && <li>Sin recetas emitidas.</li>}
            {datos.medicamentosMasRecetados.map((m) => (
              <li key={m.nombre}>
                <span>{m.nombre}</span>
                <div className="reporte-barra-fondo">
                  <div className="reporte-barra" style={{ width: `${(m.vecesRecetado / maxMedRecetado) * 100}%` }} />
                </div>
                <span>{m.vecesRecetado} recetas · {m.totalUnidades} unidades</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="reporte-tarjeta">
          <h4>Pedidos por estado</h4>
          <ul className="reporte-lista">
            {datos.pedidosPorEstado.length === 0 && <li>Sin pedidos registrados.</li>}
            {datos.pedidosPorEstado.map((p) => (
              <li key={p.estado}>
                <span>{p.estado}</span>
                <span>{p.total} ({totalPedidos > 0 ? Math.round((p.total / totalPedidos) * 100) : 0}%)</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="reporte-tarjeta">
          <h4>Pedidos: controlados vs libres</h4>
          <ul className="reporte-lista">
            <li>
              <span>Controlados</span>
              <span>{datos.pedidosControladosVsLibres.controlados}</span>
            </li>
            <li>
              <span>Libres</span>
              <span>{datos.pedidosControladosVsLibres.libres}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}