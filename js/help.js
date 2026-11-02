// JavaScript file for help page

/**
 * Redirects to the previous project page.
 */
function backToLastPage() {
    const referrer = document.referrer;

    if (referrer && referrer.includes("html")) {
        history.back();
    } else {
        window.location.href = "summary.html";
    }
}
