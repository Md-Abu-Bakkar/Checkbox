// Global variables
let ads = JSON.parse(localStorage.getItem('makeMyAds')) || [];
let currentAdId = null;
let currentCropSettings = { x: 0, y: 0, zoom: 1 };

// Demo ad scripts for preview
const demoAds = {
    '300x250': `<div style="width: 100%; height: 100%; background-color: #1E2026; display: flex; justify-content: center; align-items: center; color: #F0B90B; font-weight: bold; border: 2px dashed #F0B90B;">
        <p>300x250 Ad Preview</p>
    </div>`,
    '728x90': `<div style="width: 100%; height: 100%; background-color: #1E2026; display: flex; justify-content: center; align-items: center; color: #F0B90B; font-weight: bold; border: 2px dashed #F0B90B;">
        <p>728x90 Ad Preview</p>
    </div>`,
    '160x600': `<div style="width: 100%; height: 100%; background-color: #1E2026; display: flex; justify-content: center; align-items: center; color: #F0B90B; font-weight: bold; border: 2px dashed #F0B90B;">
        <p>160x600 Ad Preview</p>
    </div>`,
    '320x50': `<div style="width: 100%; height: 100%; background-color: #1E2026; display: flex; justify-content: center; align-items: center; color: #F0B90B; font-weight: bold; border: 2px dashed #F0B90B;">
        <p>320x50 Ad Preview</p>
    </div>`,
    '468x60': `<div style="width: 100%; height: 100%; background-color: #1E2026; display: flex; justify-content: center; align-items: center; color: #F0B90B; font-weight: bold; border: 2px dashed #F0B90B;">
        <p>468x60 Ad Preview</p>
    </div>`
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
    
    // Show popup message after 5 seconds
    setTimeout(showPopupMessage, 5000);
    
    // Show fullscreen ad once per day
    showFullscreenAdOncePerDay();
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
    const previewUpdateFields = ['ad-image', 'ad-video', 'ad-text', 'ad-link', 'bg-color', 'ad-position', 'crop-position'];
    previewUpdateFields.forEach(id => {
        document.getElementById(id).addEventListener('input', updatePreview);
        document.getElementById(id).addEventListener('change', updatePreview);
    });
}

