// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Cart functionality
let cartLines = []; // each: { id, name, unitPrice, qty }
const cartCountElement = document.querySelector('.cart-count');
const cartOverlay = document.querySelector('#cartOverlay');
const cartItemsEl = document.querySelector('#cartItems');
const cartEmptyEl = document.querySelector('#cartEmpty');
const cartTotalEl = document.querySelector('#cartTotal');
const cartCloseBtn = document.querySelector('.cart-close');

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (c) => {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return map[c] || c;
    });
}

function parsePrice(priceText) {
    // Accept strings like "$29.99" and return 29.99
    const value = parseFloat(String(priceText).replace(/[^0-9.]/g, ''));
    return Number.isFinite(value) ? value : 0;
}

function getCartTotals() {
    const totalQty = cartLines.reduce((sum, line) => sum + line.qty, 0);
    const totalAmount = cartLines.reduce((sum, line) => sum + (line.unitPrice * line.qty), 0);
    return { totalQty, totalAmount };
}

function renderCart() {
    if (!cartItemsEl) return;

    const { totalQty, totalAmount } = getCartTotals();

    cartCountElement.textContent = totalQty;
    cartTotalEl.textContent = `$${totalAmount.toFixed(2)}`;

    cartItemsEl.innerHTML = '';

    if (cartLines.length === 0) {
        cartEmptyEl.style.display = 'block';
        cartItemsEl.style.display = 'none';
        return;
    }

    cartEmptyEl.style.display = 'none';
    cartItemsEl.style.display = 'block';

    cartLines.forEach((line) => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.dataset.cartId = line.id;
        li.innerHTML = `
            <div class="cart-item-main">
                <div class="cart-item-title">${escapeHtml(line.name)}</div>
                <div class="cart-item-sub">${line.qty} x $${line.unitPrice.toFixed(2)} = $${(line.unitPrice * line.qty).toFixed(2)}</div>
            </div>
            <button type="button" class="cart-item-remove btn btn-small btn-outline">Remove</button>
        `;
        const removeBtn = li.querySelector('.cart-item-remove');
        removeBtn.addEventListener('click', () => {
            cartLines = cartLines.map((l) => (l.id === line.id ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0);
            showNotification(`${line.name} updated in your cart`);
            renderCart();
            animateCartCount();
        });
        cartItemsEl.appendChild(li);
    });
}

function openCart() {
    if (!cartOverlay) return;
    cartOverlay.classList.add('is-open');
    cartOverlay.setAttribute('aria-hidden', 'false');
    // Ensure list reflects latest state
    renderCart();
}

function closeCart() {
    if (!cartOverlay) return;
    cartOverlay.classList.remove('is-open');
    cartOverlay.setAttribute('aria-hidden', 'true');
}

function animateCartCount() {
    if (!cartCountElement) return;
    cartCountElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartCountElement.style.transform = 'scale(1)';
    }, 200);
}

function addToCart({ name, priceText }) {
    const unitPrice = parsePrice(priceText);
    // Group identical items by name+price
    const id = `${name}|${unitPrice.toFixed(2)}`;
    const existing = cartLines.find((l) => l.id === id);

    if (existing) {
        existing.qty += 1;
    } else {
        cartLines.push({ id, name, unitPrice, qty: 1 });
    }

    showNotification(`${name} added to cart!`);
    animateCartCount();
    renderCart();
    openCart();
}

// Add to cart functionality
document.querySelectorAll('.product-overlay .btn').forEach((button) => {
    if (button.textContent.includes('Add to Cart')) {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productCard = button.closest('.product-card');
            const productName = productCard?.querySelector('h3')?.textContent?.trim();
            const productPrice = productCard?.querySelector('.product-price')?.textContent?.trim();
            if (!productName || !productPrice) return;
            addToCart({ name: productName, priceText: productPrice });
        });
    }
});

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #000;
        color: #fff;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Newsletter form submission
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        
        if (email) {
            showNotification('Thanks for subscribing!');
            newsletterForm.reset();
        }
    });
}

// Product card hover effects
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Category card hover effects
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Search functionality (basic)
const searchIcon = document.querySelector('.nav-actions .fa-search');
if (searchIcon) {
    searchIcon.addEventListener('click', () => {
        const searchTerm = prompt('What are you looking for?');
        if (searchTerm) {
            // This would typically filter products or redirect to search results
            showNotification(`Searching for: ${searchTerm}`);
        }
    });
}

// User account functionality (basic)
const userIcon = document.querySelector('.nav-actions .fa-user');
if (userIcon) {
    userIcon.addEventListener('click', () => {
        showNotification('User account feature coming soon!');
    });
}

// Cart icon functionality
const cartIcon = document.querySelector('.cart-icon');
if (cartIcon) {
    cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        openCart();
    });
}

// Close cart interactions
if (cartOverlay && cartCloseBtn) {
    cartCloseBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) closeCart();
    });
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.querySelectorAll('.product-card, .category-card, .about-text, .about-image').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Header scroll effect
let lastScrollTop = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down
        header.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        header.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
});

// Add transition to header
header.style.transition = 'transform 0.3s ease';

// Quick view functionality
document.querySelectorAll('.product-overlay .btn').forEach(button => {
    if (button.textContent.includes('Quick View')) {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productCard = button.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            
            showQuickView(productName, productPrice);
        });
    }
});

function showQuickView(name, price) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: #fff;
        padding: 2rem;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        text-align: center;
        transform: scale(0.8);
        transition: transform 0.3s ease;
    `;
    
    modalContent.innerHTML = `
        <h3>${name}</h3>
        <p style="font-size: 1.5rem; font-weight: 700; margin: 1rem 0; color: #000;">${price}</p>
        <p style="color: #666; margin-bottom: 2rem;">This is a quick preview of the product. Full product details coming soon!</p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Close</button>
            <button class="btn btn-secondary" onclick='addToCartFromQuickView(${JSON.stringify(name)}, ${JSON.stringify(price)}); this.closest(".modal").remove();'>Add to Cart</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    modal.className = 'modal';
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    }, 10);
    
    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Expose a stable function for the inline onclick in Quick View
window.addToCartFromQuickView = function (name, priceText) {
    addToCart({ name, priceText });
};

// Lazy loading for images (when you add real images)
const lazyImages = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
        }
    });
});

lazyImages.forEach(img => imageObserver.observe(img));

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(() => {
    // Any scroll-based functionality can go here
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Initialize tooltips for better UX
document.querySelectorAll('[title]').forEach(element => {
    element.addEventListener('mouseenter', (e) => {
        const tooltip = document.createElement('div');
        tooltip.textContent = e.target.title;
        tooltip.style.cssText = `
            position: absolute;
            background: #000;
            color: #fff;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 0.8rem;
            z-index: 1000;
            pointer-events: none;
            white-space: nowrap;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
        
        e.target.tooltip = tooltip;
    });
    
    element.addEventListener('mouseleave', (e) => {
        if (e.target.tooltip) {
            document.body.removeChild(e.target.tooltip);
            e.target.tooltip = null;
        }
    });
});

console.log('TRĘÑDY DRIPŚ website loaded successfully! 🎉');
