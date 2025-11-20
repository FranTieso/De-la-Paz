
document.addEventListener("DOMContentLoaded", () => {
    const navContainer = document.getElementById("nav-container");
    const footerContainer = document.getElementById("footer-container");
    const currentPage = window.location.pathname.split("/").pop();

    // --- Cargar Navegación y Footer ---
    if (navContainer) {
        fetch("nav.html")
            .then(response => response.text())
            .then(data => {
                navContainer.innerHTML = data;
                initNavbar(true); // Habilitar funcionalidad del Navbar
                updateActiveLink(currentPage);
            });
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

    // --- Inicializar Firebase ---
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
        const auth = firebase.auth();
        const db = firebase.firestore();
    
        // --- Función de inicialización del Navbar ---
        function initNavbar(enableLogin) {
            const menuBtn = document.getElementById("menu-btn");
            const mobileMenu = document.getElementById("mobile-menu");
            const loginModal = document.getElementById("login-modal");
            const closeLogin = document.getElementById("close-login");
            const loginForm = document.getElementById("login-form");
            const userArea = document.getElementById('user-area');
            const mobileUserArea = document.getElementById('mobile-user-area');
            const loginCard = document.getElementById('login-card');

            if (menuBtn) {
                menuBtn.addEventListener("click", () => {
                    mobileMenu.classList.toggle("hidden");
                });
            }

            if (enableLogin) {
                const loginButton = document.getElementById("login-btn");
                const mobileLoginButton = document.getElementById("mobile-login-btn");
                if(loginButton) loginButton.style.display = 'block';
                if(mobileLoginButton) mobileLoginButton.style.display = 'block';

                const showLoginModal = () => loginModal.classList.remove("hidden");
                if(loginButton) loginButton.addEventListener("click", showLoginModal);
                if(mobileLoginButton) mobileLoginButton.addEventListener("click", showLoginModal);
                if(loginCard) loginCard.addEventListener('click', (e) => {
                    e.preventDefault();
                    showLoginModal();
                });

                closeLogin.addEventListener("click", () => loginModal.classList.add("hidden"));

                // --- Lógica de Autenticación ---
                loginForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    const email = document.getElementById("email").value;
                    const password = document.getElementById("password").value;

                    auth.signInWithEmailAndPassword(email, password)
                        .then(userCredential => {
                            console.log("Usuario autenticado:", userCredential.user);
                            loginModal.classList.add("hidden");
                        })
                        .catch(error => {
                            alert("Error al iniciar sesión: " + error.message);
                        });
                });

                auth.onAuthStateChanged(user => {
                    if (user) {
                        // Usuario está logueado
                        if(loginButton) loginButton.style.display = 'none';
                        if(mobileLoginButton) mobileLoginButton.style.display = 'none';
                        if (userArea) userArea.innerHTML = `<button id="logout-btn" class="font-semibold text-red-500 hover:text-red-700">Salir</button>`;
                        if (mobileUserArea) mobileUserArea.innerHTML = `<button id="mobile-logout-btn" class="block w-full text-left py-2 px-4 text-red-500 hover:bg-gray-200">Salir</button>`;
                        
                        document.getElementById('logout-btn')?.addEventListener('click', () => auth.signOut());
                        document.getElementById('mobile-logout-btn')?.addEventListener('click', () => auth.signOut());

                    } else {
                        // Usuario no está logueado
                        if(loginButton) loginButton.style.display = 'block';
                        if(mobileLoginButton) mobileLoginButton.style.display = 'block';
                        if (userArea) userArea.innerHTML = '';
                        if (mobileUserArea) mobileUserArea.innerHTML = '';
                    }
                });
            }
        }
});
