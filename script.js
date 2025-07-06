// Global variables
let ads = JSON.parse(localStorage.getItem('makeMyAds')) || [];
let currentAdId = null;
let currentCropSettings = { x: 0, y: 0, zoom: 1 };

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
    
    // Set up header ad click event
    document.getElementById('header-ad').addEventListener('click', function() {
        window.open('https://control.putulhost.com/aff.php?aff=3958', '_blank');
    });
    
    // Set up Streamable upload button
    document.getElementById('upload-video-btn').addEventListener('click', showStreamableModal);
});

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
    document.getElementById('ad-script-container').style.display = 'none';
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
                        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0`;
                        if (audioControl === 'muted') {
                            embedUrl += '&mute=1';
                        }
                        
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
                } else if (adVideo.includes('streamable.com')) {
                    // Handle Streamable URLs
                    const videoId = adVideo.split('streamable.com/')[1];
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://streamable.com/e/${videoId}?autoplay=1&loop=1&controls=0`;
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.frameBorder = '0';
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
                } else {
                    // Handle direct video URLs
                    videoElement = document.createElement('video');
                    videoElement.src = adVideo;
                    videoElement.style.width = '100%';
                    videoElement.style.height = '100%';
                    videoElement.autoplay = true;
                    videoElement.loop = true;
                    videoElement.playsInline = true;
                    videoElement.muted = audioControl === 'muted';
                    
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
    
    document.getElementById('crop-image').src = adImage;
    document.getElementById('crop-modal').style.display = 'block';
    
    // Initialize crop settings
    currentCropSettings = { x: 0, y: 0, zoom: 1 };
    updateCropImage();
}

// Hide crop tool
function hideCropTool() {
    document.getElementById('crop-modal').style.display = 'none';
}

// Update crop image based on current settings
function updateCropImage() {
    const img = document.getElementById('crop-image');
    img.style.transform = `translate(${currentCropSettings.x}px, ${currentCropSettings.y}px) scale(${currentCropSettings.zoom})`;
}

// Apply crop settings
function applyCrop() {
    const cropPosition = document.getElementById('crop-position');
    
    // Convert zoom and position to crop position
    if (currentCropSettings.zoom > 1) {
        if (currentCropSettings.x < 0) {
            cropPosition.value = 'left';
        } else if (currentCropSettings.x > 0) {
            cropPosition.value = 'right';
        } else if (currentCropSettings.y < 0) {
            cropPosition.value = 'top';
        } else if (currentCropSettings.y > 0) {
            cropPosition.value = 'bottom';
        } else {
            cropPosition.value = 'center';
        }
    } else {
        cropPosition.value = 'center';
    }
    
    hideCropTool();
    updatePreview();
}

// Show Streamable upload modal
function showStreamableModal() {
    document.getElementById('streamable-modal').style.display = 'block';
    document.getElementById('streamable-result').style.display = 'none';
    document.getElementById('streamable-progress').style.display = 'none';
    document.getElementById('video-file').value = '';
    document.getElementById('streamable-title').value = '';
}

// Hide Streamable upload modal
function hideStreamableModal() {
    document.getElementById('streamable-modal').style.display = 'none';
}

// Upload video to Streamable
function uploadToStreamable() {
    const fileInput = document.getElementById('video-file');
    const titleInput = document.getElementById('streamable-title');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select a video file first');
        return;
    }
    
    const file = fileInput.files[0];
    const title = titleInput.value || 'My Video Ad';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    
    document.getElementById('upload-streamable-btn').disabled = true;
    document.getElementById('streamable-progress').style.display = 'block';
    
    // Note: In a real implementation, you would need a server-side component to handle the upload
    // to Streamable since it requires authentication. This is just a mock implementation.
    
    // Mock upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 5;
        if (progress > 90) {
            clearInterval(progressInterval);
            return;
        }
        document.getElementById('upload-progress').value = progress;
        document.getElementById('upload-status').textContent = `Uploading... ${progress}%`;
    }, 300);
    
    // Simulate successful upload after delay
    setTimeout(() => {
        clearInterval(progressInterval);
        document.getElementById('upload-progress').value = 100;
        document.getElementById('upload-status').textContent = 'Processing video...';
        
        // Simulate processing delay
        setTimeout(() => {
            // Generate a mock Streamable URL
            const randomId = Math.random().toString(36).substring(2, 8);
            const mockUrl = `https://streamable.com/${randomId}`;
            
            document.getElementById('streamable-url').value = mockUrl;
            document.getElementById('streamable-result').style.display = 'block';
            document.getElementById('streamable-progress').style.display = 'none';
            document.getElementById('upload-streamable-btn').disabled = false;
        }, 2000);
    }, 3000);
}

