// Initialize Lucide Icons
lucide.createIcons();

// Set Current Year
document.getElementById('year').textContent = new Date().getFullYear();

// Hero Image Carousel
const heroImages = [
    "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&q=80"
];

const carouselContainer = document.getElementById('hero-carousel');
let currentImageIndex = 0;

// Initialize Images
heroImages.forEach((src, index) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Hero Background ${index + 1}`;
    img.className = `absolute inset-0 w-full h-full object-cover carousel-image ${index === 0 ? 'opacity-30' : 'opacity-0'}`;
    carouselContainer.insertBefore(img, carouselContainer.firstChild); // Insert before overlays
});

const images = carouselContainer.querySelectorAll('img');

setInterval(() => {
    images[currentImageIndex].classList.remove('opacity-30');
    images[currentImageIndex].classList.add('opacity-0');
    
    currentImageIndex = (currentImageIndex + 1) % heroImages.length;
    
    images[currentImageIndex].classList.remove('opacity-0');
    images[currentImageIndex].classList.add('opacity-30');
}, 5000);

// Package Selection
function selectPackage(pkgName) {
    const bookingInput = document.getElementById('booking-package');
    if(bookingInput) {
        bookingInput.value = pkgName;
        document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' });
    }
}

// Share Functionality
function shareLink() {
    if (navigator.share) {
        navigator.share({
            title: 'New Janta Band',
            text: 'Check out New Janta Band!',
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
}

// Inquiry Form Handler
// Form submission is now handled by Formspree via HTML action attribute

// Booking Form Handler
// Intercepts form submission to show payment modal first
function initiatePayment(e) {
    e.preventDefault();
    
    // Basic Validation
    const mobile = document.getElementById('booking-mobile').value;
    const amount = document.getElementById('booking-amount').value;
    
    if(mobile.length !== 10) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }
    
    if(amount < 500 || amount > 5000) {
        alert('Advance amount must be between ₹500 and ₹5000');
        return;
    }

    // Show Payment Modal
    const modal = document.getElementById('payment-modal');
    const modalContent = document.getElementById('payment-modal-content');
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
        lucide.createIcons();
    }, 10);
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    const modalContent = document.getElementById('payment-modal-content');
    
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

async function confirmPayment() {
    // 1. Generate Reference Number
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const refNumber = `REF-${timestamp}${random}`;
    
    // 2. Set Reference Number in Form
    document.getElementById('booking-reference').value = refNumber;
    document.getElementById('success-ref-number').textContent = refNumber;
    
    // 3. Submit Form to Formspree via AJAX
    const form = document.getElementById('booking-form');
    const formData = new FormData(form);
    
    try {
        const response = await fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            // 4. Hide Payment Modal & Show Success Modal
            closePaymentModal();
            setTimeout(() => {
                showSuccessModal();
                
                // 5. Send WhatsApp Message to Owner
                const name = document.getElementById('booking-name').value;
                const mobile = document.getElementById('booking-mobile').value;
                const date = document.getElementById('booking-date').value;
                const location = document.getElementById('booking-location').value;
                const pkg = document.getElementById('booking-package').value;
                const amount = document.getElementById('booking-amount').value;

                const message = encodeURIComponent(
                    `*New Booking Confirmed*\n\n` +
                    `Ref No: ${refNumber}\n` +
                    `Name: ${name}\n` +
                    `Mobile: ${mobile}\n` +
                    `Date: ${date}\n` +
                    `Location: ${location}\n` +
                    `Package: ${pkg || 'Not selected'}\n` +
                    `Advance Paid: ₹${amount}\n` +
                    `Payment Status: User marked as Paid`
                );
                
                // Using the number from UPI ID or primary contact
                const ownerPhone = "918982069314"; 
                window.open(`https://wa.me/${ownerPhone}?text=${message}`, '_blank');

                form.reset();
            }, 300);
        } else {
            alert("Oops! There was a problem submitting your form");
        }
    } catch (error) {
        alert("Oops! There was a problem submitting your form");
    }
}

function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    const modalContent = document.getElementById('success-modal-content');
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
        lucide.createIcons();
    }, 10);
}

function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    const modalContent = document.getElementById('success-modal-content');
    
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}
