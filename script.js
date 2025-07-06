// Global variables
let ads = JSON.parse(localStorage.getItem('makeMyAds')) || [];
let currentAdId = null;
let currentCropSettings = { x: 0, y: 0, zoom: 1 };

// Demo ad scripts for preview
const demoAds = {
    '300x250': `<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a237e,#2196f3);display:flex;justify-content:center;align-items:center;color:white;font-family:Arial,sans-serif;flex-direction:column;">
        <h3 style="margin-bottom:10px;">Professional Ad</h3>
        <p>300x250 Banner</p>
    </div>`,
    '728x90': `<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a237e,#2196f3);display:flex;justify-content:center;align-items:center;color:white;font-family:Arial,sans-serif;">
        <h3>728x90 Leaderboard Banner</h3>
    </div>`,
    '160x600': `<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a237e,#2196f3);display:flex;justify-content:center;align-items:center;color:white;font-family:Arial,sans-serif;writing-mode:vertical-rl;text-orientation:mixed;">
        <h3>160x600 Wide Skyscraper</h3>
    </div>`,
    '320x50': `<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a237e,#2196f3);display:flex;justify-content:center;align-items:center;color:white;font-family:Arial,sans-serif;">
        <p>320x50 Mobile Banner</p>
    </div>`,
    '468x60': `<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a237e,#2196f3);display:flex;justify-content:center;align-items:center;color:white;font-family:Arial,sans-serif;">
        <p>468x60 Standard Banner</p>
    </div>`
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load saved ads
    loadSavedAds();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize color picker
    initColorPicker();
    
    // Initialize size options
    initSizeOptions();
    
    // Show demo ad in preview
    showDemoAd();
    
    // Update form fields based on initial ad type
    updateFormFields();
});

// Set up event listeners
function setupEventListeners() {
    // Color options
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            const colorType = this.parentElement.id === 'text-color-picker' ? 'text-color' : 'bg-color';
            document.getElementById(colorType).value = this.dataset.color;
            updatePreview();
        });
    });
    
    // Custom color pickers
    document.getElementById('custom-color').addEventListener('input', function() {
        document.querySelectorAll('#bg-color-picker .color-option').forEach(opt => opt.classList.remove('selected'));
        document.getElementById('bg-color').value = this.value;
        updatePreview();
    });
    
    document.getElementById('custom-text-color').addEventListener('input', function() {
        document.querySelectorAll('#text-color-picker .color-option').forEach(opt => opt.classList.remove('selected'));
        document.getElementById('text-color').value = this.value;
        updatePreview();
    });
    
    // Form changes that should update preview
    const previewUpdateFields = ['ad-image', 'ad-video', 'ad-text', 'ad-link', 'bg-color', 'text-color', 'ad-position', 'crop-position', 'autoplay-video', 'mute-video', 'loop-video'];
    previewUpdateFields.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updatePreview);
            element.addEventListener('change', updatePreview);
        }
    });
    
    // Header ad click event
    document.getElementById('header-ad').addEventListener('click', function() {
        window.open('https://control.putulhost.com/aff.php?aff=3958', '_blank');
    });
}

// Initialize color picker
function initColorPicker() {
    document.getElementById('custom-color').value = '#1a237e';
    document.getElementById('custom-text-color').value = '#ffffff';
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
                          document.getElementById('ad-text').value;
    
    if (hasUserContent) {
        // If user has entered content, show their preview
        updatePreview();
        return;
    }
    
    // Show demo ad based on selected size
    if (selectedSize !== 'custom' && demoAds[selectedSize]) {
        preview.innerHTML = demoAds[selectedSize];
    } else {
        // Default placeholder
        preview.innerHTML = `
            <div id="demo-ad-placeholder" style="width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;background-color:#f0f0f0;color:#757575;font-size:16px;text-align:center;gap:10px;">
                <i class="fas fa-ad" style="font-size:40px;color:#1a237e;"></i>
                <p>Your ad preview will appear here</p>
            </div>
        `;
    }
}