// Use the Streamable URL in the form
function useStreamableUrl() {
    const url = document.getElementById('streamable-url').value;
    document.getElementById('ad-video').value = url;
    hideStreamableModal();
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
    
    // Get size
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
        id: Date.now().toString(),
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
    
    // Generate embed code
    let embedCode = '';
    let shareableLink = '';
    let adScript = '';
    
    if (adType === 'video') {
        // Generate video ad code
        embedCode = generateVideoAdCode(ad);
        shareableLink = generateShareableLink(ad);
        adScript = generateVideoAdScript(ad);
    } else {
        // Generate other ad types code
        embedCode = generateStandardAdCode(ad);
        shareableLink = generateShareableLink(ad);
    }
    
    // Display the generated code
    document.getElementById('embed-code').textContent = embedCode;
    document.getElementById('short-link').textContent = shareableLink;
    
    if (adType === 'video') {
        document.getElementById('ad-script-code').textContent = adScript;
        document.getElementById('ad-script-container').style.display = 'block';
    } else {
        document.getElementById('ad-script-container').style.display = 'none';
    }
    
    // Save the ad
    saveAd(ad);
}

// Generate standard ad code
function generateStandardAdCode(ad) {
    let code = `<div id="my-ad-${ad.id}" style="width: ${ad.width}px; height: ${ad.height}px; background-color: ${ad.bgColor}; position: relative; overflow: hidden; cursor: pointer;" onclick="window.open('${ad.link}', '_blank')">`;
    
    if (ad.image) {
        code += `<img src="${ad.image}" style="width: 100%; height: 100%; object-fit: cover; object-position: ${ad.cropPosition};">`;
    }
    
    if (ad.text) {
        code += `<div style="position: absolute; bottom: 0; left: 0; right: 0; background-color: rgba(0,0,0,0.7); color: white; padding: 10px; text-align: center;">${ad.text}</div>`;
    }
    
    code += `</div>`;
    
    return code;
}

// Generate video ad code
function generateVideoAdCode(ad) {
    let code = `<div id="my-ad-${ad.id}" style="width: ${ad.width}px; height: ${ad.height}px; background-color: ${ad.bgColor}; position: relative; overflow: hidden;">`;
    
    if (ad.video.includes('youtube.com') || ad.video.includes('youtu.be')) {
        // YouTube video
        let videoId = '';
        if (ad.video.includes('youtube.com/watch?v=')) {
            videoId = ad.video.split('v=')[1].split('&')[0];
        } else if (ad.video.includes('youtu.be/')) {
            videoId = ad.video.split('youtu.be/')[1].split('?')[0];
        }
        
        if (videoId) {
            const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0`;
            if (ad.audioControl === 'muted') {
                embedUrl += '&mute=1';
            }
            
            code += `<iframe src="${embedUrl}" style="width: 100%; height: 100%; border: none;"></iframe>`;
            code += `<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer;" onclick="window.open('${ad.link}', '_blank')"></div>`;
        }
    } else if (ad.video.includes('streamable.com')) {
        // Streamable video
        const videoId = ad.video.split('streamable.com/')[1];
        code += `<iframe src="https://streamable.com/e/${videoId}?autoplay=1&loop=1&controls=0" style="width: 100%; height: 100%; border: none;"></iframe>`;
        code += `<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer;" onclick="window.open('${ad.link}', '_blank')"></div>`;
    } else {
        // Direct video
        code += `<video src="${ad.video}" style="width: 100%; height: 100%;" autoplay loop ${ad.audioControl === 'muted' ? 'muted' : ''} playsinline></video>`;
        code += `<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer;" onclick="window.open('${ad.link}', '_blank')"></div>`;
    }
    
    code += `</div>`;
    
    return code;
}

// Generate shareable link
function generateShareableLink(ad) {
    // In a real implementation, this would generate a short link that points to your server
    // which would then render the ad with the ad script at the bottom
    
    // For this demo, we'll just create a data URL that contains the ad info
    const adData = encodeURIComponent(JSON.stringify(ad));
    return `${window.location.href.split('?')[0]}?ad=${adData}`;
}

// Generate video ad script that shows ad when opened via link
function generateVideoAdScript(ad) {
    return `<script>
        // Check if this page was opened via our shareable link
        if (window.location.search.includes('ad=')) {
            // Parse the ad data
            const adData = JSON.parse(decodeURIComponent(window.location.search.split('ad=')[1]));
            
            // Create the ad container
            const adContainer = document.createElement('div');
            adContainer.style.position = 'fixed';
            adContainer.style.bottom = '0';
            adContainer.style.left = '0';
            adContainer.style.right = '0';
            adContainer.style.height = '50px';
            adContainer.style.backgroundColor = '#f0f0f0';
            adContainer.style.borderTop = '1px solid #ddd';
            adContainer.style.zIndex = '1000';
            adContainer.style.display = 'flex';
            adContainer.style.justifyContent = 'center';
            adContainer.style.alignItems = 'center';
            
            // Add the ad script
            const adScript = document.createElement('script');
            adScript.type = 'text/javascript';
            adScript.innerHTML = \`
                atOptions = {
                    'key': 'a481763decb23c81da5296aea54b0fd9',
                    'format': 'iframe',
                    'height': 50,
                    'width': 320,
                    'params': {}
                };
            \`;
            
            const invokeScript = document.createElement('script');
            invokeScript.type = 'text/javascript';
            invokeScript.src = '//www.highperformanceformat.com/a481763decb23c81da5296aea54b0fd9/invoke.js';
            
            adContainer.appendChild(adScript);
            adContainer.appendChild(invokeScript);
            
            // Add to the page
            document.body.appendChild(adContainer);
        }
    </script>`;
}

