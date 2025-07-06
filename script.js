// Global variables
let ads = JSON.parse(localStorage.getItem('makeMyAds')) || [];
let currentAdId = null;
let currentCropSettings = { x: 0, y: 0, zoom: 1 };
let isAudioEnabled = false;

// Demo ad scripts for preview
const demoAds = {
    '300x250': `<script type="text/javascript">
        atOptions = {
            'key': '03e7c2c2519ccd98f477369bfbbb04d2',
            'format': 'iframe',
            'height': 250,
            'width': 300,
            'params': {}
        };
    </script>
    <script type="text/javascript" src="//www.highperformanceformat.com/03e7c2c2519ccd98f477369bfbbb04d2/invoke.js"></script>`,
    '728x90': `<script type="text/javascript">
        atOptions = {
            'key': 'c949739cfbc90099b78fd03e56e0c06f',
            'format': 'iframe',
            'height': 90,
            'width': 728,
            'params': {}
        };
    </script>
    <script type="text/javascript" src="//www.highperformanceformat.com/c949739cfbc90099b78fd03e56e0c06f/invoke.js"></script>`,
    '160x600': `<script type="text/javascript">
        atOptions = {
            'key': '8fff0980e1aa6080d86d59920876bf50',
            'format': 'iframe',
            'height': 600,
            'width': 160,
            'params': {}
        };
    </script>
    <script type="text/javascript" src="//www.highperformanceformat.com/8fff0980e1aa6080d86d59920876bf50/invoke.js"></script>`,
    '320x50': `<script type="text/javascript">
        atOptions = {
            'key': 'a481763decb23c81da5296aea54b0fd9',
            'format': 'iframe',
            'height': 50,
            'width': 320,
            'params': {}
        };
    </script>
    <script type="text/javascript" src="//www.highperformanceformat.com/a481763decb23c81da5296aea54b0fd9/invoke.js"></script>`,
    '468x60': `<script type="text/javascript">
        atOptions = {
            'key': 'dafe8afc0b0266d5b95a198608249118',
            'format': 'iframe',
            'height': 60,
            'width': 468,
            'params': {}
        };
    </script>
    <script type="text/javascript" src="//www.highperformanceformat.com/dafe8afc0b0266d5b95a198608249118/invoke.js"></script>`
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load saved ads
    loadSavedAds();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check for hash routing
    checkHashRouting();
    
    // Initialize color picker
    initColorPicker();
    
    // Initialize size options
    initSizeOptions();
    
    // Show demo ad in preview
    showDemoAd();
    
    // Check if this is an ad view via link
    if (window.location.hash.includes('ad=')) {
        showAdFromLink();
    }
});

// Show ad when opened via link
function showAdFromLink() {
    const adId = window.location.hash.split('ad=')[1];
    const ad = ads.find(a => a.id === adId);
    
    if (ad) {
        // Show the ad in preview
        displayAd(ad);
        
        // Show the ad code container
        document.getElementById('ad-code-container').style.display = 'block';
        
        // Scroll to the preview
        document.getElementById('ad-preview').scrollIntoView();
    }
}

// Set up event listeners
function setupEventListeners() {
    // Color options
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('bg-color').value = this.dataset.color;
            updatePreview();
        });
    });
    
    // Custom color picker
    document.getElementById('custom-color').addEventListener('input', function() {
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        document.getElementById('bg-color').value = this.value;
        updatePreview();
    });
    
    // Form changes that should update preview
    const previewUpdateFields = ['ad-image', 'ad-video', 'ad-text', 'ad-link', 'bg-color', 'ad-position', 'crop-position', 'audio-control'];
    previewUpdateFields.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updatePreview);
            element.addEventListener('change', updatePreview);
        }
    });
}

// Initialize color picker
function initColorPicker() {
    document.getElementById('custom-color').value = '#ffffff';
}

