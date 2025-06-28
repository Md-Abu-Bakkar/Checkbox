document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const linkId = urlParams.get('id');
    const contentContainer = document.getElementById('contentContainer');
    const captionContainer = document.getElementById('captionContainer');
    const destinationLink = document.getElementById('destinationLink');

    if (linkId) {
        const linkData = JSON.parse(localStorage.getItem(`linkpic_${linkId}`));
        
        if (linkData) {
            // Remove loading
            contentContainer.innerHTML = '';
            
            // Display content based on mode
            if (linkData.mode === 'image' && linkData.image) {
                contentContainer.innerHTML = `
                    <div class="image-content">
                        <img src="${linkData.image}" alt="Shared content">
                    </div>
                `;
            } else if (linkData.mode === 'video' && linkData.video) {
                contentContainer.innerHTML = `
                    <div class="video-content">
                        <iframe width="100%" height="400" 
                                src="https://www.youtube.com/embed/${linkData.video}?autoplay=1" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen></iframe>
                    </div>
                `;
            } else if (linkData.mode === 'both' && linkData.image && linkData.video) {
                contentContainer.innerHTML = `
                    <div class="combined-content">
                        <div class="image-part">
                            <img src="${linkData.image}" alt="Shared image">
                        </div>
                        <div class="video-part">
                            <iframe width="100%" height="100%" 
                                    src="https://www.youtube.com/embed/${linkData.video}?autoplay=1" 
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen></iframe>
                        </div>
                    </div>
                `;
            }
            
            // Set caption if available
            if (linkData.caption) {
                captionContainer.textContent = linkData.caption;
            } else {
                captionContainer.classList.add('hidden');
            }
            
            // Set destination link
            if (linkData.destination) {
                destinationLink.href = linkData.destination;
            } else {
                destinationLink.classList.add('hidden');
            }
        } else {
            contentContainer.innerHTML = '<p class="error">Content not found or expired</p>';
        }
    } else {
        contentContainer.innerHTML = '<p class="error">Invalid link</p>';
    }
});
