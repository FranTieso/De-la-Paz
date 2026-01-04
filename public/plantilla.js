
document.addEventListener("DOMContentLoaded", () => {
    // --- 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE (opcional) ---
    const firebaseConfig = {
        apiKey: "AIzaSyCmr1oZFjzao2rGMDmWFN82gdLED0ODqaE",
        authDomain: "de-la-paz-4f635.firebaseapp.com",
        projectId: "de-la-paz-4f635",
        storageBucket: "de-la-paz-4f635.firebasestorage.app",
        messagingSenderId: "713257869341",
        appId: "1:713257869341:web:118f3e3414c8daa6c566f4",
        measurementId: "G-42Q79PD42K"
    };

    // firebase is optional on every page: only init if it's present.
    let firebaseInitialized = false;
    try {
        if (typeof firebase !== 'undefined' && firebase && !firebase.apps?.length) {
            firebase.initializeApp(firebaseConfig);
            firebaseInitialized = true;
            console.log('Firebase initialized by plantilla.js');
        } else if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK not found. Firebase features are disabled on this page.');
        } else {
            // Already initialized or firebase object present without apps (compat)
            firebaseInitialized = true;
        }
    } catch (err) {
        console.error('Error while initializing Firebase in plantilla.js:', err);
    }

    if (firebaseInitialized) {
        const event = new Event('firebaseReady');
        document.dispatchEvent(event);
    }

    // --- 2. CARGA DE PLANTILLAS (NAV Y FOOTER) ---
    const navContainer = document.getElementById("nav-container");
    const footerContainer = document.getElementById("footer-container");

    // Try multiple candidate paths to be resilient to different hosting setups
    const candidatePaths = (name) => [
        `/${name}`,
        `./${name}`,
        `${name}`
    ];

    const loadTemplate = async (name, container) => {
        if (!container) return Promise.resolve();
        const paths = candidatePaths(name);
        for (const path of paths) {
            try {
                console.log(`Trying to load template at: ${path}`);
                const response = await fetch(path);
                if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
                const html = await response.text();
                container.innerHTML = html;
                console.log(`Loaded template: ${path}`);
                return Promise.resolve();
            } catch (err) {
                console.warn(`Failed to load template from ${path}:`, err.message || err);
            }
        }
        // If all attempts failed, inject a simple fallback navigation so user doesn't miss everything
        console.error(`All attempts to load ${name} failed. Inserting fallback markup.`);
        container.innerHTML = fallbackTemplate(name);
        return Promise.resolve();
    };

    const fallbackTemplate = (name) => {
        // Minimal fallback so users still see navigation and can access pages
        if (name === 'nav.html') {
            return `
              <header class="bg-primary text-white">
                <nav class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                  <a href="index.html" class="text-xl font-bold">Asociación Deportiva de la Paz</a>
                  <div class="flex items-center space-x-4">
                    <a href="equipos.html" class="hover:text-secondary">Equipos</a>
                    <a href="categorias.html" class="hover:text-secondary">Categorías</a>
                    <a href="usuarios.html" class="hover:text-secondary">Usuarios</a>
                    <a href="#" id="login-btn" class="bg-secondary text-white px-3 py-1 rounded">Login</a>
                  </div>
                </nav>
              </header>`;
        }
        if (name === 'footer.html') {
            return `<footer class="bg-white text-gray-700 text-center p-4">Asociación Deportiva de la Paz</footer>`;
        }
        return '';
    };

    Promise.all([loadTemplate("nav.html", navContainer), loadTemplate("footer.html", footerContainer)])
        .then(() => {
            console.log("Navigation and footer loaded successfully.");
            // Una vez cargado el nav, configuramos sus elementos interactivos
            setupNavInteractions();
            // Y añadimos los handlers para el modal de login
            setupLoginHandlers();
            // Verificar si hay una sesión activa y actualizar la UI
            checkUserSession();
        })
        .catch(error => {
            console.error("Error loading templates:", error);
        });

    // --- 3. FUNCIONES INTERACTIVAS DEL NAV ---
    function setupNavInteractions() {
        // Menú desplegable de "Gestión"
        const gestionBtn = document.getElementById('gestion-btn');
        const gestionMenu = document.getElementById('gestion-menu');
        if (gestionBtn && gestionMenu) {
            gestionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                gestionMenu.classList.toggle('hidden');
            });
            document.addEventListener('click', () => {
                gestionMenu.classList.add('hidden');
            });
        }

        // Menú móvil
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
    }

    // --- 4. HANDLERS PARA MODAL LOGIN ---
    function setupLoginHandlers() {
        console.log('Configurando handlers de login...');
        const loginModal = document.getElementById("login-modal");
        const loginForm = document.getElementById("login-form");
        
        console.log('Modal de login encontrado:', !!loginModal);
        console.log('Formulario de login encontrado:', !!loginForm);

        const showLoginModal = (e) => {
            console.log('Mostrando modal de login...');
            e && e.preventDefault();
            if (loginModal) {
                loginModal.classList.remove('hidden');
                console.log('Modal mostrado');
            } else {
                console.error('Modal de login no encontrado');
            }
        };

        // botones que abren el modal: desktop, mobile y la tarjeta de login en index
        const loginButtons = document.querySelectorAll('#login-btn, #mobile-login-btn, #login-card');
        console.log('Botones de login encontrados:', loginButtons.length);
        
        loginButtons.forEach((item, index) => {
            if (item) {
                console.log(`Configurando botón ${index + 1}:`, item.id || item.tagName);
                item.addEventListener('click', showLoginModal);
            }
        });

        // botón de cierre del modal
        const closeBtn = document.getElementById('close-login');
        console.log('Botón de cierre encontrado:', !!closeBtn);
        if (closeBtn && loginModal) {
            closeBtn.addEventListener('click', () => {
                console.log('Cerrando modal...');
                loginModal.classList.add('hidden');
            });
        }

        // submit del formulario de login usando nuestra API
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email')?.value;
                const password = document.getElementById('login-password')?.value;
                
                if (!email || !password) {
                    alert('Por favor, ingresa email y contraseña');
                    return;
                }

                try {
                    const response = await fetch('/api/usuarios/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            mail: email,
                            password: password
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        // Login exitoso - Guardar sesión Y token
                        localStorage.setItem('userSession', JSON.stringify(result.usuario));
                        localStorage.setItem('token', result.token);
                        console.log('Usuario autenticado:', result.usuario);
                        console.log('Token guardado:', !!result.token);
                        
                        // Cerrar modal
                        if (loginModal) loginModal.classList.add('hidden');
                        
                        // Limpiar formulario
                        loginForm.reset();
                        
                        // Redirigir según roles (objeto)
                        redirectUserByRoles(result.usuario);
                        
                    } else {
                        // Login fallido
                        alert('Error: ' + result.error);
                    }

                } catch (error) {
                    console.error('Error en login:', error);
                    alert('Error al conectar con el servidor');
                }
            });
        }
    }

    // --- 5. GESTIÓN DE SESIÓN DE USUARIO ---
    
    // Verificar si hay una sesión activa
    function checkUserSession() {
        const userSession = localStorage.getItem('userSession');
        if (userSession) {
            try {
                const usuario = JSON.parse(userSession);
                updateNavForLoggedUser(usuario);
            } catch (error) {
                console.error('Error al parsear sesión de usuario:', error);
                localStorage.removeItem('userSession');
            }
        }
    }

    // Actualizar navegación para usuario logueado
    function updateNavForLoggedUser(usuario) {
        // Cambiar botones de login por botones de logout
        const loginBtnDesktop = document.getElementById('login-btn');
        const loginBtnMobile = document.getElementById('mobile-login-btn');
        const loginCard = document.getElementById('login-card');

        // Reemplazar botón de login desktop por logout
        if (loginBtnDesktop) {
            loginBtnDesktop.textContent = 'Cerrar Sesión';
            loginBtnDesktop.className = 'bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition';
            loginBtnDesktop.onclick = logout;
        }

        // Reemplazar botón de login mobile por logout
        if (loginBtnMobile) {
            loginBtnMobile.textContent = 'Cerrar Sesión';
            loginBtnMobile.className = 'block px-4 py-2 text-red-600 hover:bg-red-50 transition';
            loginBtnMobile.onclick = logout;
        }

        // Ocultar tarjeta de login en index.html
        if (loginCard) {
            loginCard.style.display = 'none';
        }

        // Cambiar "Próximos encuentros" por "PANEL" según el rol
        const navEncuentrosDesktop = document.getElementById('nav-encuentros-desktop');
        const navEncuentrosMobile = document.getElementById('nav-encuentros-mobile');
        
        const panelUrl = getPanelUrlByRoles(usuario);
        const primary = getPrimaryRole(usuario) || 'usuario';

        if (navEncuentrosDesktop && panelUrl) {
          navEncuentrosDesktop.textContent = 'PANEL';
          navEncuentrosDesktop.href = panelUrl;
          navEncuentrosDesktop.title = `Panel de ${primary}`;
        }

        if (navEncuentrosMobile && panelUrl) {
          navEncuentrosMobile.textContent = 'PANEL';
          navEncuentrosMobile.href = panelUrl;
          navEncuentrosMobile.title = `Panel de ${primary}`;
        }

        // Mostrar información del usuario en la navegación
        const navDesktop = document.querySelector('nav .flex.items-center.space-x-4');
        if (navDesktop && !document.getElementById('user-info')) {
            const userInfo = document.createElement('span');
            userInfo.id = 'user-info';
            userInfo.className = 'text-white text-sm';
            userInfo.textContent = `¡Hola, ${usuario.nombre}!`;
            navDesktop.insertBefore(userInfo, loginBtnDesktop);
        }
    }

    // ===============================
    // ROLES (FRONT): solo user.roles
    // ===============================

    function normalizeRoleKey(roleKey) {
      const r = String(roleKey || '').toLowerCase().trim();
      if (r === 'administrador') return 'admin'; // legacy -> actual
      return r;
    }

    function hasRole(user, roleKey) {
      if (!user || !user.roles || typeof user.roles !== 'object') return false;

      const wanted = normalizeRoleKey(roleKey);
      const keys = Object.keys(user.roles).map(normalizeRoleKey);

      // admin acepta admin y administrador (si se coló legacy)
      if (wanted === 'admin') return keys.includes('admin');

      return keys.includes(wanted);
    }

    function getPrimaryRole(user) {
      // prioridad para paneles: admin > delegado > entrenador > arbitro
      if (hasRole(user, 'admin')) return 'admin';
      if (hasRole(user, 'delegado')) return 'delegado';
      if (hasRole(user, 'entrenador')) return 'entrenador';
      if (hasRole(user, 'arbitro')) return 'arbitro';
      return null;
    }

    function getPanelUrlByRoles(user) {
      const primary = getPrimaryRole(user);
      const map = {
        admin: 'admin_panel.html',
        delegado: 'delegado_panel.html',
        entrenador: 'entrenador_panel.html',
        arbitro: 'arbitro_panel.html'
      };
      return primary ? (map[primary] || null) : null;
    }

    function redirectUserByRoles(user) {
      const target = getPanelUrlByRoles(user);
      if (!target) {
        alert('Rol no reconocido');
        return;
      }
      window.location.href = target;
    }

    // Exponer helpers globales para usarlos en otras páginas
    window.hasRole = hasRole;
    window.getPrimaryRole = getPrimaryRole;
    window.getPanelUrlByRoles = getPanelUrlByRoles;
    window.redirectUserByRoles = redirectUserByRoles;

    // Cerrar sesión
    function logout() {
        localStorage.removeItem('userSession');
        localStorage.removeItem('token');
        alert('Sesión cerrada correctamente');
        window.location.href = 'index.html';
    }

    // Función global para obtener usuario actual (para usar en otras páginas)
    window.getCurrentUser = function() {
        const userSession = localStorage.getItem('userSession');
        return userSession ? JSON.parse(userSession) : null;
    };

    // Función global para verificar si el usuario está logueado
    window.isUserLoggedIn = function() {
        return localStorage.getItem('userSession') !== null;
    };

    // Función global para logout (para usar en otras páginas)
    window.logoutUser = logout;

});