// Initialize size options
function initSizeOptions() {
    document.querySelectorAll('.ad-size-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.ad-size-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            
            if (this.dataset.size === 'custom') {
                document.getElementById('custom-size-container').style.display = 'block';
                document.getElementById('ad-preview').style.width = '300px';
                document.getElementById('ad-preview').style.height = '250px';
            } else {
                document.getElementById('custom-size-container').style.display = 'none';
                const [width, height] = this.dataset.size.split('x');
                document.getElementById('ad-preview').style.width = `${width}px`;
                document.getElementById('ad-preview').style.height = `${height}px`;
                
                // Show demo ad for the selected size
                showDemoAd();
            }
        });
    });
    
    // Custom size inputs
    document.getElementById('custom-width').addEventListener('input', function() {
        document.getElementById('ad-preview').style.width = `${this.value}px`;
        updatePreview();
    });
    
    document.getElementById('custom-height').addEventListener('input', function() {
        document.getElementById('ad-preview').style.height = `${this.value}px`;
        updatePreview();
    });
}

// Show demo ad in preview
function showDemoAd() {
    const preview = document.getElementById('ad-preview');
    const selectedSize = document.querySelector('.ad-size-option.selected').dataset.size;
    
    // Clear previous content
    preview.innerHTML = '';
    
    // Check if user has entered any content
    const hasUserContent = document.getElementById('ad-image').value || 
                          document.getElementById('ad-video').value || 
                          document.getElementById('ad-text').value;
    
    if (hasUserContent) {
        // If user has entered content, show their preview
        updatePreview();
        return;
    }
    
    // Show demo ad based on selected size
    if (selectedSize !== 'custom' && demoAds[selectedSize]) {
        const demoContainer = document.createElement('div');
        demoContainer.style.width = '100%';
        demoContainer.style.height = '100%';
        demoContainer.innerHTML = demoAds[selectedSize];
        preview.appendChild(demoContainer);
        
        // Execute the demo ad script
        const scripts = demoContainer.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src) {
                const script = document.createElement('script');
                script.src = scripts[i].src;
                document.body.appendChild(script);
            } else {
                eval(scripts[i].innerHTML);
            }
        }
    } else {
        // Default placeholder
        preview.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background-color: #f0f0f0;">
                <p>Your ad preview will appear here</p>
            </div>
        `;
    }
}

// Clear preview
function clearPreview() {
    document.getElementById('ad-form').reset();
    document.getElementById('bg-color').value = '#ffffff';
    document.querySelector('.color-option[data-color="#ffffff"]').classList.add('selected');
    document.querySelector('.color-option[data-color="#ffffff"]').click();
    document.querySelector('.ad-size-option[data-size="300x250"]').click();
    document.getElementById('embed-code').innerHTML = '<p>Your ad code will appear here after generation</p>';
    document.getElementById('short-link').innerHTML = '<p>Your shareable link will appear here after generation</p>';
    document.getElementById('ad-code-container').style.display = 'none';
    showDemoAd();
}

// Tab navigation
function openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    const tabs = document.getElementsByClassName('tab');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

// Update form fields based on ad type
function updateFormFields() {
    const adType = document.getElementById('ad-type').value;
    
    // Show/hide video URL field
    document.getElementById('video-url-container').style.display = adType === 'video' ? 'block' : 'none';
    
    // Show/hide audio control for video ads
    document.getElementById('audio-control-container').style.display = adType === 'video' ? 'block' : 'none';
    
    // Show/hide size options for certain ad types
    document.getElementById('size-container').style.display = adType === 'social' || adType === 'fullscreen' ? 'none' : 'block';
    
    // Update preview
    updatePreview();
}

// Toggle audio for video ads
function toggleAudio(videoElement) {
    isAudioEnabled = !isAudioEnabled;
    videoElement.muted = !isAudioEnabled;
    
    const audioBtn = videoElement.parentElement.querySelector('.audio-control-btn');
    if (audioBtn) {
        audioBtn.innerHTML = isAudioEnabled ? '🔊' : '🔇';
    }
}

// Update the preview based on current form values
function updatePreview() {
    const adType = document.getElementById('ad-type').value;
    const preview = document.getElementById('ad-preview');
    const bgColor = document.getElementById('bg-color').value;
    const adText = document.getElementById('ad-text').value;
    const adLink = document.getElementById('ad-link').value;
    const adImage = document.getElementById('ad-image').value;
    const adVideo = document.getElementById('ad-video').value;
    const position = document.getElementById('ad-position').value;
    const cropPosition = document.getElementById('crop-position').value;
    const audioControl = document.getElementById('audio-control') ? document.getElementById('audio-control').value : 'muted';
    
    // Set background color
    preview.style.backgroundColor = bgColor;
    
    // Clear previous content
    preview.innerHTML = '';
    
    // If no user content, show demo ad
    if (!adImage && !adVideo && !adText) {
        showDemoAd();
        return;
    }
    
    // Create content based on ad type
    switch(adType) {
        case 'banner':
            if (adImage) {
                const img = document.createElement('img');
                img.src = adImage;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.objectPosition = cropPosition;
                preview.appendChild(img);
            }
            
            if (adText) {
                const textDiv = document.createElement('div');
                textDiv.textContent = adText;
                textDiv.style.position = 'absolute';
                textDiv.style.bottom = '0';
                textDiv.style.left = '0';
                textDiv.style.right = '0';
                textDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
                textDiv.style.color = 'white';
                textDiv.style.padding = '10px';
                textDiv.style.textAlign = 'center';
                preview.appendChild(textDiv);
            }
            break;
            
        case 'video':
            if (adVideo) {
                let videoElement;
                
                if (adVideo.includes('youtube.com') || adVideo.includes('youtu.be')) {
                    // Handle YouTube URLs
                    let videoId = '';
                    if (adVideo.includes('youtube.com/watch?v=')) {
                        videoId = adVideo.split('v=')[1].split('&')[0];
                    } else if (adVideo.includes('youtu.be/')) {
                        videoId = adVideo.split('youtu.be/')[1].split('?')[0];
                    }
                    
                    if (videoId) {
                        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${audioControl === 'muted' ? 1 : 0}&loop=1&playlist=${videoId}&controls=0`;
                        const iframe = document.createElement('iframe');
                        iframe.src = embedUrl;
                        iframe.style.width = '100%';
                        iframe.style.height = '100%';
                        iframe.frameBorder = '0';
                        iframe.allow = 'autoplay; encrypted-media';
                        iframe.allowFullscreen = true;
                        
                        // Add clickable overlay for YouTube videos
                        const clickOverlay = document.createElement('div');
                        clickOverlay.style.position = 'absolute';
                        clickOverlay.style.top = '0';
                        clickOverlay.style.left = '0';
                        clickOverlay.style.width = '100%';
                        clickOverlay.style.height = '100%';
                        clickOverlay.style.cursor = 'pointer';
                        clickOverlay.onclick = function() {
                            window.open(adLink, '_blank');
                        };
                        
                        preview.appendChild(iframe);
                        preview.appendChild(clickOverlay);
                    }
                } else {
                    // Handle direct video URLs
                    videoElement = document.createElement('video');
                    videoElement.src = adVideo;
                    videoElement.style.width = '100%';
                    videoElement.style.height = '100%';
                    videoElement.autoplay = true;
                    videoElement.muted = audioControl === 'muted';
                    videoElement.loop = true;
                    videoElement.playsInline = true;
                    
                    // Make the entire video clickable
                    videoElement.style.cursor = 'pointer';
                    videoElement.onclick = function() {
                        window.open(adLink, '_blank');
                    };
                    
                    // Add audio control button
                    const audioBtn = document.createElement('button');
                    audioBtn.className = 'audio-control-btn';
                    audioBtn.innerHTML = audioControl === 'muted' ? '🔇' : '🔊';
                    audioBtn.onclick = function(e) {
                        e.stopPropagation();
                        toggleAudio(videoElement);
                    };
                    
                    const videoContainer = document.createElement('div');
                    videoContainer.style.position = 'relative';
                    videoContainer.style.width = '100%';
                    videoContainer.style.height = '100%';
                    videoContainer.appendChild(videoElement);
                    videoContainer.appendChild(audioBtn);
                    
                    preview.appendChild(videoContainer);
                }
            }
            break;
            
        case 'social':
            const isVertical = position === 'left' || position === 'right';
            const socialBar = document.createElement('div');
            socialBar.style.position = 'absolute';
            socialBar.style.width = isVertical ? '50px' : '100%';
            socialBar.style.height = isVertical ? '100%' : '50px';
            socialBar.style.backgroundColor = bgColor;
            socialBar.style.display = 'flex';
            socialBar.style.flexDirection = isVertical ? 'column' : 'row';
            socialBar.style.alignItems = 'center';
            socialBar.style.justifyContent = 'center';
            
            if (position === 'top') {
                socialBar.style.top = '0';
            } else if (position === 'bottom') {
                socialBar.style.bottom = '0';
            } else if (position === 'left') {
                socialBar.style.left = '0';
            } else if (position === 'right') {
                socialBar.style.right = '0';
            }
            
            const ctaButton = document.createElement('button');
            ctaButton.textContent = adText || 'Click Here';
            ctaButton.style.padding = '8px 15px';
            ctaButton.style.backgroundColor = '#4361ee';
            ctaButton.style.color = 'white';
            ctaButton.style.border = 'none';
            ctaButton.style.borderRadius = '4px';
            ctaButton.style.cursor = 'pointer';
            ctaButton.onclick = function() {
                window.open(adLink, '_blank');
            };
            
            socialBar.appendChild(ctaButton);
            preview.appendChild(socialBar);
            break;
            
        case 'popup':
            const popup = document.createElement('div');
            popup.style.position = 'absolute';
            popup.style.width = '80%';
            popup.style.height = '80%';
            popup.style.backgroundColor = bgColor;
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            popup.style.padding = '20px';
            popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
            
            if (adImage) {
                const img = document.createElement('img');
                img.src = adImage;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '70%';
                img.style.display = 'block';
                img.style.margin = '0 auto';
                img.style.objectPosition = cropPosition;
                popup.appendChild(img);
            }
            
            if (adText) {
                const textDiv = document.createElement('div');
                textDiv.textContent = adText;
                textDiv.style.marginTop = '15px';
                textDiv.style.textAlign = 'center';
                popup.appendChild(textDiv);
            }
            
            const closeButton = document.createElement('button');
            closeButton.textContent = 'X';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '5px';
            closeButton.style.right = '5px';
            closeButton.style.backgroundColor = 'transparent';
            closeButton.style.border = 'none';
            closeButton.style.fontSize = '16px';
            closeButton.style.cursor = 'pointer';
            popup.appendChild(closeButton);
            
            popup.style.cursor = 'pointer';
            popup.onclick = function() {
                window.open(adLink, '_blank');
            };
            
            preview.appendChild(popup);
            break;
            
        case 'fullscreen':
            const fullscreenContent = document.createElement('div');
            fullscreenContent.style.position = 'relative';
            fullscreenContent.style.width = '100%';
            fullscreenContent.style.height = '100%';
            
            if (adImage) {
                const img = document.createElement('img');
                img.src = adImage;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.objectPosition = cropPosition;
                fullscreenContent.appendChild(img);
            }
            
            if (adText) {
                const textDiv = document.createElement('div');
                textDiv.textContent = adText;
                textDiv.style.position = 'absolute';
                textDiv.style.bottom = '20%';
                textDiv.style.left = '0';
                textDiv.style.right = '0';
                textDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
                textDiv.style.color = 'white';
                textDiv.style.padding = '20px';
                textDiv.style.textAlign = 'center';
                fullscreenContent.appendChild(textDiv);
            }
            
            const skipButton = document.createElement('button');
            skipButton.textContent = 'Skip Ad';
            skipButton.style.position = 'absolute';
            skipButton.style.bottom = '20px';
            skipButton.style.right = '20px';
            skipButton.style.padding = '8px 15px';
            skipButton.style.backgroundColor = 'rgba(0,0,0,0.5)';
            skipButton.style.color = 'white';
            skipButton.style.border = 'none';
            skipButton.style.borderRadius = '4px';
            skipButton.style.cursor = 'pointer';
            skipButton.onclick = function(e) {
                e.stopPropagation();
            };
            
            fullscreenContent.appendChild(skipButton);
            fullscreenContent.style.cursor = 'pointer';
            fullscreenContent.onclick = function() {
                window.open(adLink, '_blank');
            };
            
            preview.appendChild(fullscreenContent);
            break;
    }
    
    // Make the preview clickable (for demo purposes)
    preview.style.cursor = 'pointer';
    preview.onclick = function() {
        if (adLink) {
            window.open(adLink, '_blank');
        }
    };
}

