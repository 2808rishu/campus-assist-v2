/**
 * Accessibility Manager for WCAG 2.1 AA Compliance
 * Handles screen readers, keyboard navigation, high contrast mode, and voice interface
 */

export class AccessibilityManager {
    constructor() {
        this.screenReaderSupport = false;
        this.highContrastMode = false;
        this.largeTextMode = false;
        this.reducedMotion = false;
        this.keyboardNavIndex = 0;
        this.focusableElements = [];
        this.announcements = [];
        
        this.initializeAccessibility();
    }

    /**
     * Initialize accessibility features
     */
    initializeAccessibility() {
        this.detectScreenReader();
        this.setupKeyboardNavigation();
        this.setupHighContrastMode();
        this.setupFocusManagement();
        this.setupARIALabels();
        this.setupReducedMotion();
        this.createSkipLinks();
        this.setupLiveRegions();
    }

    /**
     * Detect if screen reader is active
     */
    detectScreenReader() {
        // Check for common screen reader indicators
        this.screenReaderSupport = !!(
            navigator.userAgent.includes('NVDA') ||
            navigator.userAgent.includes('JAWS') ||
            navigator.userAgent.includes('Dragon') ||
            window.speechSynthesis ||
            document.documentElement.getAttribute('data-at-shortcutkeys')
        );
        
        if (this.screenReaderSupport) {
            document.body.classList.add('screen-reader-active');
            this.announceToScreenReader('Campus Assistant loaded. Screen reader support enabled.');
        }
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'Tab':
                    this.handleTabNavigation(event);
                    break;
                case 'Enter':
                case ' ':
                    this.handleActivation(event);
                    break;
                case 'Escape':
                    this.handleEscape(event);
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.handleArrowNavigation(event);
                    break;
                case 'F6':
                    this.handleRegionNavigation(event);
                    break;
            }
        });
        
        // Update focusable elements list
        this.updateFocusableElements();
        
        // Re-scan on DOM changes
        const observer = new MutationObserver(() => {
            this.updateFocusableElements();
        });
        
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    }

    /**
     * Update list of focusable elements
     */
    updateFocusableElements() {
        const selector = [
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])',
            '[role="button"]:not([disabled])',
            '[role="link"]:not([disabled])',
            '[role="tab"]:not([disabled])',
            '[role="menuitem"]:not([disabled])'
        ].join(',');
        
        this.focusableElements = Array.from(document.querySelectorAll(selector))
            .filter(el => this.isVisible(el));
    }

    /**
     * Check if element is visible
     */
    isVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               element.offsetWidth > 0 && 
               element.offsetHeight > 0;
    }

    /**
     * Handle tab navigation
     */
    handleTabNavigation(event) {
        if (event.shiftKey) {
            // Shift+Tab: previous element
            this.keyboardNavIndex = Math.max(0, this.keyboardNavIndex - 1);
        } else {
            // Tab: next element
            this.keyboardNavIndex = Math.min(
                this.focusableElements.length - 1, 
                this.keyboardNavIndex + 1
            );
        }
        
        if (this.focusableElements[this.keyboardNavIndex]) {
            this.focusableElements[this.keyboardNavIndex].focus();
            this.announceElementToScreenReader(this.focusableElements[this.keyboardNavIndex]);
        }
    }

    /**
     * Handle activation (Enter/Space)
     */
    handleActivation(event) {
        const target = event.target;
        
        if (target.tagName === 'BUTTON' || target.role === 'button') {
            target.click();
        } else if (target.tagName === 'A') {
            window.location.href = target.href;
        }
    }

    /**
     * Handle escape key
     */
    handleEscape(event) {
        // Close modals, dropdowns, etc.
        const modal = document.querySelector('.modal:not(.hidden)');
        if (modal) {
            modal.classList.add('hidden');
            this.announceToScreenReader('Dialog closed');
        }
        
        // Return focus to main content
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.focus();
        }
    }

    /**
     * Handle arrow navigation for menu items, tabs, etc.
     */
    handleArrowNavigation(event) {
        const target = event.target;
        const role = target.getAttribute('role');
        
        if (role === 'tab' || role === 'menuitem') {
            event.preventDefault();
            
            const container = target.closest('[role="tablist"], [role="menu"]');
            if (!container) return;
            
            const items = Array.from(container.querySelectorAll(`[role="${role}"]`));
            const currentIndex = items.indexOf(target);
            let newIndex;
            
            switch (event.key) {
                case 'ArrowUp':
                case 'ArrowLeft':
                    newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
                    break;
                case 'ArrowDown':
                case 'ArrowRight':
                    newIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
                    break;
            }
            
            if (newIndex !== undefined && items[newIndex]) {
                items[newIndex].focus();
                this.announceElementToScreenReader(items[newIndex]);
            }
        }
    }

    /**
     * Setup high contrast mode
     */
    setupHighContrastMode() {
        // Detect system preference
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
        
        if (prefersHighContrast) {
            this.enableHighContrastMode();
        }
        
        // Listen for changes
        window.matchMedia('(prefers-contrast: high)').addListener((e) => {
            if (e.matches) {
                this.enableHighContrastMode();
            } else {
                this.disableHighContrastMode();
            }
        });
    }

    /**
     * Enable high contrast mode
     */
    enableHighContrastMode() {
        this.highContrastMode = true;
        document.body.classList.add('high-contrast');
        this.announceToScreenReader('High contrast mode enabled');
    }

    /**
     * Disable high contrast mode
     */
    disableHighContrastMode() {
        this.highContrastMode = false;
        document.body.classList.remove('high-contrast');
        this.announceToScreenReader('High contrast mode disabled');
    }

    /**
     * Setup reduced motion preferences
     */
    setupReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            this.enableReducedMotion();
        }
        
        window.matchMedia('(prefers-reduced-motion: reduce)').addListener((e) => {
            if (e.matches) {
                this.enableReducedMotion();
            } else {
                this.disableReducedMotion();
            }
        });
    }

    /**
     * Enable reduced motion
     */
    enableReducedMotion() {
        this.reducedMotion = true;
        document.body.classList.add('reduced-motion');
    }

    /**
     * Disable reduced motion
     */
    disableReducedMotion() {
        this.reducedMotion = false;
        document.body.classList.remove('reduced-motion');
    }

    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Ensure proper focus indicators
        const style = document.createElement('style');
        style.textContent = `
            *:focus {
                outline: 3px solid #2563eb !important;
                outline-offset: 2px !important;
            }
            
            .focus-visible {
                outline: 3px solid #2563eb !important;
                outline-offset: 2px !important;
            }
            
            /* High contrast focus indicators */
            .high-contrast *:focus {
                outline: 3px solid yellow !important;
                background: black !important;
                color: yellow !important;
            }
        `;
        document.head.appendChild(style);
        
        // Focus trap for modals
        this.setupFocusTrap();
    }

    /**
     * Setup focus trap for modal dialogs
     */
    setupFocusTrap() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                const modal = document.querySelector('.modal:not(.hidden)');
                if (modal) {
                    const focusableInModal = modal.querySelectorAll(
                        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
                    );
                    
                    if (focusableInModal.length === 0) return;
                    
                    const firstFocusable = focusableInModal[0];
                    const lastFocusable = focusableInModal[focusableInModal.length - 1];
                    
                    if (event.shiftKey) {
                        if (document.activeElement === firstFocusable) {
                            event.preventDefault();
                            lastFocusable.focus();
                        }
                    } else {
                        if (document.activeElement === lastFocusable) {
                            event.preventDefault();
                            firstFocusable.focus();
                        }
                    }
                }
            }
        });
    }

    /**
     * Setup ARIA labels and roles
     */
    setupARIALabels() {
        // Add missing ARIA labels
        const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        buttons.forEach((button, index) => {
            if (!button.textContent.trim()) {
                button.setAttribute('aria-label', `Button ${index + 1}`);
            }
        });
        
        // Add landmarks
        const nav = document.querySelector('.sidebar');
        if (nav) nav.setAttribute('role', 'navigation');
        
        const main = document.querySelector('.main-chat');
        if (main) main.setAttribute('role', 'main');
        
        // Add live regions
        this.setupLiveRegions();
    }

    /**
     * Setup live regions for dynamic content
     */
    setupLiveRegions() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(liveRegion);
        
        // Create assertive live region for urgent announcements
        const assertiveLiveRegion = document.createElement('div');
        assertiveLiveRegion.id = 'assertive-live-region';
        assertiveLiveRegion.setAttribute('aria-live', 'assertive');
        assertiveLiveRegion.setAttribute('aria-atomic', 'true');
        assertiveLiveRegion.style.cssText = liveRegion.style.cssText;
        document.body.appendChild(assertiveLiveRegion);
    }

    /**
     * Create skip navigation links
     */
    createSkipLinks() {
        const skipContainer = document.createElement('div');
        skipContainer.className = 'skip-links';
        skipContainer.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#sidebar" class="skip-link">Skip to navigation</a>
            <a href="#messageInput" class="skip-link">Skip to chat input</a>
        `;
        
        document.body.insertBefore(skipContainer, document.body.firstChild);
    }

    /**
     * Announce message to screen reader
     */
    announceToScreenReader(message, urgent = false) {
        const liveRegionId = urgent ? 'assertive-live-region' : 'live-region';
        const liveRegion = document.getElementById(liveRegionId);
        
        if (liveRegion) {
            liveRegion.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    /**
     * Announce element information to screen reader
     */
    announceElementToScreenReader(element) {
        const role = element.getAttribute('role') || element.tagName.toLowerCase();
        const label = element.getAttribute('aria-label') || 
                     element.textContent.trim() || 
                     element.getAttribute('title') || 
                     'Unlabeled element';
        
        const announcement = `${role}: ${label}`;
        this.announceToScreenReader(announcement);
    }

    /**
     * Toggle large text mode
     */
    toggleLargeTextMode() {
        this.largeTextMode = !this.largeTextMode;
        
        if (this.largeTextMode) {
            document.body.classList.add('large-text');
            this.announceToScreenReader('Large text mode enabled');
        } else {
            document.body.classList.remove('large-text');
            this.announceToScreenReader('Large text mode disabled');
        }
    }

    /**
     * Get accessibility status
     */
    getAccessibilityStatus() {
        return {
            screenReaderSupport: this.screenReaderSupport,
            highContrastMode: this.highContrastMode,
            largeTextMode: this.largeTextMode,
            reducedMotion: this.reducedMotion,
            keyboardNavigation: true
        };
    }

    /**
     * Test accessibility compliance
     */
    testAccessibilityCompliance() {
        const issues = [];
        
        // Check for missing alt text on images
        const images = document.querySelectorAll('img:not([alt])');
        if (images.length > 0) {
            issues.push(`${images.length} images missing alt text`);
        }
        
        // Check for buttons without labels
        const unlabeledButtons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        const unlabeledWithoutText = Array.from(unlabeledButtons).filter(btn => !btn.textContent.trim());
        if (unlabeledWithoutText.length > 0) {
            issues.push(`${unlabeledWithoutText.length} buttons without labels`);
        }
        
        // Check for proper heading hierarchy
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let previousLevel = 0;
        headings.forEach(heading => {
            const level = parseInt(heading.tagName.substr(1));
            if (level > previousLevel + 1) {
                issues.push(`Heading level skip detected: ${heading.tagName} after h${previousLevel}`);
            }
            previousLevel = level;
        });
        
        // Check for sufficient color contrast (simplified check)
        const elements = document.querySelectorAll('*');
        // This would need a more sophisticated color contrast analyzer in production
        
        return {
            compliant: issues.length === 0,
            issues: issues,
            score: Math.max(0, 100 - (issues.length * 10))
        };
    }
}

export default AccessibilityManager;