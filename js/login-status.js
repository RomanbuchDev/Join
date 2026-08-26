/**
 * Redirect protection for pages that require a login.
 * Usage: add <script src="../js/login-status.js"></script> to the page's <head>.
 * No further setup needed — runs automatically on load.
 */


/**
 * Checks whether a user is currently logged in.
 * Redirects to the login page if no user is found in localStorage.
 * @returns {boolean} True if a user is logged in, false otherwise.
 */
function loginStatus() {
    let currentUser;
    try {
        currentUser = JSON.parse(localStorage.getItem("currentUser"));
    } catch (error) {
        currentUser = null;
    }
    if (!currentUser) {
        window.location.href = "../index.html";
        return false;
    }
    return true;
}


loginStatus();