// Show crop tool
function showCropTool() {
    const adImage = document.getElementById('ad-image').value;
    if (!adImage) {
        alert('Please enter an image URL first');
        return;
    }
    
    const modal = document.getElementById('crop-modal');
    const cropImage = document.getElementById('crop-image');
    
    cropImage.src = adImage;
    cropImage.style.left = '0';
    cropImage.style.top = '0';
    
    // Initialize crop settings
    currentCropSettings = { x: 0, y: 0, zoom: 1 };
    updateCropImage();
    
    // Set up drag functionality
    let isDragging = false;
    let startX, startY;
    
    cropImage.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX - currentCropSettings.x;
        startY = e.clientY - currentCropSettings.y;
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        currentCropSettings.x = e.clientX - startX;
        currentCropSettings.y = e.clientY - startY;
        updateCropImage();
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
    
    // Set up zoom functionality
    document.getElementById('crop-zoom').addEventListener('input', function() {
        currentCropSettings.zoom = parseFloat(this.value);
        updateCropImage();
    });
    
    modal.style.display = 'block';
}

// Update crop image position and zoom
function updateCropImage() {
    const cropImage = document.getElementById('crop-image');
    cropImage.style.left = `${currentCropSettings.x}px`;
    cropImage.style.top = `${currentCropSettings.y}px`;
    cropImage.style.transform = `scale(${currentCropSettings.zoom})`;
}

