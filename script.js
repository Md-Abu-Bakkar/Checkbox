document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const imageUpload = document.getElementById('imageUpload');
    const uploadBox = document.getElementById('uploadBox');
    const uploadLabel = document.querySelector('.upload-label');
    const imagePreview = document.getElementById('imagePreview');
    const imageLoading = document.getElementById('imageLoading');
    const linkForm = document.getElementById('linkForm');
    const resultArea = document.getElementById('resultArea');
    const generatedLink = document.getElementById('generatedLink');
    const copyBtn = document.getElementById('copyBtn');
    const testLink = document.getElementById('testLink');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const imageUploadSection = document.getElementById('imageUploadSection');
    const youtubeSection = document.getElementById('youtubeSection');
    const youtubeUrlInput = document.getElementById('youtubeUrl');
    const youtubePreview = document.getElementById('youtubePreview');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const downloadQrBtn = document.getElementById('downloadQrBtn');
    
    // ImgBB API Key
    const IMGBB_API_KEY = 'ddc161b9a8fbb6f041c35e04629ccf71';
    
    // State variables
    let currentMode = 'image';
    let uploadedImageUrl = null;
    let youtubeVideoId = null;
    let qrCode = null;
    
    // Initialize the app
    init();
    
    function init() {
        setupEventListeners();
        
        // Set dynamic OG tags for social sharing
        updateMetaTags(
            'LinkPicGlobal - Smart Content Links',
            'Create smart links for your images and videos',
            window.location.href
        );
    }
    
    function setupEventListeners() {
        // Mode toggle
        modeButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                setMode(this.dataset.mode);
            });
        });
        
        // Image upload
        imageUpload.addEventListener('change', function(e) {
            handleImageUpload(e.target.files[0]);
        });
        
        // Drag and drop
        uploadBox.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadBox.classList.add('dragover');
        });
        
        uploadBox.addEventListener('dragleave', function() {
            uploadBox.classList.remove('dragover');
        });
        
        uploadBox.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadBox.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleImageUpload(e.dataTransfer.files[0]);
            }
        });
        
        // YouTube URL input
        youtubeUrlInput.addEventListener('input', function() {
            updateYoutubePreview(this.value);
        });
        
        // Form submission
        linkForm.addEventListener('submit', function(e) {
            e.preventDefault();
            generateLink();
        });
        
        // Copy button
        copyBtn.addEventListener('click', function() {
            copyToClipboard(generatedLink.value);
            showFeedback(this, 'Copied!');
        });
        
        // Download QR code button
        if (downloadQrBtn) {
            downloadQrBtn.addEventListener('click', downloadQRCode);
        }
    }
    
    function setMode(mode) {
        currentMode = mode;
        
        // Update UI
        modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Show/hide sections based on mode
        if (mode === 'both') {
            imageUploadSection.classList.remove('hidden');
            youtubeSection.classList.remove('hidden');
        } else {
            imageUploadSection.classList.toggle('hidden', mode !== 'image');
            youtubeSection.classList.toggle('hidden', mode !== 'youtube');
        }
    }
    
    function handleImageUpload(file) {
        if (!file || !file.type.match('image.*')) {
            alert('Please select a valid image file (JPEG, PNG)');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('Image size should be less than 5MB');
            return;
        }
        
        // Show loading state
        imageLoading.classList.remove('hidden');
        uploadLabel.classList.add('hidden');
        
        // Show preview while uploading
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
        
        // Upload to ImgBB
        uploadToImgBB(file)
            .then(url => {
                uploadedImageUrl = url;
                // Update preview with final URL
                imagePreview.src = url;
                
                // Update OG tags for social sharing
                updateMetaTags(
                    'LinkPicGlobal - Image Link',
                    document.getElementById('imageCaption').value || 'Check out this image',
                    window.location.href,
                    url
                );
            })
            .catch(error => {
                console.error('Upload failed:', error);
                alert('Image upload failed. Please try again.');
                resetImageUpload();
            })
            .finally(() => {
                imageLoading.classList.add('hidden');
            });
    }
    
    function resetImageUpload() {
        imagePreview.src = '';
        imagePreview.classList.add('hidden');
        uploadLabel.classList.remove('hidden');
        uploadedImageUrl = null;
    }
    
    function uploadToImgBB(file) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('image', file);
            
            fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    resolve(data.data.url);
                } else {
                    reject(data.error.message || 'Upload failed');
                }
            })
            .catch(error => reject(error));
        });
    }
    
    function updateYoutubePreview(url) {
        const videoId = extractYoutubeId(url);
        
        if (videoId) {
            youtubeVideoId = videoId;
            youtubePreview.innerHTML = `
                <iframe class="youtube-embed" 
                        src="https://www.youtube.com/embed/${videoId}?autoplay=0&showinfo=0&controls=1" 
                        frameborder="0" 
                        allowfullscreen></iframe>
            `;
            
            // Update OG tags for social sharing
            updateMetaTags(
                'LinkPicGlobal - YouTube Link',
                document.getElementById('imageCaption').value || 'Check out this video',
                window.location.href,
                `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            );
        } else {
            youtubeVideoId = null;
            youtubePreview.innerHTML = `
                <div class="youtube-placeholder">
                    <i class="fab fa-youtube"></i>
                    <p>${url ? 'Invalid YouTube URL' : 'Enter YouTube URL to preview'}</p>
                </div>
            `;
        }
    }
    
    function extractYoutubeId(url) {
        if (!url) return null;
        
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        
        return (match && match[2].length === 11) ? match[2] : null;
    }
    
    function generateLink() {
        const destinationUrl = document.getElementById('destinationUrl').value;
        const buttonText = document.getElementById('buttonText').value || 'Visit Destination';
        const imageCaption = document.getElementById('imageCaption').value;
        
        if (!destinationUrl) {
            alert('Please enter a destination URL');
            return;
        }
        
        if (currentMode === 'image' && !uploadedImageUrl) {
            alert('Please upload an image first');
            return;
        }
        
        if (currentMode === 'youtube' && !youtubeVideoId) {
            alert('Please enter a valid YouTube URL');
            return;
        }
        
        if (currentMode === 'both' && !uploadedImageUrl && !youtubeVideoId) {
            alert('Please upload an image or enter a YouTube URL');
            return;
        }
        
        // Generate unique ID for the link
        const linkId = generateId(12);
        
        // Create the shareable link
        const baseUrl = window.location.href.replace('index.html', '');
        let link = `${baseUrl}redirect.html?id=${linkId}`;
        
        // Store data in localStorage
        const linkData = {
            mode: currentMode,
            url: destinationUrl,
            buttonText: buttonText,
            caption: imageCaption,
            timestamp: new Date().getTime()
        };
        
        if (currentMode === 'image' || currentMode === 'both') {
            linkData.imageUrl = uploadedImageUrl;
        }
        
        if (currentMode === 'youtube' || currentMode === 'both') {
            linkData.youtubeId = youtubeVideoId;
        }
        
        localStorage.setItem(`linkpic_${linkId}`, JSON.stringify(linkData));
        
        // Update UI
        generatedLink.value = link;
        testLink.href = link;
        resultArea.classList.remove('hidden');
        
        // Generate QR code
        generateQRCode(link);
        
        // Scroll to result
        resultArea.scrollIntoView({ behavior: 'smooth' });
        
        // Initialize social sharing
        setupSocialSharing(link, imageCaption);
    }
    
    function generateQRCode(link) {
        qrCodeContainer.innerHTML = '<p>Scan QR Code:</p>';
        const canvas = document.createElement('canvas');
        canvas.id = 'qrCodeCanvas';
        qrCodeContainer.appendChild(canvas);
        
        // Clear previous QR code if exists
        if (qrCode) {
            qrCode.clear();
        }
        
        // Generate new QR code
        qrCode = new QRCode(document.getElementById('qrCodeCanvas'), {
            text: link,
            width: 200,
            height: 200,
            colorDark: '#4361ee',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
        
        qrCodeContainer.classList.remove('hidden');
    }
    
    function downloadQRCode() {
        const canvas = document.getElementById('qrCodeCanvas');
        const link = document.createElement('a');
        link.download = 'LinkPicGlobal-QRCode.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
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
    
    function setupSocialSharing(link, text = '') {
        const encodedLink = encodeURIComponent(link);
        const encodedText = encodeURIComponent(text);
        
        document.getElementById('shareFacebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
        document.getElementById('shareTwitter').href = `https://twitter.com/intent/tweet?url=${encodedLink}&text=${encodedText}`;
        document.getElementById('shareWhatsapp').href = `https://wa.me/?text=${encodedText}%20${encodedLink}`;
        document.getElementById('shareLinkedin').href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`;
    }
    
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy:', err);
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        });
    }
    
    function showFeedback(element, message) {
        const originalText = element.innerHTML;
        element.innerHTML = `<i class="fas fa-check"></i> ${message}`;
        
        setTimeout(() => {
            element.innerHTML = originalText;
        }, 2000);
    }
    
    function generateId(length) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }
});
