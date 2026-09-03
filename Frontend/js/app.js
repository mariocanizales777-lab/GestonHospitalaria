document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('slots-container');

  fetch('http://localhost:3000/api/horarios')
    .then(res => res.json())
    .then(response => {
      container.innerHTML = '';
      response.data.forEach(slot => {
        const card = document.createElement('div');
        card.className = `slot-card ${slot.estado}`;
        card.innerHTML = `<h4>${slot.hora}</h4><p>${slot.estado.replace('_', ' ').toUpperCase()}</p>`;
        
        if(slot.estado === 'disponible') {
          card.onclick = () => seleccionarHorario(slot.id);
        }
        container.appendChild(card);
      });
    })
    .catch(() => {
      container.innerHTML = '<p>Ejecuta el Backend para ver la lista de horarios.</p>';
    });
});

function seleccionarHorario(id) {
  fetch('http://localhost:3000/api/citas/bloquear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ horarioId: id })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    location.reload();
  });
}