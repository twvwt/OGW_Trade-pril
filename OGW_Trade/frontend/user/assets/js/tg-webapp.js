document.addEventListener('DOMContentLoaded', function() {
  // Initialize Telegram WebApp
  const tg = window.Telegram.WebApp;
  
  // Expand the WebApp to full viewport
  tg.expand();
  
  // Set up theme change handler
  function setTheme(theme) {
    document.documentElement.style.setProperty('--primary-color', themeParams.button_color || '#4361ee');
    document.documentElement.style.setProperty('--primary-light', themeParams.button_color || '#3f37c9');
    document.documentElement.style.setProperty('--secondary-color', themeParams.secondary_bg_color || '#3a0ca3');
    document.documentElement.style.setProperty('--accent-color', themeParams.hint_color || '#7209b7');
    document.documentElement.style.setProperty('--light-color', themeParams.bg_color || '#f8f9fa');
    document.documentElement.style.setProperty('--dark-color', themeParams.text_color || '#212529');
    document.documentElement.style.setProperty('--gray-color', themeParams.hint_color || '#6c757d');
    document.documentElement.style.setProperty('--light-gray', themeParams.secondary_bg_color || '#e9ecef');
  }
  
  // Get theme parameters
  const themeParams = tg.themeParams || {};
  setTheme(themeParams);
  
  // Handle theme changes
  tg.onEvent('themeChanged', () => {
    setTheme(tg.themeParams);
  });
  
  // Back button handling
  tg.BackButton.onClick(() => {
    // Handle back button click
    if (document.querySelector('.product-modal.active')) {
      closeProductModal();
    } else if (document.querySelector('.checkout-modal.active')) {
      closeCheckoutModal();
    } else if (document.querySelector('.cart-sidebar.active')) {
      closeCart();
    } else if (document.querySelector('.favorites-sidebar.active')) {
      closeFavorites();
    } else {
      tg.BackButton.hide();
    }
  });
  
  // Main button handling
  tg.MainButton.setParams({
    text: 'PROCEED TO CHECKOUT',
    color: themeParams.button_color || '#4361ee',
    text_color: themeParams.button_text_color || '#ffffff',
  });
  
  tg.MainButton.onClick(() => {
    openCheckoutModal();
  });
  
  // Show user data in console for debugging
  console.log('Telegram WebApp init data:', tg.initData);
  console.log('Telegram WebApp user:', tg.initDataUnsafe.user);
  
  // Store Telegram user data
  const userData = tg.initDataUnsafe.user || {};
  window.telegramUserId = userData.id;
  window.telegramUsername = userData.username;
  
  // Initialize cart and favorites
  initCart();
  initFavorites();
  loadProducts();
  
  // Set up event listeners for UI elements
  setupEventListeners();
});

