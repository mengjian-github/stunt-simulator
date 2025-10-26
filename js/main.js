// Stunt Simulator - Main JavaScript
// Handles fullscreen, analytics, and user interactions

(function() {
    'use strict';

    let gameSlug = 'stunt-simulator-2';

    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        gameSlug = document.body.dataset.gameSlug || 'stunt-simulator-2';
        initFullscreen();
        initSmoothScroll();
        initAnalytics();
        initGameTracking();
        initLazyLoad();
        initScrollSpy();
        welcomeMessage();
    }

    // ========== Fullscreen Functionality ==========
    function initFullscreen() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const gameContainer = document.querySelector('.game-container');

        if (!fullscreenBtn || !gameContainer) return;

        fullscreenBtn.textContent = '🗖 Enter Fullscreen';

        fullscreenBtn.addEventListener('click', toggleFullscreen);

        // Listen for fullscreen change events
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        function toggleFullscreen() {
            if (!isFullscreen()) {
                requestFullscreen(gameContainer);
                fullscreenBtn.textContent = '🗙 Exit Fullscreen';
            } else {
                exitFullscreen();
                fullscreenBtn.textContent = '🗖 Enter Fullscreen';
            }

            // Track fullscreen toggle
            trackEvent('fullscreen_toggle', {
                event_category: 'game_interaction',
                event_label: gameSlug
            });
        }

        function isFullscreen() {
            return !!(document.fullscreenElement ||
                     document.webkitFullscreenElement ||
                     document.mozFullScreenElement ||
                     document.msFullscreenElement);
        }

        function requestFullscreen(element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        }

        function exitFullscreen() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }

        function handleFullscreenChange() {
            if (!isFullscreen()) {
                fullscreenBtn.textContent = '🗖 Enter Fullscreen';
            }
        }
    }

    // ========== Smooth Scrolling ==========
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                // Skip if it's just '#'
                if (href === '#') {
                    return;
                }

                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Update URL without jumping
                    history.pushState(null, null, href);
                }
            });
        });
    }

    // ========== Analytics Tracking ==========
    function initAnalytics() {
        // Track page view
        trackPageView();

        // Track time on page
        trackTimeOnPage();

        // Track scroll depth
        trackScrollDepth();
    }

    function trackPageView() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }
    }

    function trackTimeOnPage() {
        const startTime = Date.now();

        window.addEventListener('beforeunload', function() {
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
            trackEvent('time_on_page', {
                event_category: 'engagement',
                event_label: 'stunt_simulator',
                value: timeSpent
            });
        });
    }

    function trackScrollDepth() {
        let maxScroll = 0;
        const throttledScroll = throttle(function() {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;

                // Track at 25%, 50%, 75%, 100%
                if ([25, 50, 75, 100].includes(scrollPercent)) {
                    trackEvent('scroll_depth', {
                        event_category: 'engagement',
                        event_label: scrollPercent + '%',
                        value: scrollPercent
                    });
                }
            }
        }, 500);

        window.addEventListener('scroll', throttledScroll);
    }

    // ========== Game Tracking ==========
    function initGameTracking() {
        const gameIframe = document.querySelector('.game-iframe');

        if (gameIframe) {
            // Track when game loads
            gameIframe.addEventListener('load', function() {
                trackEvent('game_loaded', {
                    event_category: 'game',
                    event_label: gameSlug
                });
            });

            // Track game clicks
            gameIframe.addEventListener('click', function() {
                trackEvent('game_interaction', {
                    event_category: 'game',
                    event_label: gameSlug
                });
            });
        }

        // Track related game card clicks
        document.querySelectorAll('.game-card').forEach(function(card, index) {
            card.addEventListener('click', function() {
                const gameName = this.querySelector('h3')?.textContent || 'Unknown';
                trackEvent('related_game_click', {
                    event_category: 'navigation',
                    event_label: gameName,
                    value: index + 1
                });
            });
        });

        // Track CTA button clicks
        document.querySelectorAll('.btn').forEach(function(btn) {
            if (btn.id !== 'fullscreenBtn') {
                btn.addEventListener('click', function() {
                    trackEvent('cta_click', {
                        event_category: 'engagement',
                        event_label: this.textContent.trim()
                    });
                });
            }
        });
    }

    // ========== Lazy Loading ==========
    function initLazyLoad() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(function(img) {
                imageObserver.observe(img);
            });
        }
    }

    // ========== Utility Functions ==========
    function trackEvent(eventName, params) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, params);
        }
    }

    function throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function welcomeMessage() {
        const styles = [
            'color: #e74c3c',
            'font-size: 20px',
            'font-weight: bold'
        ].join(';');

        console.log('%c🏎️ Welcome to Stunt Simulator! 🏎️', styles);
        console.log('%cEnjoy the game and perform amazing stunts!', 'color: #2c3e50; font-size: 14px;');
    }

    // ========== Prevent Context Menu on Game ==========
    const gameIframe = document.querySelector('.game-iframe');
    if (gameIframe) {
        gameIframe.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    }

    // ========== Handle Resize ==========
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Handle any responsive adjustments
            console.log('Window resized');
        }, 250);
    });

    // ========== Navigation Active State ==========
    function updateActiveNav() {
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav a').forEach(link => {
            const linkPath = new URL(link.getAttribute('href'), window.location.origin).pathname;
            if (linkPath === currentPath || (linkPath === '/' && (currentPath === '/' || currentPath === '/index.html'))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    updateActiveNav();

    // ========== Scroll Spy for Navigation ==========
    function initScrollSpy() {
        const sections = document.querySelectorAll('[id]');
        const navLinks = document.querySelectorAll('.nav a[href^="#"]');

        if (sections.length === 0 || navLinks.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        const href = link.getAttribute('href');
                        if (href === `#${id}`) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        sections.forEach(section => observer.observe(section));
    }

})();
