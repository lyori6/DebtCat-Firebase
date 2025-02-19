document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.menu-button');
    const menuIcon = document.querySelector('.menu-icon');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuButton && navMenu) {
        let isMenuOpen = false;

        const updateMenuState = (open) => {
            isMenuOpen = open;
            menuButton.classList.toggle('active', open);
            navMenu.classList.toggle('active', open);
            menuButton.setAttribute('aria-expanded', open);
            // Let CSS handle menu icon animation via active class
        };

        // Initialize ARIA attributes
        menuButton.setAttribute('aria-controls', 'nav-menu');
        menuButton.setAttribute('aria-expanded', 'false');
        navMenu.id = 'nav-menu';

        menuButton.addEventListener('click', function() {
            updateMenuState(!isMenuOpen);
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (isMenuOpen && !menuButton.contains(event.target) && !navMenu.contains(event.target)) {
                updateMenuState(false);
            }
        });

        // Close menu when window is resized beyond mobile breakpoint
        window.addEventListener('resize', function() {
            if (window.innerWidth > 991 && isMenuOpen) {
                updateMenuState(false);
            }
        });

        // Handle escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && isMenuOpen) {
                updateMenuState(false);
            }
        });
    }
});