// Initialize color picker
function initColorPicker() {
    document.getElementById('custom-color').value = '#F0B90B';
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
    
    preview.innerHTML = '';
    
    if (selectedSize !== 'custom' && demoAds[selectedSize]) {
        preview.innerHTML = demoAds[selectedSize];
    } else {
        preview.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background-color: #1E2026; color: #F0B90B; border: 2px dashed #F0B90B;">
                <p>Your ad preview will appear here</p>
            </div>
        `;
    }
}

// Show popup message
function showPopupMessage() {
    // Only show once per session
    if (sessionStorage.getItem('popupShown')) return;
    sessionStorage.setItem('popupShown', 'true');
    
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100%';
    popup.style.height = '100%';
    popup.style.backgroundColor = 'rgba(0,0,0,0.8)';
    popup.style.zIndex = '2000';
    popup.style.display = 'flex';
    popup.style.justifyContent = 'center';
    popup.style.alignItems = 'center';
    popup.style.fontFamily = 'Arial, sans-serif';
    
    const popupContent = document.createElement('div');
    popupContent.style.backgroundColor = '#1E2026';
    popupContent.style.padding = '20px';
    popupContent.style.borderRadius = '10px';
    popupContent.style.maxWidth = '500px';
    popupContent.style.width = '90%';
    popupContent.style.border = '2px solid #F0B90B';
    
    const message = document.createElement('div');
    message.style.color = '#EAECEF';
    message.style.marginBottom = '20px';
    message.style.textAlign = 'center';
    message.innerHTML = `
        <h3 style="color: #F0B90B; margin-bottom: 15px;">📱 Smart tech updates, imo mods & useful tools</h3>
        <p style="margin-bottom: 10px;">Crafted for Bangladeshi users. Join for smart solutions every day!</p>
        <p style="margin-bottom: 15px;">🚀 MakeMyAd is a no-code, browser-based ad generator that lets you easily design banner, video, popup, and social bar ads — all without writing a single line of code.</p>
        <p style="color: #F0B90B; font-weight: bold;">🔽 Explore the following resources to get started:</p>
    `;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexDirection = 'column';
    buttonContainer.style.gap = '10px';
    
    const createButton = (text, url) => {
        const btn = document.createElement('a');
        btn.href = url;
        btn.target = '_blank';
        btn.style.backgroundColor = '#F0B90B';
        btn.style.color = '#1E2026';
        btn.style.padding = '10px';
        btn.style.borderRadius = '5px';
        btn.style.textAlign = 'center';
        btn.style.textDecoration = 'none';
        btn.style.fontWeight = 'bold';
        btn.textContent = text;
        return btn;
    };
    
    buttonContainer.appendChild(createButton('▶️ Tutorial Video', 'https://youtu.be/M4gsrX0eYlg?si=wo0L2RXhi86KcUFe'));
    buttonContainer.appendChild(createButton('💬 Join Telegram Channel', 'https://t.me/smarttipsbd25'));
    buttonContainer.appendChild(createButton('📂 Developer Portfolio', 'https://abubakkardve.github.io/SmartDev-Solutions'));
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '15px';
    closeButton.style.padding = '8px 15px';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.color = '#F0B90B';
    closeButton.style.border = '1px solid #F0B90B';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.width = '100%';
    closeButton.onclick = function() {
        document.body.removeChild(popup);
    };
    
    popupContent.appendChild(message);
    popupContent.appendChild(buttonContainer);
    popupContent.appendChild(closeButton);
    popup.appendChild(popupContent);
    document.body.appendChild(popup);
}

// Show fullscreen ad once per day
function showFullscreenAdOncePerDay() {
    const lastAdShown = localStorage.getItem('lastFullscreenAd');
    const now = new Date().toDateString();
    
    if (lastAdShown !== now) {
        localStorage.setItem('lastFullscreenAd', now);
        
        // Show after 10 seconds
        setTimeout(() => {
            const adContainer = document.createElement('div');
            adContainer.style.position = 'fixed';
            adContainer.style.top = '0';
            adContainer.style.left = '0';
            adContainer.style.width = '100%';
            adContainer.style.height = '100vh';
            adContainer.style.zIndex = '10000';
            adContainer.style.backgroundColor = '#1E2026';
            
            // Add YouTube video player
            const videoContainer = document.createElement('div');
            videoContainer.style.width = '100%';
            videoContainer.style.height = '100%';
            videoContainer.style.position = 'relative';
            
            const iframe = document.createElement('iframe');
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.src = 'https://www.youtube.com/embed/M4gsrX0eYlg?autoplay=1&mute=1&rel=0&controls=0&showinfo=0';
            iframe.frameborder = '0';
            iframe.allow = 'autoplay; encrypted-media';
            iframe.allowFullscreen = true;
            
            // Add clickable overlay
            const overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.cursor = 'pointer';
            overlay.style.zIndex = '10';
            overlay.onclick = () => {
                window.location.href = 'https://abubakkardve.github.io/SmartDev-Solutions';
            };
            
            // Add skip button
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
            skipButton.style.zIndex = '11';
            skipButton.onclick = function() {
                document.body.removeChild(adContainer);
            };
            
            videoContainer.appendChild(iframe);
            videoContainer.appendChild(overlay);
            adContainer.appendChild(videoContainer);
            adContainer.appendChild(skipButton);
            document.body.appendChild(adContainer);
        }, 10000);
    }
}

// Clear preview
function clearPreview() {
    document.getElementById('ad-form').reset();
    document.getElementById('bg-color').value = '#1E2026';
    document.querySelector('.color-option[data-color="#1E2026"]').classList.add('selected');
    document.querySelector('.color-option[data-color="#1E2026"]').click();
    document.querySelector('.ad-size-option[data-size="300x250"]').click();
    document.getElementById('embed-code').innerHTML = '<p>Your ad code will appear here after generation</p>';
    document.getElementById('short-link').innerHTML = '<p>Your shareable link will appear here after generation</p>';
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
                        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0`;
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
                    videoElement.muted = true;
                    videoElement.loop = true;
                    videoElement.playsInline = true;
                    
                    // Make the entire video clickable
                    videoElement.style.cursor = 'pointer';
                    videoElement.onclick = function() {
                        window.open(adLink, '_blank');
                    };
                    
                    // Enable sound on user interaction
                    const enableSound = function() {
                        videoElement.muted = false;
                        document.removeEventListener('scroll', enableSound);
                        document.removeEventListener('click', enableSound);
                        document.removeEventListener('touchstart', enableSound);
                    };
                    
                    document.addEventListener('scroll', enableSound);
                    document.addEventListener('click', enableSound);
                    document.addEventListener('touchstart', enableSound);
                    
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
            ctaButton.style.backgroundColor = '#F0B90B';
            ctaButton.style.color = '#1E2026';
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
            
        case 'native':
            const nativeContainer = document.createElement('div');
            nativeContainer.style.width = '100%';
            nativeContainer.style.height = '100%';
            nativeContainer.style.position = 'relative';
            
            const youtubeVideos = document.createElement('div');
            youtubeVideos.id = 'youtube-videos';
            youtubeVideos.style.width = '100%';
            youtubeVideos.style.height = '100%';
            
            const script = document.createElement('script');
            script.textContent = `
                const apiKey = "AIzaSyCRA7g2azKSoLoG6u2RSbkg3uMzJjtUd6A";
                const channelId = "UCiaRAw6ZC0i-JK83RwS4bkQ";
                const maxResults = 3;
                const redirectUrl = "https://abubakkardve.github.io/SmartDev-Solutions";
                
                fetch(\`https://www.googleapis.com/youtube/v3/search?key=\${apiKey}&channelId=\${channelId}&part=snippet,id&order=date&maxResults=\${maxResults}\`)
                    .then(response => response.json())
                    .then(data => {
                        const container = document.getElementById("youtube-videos");
                        data.items.forEach(item => {
                            const videoId = item.id.videoId;
                            if (videoId) {
                                const videoContainer = document.createElement("div");
                                videoContainer.style.position = "relative";
                                videoContainer.style.marginBottom = "20px";
                                
                                const iframe = document.createElement("iframe");
                                iframe.width = "100%";
                                iframe.height = "315";
                                iframe.src = \`https://www.youtube.com/embed/\${videoId}?autoplay=1&mute=1&rel=0&controls=1&showinfo=0\`;
                                iframe.frameborder = "0";
                                iframe.allow = "autoplay; encrypted-media";
                                iframe.allowFullscreen = true;
                                
                                const overlay = document.createElement("div");
                                overlay.style.position = "absolute";
                                overlay.style.top = "0";
                                overlay.style.left = "0";
                                overlay.style.width = "100%";
                                overlay.style.height = "100%";
                                overlay.style.cursor = "pointer";
                                overlay.style.zIndex = "10";
                                overlay.onclick = () => {
                                    window.location.href = redirectUrl;
                                };
                                
                                videoContainer.appendChild(iframe);
                                videoContainer.appendChild(overlay);
                                container.appendChild(videoContainer);
                            }
                        });
                    })
                    .catch(error => {
                        console.error("YouTube API Error:", error);
                        document.getElementById("youtube-videos").innerHTML = "ভিডিও লোড করতে সমস্যা হয়েছে।";
                    });
            `;
            
            nativeContainer.appendChild(youtubeVideos);
            nativeContainer.appendChild(script);
            preview.appendChild(nativeContainer);
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
        alert('Please add an image URL first');
        return;
    }
    
    const modal = document.getElementById('crop-modal');
    const cropImage = document.getElementById('crop-image');
    cropImage.src = adImage;
    cropImage.style.left = '0';
    cropImage.style.top = '0';
    cropImage.style.transform = 'scale(1)';
    currentCropSettings = { x: 0, y: 0, zoom: 1 };
    
    // Set initial position based on crop position selection
    const cropPosition = document.getElementById('crop-position').value;
    let initialX = 0, initialY = 0;
    
    switch(cropPosition) {
        case 'top': initialY = '-25%'; break;
        case 'bottom': initialY = '25%'; break;
        case 'left': initialX = '-25%'; break;
        case 'right': initialX = '25%'; break;
    }
    
    cropImage.style.left = initialX;
    cropImage.style.top = initialY;
    currentCropSettings.x = parseInt(initialX) || 0;
    currentCropSettings.y = parseInt(initialY) || 0;
    
    modal.style.display = 'block';
    
    // Set up zoom slider
    document.getElementById('crop-zoom').addEventListener('input', function() {
        const zoomValue = parseFloat(this.value);
        cropImage.style.transform = `scale(${zoomValue})`;
        currentCropSettings.zoom = zoomValue;
    });
    
    // Make image draggable
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
        cropImage.style.left = `${currentCropSettings.x}px`;
        cropImage.style.top = `${currentCropSettings.y}px`;
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
    
    // Touch events for mobile
    cropImage.addEventListener('touchstart', function(e) {
        isDragging = true;
        startX = e.touches[0].clientX - currentCropSettings.x;
        startY = e.touches[0].clientY - currentCropSettings.y;
        e.preventDefault();
    });
    
    document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        currentCropSettings.x = e.touches[0].clientX - startX;
        currentCropSettings.y = e.touches[0].clientY - startY;
        cropImage.style.left = `${currentCropSettings.x}px`;
        cropImage.style.top = `${currentCropSettings.y}px`;
        e.preventDefault();
    });
    
    document.addEventListener('touchend', function() {
        isDragging = false;
    });
}

