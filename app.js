let paginaActual = 1;
let fichaEditandoId = null;

async function init() {
  await fichaDB.init();
  configurarEventos();
  mostrarVista('misFichas');
  cargarFichas();
}

function configurarEventos() {
  const btnNuevaFicha = document.getElementById('btnNuevaFicha');
  const btnMisFichas = document.getElementById('btnMisFichas');
  const btnAnterior = document.getElementById('btnAnterior');
  const btnSiguiente = document.getElementById('btnSiguiente');
  const btnCancelar = document.getElementById('btnCancelar');
  const formFicha = document.getElementById('formFicha');

  btnNuevaFicha.addEventListener('click', () => {
    fichaEditandoId = null;
    formFicha.reset();
    paginaActual = 1;
    mostrarVista('formulario');
    mostrasPagina(paginaActual);
  });

  btnMisFichas.addEventListener('click', () => mostrarVista('misFichas'));

  btnAnterior.addEventListener('click', () => {
    if (paginaActual > 1) {
      paginaActual--;
      mostrasPagina(paginaActual);
    }
  });

  btnSiguiente.addEventListener('click', () => {
    if (paginaActual < 4) {
      paginaActual++;
      mostrasPagina(paginaActual);
    }
  });

  btnCancelar.addEventListener('click', () => {
    mostrarVista('misFichas');
    cargarFichas();
  });

  formFicha.addEventListener('submit', guardarFicha);
}

function mostrarVista(vista) {
  document.querySelectorAll('.vista').forEach(v => v.classList.remove('activa'));
  document.querySelectorAll('.btn-nav').forEach(b => b.classList.remove('active'));

  if (vista === 'misFichas') {
    document.getElementById('vistaMisFichas').classList.add('activa');
    document.getElementById('btnMisFichas').classList.add('active');
  } else {
    document.getElementById('vistaFormulario').classList.add('activa');
    document.getElementById('btnNuevaFicha').classList.add('active');
  }
}

function mostrasPagina(num) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('activa'));
  const page = document.querySelector(`[data-page="${num}"]`);
  if (page) page.classList.add('activa');
}

async function cargarFichas() {
  const fichas = await fichaDB.obtenerTodos();
  const listaFichas = document.getElementById('listaFichas');
  const mensajeVacio = document.getElementById('mensajeVacio');

  if (fichas.length === 0) {
    listaFichas.innerHTML = '';
    mensajeVacio.style.display = 'block';
    return;
  }

  mensajeVacio.style.display = 'none';
  listaFichas.innerHTML = fichas.map(ficha => `
    <div class="ficha-card">
      <h3>${ficha.nombre || 'Sin nombre'}</h3>
      <p><strong>Apoderado:</strong> ${ficha.nombreApoderado || 'N/A'}</p>
      <p><strong>Fecha:</strong> ${new Date(ficha.fechaCreacion).toLocaleDateString('es-PE')}</p>
      <div class="ficha-card-buttons">
        <button class="btn-editor" onclick="editarFicha(${ficha.id})">Editar</button>
        <button class="btn-eliminar" onclick="eliminarFicha(${ficha.id})">Eliminar</button>
      </div>
    </div>
  `).join('');
}

async function editarFicha(id) {
  const ficha = await fichaDB.obtener(id);
  if (ficha) {
    fichaEditandoId = id;
    llenarFormulario(ficha);
    paginaActual = 1;
    mostrarVista('formulario');
    mostrasPagina(paginaActual);
  }
}

function llenarFormulario(ficha) {
  Object.keys(ficha).forEach(key => {
    const input = document.querySelector(`[name="${key}"]`);
    if (input) {
      if (input.type === 'radio') {
        document.querySelector(`[name="${key}"][value="${ficha[key]}"]`).checked = true;
      } else {
        input.value = ficha[key] || '';
      }
    }
  });
}

async function guardarFicha(e) {
  e.preventDefault();
  const formData = new FormData(document.getElementById('formFicha'));
  const datos = Object.fromEntries(formData);

  try {
    if (fichaEditandoId) {
      await fichaDB.actualizar(fichaEditandoId, datos);
      alert('Ficha actualizada exitosamente');
    } else {
      await fichaDB.guardar(datos);
      alert('Ficha guardada exitosamente');
    }
    mostrarVista('misFichas');
    cargarFichas();
    fichaEditandoId = null;
  } catch (error) {
    console.error('Error al guardar:', error);
    alert('Error al guardar la ficha');
  }
}

async function eliminarFicha(id) {
  if (confirm('¿Estás seguro de que deseas eliminar esta ficha?')) {
    try {
      await fichaDB.eliminar(id);
      cargarFichas();
      alert('Ficha eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar la ficha');
    }
  }
}

      // GitHub Sync Integration
// Sincronizar fichas cuando se guarden
async function sincronizarFichaAGitHub(ficha) {
  try {
    const sync = obtenerGitHubSync();
    if (!sync) {
      console.log('GitHub Sync no está configurado');
      return;
    }

    const config = obtenerConfiguracion();
    if (!config.AUTO_SYNC) {
      console.log('Sincronización automática deshabilitada');
      return;
    }

    const resultado = await sync.sincronizarFicha(ficha);
    if (resultado && config.SHOW_NOTIFICATIONS) {
      alert('Ficha sincronizada con GitHub exitosamente');
    }
  } catch (error) {
    console.error('Error sincronizando con GitHub:', error);
  }
}

// Modificar la función guardarFicha para incluir sincronización
const guardarFichaOriginal = window.guardarFicha;
window.guardarFicha = async function(eventos) {
  // Llamar a la función original
  const resultado = await guardarFichaOriginal(eventos);
  
  // Si se guardó exitosamente, sincronizar con GitHub
  if (resultado && fichaEditandoId) {
    const ficha = await fichaDB.obtener(fichaEditandoId);
    if (ficha) {
      sincronizarFichaAGitHub(ficha);
    }
  }
  
  return resultado;
};

// Inicializar GitHub Sync al cargar la app
window.addEventListener('load', () => {
  try {
    if (window.inicializarSincronizacion) {
      const sync = inicializarSincronizacion();
      if (sync) {
        console.log('GitHub Sync iniciado correctamente');
      }
    }
  } catch (error) {
    console.warn('No fue posible inicializar GitHub Sync:', error);
  }
});


document.addEventListener('DOMContentLoaded', init);
