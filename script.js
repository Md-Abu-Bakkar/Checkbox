document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const modeBtns = document.querySelectorAll('.mode-btn');
    const imageSection = document.getElementById('imageSection');
    const videoSection = document.getElementById('videoSection');
    const bothSection = document.getElementById('bothSection');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const youtubeUrl = document.getElementById('youtubeUrl');
    const videoPreview = document.getElementById('videoPreview');
    const combinedImageUpload = document.getElementById('combinedImageUpload');
    const combinedImagePreview = document.getElementById('combinedImagePreview');
    const combinedYoutubeUrl = document.getElementById('combinedYoutubeUrl');
    const combinedVideoPreview = document.getElementById('combinedVideoPreview');
    const linkForm = document.getElementById('linkForm');
    const resultDiv = document.getElementById('result');
    const generatedLink = document.getElementById('generatedLink');
    const copyBtn = document.getElementById('copyBtn');
    const testLink = document.getElementById('testLink');

    // State
    let currentMode = 'image';
    let imageUrl = null;
    let youtubeId = null;
    let combinedImageUrl = null;
    let combinedYoutubeId = null;

    // Mode selection
    modeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            currentMode = this.dataset.mode;
            modeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            imageSection.classList.add('hidden');
            videoSection.classList.add('hidden');
            bothSection.classList.add('hidden');
            
            if (currentMode === 'image') {
                imageSection.classList.remove('hidden');
            } else if (currentMode === 'video') {
                videoSection.classList.remove('hidden');
            } else {
                bothSection.classList.remove('hidden');
            }
        });
    });

    // Image upload (simple mode)
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imageUrl = e.target.result;
                imagePreview.src = imageUrl;
                imagePreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    // YouTube URL (simple mode)
    youtubeUrl.addEventListener('input', function() {
        const url = this.value;
        const videoId = getYouTubeId(url);
        
        if (videoId) {
            youtubeId = videoId;
            videoPreview.innerHTML = `
                <iframe width="100%" height="100%" 
                        src="https://www.youtube.com/embed/${videoId}" 
                        frameborder="0" 
                        allowfullscreen></iframe>
            `;
        } else {
            youtubeId = null;
            videoPreview.innerHTML = '<p>' + (url ? 'Invalid YouTube URL' : 'Enter YouTube URL to preview') + '</p>';
        }
    });

    // Image upload (combined mode)
    combinedImageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                combinedImageUrl = e.target.result;
                combinedImagePreview.src = combinedImageUrl;
                combinedImagePreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    // YouTube URL (combined mode)
    combinedYoutubeUrl.addEventListener('input', function() {
        const url = this.value;
        const videoId = getYouTubeId(url);
        
        if (videoId) {
            combinedYoutubeId = videoId;
            combinedVideoPreview.innerHTML = `
                <iframe width="100%" height="100%" 
                        src="https://www.youtube.com/embed/${videoId}" 
                        frameborder="0" 
                        allowfullscreen></iframe>
            `;
        } else {
            combinedYoutubeId = null;
            combinedVideoPreview.innerHTML = '<p>' + (url ? 'Invalid YouTube URL' : 'Enter YouTube URL') + '</p>';
        }
    });

    // Form submission
    linkForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const destinationUrl = document.getElementById('destinationUrl').value;
        const caption = document.getElementById('caption').value;
        
        // Validate based on mode
        if (currentMode === 'image' && !imageUrl) {
            alert('Please upload an image');
            return;
        }
        
        if (currentMode === 'video' && !youtubeId) {
            alert('Please enter a valid YouTube URL');
            return;
        }
        
        if (currentMode === 'both' && (!combinedImageUrl || !combinedYoutubeId)) {
            alert('Please provide both image and YouTube URL');
            return;
        }
        
        // Generate unique ID
        const linkId = generateId(12);
        
        // Create data object
        const linkData = {
            mode: currentMode,
            destination: destinationUrl,
            caption: caption || null,
            timestamp: new Date().getTime()
        };
        
        // Add content based on mode
        if (currentMode === 'image') {
            linkData.image = imageUrl;
        } else if (currentMode === 'video') {
            linkData.video = youtubeId;
        } else {
            linkData.image = combinedImageUrl;
            linkData.video = combinedYoutubeId;
        }
        
        // Store in localStorage
        localStorage.setItem(`linkpic_${linkId}`, JSON.stringify(linkData));
        
        // Generate link
        const baseUrl = window.location.href.replace('index.html', '');
        const link = `${baseUrl}redirect.html?id=${linkId}`;
        
        // Show result
        generatedLink.value = link;
        testLink.href = link;
        resultDiv.classList.remove('hidden');
        
        // Scroll to result
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    });

    // Copy button
    copyBtn.addEventListener('click', function() {
        generatedLink.select();
        document.execCommand('copy');
        
        // Show feedback
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i> Copied!';
        
        setTimeout(() => {
            this.innerHTML = originalText;
        }, 2000);
    });

    // Helper functions
    function getYouTubeId(url) {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
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
