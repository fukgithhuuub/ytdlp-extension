// ==UserScript==
// @name         YouTube yt-dlp Audio Downloader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds a button to YouTube to download best audio using local yt-dlp server
// @author       You
// @match        *://www.youtube.com/watch?*
// @match        *://youtube.com/watch?*
// @grant        GM_xmlhttpRequest
// @connect      localhost
// ==/UserScript==

(function() {
    'use strict';

    // The port your local python server is running on
    const SERVER_PORT = 8080;

    function createDownloadButton() {
        // Check if the button already exists
        if (document.getElementById('ytdlp-download-btn')) {
            return;
        }

        // Find a good place to insert the button
        // The menu below the video title is usually a good spot
        const actionsMenu = document.querySelector('#top-level-buttons-computed');

        if (!actionsMenu) {
            // If the standard actions menu isn't found, try again shortly
            // YouTube's dynamic loading sometimes means it's not immediately available
            setTimeout(createDownloadButton, 1000);
            return;
        }

        const button = document.createElement('button');
        button.id = 'ytdlp-download-btn';
        button.innerHTML = '🎧 Download Audio';
        button.style.backgroundColor = '#cc0000';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '18px';
        button.style.padding = '0 16px';
        button.style.height = '36px';
        button.style.fontSize = '14px';
        button.style.fontWeight = '500';
        button.style.cursor = 'pointer';
        button.style.marginLeft = '8px';
        button.style.fontFamily = 'Roboto, Arial, sans-serif';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';

        // Hover effect
        button.onmouseover = function() {
            this.style.backgroundColor = '#ff0000';
        };
        button.onmouseout = function() {
            this.style.backgroundColor = '#cc0000';
        };

        button.onclick = function() {
            const videoUrl = window.location.href;

            // Visual feedback
            button.innerHTML = '⏳ Starting...';
            button.style.backgroundColor = '#555555';

            // Send request to local server
            GM_xmlhttpRequest({
                method: "POST",
                url: `http://localhost:${SERVER_PORT}/`,
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify({ url: videoUrl }),
                onload: function(response) {
                    if (response.status === 200) {
                        button.innerHTML = '✅ Downloading!';
                        button.style.backgroundColor = '#008800';
                    } else {
                        button.innerHTML = '❌ Error';
                        button.style.backgroundColor = '#cc0000';
                        console.error('Server returned an error:', response.responseText);
                    }

                    // Reset button after 3 seconds
                    setTimeout(() => {
                        button.innerHTML = '🎧 Download Audio';
                        button.style.backgroundColor = '#cc0000';
                    }, 3000);
                },
                onerror: function(error) {
                    button.innerHTML = '❌ Server Not Running';
                    button.style.backgroundColor = '#cc0000';
                    console.error('Error connecting to local server:', error);

                    // Reset button after 3 seconds
                    setTimeout(() => {
                        button.innerHTML = '🎧 Download Audio';
                        button.style.backgroundColor = '#cc0000';
                    }, 3000);
                }
            });
        };

        actionsMenu.appendChild(button);
    }

    // Try to create the button when the script runs
    createDownloadButton();

    // YouTube uses a Single Page Application approach
    // We need to listen for navigation events to re-add the button when changing videos
    window.addEventListener('yt-navigate-finish', function() {
        createDownloadButton();
    });

    // Also use MutationObserver as a fallback for dynamic page changes
    const observer = new MutationObserver(function(mutations) {
        if (window.location.href.includes('/watch?') && !document.getElementById('ytdlp-download-btn')) {
            createDownloadButton();
        }
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
})();
