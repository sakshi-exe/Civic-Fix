/* Shared page behavior for CivicFix */

document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.querySelector(".menu-btn");
    const navLinks = document.querySelector(".nav-links");
    const loader = document.getElementById("loader");
    const header = document.querySelector("header");
    const page = document.body.dataset.page;

    if (page) {
        document.body.classList.add(page);
    }

    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });

        document.querySelectorAll(".nav-links a").forEach((link) => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
            });
        });
    }

    if (header) {
        const toggleHeader = () => {
            header.classList.toggle("scrolled", window.scrollY > 40);
        };

        toggleHeader();
        window.addEventListener("scroll", toggleHeader, { passive: true });
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
