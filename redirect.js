document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const linkId = urlParams.get('id');
    
    const contentDisplay = document.getElementById('contentDisplay');
    const contentLoading = document.getElementById('contentLoading');
    const captionElement = document.getElementById('contentCaption');
    const destinationLink = document.getElementById('destinationLink');
    const buttonTextElement = document.getElementById('buttonText');
    const copyUrlBtn = document.getElementById('copyUrlBtn');

    if (linkId) {
        // Retrieve data from server
        fetch(`https://your-server.com/api/get-link?id=${linkId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Link not found');
                }
                return response.json();
            })
            .then(linkData => {
                // Display the content based on mode
                if (linkData.mode === 'image' && linkData.imageUrl) {
                    displayImage(linkData.imageUrl);
                } 
                else if (linkData.mode === 'youtube' && linkData.youtubeId) {
                    displayYoutubeVideo(linkData.youtubeId);
                }
                else if (linkData.mode === 'both' && linkData.imageUrl && linkData.youtubeId) {
                    displayBothContent(linkData.imageUrl, linkData.youtubeId);
                }

                // Set caption if available
                if (linkData.caption) {
                    captionElement.textContent = linkData.caption;
                } else {
                    captionElement.classList.add('hidden');
                }

                // Set button text
                if (linkData.buttonText) {
                    buttonTextElement.textContent = linkData.buttonText;
                }

                // Set destination URL
                if (linkData.url) {
                    destinationLink.href = linkData.url;
                    
                    // Add click tracking
                    destinationLink.addEventListener('click', function() {
                        // You can add analytics here
                        console.log('User clicked through to:', linkData.url);
                    });
                } else {
                    destinationLink.classList.add('hidden');
                }

                // Copy URL button
                copyUrlBtn.addEventListener('click', function() {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                });
            })
            .catch(error => {
                console.error('Error:', error);
                displayError('Link not found or expired');
            });
    } else {
        // No ID provided
        displayError('Invalid link');
    }

    function displayImage(imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Shared image';
        img.onload = function() {
            contentLoading.classList.add('hidden');
        };
        
        contentDisplay.innerHTML = '';
        contentDisplay.appendChild(img);
    }

    function displayYoutubeVideo(videoId) {
        // Auto-play with mute (browser policies require mute for autoplay)
        contentDisplay.innerHTML = `
            <iframe class="youtube-embed" 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen></iframe>
        `;
        contentLoading.classList.add('hidden');
    }
    
    function displayBothContent(imageUrl, videoId) {
        contentDisplay.innerHTML = `
            <div class="dual-content-container">
                <div class="content-item">
                    <img src="${imageUrl}" alt="Shared image" class="dual-image">
                </div>
                <div class="content-item">
                    <iframe class="youtube-embed" 
                            src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen></iframe>
                </div>
            </div>
        `;
        contentLoading.classList.add('hidden');
    }

    function displayError(message) {
        contentDisplay.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
        contentLoading.classList.add('hidden');
        destinationLink.classList.add('hidden');
        captionElement.classList.add('hidden');
    }
});