function setupEventListeners() {
  // Menu button
  document.getElementById('menu-btn').addEventListener('click', () => {
    // In a real app, this might open a navigation menu
    alert('Menu button clicked');
  });
  
  // Search button
  document.getElementById('search-btn').addEventListener('click', () => {
    document.getElementById('search-bar').classList.add('active');
    document.getElementById('search-input').focus();
  });
  
  // Close search
  document.getElementById('close-search').addEventListener('click', () => {
    document.getElementById('search-bar').classList.remove('active');
  });
  
  // Cart button
  document.getElementById('cart-btn').addEventListener('click', openCart);
  
  // Close cart
  document.getElementById('close-cart').addEventListener('click', closeCart);
  
  // Favorites button
  document.getElementById('favorites-btn').addEventListener('click', openFavorites);
  
  // Close favorites
  document.getElementById('close-favorites').addEventListener('click', closeFavorites);
  
  // Close product modal
  document.getElementById('close-product-modal').addEventListener('click', closeProductModal);
  
  // Close checkout modal
  document.getElementById('close-checkout-modal').addEventListener('click', closeCheckoutModal);
  
  // Checkout button
  document.getElementById('checkout-btn').addEventListener('click', openCheckoutModal);
  
  // Search input
  document.getElementById('search-input').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
      const title = card.querySelector('.product-card-title').textContent.toLowerCase();
      if (title.includes(searchTerm)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

function openCart() {
  document.getElementById('cart-sidebar').classList.add('active');
  window.Telegram.WebApp.BackButton.show();
  renderCartItems();
}

function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('active');
  window.Telegram.WebApp.BackButton.hide();
}

function openFavorites() {
  document.getElementById('favorites-sidebar').classList.add('active');
  window.Telegram.WebApp.BackButton.show();
  renderFavoritesItems();
}

function closeFavorites() {
  document.getElementById('favorites-sidebar').classList.remove('active');
  window.Telegram.WebApp.BackButton.hide();
}

function openProductModal(product) {
  const modal = document.getElementById('product-modal');
  const mainImage = document.getElementById('modal-main-image');
  const thumbnailsContainer = document.getElementById('thumbnail-images');
  const productName = document.getElementById('modal-product-name');
  const productPrice = document.getElementById('modal-product-price');
  const productDescription = document.getElementById('modal-product-description');
  const productWeight = document.getElementById('modal-product-weight');
  const productDimensions = document.getElementById('modal-product-dimensions');
  const productColor = document.getElementById('modal-product-color');
  
  // Set product details
  productName.textContent = product.name;
  productPrice.textContent = `$${product.price.toFixed(2)}`;
  productDescription.textContent = product.description || 'No description available';
  
  // Set product attributes
  productWeight.textContent = product.attributes?.weight ? `${product.attributes.weight} kg` : '-';
  productDimensions.textContent = product.attributes?.dimensions || '-';
  productColor.textContent = product.attributes?.color || '-';
  
  // Set product images
  if (product.images && product.images.length) {
    mainImage.src = product.images[0];
    mainImage.alt = product.name;
    
    thumbnailsContainer.innerHTML = '';
    product.images.forEach((image, index) => {
      const thumbnail = document.createElement('div');
      thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
      thumbnail.innerHTML = `<img src="${image}" alt="${product.name}">`;
      thumbnail.addEventListener('click', () => {
        mainImage.src = image;
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
      });
      thumbnailsContainer.appendChild(thumbnail);
    });
  } else {
    mainImage.src = 'https://via.placeholder.com/400';
    thumbnailsContainer.innerHTML = '';
  }
  
  // Reset quantity
  document.getElementById('product-quantity').textContent = '1';
  
  // Set up add to cart button
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  addToCartBtn.onclick = () => {
    const quantity = parseInt(document.getElementById('product-quantity').textContent);
    addToCart(product._id, quantity);
    closeProductModal();
  };
  
  // Set up quantity buttons
  document.getElementById('increase-qty').onclick = () => {
    const quantityElement = document.getElementById('product-quantity');
    let quantity = parseInt(quantityElement.textContent);
    quantityElement.textContent = quantity + 1;
  };
  
  document.getElementById('decrease-qty').onclick = () => {
    const quantityElement = document.getElementById('product-quantity');
    let quantity = parseInt(quantityElement.textContent);
    if (quantity > 1) {
      quantityElement.textContent = quantity - 1;
    }
  };
  
  // Set up favorites button
  const favoritesBtn = document.getElementById('add-to-favorites-btn');
  const isFavorite = window.favorites.includes(product._id);
  
  if (isFavorite) {
    favoritesBtn.innerHTML = '<i class="fas fa-heart"></i> Remove from Favorites';
    favoritesBtn.classList.add('btn-danger');
  } else {
    favoritesBtn.innerHTML = '<i class="far fa-heart"></i> Add to Favorites';
    favoritesBtn.classList.remove('btn-danger');
  }
  
  favoritesBtn.onclick = () => {
    if (isFavorite) {
      removeFromFavorites(product._id);
      favoritesBtn.innerHTML = '<i class="far fa-heart"></i> Add to Favorites';
      favoritesBtn.classList.remove('btn-danger');
    } else {
      addToFavorites(product._id);
      favoritesBtn.innerHTML = '<i class="fas fa-heart"></i> Remove from Favorites';
      favoritesBtn.classList.add('btn-danger');
    }
  };
  
  // Open modal
  modal.classList.add('active');
  window.Telegram.WebApp.BackButton.show();
}

function closeProductModal() {
  document.getElementById('product-modal').classList.remove('active');
  window.Telegram.WebApp.BackButton.hide();
}

function openCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  const checkoutItems = document.getElementById('checkout-items');
  const cart = window.cart;
  
  // Render checkout items
  checkoutItems.innerHTML = '';
  
  cart.items.forEach(item => {
    const checkoutItem = document.createElement('div');
    checkoutItem.className = 'checkout-item';
    checkoutItem.innerHTML = `
      <span class="checkout-item-name">${item.product.name} x${item.quantity}</span>
      <span class="checkout-item-price">$${(item.product.price * item.quantity).toFixed(2)}</span>
    `;
    checkoutItems.appendChild(checkoutItem);
  });
  
  // Calculate totals
  const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = 5.99; // Fixed shipping cost for example
  const total = subtotal + shipping;
  
  document.getElementById('checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('checkout-shipping').textContent = `$${shipping.toFixed(2)}`;
  document.getElementById('checkout-total').textContent = `$${total.toFixed(2)}`;
  
  // Set up place order button
  document.getElementById('place-order-btn').onclick = placeOrder;
  
  // Open modal
  modal.classList.add('active');
  window.Telegram.WebApp.BackButton.show();
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal').classList.remove('active');
  window.Telegram.WebApp.BackButton.hide();
}

async function loadProducts() {
  try {
    // Show loading state
    const featuredContainer = document.getElementById('featured-products');
    const allProductsContainer = document.getElementById('all-products');
    
    featuredContainer.innerHTML = '<p>Loading featured products...</p>';
    allProductsContainer.innerHTML = '<p>Loading all products...</p>';
    
    // Fetch products from API
    const response = await fetch('/api/products');
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load products');
    }
    
    // Clear containers
    featuredContainer.innerHTML = '';
    allProductsContainer.innerHTML = '';
    
    // Separate featured and regular products
    const featuredProducts = data.products.filter(product => product.isFeatured);
    const regularProducts = data.products.filter(product => !product.isFeatured);
    
    // Render featured products
    if (featuredProducts.length) {
      featuredProducts.forEach(product => {
        featuredContainer.appendChild(createProductCard(product));
      });
    } else {
      featuredContainer.innerHTML = '<p>No featured products available</p>';
    }
    
    // Render all products
    if (regularProducts.length) {
      regularProducts.forEach(product => {
        allProductsContainer.appendChild(createProductCard(product));
      });
    } else {
      allProductsContainer.innerHTML = '<p>No products available</p>';
    }
    
    // Load categories
    loadCategories(data.products);
  } catch (error) {
    console.error('Error loading products:', error);
    
    const featuredContainer = document.getElementById('featured-products');
    const allProductsContainer = document.getElementById('all-products');
    
    featuredContainer.innerHTML = `<p>Error loading products: ${error.message}</p>`;
    allProductsContainer.innerHTML = '';
  }
}

