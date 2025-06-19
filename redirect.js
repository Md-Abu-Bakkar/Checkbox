document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const linkId = urlParams.get('id');
    
    const contentDisplay = document.getElementById('contentDisplay');
    const contentLoading = document.getElementById('contentLoading');
    const captionElement = document.getElementById('contentCaption');
    const destinationLink = document.getElementById('destinationLink');
    const copyUrlBtn = document.getElementById('copyUrlBtn');
    
    // Try to get data from sessionStorage first, then localStorage
    let linkData = linkId ? JSON.parse(sessionStorage.getItem(`linkpic_${linkId}`)) : null;
    if (!linkData && linkId) {
        linkData = JSON.parse(localStorage.getItem(`linkpic_${linkId}`));
    }
    
    if (linkData) {
        // Apply theme color if available
        if (linkData.color) {
            applyThemeColor(linkData.color);
        }
        
        // Display the content based on mode
        if (linkData.mode === 'image' && linkData.imageUrl) {
            displayImage(linkData.imageUrl, linkData.caption);
        } else if (linkData.mode === 'youtube' && linkData.youtubeId) {
            displayYoutubeVideo(linkData.youtubeId, linkData.caption);
        } else if (linkData.mode === 'both' && linkData.imageUrl && linkData.youtubeId) {
            displayCombinedContent(linkData.imageUrl, linkData.youtubeId, linkData.caption);
        } else {
            displayError('Invalid content data');
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
    } else {
        // Data not found
        displayError(linkId ? 'Link not found or expired' : 'Invalid link');
    }
    
    function applyThemeColor(color) {
        // Calculate lighter and darker shades
        const darkerColor = shadeColor(color, -20);
        const accentColor = shadeColor(color, 30);
        
        // Set CSS variables
        document.documentElement.style.setProperty('--primary-color', color);
        document.documentElement.style.setProperty('--secondary-color', darkerColor);
        document.documentElement.style.setProperty('--accent-color', accentColor);
        document.documentElement.style.setProperty('--primary-light', hexToRGBA(color, 0.1));
    }
    
    function shadeColor(color, percent) {
        let R = parseInt(color.substring(1,3), 16);
        let G = parseInt(color.substring(3,5), 16);
        let B = parseInt(color.substring(5,7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R<255)?R:255;  
        G = (G<255)?G:255;  
        B = (B<255)?B:255;  

        R = Math.round(R);
        G = Math.round(G);
        B = Math.round(B);

        const RR = ((R.toString(16).length===1)?"0"+R.toString(16):R.toString(16);
        const GG = ((G.toString(16).length===1)?"0"+G.toString(16):G.toString(16);
        const BB = ((B.toString(16).length===1)?"0"+B.toString(16):B.toString(16);

        return "#"+RR+GG+BB;
    }
    
    function hexToRGBA(hex, alpha) {
        let r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    function displayImage(imageUrl, caption) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Shared image';
        img.onload = function() {
            contentLoading.classList.add('hidden');
        };
        
        contentDisplay.innerHTML = '';
        contentDisplay.appendChild(img);
        
        if (caption) {
            captionElement.textContent = caption;
        } else {
            captionElement.classList.add('hidden');
        }
    }
    
    function displayYoutubeVideo(videoId, caption) {
        contentDisplay.innerHTML = `
            <iframe class="youtube-embed" 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&showinfo=0&controls=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen></iframe>
        `;
        contentLoading.classList.add('hidden');
        
        if (caption) {
            captionElement.textContent = caption;
        } else {
            captionElement.classList.add('hidden');
        }
    }
    
    function displayCombinedContent(imageUrl, videoId, caption) {
        contentDisplay.innerHTML = `
            <div class="combined-content">
                <div class="image-part">
                    <img src="${imageUrl}" alt="Shared image">
                </div>
                <div class="video-part">
                    <iframe class="youtube-embed" 
                            src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&showinfo=0&controls=1" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen></iframe>
                </div>
            </div>
        `;
        contentLoading.classList.add('hidden');
        
        if (caption) {
            captionElement.textContent = caption;
        } else {
            captionElement.classList.add('hidden');
        }
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
