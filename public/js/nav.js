document.addEventListener('DOMContentLoaded', () => {
    // Add white variant class to header on articles page
    if (window.location.pathname === '/articles.html') {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.classList.add('navbar-white');
            // Also update the logo to white version
            const logo = navbar.querySelector('.navbar-brand img');
            if (logo) {
                logo.src = '/images/debtcat-logo-inverse.svg';
            }
        }
    }
});