// Clear preview
function clearPreview() {
    document.getElementById('ad-form').reset();
    document.getElementById('bg-color').value = '#1a237e';
    document.getElementById('text-color').value = '#ffffff';
    document.querySelector('#bg-color-picker .color-option[data-color="#1a237e"]').classList.add('selected');
    document.querySelector('#text-color-picker .color-option[data-color="#ffffff"]').classList.add('selected');
    document.querySelector('.ad-size-option[data-size="300x250"]').click();
    document.getElementById('embed-code').innerHTML = '<p>Your ad code will appear here after generation</p>';
    document.getElementById('short-link').innerHTML = '<p>Your shareable link will appear here after generation</p>';
    document.getElementById('custom-color').value = '#1a237e';
    document.getElementById('custom-text-color').value = '#ffffff';
    showDemoAd();
    currentAdId = null;
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
    
    if (tabName === 'my-ads-tab') {
        loadSavedAds();
    }
}

// Update form fields based on ad type
function updateFormFields() {
    const adType = document.getElementById('ad-type').value;
    
    // Show/hide video options
    document.getElementById('video-options').style.display = adType === 'video' ? 'block' : 'none';
    
    // Show/hide size options for certain ad types
    document.getElementById('size-container').style.display = adType === 'social' || adType === 'fullscreen' ? 'none' : 'block';
    
    // Update media URL label
    const mediaLabel = adType === 'video' ? 'Video URL' : 'Image URL';
    document.querySelector('#media-url-container label').innerHTML = `<i class="fas fa-${adType === 'video' ? 'video' : 'image'}"></i> ${mediaLabel}`;
    
    // Update placeholder
    document.getElementById('ad-image').placeholder = adType === 'video' 
        ? 'https://example.com/video.mp4 or YouTube/Streamable URL' 
        : 'https://example.com/image.jpg';
    
    // Update preview
    updatePreview();
}

