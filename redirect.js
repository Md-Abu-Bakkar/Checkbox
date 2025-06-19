document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const linkId = urlParams.get('id');
    
    const contentDisplay = document.getElementById('contentDisplay');
    const contentLoading = document.getElementById('contentLoading');
    const captionElement = document.getElementById('contentCaption');
    const destinationLink = document.getElementById('destinationLink');
    const destinationButtonText = document.getElementById('destinationButtonText');
    const copyUrlBtn = document.getElementById('copyUrlBtn');
    
    if (linkId) {
        // Retrieve data from localStorage
        const linkData = JSON.parse(localStorage.getItem(`linkpic_${linkId}`));
        
        if (linkData) {
            // Set dynamic OG tags for social sharing
            updateMetaTags(
                'LinkPicGlobal - Content Link',
                linkData.caption || 'Check out this content',
                window.location.href,
                linkData.imageUrl || (linkData.youtubeId ? `https://img.youtube.com/vi/${linkData.youtubeId}/maxresdefault.jpg` : null)
            );
            
            // Display the content based on mode
            if ((linkData.mode === 'image' || linkData.mode === 'both') && linkData.imageUrl) {
                displayImage(linkData.imageUrl);
            }
            
            if ((linkData.mode === 'youtube' || linkData.mode === 'both') && linkData.youtubeId) {
                displayYoutubeVideo(linkData.youtubeId);
            }
            
            // Set caption if available
            if (linkData.caption) {
                captionElement.textContent = linkData.caption;
            } else {
                captionElement.classList.add('hidden');
            }
            
            // Set destination URL and button text
            if (linkData.url) {
                destinationLink.href = linkData.url;
                
                if (linkData.buttonText) {
                    destinationButtonText.textContent = linkData.buttonText;
                }
                
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
                showFeedback(this, 'Link copied!');
            });
        } else {
            // Data not found
            displayError('Link not found or expired');
        }
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
        contentDisplay.innerHTML = `
            <iframe class="youtube-embed" 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&showinfo=0&controls=1" 
                    frameborder="0" 
                    allow="autoplay; fullscreen" 
                    allowfullscreen></iframe>
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
    
    function updateMetaTags(title, description, url, imageUrl = null) {
        // Update meta tags for social sharing
        document.querySelector('meta[property="og:title"]').content = title;
        document.querySelector('meta[property="og:description"]').content = description;
        document.querySelector('meta[property="og:url"]').content = url;
        
        if (imageUrl) {
            let ogImage = document.querySelector('meta[property="og:image"]');
            if (!ogImage) {
                ogImage = document.createElement('meta');
                ogImage.setAttribute('property', 'og:image');
                document.head.appendChild(ogImage);
            }
            ogImage.content = imageUrl;
        }
    }
    
    function showFeedback(element, message) {
        const originalText = element.innerHTML;
        element.innerHTML = `<i class="fas fa-check"></i> ${message}`;
        
        setTimeout(() => {
            element.innerHTML = originalText;
        }, 2000);
    }
});