// Hide crop tool
function hideCropTool() {
    document.getElementById('crop-modal').style.display = 'none';
}

// Apply crop settings
function applyCrop() {
    // Determine the crop position based on current settings
    let cropPosition = 'center';
    const x = currentCropSettings.x;
    const y = currentCropSettings.y;
    
    if (x < -50 && Math.abs(x) > Math.abs(y)) cropPosition = 'left';
    else if (x > 50 && Math.abs(x) > Math.abs(y)) cropPosition = 'right';
    else if (y < -50) cropPosition = 'top';
    else if (y > 50) cropPosition = 'bottom';
    
    document.getElementById('crop-position').value = cropPosition;
    hideCropTool();
    updatePreview();
}

// Generate the ad and save it
function generateAd() {
    const adName = document.getElementById('ad-name').value;
    const adType = document.getElementById('ad-type').value;
    const adImage = document.getElementById('ad-image').value;
    const adVideo = document.getElementById('ad-video').value;
    const adLink = document.getElementById('ad-link').value;
    const adText = document.getElementById('ad-text').value;
    const bgColor = document.getElementById('bg-color').value;
    const duration = document.getElementById('ad-duration').value;
    const position = document.getElementById('ad-position').value;
    const cropPosition = document.getElementById('crop-position').value;
    
    // Validate required fields
    if (!adName || !adLink) {
        alert('Please fill in all required fields (Ad Name and Destination URL)');
        return;
    }
    
    if ((adType === 'banner' || adType === 'popup' || adType === 'fullscreen') && !adImage) {
        alert('Please add an image URL for this ad type');
        return;
    }
    
    if (adType === 'video' && !adVideo) {
        alert('Please add a video URL for this ad type');
        return;
    }
    
    // Get selected size
    let width, height;
    const selectedSize = document.querySelector('.ad-size-option.selected').dataset.size;
    
    if (selectedSize === 'custom') {
        width = document.getElementById('custom-width').value;
        height = document.getElementById('custom-height').value;
        
        if (!width || !height) {
            alert('Please enter custom width and height');
            return;
        }
    } else {
        [width, height] = selectedSize.split('x');
    }
    
    // For fullscreen and social ads, adjust size
    if (adType === 'fullscreen') {
        width = '100%';
        height = '100vh';
    } else if (adType === 'social') {
        if (position === 'left' || position === 'right') {
            width = '50px';
            height = '100%';
        } else {
            width = '100%';
            height = '50px';
        }
    }
    
    // Create ad object
    const ad = {
        id: currentAdId || Date.now().toString(),
        name: adName,
        type: adType,
        width: width,
        height: height,
        image: adImage,
        video: adVideo,
        link: adLink,
        text: adText,
        bgColor: bgColor,
        duration: duration,
        position: position,
        cropPosition: cropPosition,
        createdAt: new Date().toISOString()
    };
    
    // Save or update the ad
    if (currentAdId) {
        // Update existing ad
        const index = ads.findIndex(a => a.id === currentAdId);
        if (index !== -1) {
            ads[index] = ad;
        }
    } else {
        // Add new ad
        ads.push(ad);
    }
    
    // Save to localStorage
    localStorage.setItem('makeMyAds', JSON.stringify(ads));
    
    // Generate embed code and shareable link
    generateEmbedCode(ad);
    generateShareableLink(ad);
    
    // Reload saved ads list
    loadSavedAds();
    
    // Reset currentAdId
    currentAdId = null;
    
    // Show success message
    alert(`Ad "${adName}" saved successfully!`);
}

