/*jslint browser: true, es6: true */
/*global Promise */

(function () {
    'use strict';
    
    // Hamburger Menu Functionality
    function initHamburgerMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', function () {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
            
            // Close menu when clicking on a link
            document.querySelectorAll('.nav-menu a').forEach(function (link) {
                link.addEventListener('click', function () {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
    }
    
    // Image Gallery with Promises
    function loadImageWithPromise(src, alt) {
        return new Promise(function (resolve, reject) {
            const img = new Image();
            img.onload = function () {
                resolve({
                    element: img,
                    src: src,
                    alt: alt
                });
            };
            img.onerror = function () {
                reject(new Error('Failed to load image: ' + src));
            };
            img.src = src;
            img.alt = alt;
        });
    }
    
    function initImageGallery() {
        const galleryContainer = document.querySelector('.image-gallery');
        if (!galleryContainer) {
            return;
        }
        
        const imageData = [
            { src: 'images/manfredgawlas.jpg', alt: 'Manfred Gawlas' },
            { src: 'images/HER.png', alt: 'Physics Simulator' },
            { src: 'images/ACS.png', alt: 'Control System' },
            { src: 'images/TR-R6.png', alt: 'Rocket Project' },
            { src: 'images/mach.png', alt: 'Drag Coefficient Study' },
            { src: 'images/IACFR.png', alt: 'Team at IAC2024' }
        ];
        
        const loadingElement = document.createElement('div');
        loadingElement.textContent = 'Loading gallery...';
        loadingElement.className = 'gallery-loading';
        galleryContainer.appendChild(loadingElement);
        
        const imagePromises = imageData.map(function (data) {
            return loadImageWithPromise(data.src, data.alt);
        });
        
        Promise.all(imagePromises).then(function (results) {
            loadingElement.remove();
            
            results.forEach(function (result) {
                const imageWrapper = document.createElement('div');
                imageWrapper.className = 'gallery-item';
                
                result.element.className = 'gallery-image';
                imageWrapper.appendChild(result.element);
                
                galleryContainer.appendChild(imageWrapper);
            });
        }).catch(function (error) {
            loadingElement.textContent = 'Error loading gallery: ' + error.message;
            loadingElement.className = 'gallery-error';
        });
    }
    
    function copyCodeToClipboard(button) {
        const pre = button.parentElement;
        const code = pre.querySelector('code');
        const text = code.innerText || code.textContent;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                button.textContent = 'Copied!';
                setTimeout(function () {
                    button.textContent = 'Copy';
                }, 2000);
            }).catch(function () {
                // Fallback for older browsers
                fallbackCopyTextToClipboard(text, button);
            });
        } else {
            fallbackCopyTextToClipboard(text, button);
        }
    }
    
    function fallbackCopyTextToClipboard(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            button.textContent = 'Copied!';
            setTimeout(function () {
                button.textContent = 'Copy';
            }, 2000);
        } catch (err) {
            button.textContent = 'Copy failed';
        }
        
        document.body.removeChild(textArea);
    }
    
    // On DOM Load
    function init() {
        initHamburgerMenu();
        initImageGallery();

        if (typeof window.initHangmanGame === 'function') {
            window.initHangmanGame();
        }

        // Make copyCodeToClipboard globally available
        window.copyCodeToClipboard = copyCodeToClipboard;
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