function loadCategories(products) {
  const categoriesContainer = document.getElementById('categories-scroll');
  
  // Get unique categories
  const categories = [...new Set(products.map(product => product.category))];
  
  // Add "All" category
  categories.unshift('All');
  
  // Clear and populate categories
  categoriesContainer.innerHTML = '';
  
  categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'category-btn';
    button.textContent = category;
    button.addEventListener('click', () => filterProductsByCategory(category));
    categoriesContainer.appendChild(button);
  });
  
  // Set first category as active
  if (categoriesContainer.firstChild) {
    categoriesContainer.firstChild.classList.add('active');
  }
}

function filterProductsByCategory(category) {
  // Update active category button
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  event.target.classList.add('active');
  
  // Filter products
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    const productCategory = card.getAttribute('data-category');
    
    if (category === 'All' || productCategory === category) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('data-id', product._id);
  card.setAttribute('data-category', product.category);
  
  // Check if product is in favorites
  const isFavorite = window.favorites.includes(product._id);
  
  // Create card HTML
  card.innerHTML = `
    ${product.stock <= 0 ? '<span class="product-card-badge">Out of Stock</span>' : ''}
    <button class="product-card-favorite ${isFavorite ? 'active' : ''}" data-id="${product._id}">
      <i class="fas fa-heart"></i>
    </button>
    <img src="${product.images[0] || 'https://via.placeholder.com/300'}" alt="${product.name}" class="product-card-image">
    <div class="product-card-details">
      <h3 class="product-card-title">${product.name}</h3>
      <div class="product-card-price">
        $${product.price.toFixed(2)}
        ${product.originalPrice ? `<span class="product-card-original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
      </div>
      <div class="product-card-actions">
        <div class="product-card-rating">
          <i class="fas fa-star"></i>
          <span>4.8</span>
        </div>
        <button class="product-card-add-btn" data-id="${product._id}" ${product.stock <= 0 ? 'disabled' : ''}>
          <i class="fas fa-plus"></i>
        </button>
      </div>
    </div>
  `;
  
  // Add event listeners
  card.querySelector('.product-card-image').addEventListener('click', () => {
    openProductModal(product);
  });
  
  card.querySelector('.product-card-title').addEventListener('click', () => {
    openProductModal(product);
  });
  
  card.querySelector('.product-card-add-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    addToCart(product._id, 1);
  });
  
  card.querySelector('.product-card-favorite').addEventListener('click', (e) => {
    e.stopPropagation();
    const favoriteBtn = e.target.closest('.product-card-favorite');
    
    if (favoriteBtn.classList.contains('active')) {
      removeFromFavorites(product._id);
      favoriteBtn.classList.remove('active');
    } else {
      addToFavorites(product._id);
      favoriteBtn.classList.add('active');
    }
  });
  
  return card;
}

async function placeOrder() {
  const tg = window.Telegram.WebApp;
  const placeOrderBtn = document.getElementById('place-order-btn');
  
  // Get form data
  const fullName = document.getElementById('full-name').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const city = document.getElementById('city').value;
  const postalCode = document.getElementById('postal-code').value;
  const country = document.getElementById('country').value;
  const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
  
  // Validate form
  if (!fullName || !phone || !address || !city || !postalCode || !country) {
    alert('Please fill in all required fields');
    return;
  }
  
  // Prepare order data
  const orderData = {
    telegramId: window.telegramUserId,
    items: window.cart.items.map(item => ({
      productId: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    })),
    totalAmount: window.cart.total,
    shippingAddress: {
      street: address,
      city: city,
      country: country,
      postalCode: postalCode,
    },
    paymentMethod: paymentMethod,
  };
  
  try {
    placeOrderBtn.disabled = true;
    placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing Order...';
    
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to place order');
    }
    
    // Show success message
    tg.showAlert('Your order has been placed successfully!', () => {
      // Clear cart
      clearCart();
      // Close modals
      closeCheckoutModal();
      closeCart();
    });
    
    // You might also want to send a confirmation message to the user
    tg.sendData(JSON.stringify({
      action: 'order_placed',
      orderId: data._id,
    }));
  } catch (error) {
    console.error('Error placing order:', error);
    tg.showAlert(`Error: ${error.message}`);
  } finally {
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = 'Place Order';
  }
}