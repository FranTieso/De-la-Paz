document.addEventListener("DOMContentLoaded", () => {
    const navContainer = document.getElementById("nav-container");
    const footerContainer = document.getElementById("footer-container");
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    // --- Cargar Navegación y Footer ---
    if (navContainer) {
        fetch("nav.html")
            .then(response => response.text())
            .then(data => {
                navContainer.innerHTML = data;
                // Una vez cargado el nav, inicializamos toda la lógica interactiva
                initializeSiteLogic();
                updateActiveLink(currentPage);
            });
    } else {
        // Si no hay nav, aún podemos necesitar inicializar la lógica para otras páginas
        initializeSiteLogic();
    }

    if (footerContainer) {
        fetch("footer.html")
            .then(response => response.text())
            .then(data => {
                footerContainer.innerHTML = data;
            });
    }

    // --- Resaltar enlace activo ---
    function updateActiveLink(page) {
        const links = document.querySelectorAll("#nav-links a, #mobile-menu a");
        links.forEach(link => {
            if (link.href.endsWith(page)) {
                link.classList.add("text-secondary", "font-bold");
            }
        });
    }
    
    // --- Lógica Principal del Sitio (Inicializada después de cargar el Nav) ---
    function initializeSiteLogic() {
        // --- Inicializar Firebase (solo una vez) ---
        if (!firebase.apps.length) {
            const firebaseConfig = {
                apiKey: "AIzaSyCmr1oZFjzao2rGMDmWFN82gdLED0ODqaE",
                authDomain: "de-la-paz-4f635.firebaseapp.com",
                projectId: "de-la-paz-4f635",
                storageBucket: "de-la-paz-4f635.firebasestorage.app",
                messagingSenderId: "713257869341",
                appId: "1:713257869341:web:118f3e3414c8daa6c566f4",
                measurementId: "G-42Q79PD42K"
            };
            firebase.initializeApp(firebaseConfig);
        }
        const auth = firebase.auth();
        
        // Disparar un evento personalizado cuando Firebase esté listo
        document.dispatchEvent(new Event('firebaseReady'));

        // --- Lógica del Menú Móvil ---
        const menuBtn = document.getElementById("menu-btn");
        const mobileMenu = document.getElementById("mobile-menu");
        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener("click", () => {
                mobileMenu.classList.toggle("hidden");
            });
        }

        // --- Lógica del Modal de Login ---
        const loginModal = document.getElementById("login-modal");
        const closeLogin = document.getElementById("close-login");
        const loginForm = document.getElementById("login-form");
        
        const showLoginModal = (e) => {
            if (e) e.preventDefault();
            if (loginModal) loginModal.classList.remove("hidden");
        };
        
        // CORRECTED SELECTORS: Attach events to buttons and the login card itself.
        const loginTriggers = document.querySelectorAll('#login-btn, #mobile-login-btn, #login-card');
        loginTriggers.forEach(item => {
            if (item) { // Check if the element exists on the current page
                item.addEventListener('click', showLoginModal);
            }
        });

        if (closeLogin) {
            closeLogin.addEventListener("click", () => loginModal.classList.add("hidden"));
        }

        // --- Lógica de Autenticación (Formulario y Estado) ---
        if (loginForm) {
            loginForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const email = document.getElementById("email").value;
                const password = document.getElementById("password").value;

                auth.signInWithEmailAndPassword(email, password)
                    .then(userCredential => {
                        console.log("Usuario autenticado:", userCredential.user.email);
                        if (loginModal) loginModal.classList.add("hidden");
                        // No es necesario recargar, onAuthStateChanged se encargará de la UI.
                    })
                    .catch(error => {
                        alert("Error al iniciar sesión: " + error.message);
                    });
            });
        }

        auth.onAuthStateChanged(user => {
            const userArea = document.getElementById('user-area');
            const mobileUserArea = document.getElementById('mobile-user-area');
            const loginBtn = document.getElementById('login-btn');
            const mobileLoginBtn = document.getElementById('mobile-login-btn');
            const loginCard = document.getElementById('login-card');

            if (user) {
                // Usuario está logueado
                const userDisplay = `<span class="font-semibold text-primary">${user.email}</span>`;
                const logoutButton = `<button id="logout-btn" class="ml-4 font-semibold text-red-500 hover:text-red-700">Salir</button>`;
                
                if (userArea) userArea.innerHTML = userDisplay + logoutButton;
                if (mobileUserArea) mobileUserArea.innerHTML = userDisplay + logoutButton;

                if (loginBtn) loginBtn.style.display = 'none';
                if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
                if (loginCard) loginCard.style.display = 'none';

                // Añadir evento al botón de logout (debe hacerse después de crearlo)
                const logoutButtons = document.querySelectorAll('#logout-btn');
                logoutButtons.forEach(btn => btn.addEventListener('click', () => auth.signOut()));

            } else {
                // Usuario no está logueado
                if (userArea) userArea.innerHTML = '';
                if (mobileUserArea) mobileUserArea.innerHTML = '';

                if (loginBtn) loginBtn.style.display = 'block';
                if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
                if (loginCard) loginCard.style.display = 'block';
            }
        });
    }
});
