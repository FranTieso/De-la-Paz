
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
        const loginModal = document.getElementById("login-modal");
        const loginForm = document.getElementById("login-form");

        const showLoginModal = (e) => {
            e && e.preventDefault();
            if (loginModal) loginModal.classList.remove('hidden');
        };

        // botones que abren el modal: desktop, mobile y la tarjeta de login en index
        document.querySelectorAll('#login-btn, #mobile-login-btn, #login-card').forEach(item => {
            item && item.addEventListener('click', showLoginModal);
        });

        // botón de cierre del modal
        const closeBtn = document.getElementById('close-login');
        if (closeBtn && loginModal) {
            closeBtn.addEventListener('click', () => loginModal.classList.add('hidden'));
        }

        // submit del formulario de login usando firebase auth (compat)
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email')?.value;
                const password = document.getElementById('login-password')?.value;
                if (!email || !password) return;
                // Usamos firebase auth compat
                try {
                    if (typeof firebase === 'undefined' || !firebase.auth) {
                        throw new Error('Firebase Auth no disponible en esta página. Asegúrate de cargar los SDKs de Firebase antes de plantilla.js si necesitas autenticación.');
                    }
                    firebase.auth().signInWithEmailAndPassword(email, password)
                        .then(async (userCredential) => {
                            console.log('Usuario autenticado:', userCredential.user?.email);

                            // 1. Obtener el UID
                            const uid = userCredential.user.uid;

                            // 2. Consultar el rol en el backend
                            try {
                                const response = await fetch(`/api/usuarios/${uid}`);
                                if (!response.ok) throw new Error('Error al obtener datos del usuario');

                                const userData = await response.json();
                                const roles = userData.roles || {};

                                // 3. Redirigir según el rol
                                if (roles.administrador) {
                                    window.location.href = 'admin_panel.html';
                                } else if (roles.entrenador) {
                                    window.location.href = 'entrenador_panel.html';
                                } else if (roles.delegado) {
                                    window.location.href = 'delegado_panel.html';
                                } else if (roles.arbitro) {
                                    window.location.href = 'arbitro_panel.html';
                                } else {
                                    // Fallback si no tiene rol específico o es un usuario normal
                                    window.location.href = 'index.html';
                                }

                            } catch (error) {
                                console.error('Error al obtener rol:', error);
                                // Si falla la obtención del rol, cerramos el modal pero avisamos o recargamos
                                if (loginModal) loginModal.classList.add('hidden');
                                alert('Inicio de sesión correcto, pero hubo un error al cargar tu perfil.');
                            }
                        })
                        .catch(error => {
                            console.error('Error autenticación:', error);
                            alert('Error al iniciar sesión: ' + (error.message || error.code));
                        });
                } catch (err) {
                    console.error('Firebase Auth no disponible', err);
                }
            });
        }
    }
});
