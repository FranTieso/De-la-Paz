
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
    
    const event = new Event('firebaseReady');
    document.dispatchEvent(event);

    // --- 2. CARGA DE PLANTILLAS (NAV Y FOOTER) ---
    const navContainer = document.getElementById("nav-container");
    const footerContainer = document.getElementById("footer-container");

    const loadTemplate = (url, container) => {
        if (container) {
            return fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
                    return response.text();
                })
                .then(html => {
                    container.innerHTML = html;
                });
        }
        return Promise.resolve();
    };

    Promise.all([loadTemplate("/nav.html", navContainer), loadTemplate("/footer.html", footerContainer)])
        .then(() => {
            console.log("Navigation and footer loaded successfully.");
            // Una vez cargado el nav, configuramos sus elementos interactivos
            setupNavInteractions();
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
});
