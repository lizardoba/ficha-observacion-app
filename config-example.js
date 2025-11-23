// Configuración de GitHub Sync
// IMPORTANTE: Reemplaza estos valores con tus datos de GitHub

// Pasos para obtener estos valores:
// 1. Crea un Personal Access Token en GitHub:
//    - Ve a https://github.com/settings/tokens
//    - Click en "Generate new token"
//    - Dale permisos de: repo (full control), workflow
//    - Copia el token generado

// 2. Conoce tu nombre de usuario y nombre del repositorio

// CONFIGURACIÓN
const GITHUB_CONFIG = {
  // Tu token de acceso personal de GitHub
  TOKEN: 'ghp_REEMPLAZA_CON_TU_TOKEN_AQUI',
  
  // Tu nombre de usuario en GitHub
  OWNER: 'lizardoba',
  
  // El nombre de tu repositorio
  REPO: 'ficha-observacion-app',
  
  // La rama donde guardar los datos (default: main)
  BRANCH: 'main',
  
  // Habilitar sincronización automática al guardar fichas
  AUTO_SYNC: true,
  
  // Intervalo en milisegundos para sincronización automática (0 = deshabilitada)
  // Ejemplo: 300000 = cada 5 minutos
  AUTO_SYNC_INTERVAL: 0,
  
  // Mostrar notificaciones de sincronización
  SHOW_NOTIFICATIONS: true
};

// Función para inicializar la sincronización
function inicializarSincronizacion() {
  if (!GITHUB_CONFIG.TOKEN || GITHUB_CONFIG.TOKEN.includes('REEMPLAZA')) {
    console.warn('GitHub Sync no configurado. Por favor, actualiza GITHUB_CONFIG con tus credenciales.');
    return false;
  }
  
  // Inicializar GitHubSync
  const sync = inicializarGitHubSync(
    GITHUB_CONFIG.TOKEN,
    GITHUB_CONFIG.OWNER,
    GITHUB_CONFIG.REPO
  );
  
  console.log('Sincronización con GitHub configurada exitosamente');
  return sync;
}

// Obtener configuración
function obtenerConfiguracion() {
  return GITHUB_CONFIG;
}
