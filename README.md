# ficha-observacion-app
App digital interactiva para Ficha de Observación de niños - Gniius Centro Integral Infantil y Familiar. Incluye 4 páginas con evaluación de áreas: cognitiva, lenguaje, motriz y socioemocional. Datos persistentes con IndexedDB y PWA.

## GitHub Sync - Sincronización Automática

Esta app ahora incluye sincronización automática con GitHub para guardar y respaldar todas tus fichas de observación.

### Características

- **Sincronización Automática**: Cuando guardas una ficha, se sincroniza automáticamente con GitHub
- **Respaldo Seguro**: Todos tus datos se guardan en tu repositorio de GitHub
- **Recuperación Fácil**: Puedes restaurar fichas desde GitHub en cualquier momento
- **Sin Limites**: Almacena todas las fichas que necesites

### Configuración Requerida

Para usar la sincronización con GitHub, necesitas:

1. **Personal Access Token de GitHub**:
   - Ve a https://github.com/settings/tokens
   - Haz clic en "Generate new token"
   - Dale permisos de:
     - `repo` (control total del repositorio)
     - `workflow` (para crear commits)
   - Copia el token generado

2. **Editar el archivo `config-example.js`**:
   - Abre el archivo `config-example.js` en tu navegador (devtools) o editorially
   - Reemplaza:
     - `TOKEN`: Con tu Personal Access Token
     - `OWNER`: Con tu nombre de usuario de GitHub
     - `REPO`: Con el nombre del repositorio
   - Guarda como `config.js` en la raíz del proyecto

3. **Configuración de Opciones**:
   ```javascript
   const GITHUB_CONFIG = {
     TOKEN: 'tu_personal_access_token_aqui',
     OWNER: 'tu_usuario_github',
     REPO: 'nombre_del_repositorio',
     AUTO_SYNC: true,              // Habilitar sincronización automática
     SHOW_NOTIFICATIONS: true      // Mostrar notificaciones
   };
   ```

### ¿Cómo Funciona?

1. Cuando creas o editas una ficha, se guarda en IndexedDB localmente
2. Al guardar, se sincroniza automáticamente con GitHub
3. Las fichas se guardan en la carpeta `fichas-data/` de tu repositorio
4. Cada ficha se guarda como un archivo JSON individual

### Archivos Necesarios

- `github-sync.js`: Módulo de sincronización con GitHub
- `config-example.js`: Archivo de configuración (copia a `config.js`)
- `app.js`: Modificado para incluir sincronización automática
- `index.html`: Scripts incluidos en el HTML

### Seguridad

- **Nunca compartas tu Personal Access Token**
- El token se almacena solo en tu navegador (no en servidores)
- Se recomienda crear un repositorio privado para máxima seguridad
- Puedes revocar el token en GitHub en cualquier momento

