
document.addEventListener("DOMContentLoaded", () => {
    // --- 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE ---
    const firebaseConfig = {
        apiKey: "AIzaSyCmr1oZFjzao2rGMDmWFN82gdLED0ODqaE",
        authDomain: "de-la-paz-4f635.firebaseapp.com",
        projectId: "de-la-paz-4f635",
        storageBucket: "de-la-paz-4f635.firebasestorage.app",
        messagingSenderId: "713257869341",
        appId: "1:713257869341:web:118f3e3414c8daa6c566f4",
        measurementId: "G-42Q79PD42K"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();

    // --- 2. FUNCIONES AUXILIARES (DEPENDEN DE `auth` Y EL DOM) ---
    function updateActiveLink(currentPage) {
        document.querySelectorAll("#nav-links a, #mobile-menu a").forEach(link => {
            const linkPage = link.href.split("/").pop();
            // Marca como activa la página actual, incluyendo el index
            if (linkPage === currentPage || (currentPage === 'index.html' && (linkPage === '' || linkPage === 'index.html'))) {
                link.classList.add("text-secondary", "font-bold");
            }
        });
    }

    function setupMobileMenu() {
        const menuBtn = document.getElementById("menu-btn");
        const mobileMenu = document.getElementById("mobile-menu");
        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener("click", () => mobileMenu.classList.toggle("hidden"));
        }
    }

    function setupLoginModal() {
        const loginModal = document.getElementById("login-modal");
        if (!loginModal) return;

        const showLoginModal = (e) => { 
            if(e) e.preventDefault(); 
            loginModal.classList.remove("hidden"); 
        };

        document.querySelectorAll('#login-btn, #mobile-login-btn, #login-card').forEach(item => {
            if(item) item.addEventListener('click', showLoginModal);
        });

        document.getElementById("close-login")?.addEventListener("click", () => loginModal.classList.add("hidden"));

        document.getElementById("login-form")?.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            auth.signInWithEmailAndPassword(email, password)
                .then(() => loginModal.classList.add("hidden"))
                .catch(error => alert("Error: " + error.message));
        });
    }

    function updateUserUI(user) {
        const userArea = document.getElementById('user-area');
        const mobileUserArea = document.getElementById('mobile-user-area');
        const loginBtn = document.getElementById('login-btn');
        const mobileLoginBtn = document.getElementById('mobile-login-btn');
        const loginCard = document.getElementById('login-card');

        if (user) {
            const userDisplay = `<span class="font-semibold text-primary">${user.email}</span>`;
            const logoutButton = `<button id="logout-btn" class="ml-4 font-semibold text-red-500 hover:text-red-700">Salir</button>`;
            if (userArea) userArea.innerHTML = userDisplay + logoutButton;
            if (mobileUserArea) mobileUserArea.innerHTML = userDisplay + logoutButton;
            
            document.querySelectorAll('#logout-btn').forEach(btn => btn.addEventListener('click', () => auth.signOut()));
            
            if(loginBtn) loginBtn.style.display = 'none';
            if(mobileLoginBtn) mobileLoginBtn.style.display = 'none';
            if(loginCard) loginCard.style.display = 'none';
        } else {
            if (userArea) userArea.innerHTML = '';
            if (mobileUserArea) mobileUserArea.innerHTML = '';

            if(loginBtn) loginBtn.style.display = 'block';
            if(mobileLoginBtn) mobileLoginBtn.style.display = 'block';
            if(loginCard) loginCard.style.display = 'block';
        }
    }

    // --- 3. CARGA DE PLANTILLAS Y EJECUCIÓN ---
    const navContainer = document.getElementById("nav-container");
    const footerContainer = document.getElementById("footer-container");
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    const navPromise = navContainer ?
        fetch("nav.html")
            .then(response => {
                if (!response.ok) throw new Error("nav.html not found");
                return response.text();
            })
            .then(html => {
                navContainer.innerHTML = html;
                updateActiveLink(currentPage);
                setupMobileMenu();
                setupLoginModal();
            })
        : Promise.resolve();

    const footerPromise = footerContainer ?
        fetch("footer.html")
            .then(response => response.ok ? response.text() : "")
            .then(html => footerContainer.innerHTML = html)
        : Promise.resolve();

    // --- 4. SEÑAL DE "LISTO" ---
    Promise.all([navPromise, footerPromise]).then(() => {
        auth.onAuthStateChanged(updateUserUI);
        updateUserUI(auth.currentUser);

        window.firebaseReady = true;
        document.dispatchEvent(new Event('firebaseReady'));
        console.log("Plantilla.js: Firebase and UI templates are ready. Event 'firebaseReady' dispatched.");
    }).catch(error => {
        console.error("Error loading templates:", error);
        window.firebaseReady = true;
        document.dispatchEvent(new Event('firebaseReady'));
        console.warn("Plantilla.js: 'firebaseReady' dispatched despite template loading errors.");
    });
});
