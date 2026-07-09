// Stunt Simulator - Main JavaScript
// Handles fullscreen, analytics, and user interactions

(function() {
    'use strict';

    let gameSlug = 'stunt-simulator';
    let gameVariant = 'stunt-simulator-2';

    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        gameSlug = document.body.dataset.gameSlug || 'stunt-simulator';
        gameVariant = document.body.dataset.gameVariant || gameSlug;
        window.__moxiReviewProps = {
            moxi_review: 'auto_optimization_20260709',
            viewport_bucket: getViewportBucket()
        };
        initFullscreen();
        initSmoothScroll();
        initAnalytics();
        initGameTracking();
        initLazyLoad();
        initScrollSpy();
        initEngagementTimeEvents();
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
            trackEvent('fullscreen_click', {
                event_category: 'game_interaction',
                event_label: gameSlug,
                variant: gameVariant
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

    // ========== Engagement Time Events ==========
    function initEngagementTimeEvents() {
        const thresholds = [10, 30, 60, 120, 180, 300];
        const startTime = Date.now();
        const fired = {};

        function check() {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            thresholds.forEach(function(sec) {
                if (elapsed >= sec && !fired[sec]) {
                    fired[sec] = true;
                    trackEvent('engagement_time_seconds', {
                        event_category: 'engagement',
                        event_label: sec + 's',
                        value: sec
                    });
                }
            });
        }

        const interval = window.setInterval(check, 5000);
        window.addEventListener('beforeunload', function() {
            window.clearInterval(interval);
            check();
        });
    }

    // ========== Game Tracking ==========
    function initGameTracking() {
        const gameIframe = document.querySelector('.game-iframe');
        const gameStatus = document.getElementById('gameStatus');
        const startGameBtn = document.getElementById('startGameBtn');

        if (gameIframe) {
            let iframeLoaded = false;
            let playStarted = false;
            const timeoutMs = 12000;

            if (startGameBtn) {
                startGameBtn.addEventListener('click', function() {
                    if (playStarted) return;
                    playStarted = true;
                    iframeLoaded = false;
                    const src = gameIframe.dataset.gameSrc || gameIframe.getAttribute('src');
                    if (src) {
                        gameIframe.setAttribute('src', src);
                    }
                    if (gameStatus) {
                        gameStatus.innerHTML = '<strong>Loading the Stunt Simulator player…</strong><span>If WebGL or the school network blocks the embed, use a fallback below instead of staring at an error screen.</span><div class="status-actions"><a href="#loading-checklist">Loading checklist</a><a class="direct-play-link" href="https://unblocked-games.s3.amazonaws.com/games/2021/unity3/stunt-simulator-2/index.html" target="_blank" rel="noopener">Direct play</a></div>';
                    }
                    trackEvent('play_start', {
                        event_category: 'game',
                        event_label: gameSlug,
                        variant: gameVariant,
                        source: 'embedded_iframe_start_button'
                    });
                    trackEvent('tool_start', {
                        event_category: 'game',
                        event_label: gameSlug,
                        variant: gameVariant,
                        source: 'embedded_iframe_start_button'
                    });
                    window.setTimeout(function() {
                        if (playStarted && !iframeLoaded) {
                            showGameFallback('embed_timeout', 'The player is taking too long. Try Direct Play, Original Stunt Simulator, Multiplayer, or WebGL Help.');
                        }
                    }, timeoutMs);
                });
            }

            gameIframe.addEventListener('load', function() {
                if (!playStarted) return;
                iframeLoaded = true;
                if (gameStatus) {
                    gameStatus.classList.add('is-loaded');
                    gameStatus.innerHTML = '<strong>Player frame loaded.</strong><span>If the Unity/WebGL screen inside the frame still reports a compatibility error, use Try Direct Play or the fallback cards.</span><div class="status-actions"><a href="#controls">Controls</a><a href="#fallbacks">Fallbacks</a></div>';
                }
                trackEvent('iframe_loaded', {
                    event_category: 'game',
                    event_label: gameSlug,
                    variant: gameVariant,
                    source: 'iframe_load_event'
                });
                trackEvent('game_loaded', {
                    event_category: 'game',
                    event_label: gameSlug,
                    variant: gameVariant,
                    source: 'iframe_load_event'
                });
                window.setTimeout(function() {
                    if (playStarted && iframeLoaded && !document.hidden) {
                        trackEvent('qualified_play_session', {
                            event_category: 'game',
                            event_label: gameSlug,
                            variant: gameVariant,
                            source: 'iframe_visible_45s',
                            value: 45
                        });
                        trackEvent('conversion_goal', {
                            event_category: 'game',
                            event_label: gameSlug,
                            variant: gameVariant,
                            goal_type: 'qualified_play_session',
                            source: 'iframe_visible_45s',
                            value: 1
                        });
                    }
                }, 45000);
            });

            gameIframe.addEventListener('error', function() {
                showGameFallback('iframe_error', 'The embedded player failed to load. Try Direct Play or choose another fallback.');
            });

            // Track game clicks
            gameIframe.addEventListener('click', function() {
                trackEvent('game_interaction', {
                    event_category: 'game',
                    event_label: gameSlug
                });
            });
        }

        document.querySelectorAll('.direct-play-link').forEach(function(link) {
            link.addEventListener('click', function() {
                trackEvent('direct_play_click', {
                    event_category: 'game_fallback',
                    event_label: gameSlug,
                    variant: gameVariant,
                    destination: this.getAttribute('href') || ''
                });
                trackEvent('conversion_goal', {
                    event_category: 'game',
                    event_label: gameSlug,
                    variant: gameVariant,
                    goal_type: 'direct_play_fallback',
                    destination: this.getAttribute('href') || '',
                    value: 1
                });
            });
        });

        document.querySelectorAll('.route-card, .path-card').forEach(function(card) {
            card.addEventListener('click', function() {
                trackEvent('route_intent_click', {
                    event_category: 'navigation',
                    event_label: this.querySelector('strong, h3')?.textContent || 'route_card',
                    destination: this.getAttribute('href') || '',
                    location: this.closest('[id]')?.id || 'route_grid',
                    game: gameSlug,
                    variant: gameVariant
                });
            });
        });

        document.querySelectorAll('.intent-card, .answer-card').forEach(function(card) {
            card.addEventListener('click', function() {
                trackEvent('seo_help_card_click', {
                    event_category: 'content_engagement',
                    event_label: this.querySelector('strong')?.textContent || 'help_card',
                    game: gameSlug,
                    variant: gameVariant,
                    location: this.closest('.intent-panel') ? 'intent_panel' : 'answer_panel'
                });
            });
        });

        document.querySelectorAll('.fallback-card').forEach(function(link) {
            link.addEventListener('click', function() {
                const href = this.getAttribute('href') || '';
                let eventName = 'fallback_click';
                if (href.includes('/games/stunt-simulator')) eventName = 'fallback_original_click';
                if (href === '#webgl-help') eventName = 'webgl_help_view';
                if (href.includes('play-google')) eventName = 'mobile_google_click';
                const props = {
                    event_category: 'game_fallback',
                    event_label: this.querySelector('strong')?.textContent || 'fallback',
                    game: gameSlug,
                    variant: gameVariant,
                    destination: href
                };
                trackEvent('fallback_click', props);
                if (eventName !== 'fallback_click') {
                    trackEvent(eventName, props);
                }
            });
        });

        if (gameStatus) {
            trackEvent('game_ready_panel_view', {
                event_category: 'game',
                event_label: gameSlug,
                variant: gameVariant,
                source: 'visible_above_fold_status'
            });
        }

        if (document.getElementById('loading-checklist')) {
            trackEvent('loading_checklist_view', {
                event_category: 'game_fallback',
                event_label: gameSlug,
                variant: gameVariant,
                source: 'homepage_loading_help'
            });
        }

        if (document.getElementById('google-ranking-action')) {
            trackEvent('seo_answer_panel_view', {
                event_category: 'content_engagement',
                event_label: 'stunt_simulator_google_rank_support',
                game: gameSlug,
                variant: gameVariant,
                source: '20260708_internal_optimization'
            });
        }

        if (document.getElementById('stunt-simulator-quick-answer-20260708')) {
            trackEvent('answer_first_panel_view', {
                event_category: 'content_engagement',
                event_label: 'stunt_simulator_quick_answer',
                game: gameSlug,
                variant: gameVariant,
                source: '20260708_internal_optimization'
            });
        }

        document.addEventListener('click', function(event) {
            const statusLink = event.target.closest('.game-status .status-actions a');
            if (!statusLink) return;
            trackEvent('game_status_action_click', {
                event_category: 'game_fallback',
                event_label: statusLink.textContent.trim(),
                game: gameSlug,
                variant: gameVariant,
                destination: statusLink.getAttribute('href') || ''
            });
        });

        function showGameFallback(reason, message) {
            if (gameStatus) {
                gameStatus.classList.add('is-error');
                gameStatus.innerHTML = '<strong>Having trouble loading Stunt Simulator?</strong><span>' + message + '</span><div class="status-actions"><a class="direct-play-link" href="https://unblocked-games.s3.amazonaws.com/games/2021/unity3/stunt-simulator-2/index.html" target="_blank" rel="noopener">Direct play</a><a href="/games/stunt-simulator">Classic</a><a href="/games/madalin-stunt-cars-2">Multiplayer</a><a href="#webgl-help">WebGL help</a></div>';
            }
            trackEvent('game_error', {
                event_category: 'game',
                event_label: gameSlug,
                variant: gameVariant,
                reason: reason
            });
        }

        // Track related game card clicks
        document.querySelectorAll('.game-card').forEach(function(card, index) {
            card.addEventListener('click', function() {
                const gameName = this.querySelector('h3')?.textContent || 'Unknown';
                trackEvent('tool_entry_click', {
                    event_category: 'navigation',
                    event_label: gameName,
                    location: 'related_game_card',
                    value: index + 1
                });
            });
        });

        // Track CTA button clicks
        document.querySelectorAll('.btn').forEach(function(btn) {
            if (btn.id !== 'fullscreenBtn') {
                btn.addEventListener('click', function() {
                    const label = this.textContent.trim();
                    trackEvent(label.toLowerCase().includes('restart') || label.toLowerCase().includes('reload') ? 'tool_start_click' : 'cta_click', {
                        event_category: 'engagement',
                        event_label: label,
                        location: this.id || 'button'
                    });
                });
            }
        });

        // Track key navigation and outbound clicks
        document.querySelectorAll('a[href]').forEach(function(link) {
            link.addEventListener('click', function() {
                const href = this.getAttribute('href') || '';
                const label = this.textContent.trim().replace(/\s+/g, ' ').slice(0, 80) || href;
                const isExternal = /^https?:\/\//.test(href) || href.startsWith('mailto:');
                const isToolEntry = href.includes('unblocked') || href.includes('play-google') || href.includes('/games/') || href === '/#play' || href === '#play';

                if (isExternal) {
                    trackEvent('outbound_click', {
                        event_category: 'navigation',
                        event_label: label,
                        destination: href,
                        location: this.closest('.footer') ? 'footer' : 'content'
                    });
                    if (href.includes('utm_campaign=stuntsimulator_owned_network_202607')) {
                        trackEvent('owned_network_click', {
                            event_category: 'external_distribution_utm',
                            event_label: label,
                            destination: href,
                            source_site: 'stunt-simulator.com',
                            campaign: 'stuntsimulator_owned_network_202607'
                        });
                    }
                    return;
                }

                if (isToolEntry) {
                    trackEvent('tool_entry_click', {
                        event_category: 'navigation',
                        event_label: label,
                        destination: href,
                        location: this.closest('.header') ? 'header' : this.closest('.footer') ? 'footer' : 'content'
                    });
                    if (href.includes('play-google')) {
                        trackEvent('mobile_google_click', {
                            event_category: 'navigation',
                            event_label: label,
                            destination: href,
                            location: this.closest('.header') ? 'header' : this.closest('.footer') ? 'footer' : 'content'
                        });
                    }
                    return;
                }

                if (href.startsWith('#') || href.startsWith('/')) {
                    trackEvent('navigation_click', {
                        event_category: 'navigation',
                        event_label: label,
                        destination: href,
                        location: this.closest('.header') ? 'header' : this.closest('.footer') ? 'footer' : 'content'
                    });
                }
            });
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
        try {
            params = Object.assign({}, window.__moxiReviewProps || {}, params || {});
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, params);
            }

            if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
                const props = {};
                Object.entries(params || {}).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        props[key] = value;
                    }
                });
                props.page = window.location.pathname || '/';
                props.game = props.game || gameSlug;
                props.variant = props.variant || gameVariant;
                window.plausible(eventName, { props });
            }
        } catch (e) {
            if (window.console) console.error('trackEvent', eventName, e);
        }
    }

    function getViewportBucket() {
        const width = window.innerWidth || document.documentElement.clientWidth || 0;
        if (width <= 390) return 'mobile_390';
        if (width <= 480) return 'mobile';
        if (width <= 768) return 'tablet';
        return 'desktop';
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
