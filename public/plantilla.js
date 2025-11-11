// plantilla.js
document.addEventListener('DOMContentLoaded', () => {

    // --- Cargar Navbar ---
    fetch('nav.html')
        .then(res => res.text())
        .then(data => {
            // Insertar navbar al inicio del body
            document.body.insertAdjacentHTML('afterbegin', data);

            // Inicializar login solo en index
            if (document.body.id === 'index-page') {
                initNavbar(true); // login habilitado
            } else {
                initNavbar(false); // login oculto
            }
        })
        .catch(err => console.error('Error cargando navbar:', err));

    // --- Cargar Footer ---
    fetch('footer.html')
        .then(res => res.text())
        .then(data => {
            const footerContainer = document.getElementById('footer-container');
            if (footerContainer) footerContainer.innerHTML = data;
        })
        .catch(err => console.error('Error cargando footer:', err));

    // --- Inicializar Firebase ---
    const firebaseConfig = {
        apiKey: "AIzaSyCmr1oZFjzao2rGMDmWFN82gdLED0ODqaE",
        authDomain: "de-la-paz-4f635.firebaseapp.com",
        projectId: "de-la-paz-4f635"
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

        // Menú móvil
        menuBtn?.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
        });

        if (!enableLogin) {
            // Si login no habilitado, ocultar botones de usuario
            if (userArea) userArea.style.display = 'none';
            if (mobileUserArea) mobileUserArea.style.display = 'none';
            if (loginCard) loginCard.style.display = 'none';
            return;
        }

        // Modal login
        const openLoginModal = () => loginModal.classList.remove("hidden");
        const closeLoginModal = () => loginModal.classList.add("hidden");

        closeLogin?.addEventListener("click", closeLoginModal);
        loginCard?.addEventListener('click', (e) => {
            e.preventDefault();
            openLoginModal();
        });
        window.addEventListener("click", e => {
            if(e.target === loginModal) closeLoginModal();
        });

        // Logout
        function logout() {
            auth.signOut();
        }

        // Cambiar UI según estado del usuario
        auth.onAuthStateChanged(user => {
            userArea.innerHTML = '';
            mobileUserArea.innerHTML = '';

            if (user) {
                const userEmail = user.email;
                const desktopView = `<span class="text-white">👤 ${userEmail}</span><a href="#" id="logout-btn" class="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-orange-500 font-semibold">Salir</a>`;
                const mobileView = `<span class="block text-white text-center py-2">👤 ${userEmail}</span><br><a href="#" id="mobile-logout-btn" class="block bg-secondary text-white px-4 py-2 rounded-lg hover:bg-orange-500 text-center">Salir</a>`;

                userArea.innerHTML = desktopView;
                mobileUserArea.innerHTML = mobileView;

                document.getElementById('logout-btn')?.addEventListener('click', e => { e.preventDefault(); logout(); });
                document.getElementById('mobile-logout-btn')?.addEventListener('click', e => { e.preventDefault(); logout(); });

            } else {
                const desktopLoginBtn = `<a href="#" id="open-login" class="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-orange-500 font-semibold">Login</a>`;
                const mobileLoginBtn = `<a href="#" class="mobile-login block bg-secondary text-white px-4 py-2 hover:bg-orange-500 text-center rounded-lg">Login</a>`;

                userArea.innerHTML = desktopLoginBtn;
                mobileUserArea.innerHTML = mobileLoginBtn;

                document.getElementById('open-login')?.addEventListener('click', e => { e.preventDefault(); openLoginModal(); });
                document.querySelector('.mobile-login')?.addEventListener('click', e => { e.preventDefault(); openLoginModal(); });
            }
        });

        // Procesar login
        loginForm?.addEventListener("submit", e => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            auth.signInWithEmailAndPassword(email, password)
                .then(userCredential => {
                    closeLoginModal();
                    loginForm.reset();
                })
                .catch(error => {
                    console.error("Error al iniciar sesión:", error);
                    alert(`Error: ${error.message}`);
                });
        });
    }

});