// Generate embed code for the ad
function generateEmbedCode(ad) {
    let embedCode = '';
    
    switch(ad.type) {
        case 'banner':
            embedCode = `
<div style="width: ${ad.width}px; height: ${ad.height}px; background-color: ${ad.bgColor}; position: relative; overflow: hidden; cursor: pointer;" onclick="window.open('${ad.link}', '_blank')">
    ${ad.image ? `<img src="${ad.image}" style="width: 100%; height: 100%; object-fit: cover; object-position: ${ad.cropPosition};">` : ''}
    ${ad.text ? `<div style="position: absolute; bottom: 0; left: 0; right: 0; background-color: rgba(0,0,0,0.7); color: white; padding: 10px; text-align: center;">${ad.text}</div>` : ''}
</div>`;
            break;
            
        case 'video':
            if (ad.video.includes('youtube.com') || ad.video.includes('youtu.be')) {
                // YouTube embed code
                let videoId = '';
                if (ad.video.includes('youtube.com/watch?v=')) {
                    videoId = ad.video.split('v=')[1].split('&')[0];
                } else if (ad.video.includes('youtu.be/')) {
                    videoId = ad.video.split('youtu.be/')[1].split('?')[0];
                }
                
                if (videoId) {
                    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0`;
                    embedCode = `
<div style="width: ${ad.width}px; height: ${ad.height}px; position: relative;">
    <iframe src="${embedUrl}" style="width: 100%; height: 100%; border: none;"></iframe>
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer;" onclick="window.open('${ad.link}', '_blank')"></div>
</div>`;
                }
            } else {
                // Direct video embed code with auto-play and sound control
                embedCode = `
<div style="width: ${ad.width}px; height: ${ad.height}px; position: relative;">
    <video id="video-ad" style="width: 100%; height: 100%;" autoplay muted loop playsinline>
        <source src="${ad.video}" type="video/mp4">
        Your browser does not support the video tag.
    </video>
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer;" onclick="window.open('${ad.link}', '_blank')"></div>
    <script>
        // Enable sound on user interaction
        const videoAd = document.getElementById('video-ad');
        const enableSound = function() {
            videoAd.muted = false;
            document.removeEventListener('scroll', enableSound);
            document.removeEventListener('click', enableSound);
            document.removeEventListener('touchstart', enableSound);
        };
        document.addEventListener('scroll', enableSound);
        document.addEventListener('click', enableSound);
        document.addEventListener('touchstart', enableSound);
    </script>
</div>`;
            }
            break;
            
        case 'social':
            const isVertical = ad.position === 'left' || ad.position === 'right';
            embedCode = `
<div style="position: fixed; ${ad.position}: 0; ${isVertical ? 'width: 50px; height: 100%;' : 'width: 100%; height: 50px;'} background-color: ${ad.bgColor}; display: flex; ${isVertical ? 'flex-direction: column;' : ''} align-items: center; justify-content: center; z-index: 1000;">
    <button style="padding: 8px 15px; background-color: #F0B90B; color: #1E2026; border: none; border-radius: 4px; cursor: pointer;" onclick="window.open('${ad.link}', '_blank')">
        ${ad.text || 'Click Here'}
    </button>
</div>`;
            break;
            
        case 'popup':
            embedCode = `
<script>
    function showPopupAd() {
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '0';
        popup.style.left = '0';
        popup.style.width = '100%';
        popup.style.height = '100%';
        popup.style.backgroundColor = 'rgba(0,0,0,0.7)';
        popup.style.zIndex = '1000';
        popup.style.display = 'flex';
        popup.style.justifyContent = 'center';
        popup.style.alignItems = 'center';
        
        const popupContent = document.createElement('div');
        popupContent.style.width = '80%';
        popupContent.style.height = '80%';
        popupContent.style.backgroundColor = '${ad.bgColor}';
        popupContent.style.padding = '20px';
        popupContent.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        popupContent.style.position = 'relative';
        
        ${ad.image ? `const img = document.createElement('img');
        img.src = '${ad.image}';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '70%';
        img.style.display = 'block';
        img.style.margin = '0 auto';
        img.style.objectPosition = '${ad.cropPosition}';
        popupContent.appendChild(img);` : ''}
        
        ${ad.text ? `const textDiv = document.createElement('div');
        textDiv.textContent = '${ad.text.replace(/'/g, "\\'")}';
        textDiv.style.marginTop = '15px';
        textDiv.style.textAlign = 'center';
        popupContent.appendChild(textDiv);` : ''}
        
        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '5px';
        closeButton.style.right = '5px';
        closeButton.style.backgroundColor = 'transparent';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '16px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = function() {
            document.body.removeChild(popup);
        };
        popupContent.appendChild(closeButton);
        
        popupContent.style.cursor = 'pointer';
        popupContent.onclick = function() {
            window.open('${ad.link}', '_blank');
        };
        
        popup.appendChild(popupContent);
        document.body.appendChild(popup);
        
        setTimeout(function() {
            if (document.body.contains(popup)) {
                document.body.removeChild(popup);
            }
        }, ${ad.duration * 1000});
    }
    
    // Show popup after 3 seconds
    setTimeout(showPopupAd, 3000);
</script>`;
            break;
            
        case 'fullscreen':
            embedCode = `
<script>
    function showFullscreenAd() {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = '${ad.bgColor}';
        overlay.style.zIndex = '10000';
        
        ${ad.image ? `const img = document.createElement('img');
        img.src = '${ad.image}';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.objectPosition = '${ad.cropPosition}';
        overlay.appendChild(img);` : ''}
        
        ${ad.text ? `const textDiv = document.createElement('div');
        textDiv.textContent = '${ad.text.replace(/'/g, "\\'")}';
        textDiv.style.position = 'absolute';
        textDiv.style.bottom = '20%';
        textDiv.style.left = '0';
        textDiv.style.right = '0';
        textDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
        textDiv.style.color = 'white';
        textDiv.style.padding = '20px';
        textDiv.style.textAlign = 'center';
        overlay.appendChild(textDiv);` : ''}
        
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
            document.body.removeChild(overlay);
        };
        overlay.appendChild(skipButton);
        
        overlay.style.cursor = 'pointer';
        overlay.onclick = function() {
            window.open('${ad.link}', '_blank');
        };
        
        document.body.appendChild(overlay);
        
        setTimeout(function() {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, ${ad.duration * 1000});
    }
    
    // Show fullscreen ad immediately
    showFullscreenAd();
</script>`;
            break;
            
        case 'native':
            embedCode = `
<div id="youtube-videos"></div>
<script>
    const apiKey = "AIzaSyCRA7g2azKSoLoG6u2RSbkg3uMzJjtUd6A";
    const channelId = "UCiaRAw6ZC0i-JK83RwS4bkQ";
    const maxResults = 3;
    const redirectUrl = "https://abubakkardve.github.io/SmartDev-Solutions";
    
    fetch(\`https://www.googleapis.com/youtube/v3/search?key=\${apiKey}&channelId=\${channelId}&part=snippet,id&order=date&maxResults=\${maxResults}\`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("youtube-videos");
            data.items.forEach(item => {
                const videoId = item.id.videoId;
                if (videoId) {
                    const videoContainer = document.createElement("div");
                    videoContainer.style.position = "relative";
                    videoContainer.style.marginBottom = "20px";
                    
                    const iframe = document.createElement("iframe");
                    iframe.width = "100%";
                    iframe.height = "315";
                    iframe.src = \`https://www.youtube.com/embed/\${videoId}?autoplay=1&mute=1&rel=0&controls=1&showinfo=0\`;
                    iframe.frameborder = "0";
                    iframe.allow = "autoplay; encrypted-media";
                    iframe.allowFullscreen = true;
                    
                    const overlay = document.createElement("div");
                    overlay.style.position = "absolute";
                    overlay.style.top = "0";
                    overlay.style.left = "0";
                    overlay.style.width = "100%";
                    overlay.style.height = "100%";
                    overlay.style.cursor = "pointer";
                    overlay.style.zIndex = "10";
                    overlay.onclick = () => {
                        window.location.href = redirectUrl;
                    };
                    
                    videoContainer.appendChild(iframe);
                    videoContainer.appendChild(overlay);
                    container.appendChild(videoContainer);
                }
            });
        })
        .catch(error => {
            console.error("YouTube API Error:", error);
            document.getElementById("youtube-videos").innerHTML = "ভিডিও লোড করতে সমস্যা হয়েছে।";
        });
</script>`;
            break;
    }
    
    document.getElementById('embed-code').textContent = embedCode.trim();
}

// Generate shareable link with Open Graph metadata
function generateShareableLink(ad) {
    // Create a data URL with the ad information
    const adData = {
        name: ad.name,
        type: ad.type,
        width: ad.width,
        height: ad.height,
        image: ad.image,
        video: ad.video,
        link: ad.link,
        text: ad.text,
        bgColor: ad.bgColor,
        duration: ad.duration,
        position: ad.position,
        cropPosition: ad.cropPosition
    };
    
    // Convert to base64
    const adDataBase64 = btoa(JSON.stringify(adData));
    
    // Create shareable URL
    const shareableLink = `${window.location.origin}${window.location.pathname}#/ad/${adDataBase64}`;
    
    document.getElementById('short-link').textContent = shareableLink;
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
            <div class="ad-item-info">
                <h3>${ad.name}</h3>
                <p>Type: ${ad.type} | Size: ${ad.width}x${ad.height} | Created: ${new Date(ad.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="ad-item-actions">
                <button onclick="editAd('${ad.id}')">Edit</button>
                <button onclick="viewAd('${ad.id}')">View</button>
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
    
    currentAdId = adId;
    
    // Fill the form with ad data
    document.getElementById('ad-name').value = ad.name;
    document.getElementById('ad-type').value = ad.type;
    document.getElementById('ad-image').value = ad.image || '';
    document.getElementById('ad-video').value = ad.video || '';
    document.getElementById('ad-link').value = ad.link;
    document.getElementById('ad-text').value = ad.text || '';
    document.getElementById('bg-color').value = ad.bgColor;
    document.getElementById('ad-duration').value = ad.duration || 5;
    document.getElementById('ad-position').value = ad.position || 'center';
    document.getElementById('crop-position').value = ad.cropPosition || 'center';
    
    // Update form fields
    updateFormFields();
    
    // Set color picker
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.color === ad.bgColor) {
            opt.classList.add('selected');
        }
    });
    
    // Set size options
    const sizeStr = `${ad.width}x${ad.height}`;
    const standardSizes = ['300x250', '728x90', '160x600', '320x50', '468x60'];
    
    if (standardSizes.includes(sizeStr)) {
        document.querySelectorAll('.ad-size-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.size === sizeStr) {
                opt.classList.add('selected');
            }
        });
        document.getElementById('custom-size-container').style.display = 'none';
    } else {
        document.querySelector('.ad-size-option[data-size="custom"]').classList.add('selected');
        document.getElementById('custom-size-container').style.display = 'block';
        document.getElementById('custom-width').value = ad.width;
        document.getElementById('custom-height').value = ad.height;
    }
    
    // Update preview
    updatePreview();
    
    // Generate embed code and shareable link
    generateEmbedCode(ad);
    generateShareableLink(ad);
    
    // Switch to create tab
    document.querySelector('.tab').click();
}

