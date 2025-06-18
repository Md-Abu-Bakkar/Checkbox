document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const destinationUrl = urlParams.get('dest');
    const caption = urlParams.get('caption');
    const imageUrl = urlParams.get('image');
    const youtubeId = urlParams.get('youtube');
    
    const contentDisplay = document.getElementById('contentDisplay');
    const contentLoading = document.getElementById('contentLoading');
    const captionElement = document.getElementById('contentCaption');
    const destinationLink = document.getElementById('destinationLink');
    const copyUrlBtn = document.getElementById('copyUrlBtn');
    
    if (!destinationUrl) {
        displayError('Invalid link - missing destination URL');
        return;
    }
    
    // Set destination URL
    destinationLink.href = destinationUrl;
    
    // Set caption if available
    if (caption) {
        captionElement.textContent = decodeURIComponent(caption);
    } else {
        captionElement.classList.add('hidden');
    }
    
    // Display content based on available media
    if (imageUrl && youtubeId) {
        // Both image and YouTube video
        displayDualMedia(decodeURIComponent(imageUrl), youtubeId);
    } else if (imageUrl) {
        // Only image
        displayImage(decodeURIComponent(imageUrl));
    } else if (youtubeId) {
        // Only YouTube video
        displayYoutubeVideo(youtubeId);
    } else {
        // No media - just show destination button
        displayNoMedia();
    }
    
    // Copy URL button
    copyUrlBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    });
    
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
        contentDisplay.innerHTML = `
            <div class="video-container">
                <iframe class="youtube-embed" 
                        src="https://www.youtube.com/embed/${videoId}?autoplay=0&showinfo=0&controls=1" 
                        frameborder="0" 
                        allowfullscreen></iframe>
            </div>
        `;
        contentLoading.classList.add('hidden');
    }
    
    function displayDualMedia(imageUrl, videoId) {
        contentDisplay.innerHTML = `
            <div class="dual-media-container">
                <div class="media-item image-item">
                    <img src="${imageUrl}" alt="Shared image">
                </div>
                <div class="media-item video-item">
                    <iframe class="youtube-embed" 
                            src="https://www.youtube.com/embed/${videoId}?autoplay=0&showinfo=0&controls=1" 
                            frameborder="0" 
                            allowfullscreen></iframe>
                </div>
            </div>
        `;
        contentLoading.classList.add('hidden');
    }
    
    function displayNoMedia() {
        contentDisplay.innerHTML = `
            <div class="no-media-message">
                <i class="fas fa-external-link-alt"></i>
                <p>Click the button below to visit the destination</p>
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
