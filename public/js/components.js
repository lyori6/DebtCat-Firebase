// Component loading states
const loadingStates = {
    header: `
        <div class="navbar" role="banner">
            <div class="navbar-container">
                <div class="navbar-content">
                    <a href="/" class="navbar-brand">DebtCat</a>
                </div>
            </div>
        </div>
    `,
    footer: `
        <footer class="site-footer">
            <div class="footer-container">
                <p class="copyright">© 2025 DebtCat</p>
            </div>
        </footer>
    `
};

// Utility function to load HTML components
async function loadComponent(elementId, componentPath) {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Show loading state
    element.innerHTML = loadingStates[elementId] || '';

    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        element.innerHTML = html;
    } catch (error) {
        console.error(`Error loading ${elementId}:`, error);
        // Keep the loading state as fallback
        // Log error if debug logging is available
        window.debugLog?.error?.(`Component loading error (${elementId}): ${error.message}`);
    }
}

// Load header and footer components
document.addEventListener('DOMContentLoaded', () => {
    // Determine which header to load based on the current page
    const isArticlesPage = window.location.pathname === '/articles.html';
    const headerPath = isArticlesPage ? '/components/header-white.html' : '/components/header.html';

    // Load components sequentially to ensure header appears first
    loadComponent('header', headerPath)
        .then(() => loadComponent('footer', '/components/footer.html'))
        .catch(error => {
            console.error('Error in component loading sequence:', error);
            window.debugLog?.error?.(`Component sequence error: ${error.message}`);
        });
});