// Hide crop tool
function hideCropTool() {
    document.getElementById('crop-modal').style.display = 'none';
}

// Apply crop settings to preview
function applyCrop() {
    const cropPositionSelect = document.getElementById('crop-position');
    
    // Determine crop position based on current settings
    if (currentCropSettings.zoom > 1) {
        if (currentCropSettings.x < 0 && Math.abs(currentCropSettings.x) > currentCropSettings.y) {
            cropPositionSelect.value = 'left';
        } else if (currentCropSettings.x > 0 && currentCropSettings.x > Math.abs(currentCropSettings.y)) {
            cropPositionSelect.value = 'right';
        } else if (currentCropSettings.y < 0) {
            cropPositionSelect.value = 'top';
        } else {
            cropPositionSelect.value = 'bottom';
        }
    } else {
        cropPositionSelect.value = 'center';
    }
    
    hideCropTool();
    updatePreview();
}

// Generate the ad code
function generateAd() {
    const adType = document.getElementById('ad-type').value;
    const adName = document.getElementById('ad-name').value;
    const bgColor = document.getElementById('bg-color').value;
    const adText = document.getElementById('ad-text').value;
    const adLink = document.getElementById('ad-link').value;
    const adImage = document.getElementById('ad-image').value;
    const adVideo = document.getElementById('ad-video').value;
    const position = document.getElementById('ad-position').value;
    const cropPosition = document.getElementById('crop-position').value;
    const duration = document.getElementById('ad-duration').value;
    const audioControl = document.getElementById('audio-control') ? document.getElementById('audio-control').value : 'muted';
    
    // Get selected size
    let width, height;
    const selectedSize = document.querySelector('.ad-size-option.selected').dataset.size;
    
    if (selectedSize === 'custom') {
        width = document.getElementById('custom-width').value || '300';
        height = document.getElementById('custom-height').value || '250';
    } else {
        [width, height] = selectedSize.split('x');
    }
    
    // Create ad object
    const ad = {
        id: generateId(),
        name: adName,
        type: adType,
        width: width,
        height: height,
        bgColor: bgColor,
        text: adText,
        link: adLink,
        image: adImage,
        video: adVideo,
        position: position,
        cropPosition: cropPosition,
        duration: duration,
        audioControl: audioControl,
        createdAt: new Date().toISOString()
    };
    
    // Save the ad
    saveAd(ad);
    
    // Generate embed code
    const embedCode = generateEmbedCode(ad);
    document.getElementById('embed-code').innerHTML = escapeHtml(embedCode);
    
    // Generate short link
    const shortLink = generateShortLink(ad.id);
    document.getElementById('short-link').innerHTML = shortLink;
    
    // Display the ad
    displayAd(ad);
    
    // Show success message
    alert('Ad generated successfully!');
}

