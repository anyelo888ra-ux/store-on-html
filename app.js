// Configuración de la App en Discord Developer Portal (stupid dev)
const CLIENT_ID = 'TU_DISCORD_CLIENT_ID_AQUI'; // Reemplazar con el Client ID de store.on-html
const REDIRECT_URI = encodeURIComponent('https://store.on-html.duckdns.org/');

document.addEventListener('DOMContentLoaded', () => {
  verificarSesion();
  cargarCatalogoEjemplo();
});

// 1. Verificar si hay sesión guardada en localStorage o un nuevo token en URL
function verificarSesion() {
  const sesionGuardada = localStorage.getItem('store_onhtml_user');

  if (sesionGuardada) {
    renderizarUsuario(JSON.parse(sesionGuardada));
  } else {
    procesarHashOAuth();
  }
}

// 2. Procesar el token devuelto por Discord y limpiar la URL inmediatamente
function procesarHashOAuth() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');

  if (accessToken) {
    fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    .then(res => res.json())
    .then(userData => {
      const usuario = {
        id: userData.id,
        username: userData.username,
        avatar: `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
      };

      // Guardar permanentemente en localStorage
      localStorage.setItem('store_onhtml_user', JSON.stringify(usuario));

      // Limpiar URL feo sin recargar
      window.history.replaceState({}, document.title, window.location.pathname);

      renderizarUsuario(usuario);
    })
    .catch(err => console.error('Error procesando login:', err));
  }
}

// 3. Iniciar sesión con Discord
function loginDiscord() {
  const authUrl = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=identify`;
  window.location.href = authUrl;
}

// 4. Cerrar Sesión
function logout() {
  localStorage.removeItem('store_onhtml_user');
  window.location.reload();
}

// 5. Mostrar Perfil en la UI
function renderizarUsuario(user) {
  const authContainer = document.getElementById('auth-container');
  if (!authContainer) return;

  authContainer.innerHTML = `
    <div class="user-profile">
      <img src="${user.avatar}" class="user-avatar" alt="${user.username}">
      <span>${user.username}</span>
      <button onclick="logout()" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:600; margin-left:8px;">Salir</button>
    </div>
  `;
}

// 6. Cargar Apps Disponibles
function cargarCatalogoEjemplo() {
  const grid = document.getElementById('app-grid');
  if (!grid) return;

  const apps = [
    { nombre: 'Loquendo Web Voice', tipo: 'apk', version: '1.0.0', desc: 'Sintetizador de voz independiente.', link: '#' },
    { nombre: 'Nexus Browser Desktop', tipo: 'exe', version: '2.1.0', desc: 'Navegador ultraligero para Windows.', link: '#' }
  ];

  grid.innerHTML = apps.map(app => `
    <div class="app-card">
      <span class="badge badge-${app.tipo}">${app.tipo}</span>
      <h3>${app.nombre}</h3>
      <p style="color:var(--text-secondary); font-size:0.9rem; margin:6px 0;">${app.desc}</p>
      <small style="color:#64748b;">v${app.version}</small>
      <a href="${app.link}" class="btn-download">Descargar Gratis</a>
    </div>
  `).join('');
}
