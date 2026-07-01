/* Shared page behavior for CivicFix */

document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.querySelector(".menu-btn");
    const navLinks = document.querySelector(".nav-links");
    const loader = document.getElementById("loader");

    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }

    if (loader) {
        window.addEventListener("load", () => {
            loader.classList.add("loader-hidden");
        });
    }

    if (window.AOS) {
        AOS.init({
            duration: 700,
            easing: "ease-out-cubic",
            once: true,
        });
    }
});
