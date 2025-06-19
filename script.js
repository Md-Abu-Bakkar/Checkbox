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
    const tabButtons = document.querySelectorAll('.tab-btn');
    const sections = {
        image: document.getElementById('imageUploadSection'),
        youtube: document.getElementById('youtubeSection'),
        both: document.getElementById('combinedSection')
    };
    const youtubeUrlInput = document.getElementById('youtubeUrl');
    const youtubePreview = document.getElementById('youtubePreview');
    const combinedImageUpload = document.getElementById('combinedImageUpload');
    const combinedImagePreview = document.getElementById('combinedImagePreview');
    const combinedImageLoading = document.getElementById('combinedImageLoading');
    const combinedYoutubeUrl = document.getElementById('combinedYoutubeUrl');
    const combinedYoutubePreview = document.getElementById('combinedYoutubePreview');
    const colorOptions = document.querySelectorAll('.color-option');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const qrCodeCanvas = document.getElementById('qrCodeCanvas');

    // ImgBB API Key
    const IMGBB_API_KEY = 'ddc161b9a8fbb6f041c35e04629ccf71';
    
    // State variables
    let currentTab = 'image';
    let uploadedImageUrl = null;
    let youtubeVideoId = null;
    let combinedImageUrl = null;
    let combinedYoutubeId = null;
    let selectedColor = '#4361ee';

    // Initialize the app
    init();
    
    function init() {
        setupEventListeners();
        setRootColors(selectedColor);
    }
    
    function setupEventListeners() {
        // Tab switching
        tabButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                setTab(this.dataset.tab);
            });
        });
        
        // Image upload (simple mode)
        imageUpload.addEventListener('change', function(e) {
            handleImageUpload(e.target.files[0], 'simple');
        });
        
        // Image upload (combined mode)
        combinedImageUpload.addEventListener('change', function(e) {
            handleImageUpload(e.target.files[0], 'combined');
        });
        
        // Drag and drop (simple mode)
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
                handleImageUpload(e.dataTransfer.files[0], 'simple');
            }
        });
        
        // YouTube URL input (simple mode)
        youtubeUrlInput.addEventListener('input', function() {
            updateYoutubePreview(this.value, 'simple');
        });
        
        // YouTube URL input (combined mode)
        combinedYoutubeUrl.addEventListener('input', function() {
            updateYoutubePreview(this.value, 'combined');
        });
        
        // Form submission
        linkForm.addEventListener('submit', function(e) {
            e.preventDefault();
            generateLink();
        });
        
        // Copy button
        copyBtn.addEventListener('click', function() {
            copyToClipboard(generatedLink.value);
            showFeedback(this, '<i class="fas fa-check"></i> Copied!');
        });
        
        // Color selection
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                selectColor(this.dataset.color);
            });
        });
    }
    
    function setTab(tab) {
        currentTab = tab;
        
        // Update UI
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        // Show/hide sections
        for (const [key, section] of Object.entries(sections)) {
            section.classList.toggle('hidden', key !== tab);
        }
    }
    
    function handleImageUpload(file, mode) {
        if (!file || !file.type.match('image.*')) {
            alert('Please select a valid image file (JPEG, PNG)');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('Image size should be less than 5MB');
            return;
        }
        
        // Show loading state
        const loadingElement = mode === 'simple' ? imageLoading : combinedImageLoading;
        loadingElement.classList.remove('hidden');
        
        // Upload to ImgBB
        uploadToImgBB(file)
            .then(url => {
                if (mode === 'simple') {
                    uploadedImageUrl = url;
                    imagePreview.src = url;
                    imagePreview.classList.remove('hidden');
                    uploadLabel.classList.add('hidden');
                } else {
                    combinedImageUrl = url;
                    combinedImagePreview.src = url;
                    combinedImagePreview.classList.remove('hidden');
                }
            })
            .catch(error => {
                console.error('Upload failed:', error);
                alert('Image upload failed. Please try again.');
            })
            .finally(() => {
                loadingElement.classList.add('hidden');
            });
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
    
    function updateYoutubePreview(url, mode) {
        const videoId = extractYoutubeId(url);
        
        if (videoId) {
            if (mode === 'simple') {
                youtubeVideoId = videoId;
                youtubePreview.innerHTML = `
                    <iframe class="youtube-embed" 
                            src="https://www.youtube.com/embed/${videoId}?autoplay=0&showinfo=0&controls=1" 
                            frameborder="0" 
                            allowfullscreen></iframe>
                `;
            } else {
                combinedYoutubeId = videoId;
                combinedYoutubePreview.innerHTML = `
                    <iframe class="youtube-embed" 
                            src="https://www.youtube.com/embed/${videoId}?autoplay=0&showinfo=0&controls=1" 
                            frameborder="0" 
                            allowfullscreen></iframe>
                `;
            }
        } else {
            if (mode === 'simple') {
                youtubeVideoId = null;
                youtubePreview.innerHTML = `
                    <div class="youtube-placeholder">
                        <i class="fab fa-youtube"></i>
                        <p>${url ? 'Invalid YouTube URL' : 'Enter YouTube URL to preview'}</p>
                    </div>
                `;
            } else {
                combinedYoutubeId = null;
                combinedYoutubePreview.innerHTML = `
                    <div class="youtube-placeholder">
                        <i class="fab fa-youtube"></i>
                        <p>${url ? 'Invalid YouTube URL' : 'Enter YouTube URL'}</p>
                    </div>
                `;
            }
        }
    }
    
    function extractYoutubeId(url) {
        if (!url) return null;
        
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        
        return (match && match[2].length === 11) ? match[2] : null;
    }
    
    function selectColor(color) {
        selectedColor = color;
        setRootColors(color);
        
        // Update UI
        colorOptions.forEach(option => {
            option.classList.toggle('selected', option.dataset.color === color);
        });
    }
    
    function setRootColors(color) {
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
    
    function generateLink() {
        const destinationUrl = document.getElementById('destinationUrl').value;
        const imageCaption = document.getElementById('imageCaption').value;
        
        if (!destinationUrl) {
            alert('Please enter a destination URL');
            return;
        }
        
        // Validate based on current tab
        if (currentTab === 'image' && !uploadedImageUrl) {
            alert('Please upload an image first');
            return;
        }
        
        if (currentTab === 'youtube' && !youtubeVideoId) {
            alert('Please enter a valid YouTube URL');
            return;
        }
        
        if (currentTab === 'both' && (!combinedImageUrl || !combinedYoutubeId)) {
            alert('Please provide both an image and a YouTube URL');
            return;
        }
        
        // Generate unique ID for the link
        const linkId = generateId(12);
        
        // Create the shareable link
        const baseUrl = window.location.href.replace('index.html', '');
        const link = `${baseUrl}redirect.html?id=${linkId}`;
        
        // Store data in localStorage and sessionStorage for cross-device compatibility
        const linkData = {
            mode: currentTab,
            url: destinationUrl,
            caption: imageCaption,
            color: selectedColor,
            timestamp: new Date().getTime()
        };
        
        if (currentTab === 'image') {
            linkData.imageUrl = uploadedImageUrl;
        } else if (currentTab === 'youtube') {
            linkData.youtubeId = youtubeVideoId;
        } else {
            linkData.imageUrl = combinedImageUrl;
            linkData.youtubeId = combinedYoutubeId;
        }
        
        // Store in both localStorage and sessionStorage
        localStorage.setItem(`linkpic_${linkId}`, JSON.stringify(linkData));
        sessionStorage.setItem(`linkpic_${linkId}`, JSON.stringify(linkData));
        
        // Also store in a special key to help with cross-device sharing
        const shareData = { id: linkId, timestamp: new Date().getTime() };
        localStorage.setItem('linkpic_last_shared', JSON.stringify(shareData));
        
        // Update UI
        generatedLink.value = link;
        testLink.href = link;
        resultArea.classList.remove('hidden');
        
        // Generate QR code
        generateQRCode(link, qrCodeCanvas);
        qrCodeContainer.classList.remove('hidden');
        
        // Initialize social sharing
        setupSocialSharing(link, imageCaption);
        
        // Scroll to result
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }
    
    function generateQRCode(text, canvas) {
        QRCode.toCanvas(canvas, text, {
            width: 150,
            color: {
                dark: selectedColor,
                light: '#ffffff'
            }
        }, function(error) {
            if (error) console.error('QR Code generation error:', error);
        });
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
        element.innerHTML = message;
        
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