// Generate embed code for the ad
function generateEmbedCode(ad) {
    let code = '';
    
    switch(ad.type) {
        case 'banner':
            code = `
<div style="width: ${ad.width}px; height: ${ad.height}px; background-color: ${ad.bgColor}; position: relative; overflow: hidden; cursor: pointer;" onclick="window.open('${ad.link}', '_blank')">
    ${ad.image ? `<img src="${ad.image}" style="width: 100%; height: 100%; object-fit: cover; object-position: ${ad.cropPosition};">` : ''}
    ${ad.text ? `<div style="position: absolute; bottom: 0; left: 0; right: 0; background-color: rgba(0,0,0,0.7); color: white; padding: 10px; text-align: center;">${ad.text}</div>` : ''}
</div>
            `;
            break;
            
        case 'video':
            if (ad.video.includes('youtube.com') || ad.video.includes('youtu.be')) {
                let videoId = '';
                if (ad.video.includes('youtube.com/watch?v=')) {
                    videoId = ad.video.split('v=')[1].split('&')[0];
                } else if (ad.video.includes('youtu.be/')) {
                    videoId = ad.video.split('youtu.be/')[1].split('?')[0];
                }
                
                if (videoId) {
                    code = `
<div style="width: ${ad.width}px; height: ${ad.height}px; position: relative;">
    <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${ad.audioControl === 'muted' ? 1 : 0}&loop=1&playlist=${videoId}&controls=0" 
            style="width: 100%; height: 100%; border: none;"></iframe>
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer;" onclick="window.open('${ad.link}', '_blank')"></div>
</div>
                    `;
                }
            } else {
                code = `
<div style="width: ${ad.width}px; height: ${ad.height}px; position: relative;">
    <video src="${ad.video}" autoplay ${ad.audioControl === 'muted' ? 'muted' : ''} loop playsinline 
           style="width: 100%; height: 100%; cursor: pointer;" onclick="window.open('${ad.link}', '_blank')"></video>
    <button class="audio-control-btn" onclick="this.previousElementSibling.muted = !this.previousElementSibling.muted; this.innerHTML = this.previousElementSibling.muted ? '🔇' : '🔊'" 
            style="position: absolute; bottom: 10px; left: 10px; background-color: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10;">
        ${ad.audioControl === 'muted' ? '🔇' : '🔊'}
    </button>
</div>
                `;
            }
            break;
            
        case 'social':
            const isVertical = ad.position === 'left' || ad.position === 'right';
            code = `
<div style="width: ${ad.width}px; height: ${ad.height}px; position: relative; overflow: hidden; background-color: ${ad.bgColor};">
    <div style="position: absolute; width: ${isVertical ? '50px' : '100%'}; height: ${isVertical ? '100%' : '50px'}; 
                background-color: ${ad.bgColor}; display: flex; flex-direction: ${isVertical ? 'column' : 'row'}; 
                align-items: center; justify-content: center; ${ad.position}: 0;">
        <button onclick="window.open('${ad.link}', '_blank')" 
                style="padding: 8px 15px; background-color: #4361ee; color: white; border: none; border-radius: 4px; cursor: pointer;">
            ${ad.text || 'Click Here'}
        </button>
    </div>
</div>
            `;
            break;
            
        case 'popup':
            code = `
<div id="myAdPopup" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 1000; display: none;">
    <div style="position: absolute; width: 80%; height: 80%; background-color: ${ad.bgColor}; top: 50%; left: 50%; 
                transform: translate(-50%, -50%); padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.5); cursor: pointer;" 
         onclick="window.open('${ad.link}', '_blank')">
        ${ad.image ? `<img src="${ad.image}" style="max-width: 100%; max-height: 70%; display: block; margin: 0 auto; object-position: ${ad.cropPosition};">` : ''}
        ${ad.text ? `<div style="margin-top: 15px; text-align: center;">${ad.text}</div>` : ''}
        <button onclick="document.getElementById('myAdPopup').style.display = 'none';" 
                style="position: absolute; top: 5px; right: 5px; background-color: transparent; border: none; font-size: 16px; cursor: pointer;">X</button>
    </div>
</div>

<script>
    setTimeout(function() {
        document.getElementById('myAdPopup').style.display = 'block';
    }, ${ad.duration * 1000});
</script>
            `;
            break;
            
        case 'fullscreen':
            code = `
<div id="myFullscreenAd" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: ${ad.bgColor}; z-index: 1000; display: none;">
    <div style="position: relative; width: 100%; height: 100%;">
        ${ad.image ? `<img src="${ad.image}" style="width: 100%; height: 100%; object-fit: cover; object-position: ${ad.cropPosition};">` : ''}
        ${ad.text ? `<div style="position: absolute; bottom: 20%; left: 0; right: 0; background-color: rgba(0,0,0,0.7); color: white; padding: 20px; text-align: center;">${ad.text}</div>` : ''}
        <button onclick="document.getElementById('myFullscreenAd').style.display = 'none';" 
                style="position: absolute; bottom: 20px; right: 20px; padding: 8px 15px; background-color: rgba(0,0,0,0.5); color: white; border: none; border-radius: 4px; cursor: pointer;">Skip Ad</button>
    </div>
</div>

<script>
    setTimeout(function() {
        document.getElementById('myFullscreenAd').style.display = 'block';
    }, 1000);
</script>
            `;
            break;
    }
    
    return code.trim();
}

