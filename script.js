// Global variables
let ads = JSON.parse(localStorage.getItem('makeMyAds')) || [];
let currentAdId = null;
let currentShareUrl = '';
let currentCropSettings = { x: 0, y: 0, zoom: 1 };

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
    
    // Load demo ads in help section
    loadDemoAds();
    
    // Update OG metadata
    updateOGMetadata();
});

// Update Open Graph metadata
function updateOGMetadata(ad = null) {
    if (ad) {
        document.querySelector('meta[property="og:title"]').content = ad.name;
        document.querySelector('meta[property="og:description"]').content = ad.text || 'Professional ad created with MakeMyAd';
        document.querySelector('meta[property="og:url"]').content = window.location.href.split('#')[0] + '#/ad' + ad.id;
        
        if (ad.image) {
            document.querySelector('meta[property="og:image"]').content = ad.image;
        } else if (ad.type === 'video' && ad.video.includes('youtube.com')) {
            const videoId = ad.video.includes('youtube.com/watch?v=') ? 
                ad.video.split('v=')[1].split('&')[0] : 
                ad.video.split('youtu.be/')[1].split('?')[0];
            document.querySelector('meta[property="og:image"]').content = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        } else {
            document.querySelector('meta[property="og:image"]').content = window.location.origin + '/logo.png';
        }
    } else {
        document.querySelector('meta[property="og:title"]').content = 'MakeMyAd - Professional Ad Generator';
        document.querySelector('meta[property="og:description"]').content = 'Create professional ads with MakeMyAd';
        document.querySelector('meta[property="og:url"]').content = window.location.href.split('#')[0];
        document.querySelector('meta[property="og:image"]').content = window.location.origin + '/logo.png';
    }
}

// Generate shareable URL
function generateShareableUrl(ad) {
    const baseUrl = window.location.href.split('#')[0];
    const adUrl = baseUrl + '#/ad' + ad.id;
    currentShareUrl = adUrl;
    
    // For demonstration, we'll use the current URL
    // In a real app, you would use a URL shortener API
    document.getElementById('shareable-link').textContent = adUrl;
    
    // Generate QR code
    if (typeof QRCode !== 'undefined') {
        document.getElementById('qr-code').innerHTML = '';
        new QRCode(document.getElementById('qr-code'), {
            text: adUrl,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
    
    return adUrl;
}

// Share ad link
function shareAdLink() {
    if (!currentShareUrl) {
        alert('Please generate an ad first');
        return;
    }
    
    document.getElementById('share-modal').style.display = 'block';
}

// Share via specific platform
function shareVia(platform) {
    if (!currentShareUrl) return;
    
    let shareUrl = '';
    const title = document.getElementById('ad-name').value || 'Check out this ad';
    const text = document.getElementById('ad-text').value || 'Professional ad created with MakeMyAd';
    
    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentShareUrl)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentShareUrl)}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + currentShareUrl)}`;
            break;
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${encodeURIComponent(currentShareUrl)}&text=${encodeURIComponent(text)}`;
            break;
        case 'email':
            shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + currentShareUrl)}`;
            break;
    }
    
    window.open(shareUrl, '_blank');
}

// Hide share modal
function hideShareModal() {
    document.getElementById('share-modal').style.display = 'none';
}

// Download QR code
function downloadQRCode() {
    const canvas = document.querySelector('#qr-code canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'ad-qr-code.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Check for hash routing
function checkHashRouting() {
    const hash = window.location.hash;
    if (hash.startsWith('#/ad')) {
        const adId = hash.replace('#/ad', '');
        const ad = ads.find(a => a.id === adId);
        
        if (ad) {
            // Update OG metadata for shared link
            updateOGMetadata(ad);
            
            // Show the ad
            renderAdForSharing(ad);
        } else {
            // Redirect to home if ad not found
            window.location.hash = '';
        }
    }
}

// Render ad for sharing (fullscreen view)
function renderAdForSharing(ad) {
    document.body.innerHTML = '';
    
    // Create container
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100vh';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.backgroundColor = '#f5f5f5';
    
    // Create back button
    const backButton = document.createElement('button');
    backButton.textContent = 'Back to MakeMyAd';
    backButton.style.position = 'fixed';
    backButton.style.top = '20px';
    backButton.style.left = '20px';
    backButton.style.padding = '10px 20px';
    backButton.style.backgroundColor = '#4361ee';
    backButton.style.color = 'white';
    backButton.style.border = 'none';
    backButton.style.borderRadius = '4px';
    backButton.style.cursor = 'pointer';
    backButton.style.zIndex = '1000';
    backButton.onclick = function() {
        window.location.href = window.location.href.split('#')[0];
    };
    
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
    
    // Render ad based on type (same as viewAd function)
    // ... (use the same rendering logic from viewAd function)
    
    container.appendChild(backButton);
    container.appendChild(adContainer);
    document.body.appendChild(container);
}

// Modify the generateAd function to include shareable URL generation
function generateAd() {
    // ... (previous generateAd implementation)
    
    // After saving the ad
    generateShareableUrl(ad);
    updateOGMetadata(ad);
    
    // ... (rest of the function)
}

// Add this to your style.css
.share-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
}

.share-options button {
    padding: 10px 15px;
    background-color: #4361ee;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.share-options button:hover {
    background-color: #3a0ca3;
}

.qr-code-container {
    text-align: center;
    margin-top: 20px;
}

.qr-code-container button {
    margin-top: 10px;
    padding: 10px 15px;
    background-color: #4cc9f0;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.share-btn {
    background-color: #4cc9f0;
    margin-left: 10px;
}

.share-btn:hover {
    background-color: #3aa8d8;
}
