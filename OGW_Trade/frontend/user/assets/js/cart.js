// Initialize cart
function initCart() {
  if (!window.cart) {
    window.cart = {
      items: [],
      get total() {
        return this.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      }
    };
  }
  
  // Load cart from localStorage
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    try {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart && Array.isArray(parsedCart.items)) {
        window.cart.items = parsedCart.items;
      }
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
    }
  }
  
  updateCartBadge();
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify({
    items: window.cart.items,
  }));
  updateCartBadge();
}

// Update cart badge count
function updateCartBadge() {
  const totalItems = window.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').textContent = totalItems;
  
  // Update Telegram MainButton
  const tg = window.Telegram.WebApp;
  if (totalItems > 0) {
    tg.MainButton.setText(`PROCEED TO CHECKOUT (${totalItems})`);
    tg.MainButton.show();
  } else {
    tg.MainButton.hide();
  }
}

// Add item to cart
function addToCart(productId, quantity = 1) {
  // Check if product is already in cart
  const existingItem = window.cart.items.find(item => item.product._id === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    // Fetch product details (in a real app, you would get this from your API)
    fetch(`/api/products/${productId}`)
      .then(response => response.json())
      .then(product => {
        window.cart.items.push({
          product,
          quantity,
        });
        saveCart();
        showCartNotification(product.name, quantity);
      })
      .catch(error => {
        console.error('Error fetching product details:', error);
      });
    return;
  }
  
  saveCart();
  showCartNotification(existingItem.product.name, quantity);
}

// Remove item from cart
function removeFromCart(productId) {
  window.cart.items = window.cart.items.filter(item => item.product._id !== productId);
  saveCart();
}

// Update item quantity in cart
function updateCartItemQuantity(productId, quantity) {
  const item = window.cart.items.find(item => item.product._id === productId);
  if (item) {
    item.quantity = quantity;
    saveCart();
  }
}

// Clear cart
function clearCart() {
  window.cart.items = [];
  saveCart();
}

// Render cart items in sidebar
function renderCartItems() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalAmount = document.getElementById('cart-total-amount');
  
  cartItemsContainer.innerHTML = '';
  
  if (window.cart.items.length === 0) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
    cartTotalAmount.textContent = '$0.00';
    return;
  }
  
  window.cart.items.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <img src="${item.product.images[0] || 'https://via.placeholder.com/70'}" alt="${item.product.name}" class="cart-item-image">
      <div class="cart-item-details">
        <h4 class="cart-item-title">${item.product.name}</h4>
        <div class="cart-item-price">$${item.product.price.toFixed(2)}</div>
        <div class="cart-item-actions">
          <div class="quantity-selector">
            <button class="quantity-btn decrease" data-id="${item.product._id}">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn increase" data-id="${item.product._id}">+</button>
          </div>
          <button class="remove-item" data-id="${item.product._id}">Remove</button>
        </div>
      </div>
    `;
    
    // Add event listeners
    cartItem.querySelector('.decrease').addEventListener('click', () => {
      if (item.quantity > 1) {
        updateCartItemQuantity(item.product._id, item.quantity - 1);
        renderCartItems();
      } else {
        removeFromCart(item.product._id);
        renderCartItems();
      }
    });
    
    cartItem.querySelector('.increase').addEventListener('click', () => {
      updateCartItemQuantity(item.product._id, item.quantity + 1);
      renderCartItems();
    });
    
    cartItem.querySelector('.remove-item').addEventListener('click', () => {
      removeFromCart(item.product._id);
      renderCartItems();
    });
    
    cartItemsContainer.appendChild(cartItem);
  });
  
  cartTotalAmount.textContent = `$${window.cart.total.toFixed(2)}`;
}

// Show add to cart notification
function showCartNotification(productName, quantity) {
  const tg = window.Telegram.WebApp;
  tg.showAlert(`${quantity} ${quantity > 1 ? 'items' : 'item'} of ${productName} added to cart`);
}