// Generate a short link for the ad
function generateShortLink(adId) {
    return `${window.location.origin}${window.location.pathname}#ad=${adId}`;
}

// Display the ad in preview
function displayAd(ad) {
    // Set form values
    document.getElementById('ad-name').value = ad.name;
    document.getElementById('ad-type').value = ad.type;
    document.getElementById('bg-color').value = ad.bgColor;
    document.getElementById('ad-text').value = ad.text;
    document.getElementById('ad-link').value = ad.link;
    document.getElementById('ad-image').value = ad.image || '';
    document.getElementById('ad-video').value = ad.video || '';
    document.getElementById('ad-position').value = ad.position;
    document.getElementById('crop-position').value = ad.cropPosition;
    document.getElementById('ad-duration').value = ad.duration;
    
    if (ad.audioControl) {
        document.getElementById('audio-control').value = ad.audioControl;
    }
    
    // Set size
    if (ad.width && ad.height) {
        const sizeOptions = document.querySelectorAll('.ad-size-option');
        let foundSize = false;
        
        sizeOptions.forEach(option => {
            if (option.dataset.size === `${ad.width}x${ad.height}`) {
                option.click();
                foundSize = true;
            }
        });
        
        if (!foundSize) {
            document.querySelector('.ad-size-option[data-size="custom"]').click();
            document.getElementById('custom-width').value = ad.width;
            document.getElementById('custom-height').value = ad.height;
            document.getElementById('ad-preview').style.width = `${ad.width}px`;
            document.getElementById('ad-preview').style.height = `${ad.height}px`;
        }
    }
    
    // Update preview
    updatePreview();
}