// View an ad (render it in preview)
function viewAd(adId) {
    const ad = ads.find(a => a.id === adId);
    if (!ad) return;
    
    // Create a temporary preview container
    const preview = document.createElement('div');
    preview.style.position = 'fixed';
    preview.style.top = '0';
    preview.style.left = '0';
    preview.style.width = '100%';
    preview.style.height = '100%';
    preview.style.backgroundColor = 'rgba(0,0,0,0.8)';
    preview.style.zIndex = '1000';
    preview.style.display = 'flex';
    preview.style.justifyContent = 'center';
    preview.style.alignItems = 'center';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '20px';
    closeButton.style.right = '20px';
    closeButton.style.backgroundColor = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '40px';
    closeButton.style.height = '40px';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = function() {
        document.body.removeChild(preview);
    };
    preview.appendChild(closeButton);
    
    // Create ad container
    const adContainer = document.createElement('div');
    adContainer.style.width = ad.type === 'fullscreen' ? '100%' : `${ad.width}${typeof ad.width === 'string' ? '' : 'px'}`;
    adContainer.style.height = ad.type === 'fullscreen' ? '100vh' : `${ad.height}${typeof ad.height === 'string' ? '' : 'px'}`;
    adContainer.style.backgroundColor = ad.bgColor;
    adContainer.style.position = 'relative';
    adContainer.style.overflow = 'hidden';
    adContainer.style.cursor = 'pointer';
    adContainer.onclick = function() {
        window.open(ad.link, '_blank');
    };
    
    // Render ad based on type
    switch(ad.type) {
        case 'banner':
            if (ad.image) {
                const img = document.createElement('img');
                img.src = ad.image;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.objectPosition = ad.cropPosition;
                adContainer.appendChild(img);
            }
            
            if (ad.text) {
                const textDiv = document.createElement('div');
                textDiv.textContent = ad.text;
                textDiv.style.position = 'absolute';
                textDiv.style.bottom = '0';
                textDiv.style.left = '0';
                textDiv.style.right = '0';
                textDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
                textDiv.style.color = 'white';
                textDiv.style.padding = '10px';
                textDiv.style.textAlign = 'center';
                adContainer.appendChild(textDiv);
            }
            break;
            
        case 'video':
            if (ad.video) {
                if (ad.video.includes('youtube.com') || ad.video.includes('youtu.be')) {
                    // Handle YouTube URLs
                    let videoId = '';
                    if (ad.video.includes('youtube.com/watch?v=')) {
                        videoId = ad.video.split('v=')[1].split('&')[0];
                    } else if (ad.video.includes('youtu.be/')) {
                        videoId = ad.video.split('youtu.be/')[1].split('?')[0];
                    }
                    
                    if (videoId) {
                        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0`;
                        const iframe = document.createElement('iframe');
                        iframe.src = embedUrl;
                        iframe.style.width = '100%';
                        iframe.style.height = '100%';
                        iframe.frameBorder = '0';
                        iframe.allow = 'autoplay; encrypted-media';
                        iframe.allowFullscreen = true;
                        
                        // Add clickable overlay
                        const overlay = document.createElement('div');
                        overlay.style.position = 'absolute';
                        overlay.style.top = '0';
                        overlay.style.left = '0';
                        overlay.style.width = '100%';
                        overlay.style.height = '100%';
                        overlay.style.cursor = 'pointer';
                        overlay.onclick = function() {
                            window.open(ad.link, '_blank');
                        };
                        
                        adContainer.appendChild(iframe);
                        adContainer.appendChild(overlay);
                    }
                } else {
                    // Handle direct video URLs
                    const video = document.createElement('video');
                    video.src = ad.video;
                    video.style.width = '100%';
                    video.style.height = '100%';
                    video.autoplay = true;
                    video.muted = true;
                    video.loop = true;
                    video.playsInline = true;
                    
                    // Enable sound on user interaction
                    const enableSound = function() {
                        video.muted = false;
                        document.removeEventListener('scroll', enableSound);
                        document.removeEventListener('click', enableSound);
                        document.removeEventListener('touchstart', enableSound);
                    };
                    
                    document.addEventListener('scroll', enableSound);
                    document.addEventListener('click', enableSound);
                    document.addEventListener('touchstart', enableSound);
                    
                    video.style.cursor = 'pointer';
                    video.onclick = function() {
                        window.open(ad.link, '_blank');
                    };
                    
                    adContainer.appendChild(video);
                }
            }
            break;
            
        case 'social':
            const isVertical = ad.position === 'left' || ad.position === 'right';
            const socialBar = document.createElement('div');
            socialBar.style.position = 'absolute';
            socialBar.style.width = isVertical ? '50px' : '100%';
            socialBar.style.height = isVertical ? '100%' : '50px';
            socialBar.style.backgroundColor = ad.bgColor;
            socialBar.style.display = 'flex';
            socialBar.style.flexDirection = isVertical ? 'column' : 'row';
            socialBar.style.alignItems = 'center';
            socialBar.style.justifyContent = 'center';
            
            if (ad.position === 'top') {
                socialBar.style.top = '0';
            } else if (ad.position === 'bottom') {
                socialBar.style.bottom = '0';
            } else if (ad.position === 'left') {
                socialBar.style.left = '0';
            } else if (ad.position === 'right') {
                socialBar.style.right = '0';
            }
            
            const ctaButton = document.createElement('button');
            ctaButton.textContent = ad.text || 'Click Here';
            ctaButton.style.padding = '8px 15px';
            ctaButton.style.backgroundColor = '#F0B90B';
            ctaButton.style.color = '#1E2026';
            ctaButton.style.border = 'none';
            ctaButton.style.borderRadius = '4px';
            ctaButton.style.cursor = 'pointer';
            ctaButton.onclick = function() {
                window.open(ad.link, '_blank');
            };
            
            socialBar.appendChild(ctaButton);
            adContainer.appendChild(socialBar);
            break;
            
        case 'popup':
            const popupContent = document.createElement('div');
            popupContent.style.width = '80%';
            popupContent.style.height = '80%';
            popupContent.style.backgroundColor = ad.bgColor;
            popupContent.style.padding = '20px';
            popupContent.style.position = 'relative';
            
            if (ad.image) {
                const img = document.createElement('img');
                img.src = ad.image;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '70%';
                img.style.display = 'block';
                img.style.margin = '0 auto';
                img.style.objectPosition = ad.cropPosition;
                popupContent.appendChild(img);
            }
            
            if (ad.text) {
                const textDiv = document.createElement('div');
                textDiv.textContent = ad.text;
                textDiv.style.marginTop = '15px';
                textDiv.style.textAlign = 'center';
                popupContent.appendChild(textDiv);
            }
            
            adContainer.style.width = '100%';
            adContainer.style.height = '100%';
            adContainer.style.display = 'flex';
            adContainer.style.justifyContent = 'center';
            adContainer.style.alignItems = 'center';
            adContainer.appendChild(popupContent);
            break;
            
        case 'fullscreen':
            if (ad.image) {
                const img = document.createElement('img');
                img.src = ad.image;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.objectPosition = ad.cropPosition;
                adContainer.appendChild(img);
            }
            
            if (ad.text) {
                const textDiv = document.createElement('div');
                textDiv.textContent = ad.text;
                textDiv.style.position = 'absolute';
                textDiv.style.bottom = '20%';
                textDiv.style.left = '0';
                textDiv.style.right = '0';
                textDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
                textDiv.style.color = 'white';
                textDiv.style.padding = '20px';
                textDiv.style.textAlign = 'center';
                adContainer.appendChild(textDiv);
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
                document.body.removeChild(preview);
            };
            
            adContainer.appendChild(skipButton);
            break;
            
        case 'native':
            const nativeContainer = document.createElement('div');
            nativeContainer.style.width = '100%';
            nativeContainer.style.height = '100%';
            nativeContainer.style.position = 'relative';
            
            const youtubeVideos = document.createElement('div');
            youtubeVideos.id = 'youtube-videos';
            youtubeVideos.style.width = '100%';
            youtubeVideos.style.height = '100%';
            
            const script = document.createElement('script');
            script.textContent = `
                const apiKey = "AIzaSyCRA7g2azKSoLoG6u2RSbkg3uMzJjtUd6A";
                const channelId = "UCiaRAw6ZC0i-JK83RwS4bkQ";
                const maxResults = 3;
                const redirectUrl = "https://abubakkardve.github.io/SmartDev-Solutions";
                
                fetch(\`https://www.googleapis.com/youtube/v3/search?key=\${apiKey}&channelId=\${channelId}&part=snippet,id&order=date&maxResults=\${maxResults}\`)
                    .then(response => response.json())
                    .then(data => {
                        const container = document.getElementById("youtube-videos");
                        data.items.forEach(item => {
                            const videoId = item.id.videoId;
                            if (videoId) {
                                const videoContainer = document.createElement("div");
                                videoContainer.style.position = "relative";
                                videoContainer.style.marginBottom = "20px";
                                
                                const iframe = document.createElement("iframe");
                                iframe.width = "100%";
                                iframe.height = "315";
                                iframe.src = \`https://www.youtube.com/embed/\${videoId}?autoplay=1&mute=1&rel=0&controls=1&showinfo=0\`;
                                iframe.frameborder = "0";
                                iframe.allow = "autoplay; encrypted-media";
                                iframe.allowFullscreen = true;
                                
                                const overlay = document.createElement("div");
                                overlay.style.position = "absolute";
                                overlay.style.top = "0";
                                overlay.style.left = "0";
                                overlay.style.width = "100%";
                                overlay.style.height = "100%";
                                overlay.style.cursor = "pointer";
                                overlay.style.zIndex = "10";
                                overlay.onclick = () => {
                                    window.location.href = redirectUrl;
                                };
                                
                                videoContainer.appendChild(iframe);
                                videoContainer.appendChild(overlay);
                                container.appendChild(videoContainer);
                            }
                        });
                    })
                    .catch(error => {
                        console.error("YouTube API Error:", error);
                        document.getElementById("youtube-videos").innerHTML = "ভিডিও লোড করতে সমস্যা হয়েছে।";
                    });
            `;
            
            nativeContainer.appendChild(youtubeVideos);
            nativeContainer.appendChild(script);
            adContainer.appendChild(nativeContainer);
            break;
    }
    
    preview.appendChild(adContainer);
    document.body.appendChild(preview);
}

// Delete an ad
function deleteAd(adId) {
    if (confirm('Are you sure you want to delete this ad?')) {
        ads = ads.filter(a => a.id !== adId);
        localStorage.setItem('makeMyAds', JSON.stringify(ads));
        
        if (currentAdId === adId) {
            currentAdId = null;
            document.getElementById('ad-form').reset();
            document.getElementById('embed-code').textContent = '';
            document.getElementById('short-link').textContent = '';
        }
        
        loadSavedAds();
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
    
    // Show feedback
    const originalText = elementId === 'embed-code' ? 'Copy Code' : 'Copy Link';
    const button = elementId === 'embed-code' ? document.querySelector('.copy-btn') : document.querySelectorAll('.copy-btn')[1];
    button.textContent = 'Copied!';
    setTimeout(() => {
        button.textContent = originalText;
    }, 2000);
}

// Check for hash routing
function checkHashRouting() {
    const hash = window.location.hash;
    if (hash.startsWith('#/ad/')) {
        const adDataBase64 = hash.replace('#/ad/', '');
        
        try {
            // Decode the base64 data
            const adData = JSON.parse(atob(adDataBase64));
            
            // Create a temporary preview container
            const preview = document.createElement('div');
            preview.style.position = 'fixed';
            preview.style.top = '0';
            preview.style.left = '0';
            preview.style.width = '100%';
            preview.style.height = '100%';
            preview.style.zIndex = '1000';
            
            // Create close button
            const closeButton = document.createElement('button');
            closeButton.textContent = 'X';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '20px';
            closeButton.style.right = '20px';
            closeButton.style.backgroundColor = 'white';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '50%';
            closeButton.style.width = '40px';
            closeButton.style.height = '40px';
            closeButton.style.fontSize = '20px';
            closeButton.style.cursor = 'pointer';
            closeButton.onclick = function() {
                document.body.removeChild(preview);
                window.location.hash = '';
            };
            preview.appendChild(closeButton);
            
            // Create ad container
            const adContainer = document.createElement('div');
            adContainer.style.width = adData.type === 'fullscreen' ? '100%' : `${adData.width}${typeof adData.width === 'string' ? '' : 'px'}`;
            adContainer.style.height = adData.type === 'fullscreen' ? '100vh' : `${adData.height}${typeof adData.height === 'string' ? '' : 'px'}`;
            adContainer.style.backgroundColor = adData.bgColor;
            adContainer.style.position = 'relative';
            adContainer.style.overflow = 'hidden';
            adContainer.style.cursor = 'pointer';
            adContainer.onclick = function() {
                window.open(adData.link, '_blank');
            };
            
            // Render ad based on type
            switch(adData.type) {
                case 'banner':
                    if (adData.image) {
                        const img = document.createElement('img');
                        img.src = adData.image;
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'cover';
                        img.style.objectPosition = adData.cropPosition;
                        adContainer.appendChild(img);
                    }
                    
                    if (adData.text) {
                        const textDiv = document.createElement('div');
                        textDiv.textContent = adData.text;
                        textDiv.style.position = 'absolute';
                        textDiv.style.bottom = '0';
                        textDiv.style.left = '0';
                        textDiv.style.right = '0';
                        textDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
                        textDiv.style.color = 'white';
                        textDiv.style.padding = '10px';
                        textDiv.style.textAlign = 'center';
                        adContainer.appendChild(textDiv);
                    }
                    break;
                    
                case 'video':
                    if (adData.video) {
                        if (adData.video.includes('youtube.com') || adData.video.includes('youtu.be')) {
                            // Handle YouTube URLs
                            let videoId = '';
                            if (adData.video.includes('youtube.com/watch?v=')) {
                                videoId = adData.video.split('v=')[1].split('&')[0];
                            } else if (adData.video.includes('youtu.be/')) {
                                videoId = adData.video.split('youtu.be/')[1].split('?')[0];
                            }
                            
                            if (videoId) {
                                const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0`;
                                const iframe = document.createElement('iframe');
                                iframe.src = embedUrl;
                                iframe.style.width = '100%';
                                iframe.style.height = '100%';
                                iframe.frameBorder = '0';
                                iframe.allow = 'autoplay; encrypted-media';
                                iframe.allowFullscreen = true;
                                
                                // Add clickable overlay
                                const overlay = document.createElement('div');
                                overlay.style.position = 'absolute';
                                overlay.style.top = '0';
                                overlay.style.left = '0';
                                overlay.style.width = '100%';
                                overlay.style.height = '100%';
                                overlay.style.cursor = 'pointer';
                                overlay.onclick = function() {
                                    window.open(adData.link, '_blank');
                                };
                                
                                adContainer.appendChild(iframe);
                                adContainer.appendChild(overlay);
                            }
                        } else {
                            // Handle direct video URLs
                            const video = document.createElement('video');
                            video.src = adData.video;
                            video.style.width = '100%';
                            video.style.height = '100%';
                            video.autoplay = true;
                            video.muted = true;
                            video.loop = true;
                            video.playsInline = true;
                            
                            // Enable sound on user interaction
                            const enableSound = function() {
                                video.muted = false;
                                document.removeEventListener('scroll', enableSound);
                                document.removeEventListener('click', enableSound);
                                document.removeEventListener('touchstart', enableSound);
                            };
                            
                            document.addEventListener('scroll', enableSound);
                            document.addEventListener('click', enableSound);
                            document.addEventListener('touchstart', enableSound);
                            
                            video.style.cursor = 'pointer';
                            video.onclick = function() {
                                window.open(adData.link, '_blank');
                            };
                            
                            adContainer.appendChild(video);
                        }
                    }
                    break;
                    
                case 'social':
                    const isVertical = adData.position === 'left' || adData.position === 'right';
                    const socialBar = document.createElement('div');
                    socialBar.style.position = 'fixed';
                    socialBar.style[adData.position] = '0';
                    socialBar.style.width = isVertical ? '50px' : '100%';
                    socialBar.style.height = isVertical ? '100%' : '50px';
                    socialBar.style.backgroundColor = adData.bgColor;
                    socialBar.style.display = 'flex';
                    socialBar.style.flexDirection = isVertical ? 'column' : 'row';
                    socialBar.style.alignItems = 'center';
                    socialBar.style.justifyContent = 'center';
                    socialBar.style.zIndex = '1000';
                    
                    const ctaButton = document.createElement('button');
                    ctaButton.textContent = adData.text || 'Click Here';
                    ctaButton.style.padding = '8px 15px';
                    ctaButton.style.backgroundColor = '#F0B90B';
                    ctaButton.style.color = '#1E2026';
                    ctaButton.style.border = 'none';
                    ctaButton.style.borderRadius = '4px';
                    ctaButton.style.cursor = 'pointer';
                    ctaButton.onclick = function() {
                        window.open(adData.link, '_blank');
                    };
                    
                    socialBar.appendChild(ctaButton);
                    adContainer.appendChild(socialBar);
                    break;
                    
                case 'popup':
                    const popupContent = document.createElement('div');
                    popupContent.style.width = '80%';
                    popupContent.style.height = '80%';
                    popupContent.style.backgroundColor = adData.bgColor;
                    popupContent.style.padding = '20px';
                    popupContent.style.position = 'relative';
                    
                    if (adData.image) {
                        const img = document.createElement('img');
                        img.src = adData.image;
                        img.style.maxWidth = '100%';
                        img.style.maxHeight = '70%';
                        img.style.display = 'block';
                        img.style.margin = '0 auto';
                        img.style.objectPosition = adData.cropPosition;
                        popupContent.appendChild(img);
                    }
                    
                    if (adData.text) {
                        const textDiv = document.createElement('div');
                        textDiv.textContent = adData.text;
                        textDiv.style.marginTop = '15px';
                        textDiv.style.textAlign = 'center';
                        popupContent.appendChild(textDiv);
                    }
                    
                    adContainer.style.width = '100%';
                    adContainer.style.height = '100%';
                    adContainer.style.display = 'flex';
                    adContainer.style.justifyContent = 'center';
                    adContainer.style.alignItems = 'center';
                    adContainer.appendChild(popupContent);
                    break;
                    
                case 'fullscreen':
                    if (adData.image) {
                        const img = document.createElement('img');
                        img.src = adData.image;
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'cover';
                        img.style.objectPosition = adData.cropPosition;
                        adContainer.appendChild(img);
                    }
                    
                    if (adData.text) {
                        const textDiv = document.createElement('div');
                        textDiv.textContent = adData.text;
                        textDiv.style.position = 'absolute';
                        textDiv.style.bottom = '20%';
                        textDiv.style.left = '0';
                        textDiv.style.right = '0';
                        textDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
                        textDiv.style.color = 'white';
                        textDiv.style.padding = '20px';
                        textDiv.style.textAlign = 'center';
                        adContainer.appendChild(textDiv);
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
                        document.body.removeChild(preview);
                        window.location.hash = '';
                    };
                    
                    adContainer.appendChild(skipButton);
                    break;
                    
                case 'native':
                    const nativeContainer = document.createElement('div');
                    nativeContainer.style.width = '100%';
                    nativeContainer.style.height = '100%';
                    nativeContainer.style.position = 'relative';
                    
                    const youtubeVideos = document.createElement('div');
                    youtubeVideos.id = 'youtube-videos';
                    youtubeVideos.style.width = '100%';
                    youtubeVideos.style.height = '100%';
                    
                    const script = document.createElement('script');
                    script.textContent = `
                        const apiKey = "AIzaSyCRA7g2azKSoLoG6u2RSbkg3uMzJjtUd6A";
                        const channelId = "UCiaRAw6ZC0i-JK83RwS4bkQ";
                        const maxResults = 3;
                        const redirectUrl = "https://abubakkardve.github.io/SmartDev-Solutions";
                        
                        fetch(\`https://www.googleapis.com/youtube/v3/search?key=\${apiKey}&channelId=\${channelId}&part=snippet,id&order=date&maxResults=\${maxResults}\`)
                            .then(response => response.json())
                            .then(data => {
                                const container = document.getElementById("youtube-videos");
                                data.items.forEach(item => {
                                    const videoId = item.id.videoId;
                                    if (videoId) {
                                        const videoContainer = document.createElement("div");
                                        videoContainer.style.position = "relative";
                                        videoContainer.style.marginBottom = "20px";
                                        
                                        const iframe = document.createElement("iframe");
                                        iframe.width = "100%";
                                        iframe.height = "315";
                                        iframe.src = \`https://www.youtube.com/embed/\${videoId}?autoplay=1&mute=1&rel=0&controls=1&showinfo=0\`;
                                        iframe.frameborder = "0";
                                        iframe.allow = "autoplay; encrypted-media";
                                        iframe.allowFullscreen = true;
                                        
                                        const overlay = document.createElement("div");
                                        overlay.style.position = "absolute";
                                        overlay.style.top = "0";
                                        overlay.style.left = "0";
                                        overlay.style.width = "100%";
                                        overlay.style.height = "100%";
                                        overlay.style.cursor = "pointer";
                                        overlay.style.zIndex = "10";
                                        overlay.onclick = () => {
                                            window.location.href = redirectUrl;
                                        };
                                        
                                        videoContainer.appendChild(iframe);
                                        videoContainer.appendChild(overlay);
                                        container.appendChild(videoContainer);
                                    }
                                });
                            })
                            .catch(error => {
                                console.error("YouTube API Error:", error);
                                document.getElementById("youtube-videos").innerHTML = "ভিডিও লোড করতে সমস্যা হয়েছে।";
                            });
                    `;
                    
                    nativeContainer.appendChild(youtubeVideos);
                    nativeContainer.appendChild(script);
                    adContainer.appendChild(nativeContainer);
                    break;
            }
            
            preview.appendChild(adContainer);
            document.body.appendChild(preview);
        } catch (e) {
            console.error('Error parsing ad data:', e);
            window.location.hash = '';
        }
    }
}
