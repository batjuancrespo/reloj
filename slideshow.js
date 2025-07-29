// Slideshow module
const slideshowImages = [
    './slideshow_image_1.png',
    './slideshow_image_2.png',
    './slideshow_image_3.png'
];

let currentImageIndex = 0;
let slideshowIntervalId = null;
let slideshowImageElement = null; // Reference to the <img> tag

/**
 * Initializes the slideshow by setting up the image element.
 * @param {string} imageElementId The ID of the <img> element to use for the slideshow.
 */
export function initSlideshow(imageElementId) {
    slideshowImageElement = document.getElementById(imageElementId);
    if (!slideshowImageElement) {
        console.error(`Slideshow image element with ID '${imageElementId}' not found.`);
        return;
    }
    // Preload images to avoid delay on first display
    slideshowImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
    // Set initial image (will be hidden by CSS until slideshow starts)
    if (slideshowImages.length > 0) {
        slideshowImageElement.src = slideshowImages[0];
    }
}

/**
 * Displays the next image in the slideshow with a fade effect.
 */
function displayNextImage() {
    if (!slideshowImageElement || slideshowImages.length === 0) return;

    // Fade out current image
    slideshowImageElement.classList.remove('active');

    setTimeout(() => {
        currentImageIndex = (currentImageIndex + 1) % slideshowImages.length;
        slideshowImageElement.src = slideshowImages[currentImageIndex];
        // Fade in new image after source is set
        slideshowImageElement.classList.add('active');
    }, 1000); // Wait for fade-out transition (1s as defined in CSS)
}

/**
 * Starts the slideshow.
 */
export function startSlideshow() {
    if (slideshowIntervalId) {
        clearInterval(slideshowIntervalId);
    }
    if (slideshowImages.length > 0) {
        // Ensure the first image is displayed correctly on start
        slideshowImageElement.src = slideshowImages[currentImageIndex];
        slideshowImageElement.classList.add('active'); // Immediately show the first image

        // Start cycling after an initial delay or directly if needed
        slideshowIntervalId = setInterval(displayNextImage, 8000); // Change image every 8 seconds (adjust as needed)
        console.log("Slideshow started.");
    } else {
        console.warn("No images available for slideshow.");
    }
}

/**
 * Stops the slideshow.
 */
export function stopSlideshow() {
    if (slideshowIntervalId) {
        clearInterval(slideshowIntervalId);
        slideshowIntervalId = null;
        console.log("Slideshow stopped.");
    }
    // Optionally fade out and clear the last image
    if (slideshowImageElement) {
        slideshowImageElement.classList.remove('active');
        // Give time for fade-out before potentially clearing source
        setTimeout(() => {
            slideshowImageElement.src = ''; // Clear the image source
        }, 1000);
    }
    currentImageIndex = 0; // Reset index for next start
}