// Save ad to local storage
function saveAd(ad) {
    // Check if this is an update
    const existingIndex = ads.findIndex(a => a.id === ad.id);
    
    if (existingIndex >= 0) {
        ads[existingIndex] = ad;
    } else {
        ads.push(ad);
    }
    
    localStorage.setItem('makeMyAds', JSON.stringify(ads));
    loadSavedAds();
}

// Load saved ads
function loadSavedAds() {
    const adsList = document.getElementById('ads-list');
    adsList.innerHTML = '';
    
    if (ads.length === 0) {
        adsList.innerHTML = '<p>No ads saved yet. Create your first ad!</p>';
        return;
    }
    
    ads.forEach(ad => {
        const adItem = document.createElement('div');
        adItem.className = 'ad-item';
        adItem.innerHTML = `
            <div>
                <h3>${ad.name}</h3>
                <p>Type: ${ad.type} | Size: ${ad.width}x${ad.height} | Created: ${new Date(ad.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="ad-item-actions">
                <button onclick="editAd('${ad.id}')">Edit</button>
                <button class="delete-btn" onclick="deleteAd('${ad.id}')">Delete</button>
            </div>
        `;
        adsList.appendChild(adItem);
    });
}

// Edit an existing ad
function editAd(adId) {
    const ad = ads.find(a => a.id === adId);
    if (ad) {
        currentAdId = ad.id;
        displayAd(ad);
        document.querySelector('.tab[onclick*="create-tab"]').click();
    }
}

// Delete an ad
function deleteAd(adId) {
    if (confirm('Are you sure you want to delete this ad?')) {
        ads = ads.filter(a => a.id !== adId);
        localStorage.setItem('makeMyAds', JSON.stringify(ads));
        loadSavedAds();
        
        if (currentAdId === adId) {
            clearPreview();
            currentAdId = null;
        }
    }
}

// Generate a unique ID
function generateId() {
    return currentAdId || Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Escape HTML for code display
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Copy to clipboard
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const range = document.createRange();
    range.selectNode(element);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    
    alert('Copied to clipboard!');
}

// Check hash routing
function checkHashRouting() {
    if (window.location.hash.includes('ad=')) {
        document.querySelector('.tab[onclick*="create-tab"]').click();
    }
}