// Save ad to localStorage
function saveAd(ad) {
    // Check if we're updating an existing ad
    if (currentAdId) {
        const index = ads.findIndex(a => a.id === currentAdId);
        if (index !== -1) {
            ads[index] = ad;
        }
    } else {
        // Add new ad
        ads.push(ad);
    }
    
    localStorage.setItem('makeMyAds', JSON.stringify(ads));
    loadSavedAds();
    currentAdId = null;
}

// Load saved ads from localStorage
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
                <p>Type: ${ad.type} | Size: ${ad.width}x${ad.height}</p>
                <small>Created: ${new Date(ad.createdAt).toLocaleString()}</small>
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
    if (!ad) return;
    
    currentAdId = ad.id;
    
    // Fill the form with ad data
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
    const standardSize = `${ad.width}x${ad.height}`;
    const sizeOption = document.querySelector(`.ad-size-option[data-size="${standardSize}"]`);
    
    if (sizeOption) {
        document.querySelectorAll('.ad-size-option').forEach(opt => opt.classList.remove('selected'));
        sizeOption.classList.add('selected');
        document.getElementById('custom-size-container').style.display = 'none';
    } else {
        document.querySelector('.ad-size-option[data-size="custom"]').click();
        document.getElementById('custom-width').value = ad.width;
        document.getElementById('custom-height').value = ad.height;
    }
    
    // Update preview
    document.getElementById('ad-preview').style.width = `${ad.width}px`;
    document.getElementById('ad-preview').style.height = `${ad.height}px`;
    updatePreview();
    
    // Switch to create tab
    document.querySelector('.tab[onclick*="create-tab"]').click();
}

// Delete an ad
function deleteAd(adId) {
    if (confirm('Are you sure you want to delete this ad?')) {
        ads = ads.filter(a => a.id !== adId);
        localStorage.setItem('makeMyAds', JSON.stringify(ads));
        loadSavedAds();
        
        if (currentAdId === adId) {
            currentAdId = null;
            clearPreview();
        }
    }
}

// Check for hash routing to load an ad
function checkHashRouting() {
    const params = new URLSearchParams(window.location.search);
    const adParam = params.get('ad');
    
    if (adParam) {
        try {
            const ad = JSON.parse(decodeURIComponent(adParam));
            renderAdFromLink(ad);
        } catch (e) {
            console.error('Error parsing ad data:', e);
        }
    }
}

// Render ad when opened via link
function renderAdFromLink(ad) {
    // Clear the page
    document.body.innerHTML = '';
    
    // Create ad container
    const adContainer = document.createElement('div');
    adContainer.style.width = '100%';
    adContainer.style.height = '100vh';
    adContainer.style.display = 'flex';
    adContainer.style.justifyContent = 'center';
    adContainer.style.alignItems = 'center';
    adContainer.style.backgroundColor = '#f5f5f5';
    
    // Add the ad
    if (ad.type === 'video') {
        adContainer.innerHTML = generateVideoAdCode(ad);
        
        // Add the ad script at the bottom
        const adScriptContainer = document.createElement('div');
        adScriptContainer.style.position = 'fixed';
        adScriptContainer.style.bottom = '0';
        adScriptContainer.style.left = '0';
        adScriptContainer.style.right = '0';
        adScriptContainer.style.height = '50px';
        adScriptContainer.style.backgroundColor = '#f0f0f0';
        adScriptContainer.style.borderTop = '1px solid #ddd';
        adScriptContainer.style.zIndex = '1000';
        adScriptContainer.style.display = 'flex';
        adScriptContainer.style.justifyContent = 'center';
        adScriptContainer.style.alignItems = 'center';
        
        const adScript = document.createElement('script');
        adScript.type = 'text/javascript';
        adScript.innerHTML = `
            atOptions = {
                'key': 'a481763decb23c81da5296aea54b0fd9',
                'format': 'iframe',
                'height': 50,
                'width': 320,
                'params': {}
            };
        `;
        
        const invokeScript = document.createElement('script');
        invokeScript.type = 'text/javascript';
        invokeScript.src = '//www.highperformanceformat.com/a481763decb23c81da5296aea54b0fd9/invoke.js';
        
        adScriptContainer.appendChild(adScript);
        adScriptContainer.appendChild(invokeScript);
        
        document.body.appendChild(adContainer);
        document.body.appendChild(adScriptContainer);
    } else {
        adContainer.innerHTML = generateStandardAdCode(ad);
        document.body.appendChild(adContainer);
    }
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
    
    // Show copied notification
    const originalText = elementId === 'embed-code' ? 'Copy Code' : 'Copy Link';
    const button = document.querySelector(`button[onclick="copyToClipboard('${elementId}')"]`);
    const originalButtonText = button.textContent;
    button.textContent = 'Copied!';
    
    setTimeout(() => {
        button.textContent = originalButtonText;
    }, 2000);
}
