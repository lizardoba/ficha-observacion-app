// GitHub Sync Module
// Sincroniza fichas de observación con un repositorio de GitHub

class GitHubSync {
  constructor(token, owner, repo, branch = 'main') {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.branch = branch;
    this.apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    this.fichasPath = 'fichas-data';
    this.lastSyncTime = localStorage.getItem('lastGitHubSync') || null;
  }

  // Obtener contenido de un archivo en GitHub
  async obtenerArchivo(path) {
    try {
      const response = await fetch(
        `${this.apiUrl}/contents/${path}?ref=${this.branch}`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3.raw'
          }
        }
      );
      if (response.ok) {
        return await response.text();
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo archivo:', error);
      return null;
    }
  }

  // Obtener SHA del archivo para actualizar
  async obtenerSHA(path) {
    try {
      const response = await fetch(
        `${this.apiUrl}/contents/${path}?ref=${this.branch}`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data.sha;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo SHA:', error);
      return null;
    }
  }

  // Guardar/Actualizar archivo en GitHub
  async guardarArchivo(path, contenido, mensaje) {
    try {
      // Obtener SHA actual si el archivo existe
      let sha = null;
      try {
        sha = await this.obtenerSHA(path);
      } catch (e) {
        // El archivo no existe aún
      }

      // Codificar contenido en base64
      const contenidoBase64 = btoa(unescape(encodeURIComponent(contenido)));

      const body = {
        message: mensaje,
        content: contenidoBase64,
        branch: this.branch
      };

      if (sha) {
        body.sha = sha; // Para actualizar
      }

      const response = await fetch(
        `${this.apiUrl}/contents/${path}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${this.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );

      if (response.ok) {
        localStorage.setItem('lastGitHubSync', new Date().toISOString());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error guardando archivo:', error);
      return false;
    }
  }

  // Sincronizar una ficha individual
  async sincronizarFicha(ficha) {
    try {
      const nombreArchivo = `${this.fichasPath}/ficha-${ficha.id}-${new Date().getTime()}.json`;
      const contenido = JSON.stringify(ficha, null, 2);
      const mensaje = `Sincronizar ficha de observación #${ficha.id} - ${new Date().toLocaleString()}`;

      return await this.guardarArchivo(nombreArchivo, contenido, mensaje);
    } catch (error) {
      console.error('Error sincronizando ficha:', error);
      return false;
    }
  }

  // Sincronizar múltiples fichas
  async sincronizarFichas(fichas) {
    try {
      const timestamp = new Date().getTime();
      const nombreArchivo = `${this.fichasPath}/fichas-backup-${timestamp}.json`;
      const contenido = JSON.stringify(fichas, null, 2);
      const mensaje = `Backup de fichas - ${fichas.length} registros - ${new Date().toLocaleString()}`;

      return await this.guardarArchivo(nombreArchivo, contenido, mensaje);
    } catch (error) {
      console.error('Error sincronizando múltiples fichas:', error);
      return false;
    }
  }

  // Obtener todas las fichas sincronizadas desde GitHub
  async obtenerFichasGuardadas() {
    try {
      // Listar archivos en la carpeta fichas-data
      const response = await fetch(
        `${this.apiUrl}/contents/${this.fichasPath}?ref=${this.branch}`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (response.ok) {
        const files = await response.json();
        const fichas = [];

        for (const file of files) {
          if (file.name.endsWith('.json')) {
            const contenido = await this.obtenerArchivo(file.path);
            if (contenido) {
              const data = JSON.parse(contenido);
              fichas.push(data);
            }
          }
        }
        return fichas;
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo fichas guardadas:', error);
      return [];
    }
  }

  // Restaurar fichas desde GitHub a IndexedDB
  async restaurarFichasDesdeGitHub(fichaDB) {
    try {
      const fichas = await this.obtenerFichasGuardadas();
      
      for (const ficha of fichas) {
        // Si es un backup completo
        if (Array.isArray(ficha)) {
          for (const item of ficha) {
            await fichaDB.guardar(item);
          }
        } else {
          // Si es una ficha individual
          await fichaDB.guardar(ficha);
        }
      }
      
      return fichas.length > 0;
    } catch (error) {
      console.error('Error restaurando fichas:', error);
      return false;
    }
  }
}

// Inicializar sincronización
let gitHubSync = null;

function inicializarGitHubSync(token, owner, repo) {
  gitHubSync = new GitHubSync(token, owner, repo);
  console.log('GitHubSync inicializado');
  return gitHubSync;
}

function obtenerGitHubSync() {
  return gitHubSync;
}
