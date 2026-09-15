(function () {
    let animationFrame = null;
    let observer = null;

    function getSidebar() {
        return document.querySelector(
            ".md-sidebar--primary .md-sidebar__scrollwrap"
        );
    }

    function getActiveLink() {
        return document.querySelector(
            '.md-sidebar--primary [data-md-component="toc"] .md-nav__link--active'
        );
    }

    function scrollToActive() {
        const sidebar = getSidebar();
        const active = getActiveLink();

        if (!sidebar || !active) return;

        const sidebarRect = sidebar.getBoundingClientRect();
        const activeRect = active.getBoundingClientRect();

        const margin = 60;

        let target = null;

        if (activeRect.top < sidebarRect.top + margin) {
            target =
                sidebar.scrollTop +
                activeRect.top -
                sidebarRect.top -
                margin;
        }

        else if (activeRect.bottom > sidebarRect.bottom - margin) {
            target =
                sidebar.scrollTop +
                activeRect.bottom -
                sidebarRect.bottom +
                margin;
        }

        if (target === null) return;

        target = Math.max(
            0,
            Math.min(
                target,
                sidebar.scrollHeight - sidebar.clientHeight
            )
        );

        // Cancel previous animation
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }

        const start = sidebar.scrollTop;
        const distance = target - start;

        // Very short animation: 120 ms
        const duration = 120;
        const startTime = performance.now();

        function animate(time) {
            const progress = Math.min(
                (time - startTime) / duration,
                1
            );

            // ease-out
            const eased = 1 - Math.pow(1 - progress, 3);

            sidebar.scrollTop = start + distance * eased;

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                animationFrame = null;
            }
        }

        animationFrame = requestAnimationFrame(animate);
    }

    function init() {
        const toc = document.querySelector(
            '.md-sidebar--primary [data-md-component="toc"]'
        );

        if (!toc) return;

        // Disconnect an old observer
        if (observer) {
            observer.disconnect();
        }

        observer = new MutationObserver(() => {
            scrollToActive();
        });

        observer.observe(toc, {
            subtree: true,
            attributes: true,
            attributeFilter: ["class"]
        });

        setTimeout(scrollToActive, 100);
    }

    if (typeof document$ !== "undefined") {
        document$.subscribe(() => {
            setTimeout(init, 50);
        });
    } else {
        document.addEventListener("DOMContentLoaded", init);
    }
})();