// Update the preview based on current form values
function updatePreview() {
    const adType = document.getElementById('ad-type').value;
    const preview = document.getElementById('ad-preview');
    const bgColor = document.getElementById('bg-color').value;
    const textColor = document.getElementById('text-color').value;
    const adText = document.getElementById('ad-text').value;
    const adLink = document.getElementById('ad-link').value;
    const mediaUrl = document.getElementById('ad-image').value;
    const position = document.getElementById('ad-position').value;
    const cropPosition = document.getElementById('crop-position').value;
    const autoplay = adType === 'video' ? document.getElementById('autoplay-video').checked : true;
    const mute = adType === 'video' ? document.getElementById('mute-video').checked : false;
    const loop = adType === 'video' ? document.getElementById('loop-video').checked : true;
    
    // Set background color
    preview.style.backgroundColor = bgColor;
    
    // Clear previous content
    preview.innerHTML = '';
    
    // If no user content, show demo ad
    if (!mediaUrl && !adText) {
        showDemoAd();
        return;
    }
    
    // Create content based on ad type
    switch(adType) {
        case 'banner':
            if (mediaUrl) {
                const img = document.createElement('img');
                img.src = mediaUrl;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.objectPosition = cropPosition;
                img.onerror = function() {
                    this.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.style.width = '100%';
                    errorDiv.style.height = '100%';
                    errorDiv.style.display = 'flex';
                    errorDiv.style.justifyContent = 'center';
                    errorDiv.style.alignItems = 'center';
                    errorDiv.style.backgroundColor = '#f8d7da';
                    errorDiv.style.color = '#721c24';
                    errorDiv.innerHTML = '<p>Image failed to load</p>';
                    preview.appendChild(errorDiv);
                };
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
                textDiv.style.color = textColor;
                textDiv.style.padding = '10px';
                textDiv.style.textAlign = 'center';
                preview.appendChild(textDiv);
            }
            break;
            
        case 'video':
            if (mediaUrl) {
                let videoElement;
                
                // Check if it's a Streamable URL
                if (mediaUrl.includes('streamable.com')) {
                    const streamableId = mediaUrl.split('streamable.com/')[1];
                    if (streamableId) {
                        const iframe = document.createElement('iframe');
                        iframe.src = `https://streamable.com/e/${streamableId}?autoplay=1&muted=${mute ? 1 : 0}&loop=${loop ? 1 : 0}`;
                        iframe.style.width = '100%';
                        iframe.style.height = '100%';
                        iframe.frameBorder = '0';
                        iframe.allow = 'autoplay; encrypted-media';
                        iframe.allowFullscreen = true;
                        
                        // Add clickable overlay for Streamable videos
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
                }
                // Check if it's a YouTube URL
                else if (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')) {
                    let videoId = '';
                    if (mediaUrl.includes('youtube.com/watch?v=')) {
                        videoId = mediaUrl.split('v=')[1].split('&')[0];
                    } else if (mediaUrl.includes('youtu.be/')) {
                        videoId = mediaUrl.split('youtu.be/')[1].split('?')[0];
                    }
                    
                    if (videoId) {
                        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${mute ? 1 : 0}&loop=${loop ? 1 : 0}&playlist=${videoId}&controls=0`;
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
                    videoElement.src = mediaUrl;
                    videoElement.style.width = '100%';
                    videoElement.style.height = '100%';
                    videoElement.autoplay = autoplay;
                    videoElement.muted = mute;
                    videoElement.loop = loop;
                    videoElement.playsInline = true;
                    
                    // Make the entire video clickable
                    videoElement.style.cursor = 'pointer';
                    videoElement.onclick = function() {
                        window.open(adLink, '_blank');
                    };
                    
                    preview.appendChild(videoElement);
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
            ctaButton.style.color = textColor;
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
            
            if (mediaUrl) {
                const img = document.createElement('img');
                img.src = mediaUrl;
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
                textDiv.style.color = textColor;
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
            closeButton.style.color = textColor;
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
            
            if (mediaUrl) {
                const img = document.createElement('img');
                img.src = mediaUrl;
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
                textDiv.style.color = textColor;
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
            skipButton.style.color = textColor;
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
    if (adLink) {
        preview.style.cursor = 'pointer';
        preview.onclick = function() {
            window.open(adLink, '_blank');
        };
    }
}

// Show crop tool
function showCropTool() {
    const mediaUrl = document.getElementById('ad-image').value;
    if (!mediaUrl) {
        alert('Please enter an image URL first');
        return;
    }
    
    document.getElementById('crop-image').src = mediaUrl;
    document.getElementById('crop-modal').style.display = 'block';
    
    // Initialize crop settings
    currentCropSettings = { x: 0, y: 0, zoom: 1 };
    updateCropImage();
}

// Hide crop tool
function hideCropTool() {
    document.getElementById('crop-modal').style.display = 'none';
}

// Update crop image position
function updateCropImage() {
    const img = document.getElementById('crop-image');
    img.style.transform = `translate(${currentCropSettings.x}px, ${currentCropSettings.y}px) scale(${currentCropSettings.zoom})`;
}

// Apply crop settings
function applyCrop() {
    const positionSelect = document.getElementById('crop-position');
    if (currentCropSettings.x < 0 && currentCropSettings.y < 0) {
        positionSelect.value = 'top left';
    } else if (currentCropSettings.x < 0 && currentCropSettings.y === 0) {
        positionSelect.value = 'left';
    } else if (currentCropSettings.x < 0 && currentCropSettings.y > 0) {
        positionSelect.value = 'bottom left';
    } else if (currentCropSettings.x === 0 && currentCropSettings.y < 0) {
        positionSelect.value = 'top';
    } else if (currentCropSettings.x === 0 && currentCropSettings.y === 0) {
        positionSelect.value = 'center';
    } else if (currentCropSettings.x === 0 && currentCropSettings.y > 0) {
        positionSelect.value = 'bottom';
    } else if (currentCropSettings.x > 0 && currentCropSettings.y < 0) {
        positionSelect.value = 'top right';
    } else if (currentCropSettings.x > 0 && currentCropSettings.y === 0) {
        positionSelect.value = 'right';
    } else if (currentCropSettings.x > 0 && currentCropSettings.y > 0) {
        positionSelect.value = 'bottom right';
    }
    
    hideCropTool();
    updatePreview();
}

// Handle crop zoom change
document.getElementById('crop-zoom').addEventListener('input', function() {
    currentCropSettings.zoom = parseFloat(this.value);
    updateCropImage();
});

// Handle crop image dragging
let isDragging = false;
let startX, startY;

document.getElementById('crop-image').addEventListener('mousedown', function(e) {
    isDragging = true;
    startX = e.clientX - currentCropSettings.x;
    startY = e.clientY - currentCropSettings.y;
    this.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    
    currentCropSettings.x = e.clientX - startX;
    currentCropSettings.y = e.clientY - startY;
    updateCropImage();
});

document.addEventListener('mouseup', function() {
    isDragging = false;
    document.getElementById('crop-image').style.cursor = 'grab';
});

// Generate ad code
function generateAd() {
    const adType = document.getElementById('ad-type').value;
    const adName = document.getElementById('ad-name').value || 'Untitled Ad';
    const bgColor = document.getElementById('bg-color').value;
    const textColor = document.getElementById('text-color').value;
    const adText = document.getElementById('ad-text').value;
    const adLink = document.getElementById('ad-link').value;
    const mediaUrl = document.getElementById('ad-image').value;
    const position = document.getElementById('ad-position').value;
    const cropPosition = document.getElementById('crop-position').value;
    const duration = document.getElementById('ad-duration').value;
    const autoplay = adType === 'video' ? document.getElementById('autoplay-video').checked : true;
    const mute = adType === 'video' ? document.getElementById('mute-video').checked : false;
    const loop = adType === 'video' ? document.getElementById('loop-video').checked : true;
    
    // Get ad size
    let width, height;
    const sizeOption = document.querySelector('.ad-size-option.selected');
    if (sizeOption.dataset.size === 'custom') {
        width = document.getElementById('custom-width').value || 300;
        height = document.getElementById('custom-height').value || 250;
    } else {
        [width, height] = sizeOption.dataset.size.split('x');
    }
    
    // Generate unique ID for this ad
    const adId = currentAdId || 'ad-' + Math.random().toString(36).substr(2, 9);
    currentAdId = adId;
    
    // Create ad data object
    const adData = {
        id: adId,
        type: adType,
        name: adName,
        width: width,
        height: height,
        bgColor: bgColor,
        textColor: textColor,
        text: adText,
        link: adLink,
        mediaUrl: mediaUrl,
        position: position,
        cropPosition: cropPosition,
        duration: duration,
        autoplay: autoplay,
        mute: mute,
        loop: loop,
        createdAt: new Date().toISOString()
    };
    
    // Generate embed code
    let embedCode = '';
    
    if (adType === 'banner') {
        embedCode = `
<div id="${adId}" style="width:${width}px;height:${height}px;background-color:${bgColor};position:relative;overflow:hidden;cursor:pointer;" onclick="window.open('${adLink}', '_blank')">
    ${mediaUrl ? `<img src="${mediaUrl}" style="width:100%;height:100%;object-fit:cover;object-position:${cropPosition};" alt="${adText || 'Advertisement'}">` : ''}
    ${adText ? `<div style="position:absolute;bottom:0;left:0;right:0;background-color:rgba(0,0,0,0.7);color:${textColor};padding:10px;text-align:center;">${adText}</div>` : ''}
</div>
        `;
    } else if (adType === 'video') {
        if (mediaUrl.includes('streamable.com')) {
            const streamableId = mediaUrl.split('streamable.com/')[1];
            embedCode = `
<div id="${adId}" style="width:${width}px;height:${height}px;position:relative;">
    <iframe src="https://streamable.com/e/${streamableId}?autoplay=${autoplay ? 1 : 0}&muted=${mute ? 1 : 0}&loop=${loop ? 1 : 0}" style="width:100%;height:100%;border:none;" allowfullscreen></iframe>
    <div style="position:absolute;top:0;left:0;width:100%;height:100%;cursor:pointer;" onclick="window.open('${adLink}', '_blank')"></div>
</div>
            `;
        } else if (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')) {
            let videoId = '';
            if (mediaUrl.includes('youtube.com/watch?v=')) {
                videoId = mediaUrl.split('v=')[1].split('&')[0];
            } else if (mediaUrl.includes('youtu.be/')) {
                videoId = mediaUrl.split('youtu.be/')[1].split('?')[0];
            }
            
            embedCode = `
<div id="${adId}" style="width:${width}px;height:${height}px;position:relative;">
    <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${mute ? 1 : 0}&loop=${loop ? 1 : 0}&playlist=${videoId}&controls=0" style="width:100%;height:100%;border:none;" allowfullscreen></iframe>
    <div style="position:absolute;top:0;left:0;width:100%;height:100%;cursor:pointer;" onclick="window.open('${adLink}', '_blank')"></div>
</div>
            `;
        } else {
            embedCode = `
<div id="${adId}" style="width:${width}px;height:${height}px;position:relative;">
    <video src="${mediaUrl}" style="width:100%;height:100%;" ${autoplay ? 'autoplay' : ''} ${mute ? 'muted' : ''} ${loop ? 'loop' : ''} playsinline></video>
    <div style="position:absolute;top:0;left:0;width:100%;height:100%;cursor:pointer;" onclick="window.open('${adLink}', '_blank')"></div>
</div>
            `;
        }
    } else if (adType === 'social') {
        const isVertical = position === 'left' || position === 'right';
        embedCode = `
<div id="${adId}" style="width:${width}px;height:${height}px;position:relative;background-color:${bgColor};">
    <div style="position:absolute;${position}:0;width:${isVertical ? '50px' : '100%'};height:${isVertical ? '100%' : '50px'};background-color:${bgColor};display:flex;flex-direction:${isVertical ? 'column' : 'row'};align-items:center;justify-content:center;">
        <button style="padding:8px 15px;background-color:#4361ee;color:${textColor};border:none;border-radius:4px;cursor:pointer;" onclick="window.open('${adLink}', '_blank')">${adText || 'Click Here'}</button>
    </div>
</div>
        `;
    } else if (adType === 'popup') {
        embedCode = `
<div id="${adId}" style="width:${width}px;height:${height}px;position:relative;background-color:${bgColor};">
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80%;height:80%;background-color:${bgColor};padding:20px;box-shadow:0 0 10px rgba(0,0,0,0.5);cursor:pointer;" onclick="window.open('${adLink}', '_blank')">
        ${mediaUrl ? `<img src="${mediaUrl}" style="max-width:100%;max-height:70%;display:block;margin:0 auto;object-position:${cropPosition};" alt="${adText || 'Advertisement'}">` : ''}
        ${adText ? `<div style="margin-top:15px;text-align:center;color:${textColor};">${adText}</div>` : ''}
        <button style="position:absolute;top:5px;right:5px;background-color:transparent;border:none;font-size:16px;cursor:pointer;color:${textColor};">X</button>
    </div>
</div>
        `;
    } else if (adType === 'fullscreen') {
        embedCode = `
<div id="${adId}" style="width:${width}px;height:${height}px;position:relative;background-color:${bgColor};">
    <div style="position:relative;width:100%;height:100%;cursor:pointer;" onclick="window.open('${adLink}', '_blank')">
        ${mediaUrl ? `<img src="${mediaUrl}" style="width:100%;height:100%;object-fit:cover;object-position:${cropPosition};" alt="${adText || 'Advertisement'}">` : ''}
        ${adText ? `<div style="position:absolute;bottom:20%;left:0;right:0;background-color:rgba(0,0,0,0.7);color:${textColor};padding:20px;text-align:center;">${adText}</div>` : ''}
        <button style="position:absolute;bottom:20px;right:20px;padding:8px 15px;background-color:rgba(0,0,0,0.5);color:${textColor};border:none;border-radius:4px;cursor:pointer;">Skip Ad</button>
    </div>
</div>
        `;
    }
    
    // Generate shareable link with data encoded
    const shareableLink = `${window.location.origin}${window.location.pathname}#${encodeURIComponent(JSON.stringify(adData))}`;
    
    // Display the generated code and link
    document.getElementById('embed-code').textContent = embedCode.trim();
    document.getElementById('short-link').textContent = shareableLink;
    
    // Return the ad data for saving
    return adData;
}

// Save ad to local storage
function saveAd() {
    const adData = generateAd();
    if (!adData) return;
    
    // Check if this is an existing ad
    const existingIndex = ads.findIndex(ad => ad.id === adData.id);
    if (existingIndex >= 0) {
        ads[existingIndex] = adData;
    } else {
        ads.push(adData);
    }
    
    localStorage.setItem('makeMyAds', JSON.stringify(ads));
    alert('Ad saved successfully!');
    loadSavedAds();
}

// Load saved ads from local storage
function loadSavedAds() {
    const adsList = document.getElementById('ads-list');
    if (ads.length === 0) {
        adsList.innerHTML = '<p>No ads saved yet. Create your first ad!</p>';
        return;
    }
    
    adsList.innerHTML = '';
    ads.forEach(ad => {
        const adItem = document.createElement('div');
        adItem.className = 'ad-item';
        adItem.innerHTML = `
            <div class="ad-item-header">
                <div class="ad-item-title">${ad.name}</div>
                <div class="ad-item-type">${ad.type}</div>
            </div>
            <div class="ad-item-preview" style="background-color:${ad.bgColor};">
                ${ad.mediaUrl ? `<img src="${ad.mediaUrl}" style="width:100%;height:100%;object-fit:cover;object-position:${ad.cropPosition};">` : ''}
                ${ad.text ? `<div style="position:absolute;bottom:0;left:0;right:0;background-color:rgba(0,0,0,0.7);color:${ad.textColor};padding:5px;text-align:center;font-size:12px;">${ad.text}</div>` : ''}
            </div>
            <div class="ad-item-actions">
                <button class="secondary-btn" onclick="loadAd('${ad.id}')"><i class="fas fa-edit"></i> Edit</button>
                <button class="danger-btn" onclick="deleteAd('${ad.id}')"><i class="fas fa-trash"></i> Delete</button>
            </div>
        `;
        adsList.appendChild(adItem);
    });
}

// Load ad into editor
function loadAd(adId) {
    const ad = ads.find(a => a.id === adId);
    if (!ad) return;
    
    currentAdId = adId;
    document.getElementById('ad-name').value = ad.name;
    document.getElementById('ad-type').value = ad.type;
    document.getElementById('bg-color').value = ad.bgColor;
    document.getElementById('text-color').value = ad.textColor;
    document.getElementById('ad-text').value = ad.text || '';
    document.getElementById('ad-link').value = ad.link;
    document.getElementById('ad-image').value = ad.mediaUrl || '';
    document.getElementById('ad-position').value = ad.position;
    document.getElementById('crop-position').value = ad.cropPosition;
    document.getElementById('ad-duration').value = ad.duration;
    
    if (ad.type === 'video') {
        document.getElementById('autoplay-video').checked = ad.autoplay;
        document.getElementById('mute-video').checked = ad.mute;
        document.getElementById('loop-video').checked = ad.loop;
    }
    
    // Set size
    const sizeOptions = document.querySelectorAll('.ad-size-option');
    sizeOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.size === `${ad.width}x${ad.height}`) {
            option.classList.add('selected');
        } else if (option.dataset.size === 'custom') {
            document.getElementById('custom-width').value = ad.width;
            document.getElementById('custom-height').value = ad.height;
            document.getElementById('custom-size-container').style.display = 'block';
        }
    });
    
    // Update preview
    document.getElementById('ad-preview').style.width = `${ad.width}px`;
    document.getElementById('ad-preview').style.height = `${ad.height}px`;
    updateFormFields();
    updatePreview();
    
    // Switch to create tab
    document.querySelector('.tab[onclick*="create-tab"]').click();
}

// Delete ad
function deleteAd(adId) {
    if (!confirm('Are you sure you want to delete this ad?')) return;
    
    ads = ads.filter(ad => ad.id !== adId);
    localStorage.setItem('makeMyAds', JSON.stringify(ads));
    loadSavedAds();
    
    if (currentAdId === adId) {
        clearPreview();
    }
}

// Copy to clipboard
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent || element.innerText;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = element.textContent;
        element.textContent = 'Copied to clipboard!';
        setTimeout(() => {
            element.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Test ad in modal
function testAd() {
    const embedCode = document.getElementById('embed-code').textContent;
    if (!embedCode || embedCode.includes('Your ad code will appear here')) {
        alert('Please generate an ad first');
        return;
    }
    
    const testContainer = document.getElementById('test-ad-container');
    testContainer.innerHTML = embedCode;
    
    document.getElementById('test-modal').style.display = 'block';
}

// Hide test modal
function hideTestModal() {
    document.getElementById('test-modal').style.display = 'none';
    document.getElementById('test-ad-container').innerHTML = '';
}

// Check for hash routing (shared links)
function checkHashRouting() {
    if (window.location.hash) {
        try {
            const adData = JSON.parse(decodeURIComponent(window.location.hash.substr(1)));
            if (adData && adData.type) {
                // Check if this ad already exists
                const existingAd = ads.find(ad => 
                    ad.type === adData.type && 
                    ad.link === adData.link && 
                    ad.mediaUrl === adData.mediaUrl
                );
                
                if (existingAd) {
                    loadAd(existingAd.id);
                } else {
                    // Add as new ad
                    currentAdId = null;
                    loadAd(adData.id); // This will create a new ID if needed
                }
                
                // Scroll to top
                window.scrollTo(0, 0);
            }
        } catch (e) {
            console.error('Error parsing shared ad data:', e);
        }
    }
}

// Initialize hash routing check
checkHashRouting();
