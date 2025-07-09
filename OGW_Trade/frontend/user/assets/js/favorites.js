// Initialize favorites
function initFavorites() {
  if (!window.favorites) {
    window.favorites = [];
  }
  
  // Load favorites from localStorage
  const savedFavorites = localStorage.getItem('favorites');
  if (savedFavorites) {
    try {
      const parsedFavorites = JSON.parse(savedFavorites);
      if (parsedFavorites && Array.isArray(parsedFavorites)) {
        window.favorites = parsedFavorites;
      }
    } catch (error) {
      console.error('Error parsing favorites from localStorage:', error);
    }
  }
  
  updateFavoritesBadge();
}

// Save favorites to localStorage
function saveFavorites() {
  localStorage.setItem('favorites', JSON.stringify(window.favorites));
  updateFavoritesBadge();
}

// Update favorites badge count
function updateFavoritesBadge() {
  document.getElementById('favorites-count').textContent = window.favorites.length;
}

// Add product to favorites
function addToFavorites(productId) {
  if (!window.favorites.includes(productId)) {
    window.favorites.push(productId);
    saveFavorites();
  }
}

// Remove product from favorites
function removeFromFavorites(productId) {
  window.favorites = window.favorites.filter(id => id !== productId);
  saveFavorites();
}

// Render favorites items in sidebar
function renderFavoritesItems() {
  const favoritesContainer = document.getElementById('favorites-items');
  
  favoritesContainer.innerHTML = '';
  
  if (window.favorites.length === 0) {
    favoritesContainer.innerHTML = '<p>Your favorites list is empty</p>';
    return;
  }
  
  // Fetch favorite products details
  Promise.all(
    window.favorites.map(productId => 
      fetch(`/api/products/${productId}`)
        .then(response => response.json())
        .catch(error => {
          console.error('Error fetching product:', error);
          return null;
        })
    )
  ).then(products => {
    // Filter out any failed fetches
    const validProducts = products.filter(product => product !== null);
    
    if (validProducts.length === 0) {
      favoritesContainer.innerHTML = '<p>Error loading favorites</p>';
      return;
    }
    
    validProducts.forEach(product => {
      const favoriteItem = document.createElement('div');
      favoriteItem.className = 'favorites-item';
      favoriteItem.innerHTML = `
        <img src="${product.images[0] || 'https://via.placeholder.com/60'}" alt="${product.name}" class="favorites-item-image">
        <div class="favorites-item-details">
          <h4 class="favorites-item-title">${product.name}</h4>
          <div class="favorites-item-price">$${product.price.toFixed(2)}</div>
          <div class="favorites-item-actions">
            <button class="btn btn-outline add-to-cart" data-id="${product._id}">
              <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
            <button class="btn btn-outline remove-favorite" data-id="${product._id}">
              <i class="fas fa-trash"></i> Remove
            </button>
          </div>
        </div>
      `;
      
      // Add event listeners
      favoriteItem.querySelector('.add-to-cart').addEventListener('click', () => {
        addToCart(product._id, 1);
      });
      
      favoriteItem.querySelector('.remove-favorite').addEventListener('click', () => {
        removeFromFavorites(product._id);
        renderFavoritesItems();
        
        // Also update the heart icon in product cards
        const productCard = document.querySelector(`.product-card[data-id="${product._id}"] .product-card-favorite`);
        if (productCard) {
          productCard.classList.remove('active');
        }
        
        // Update modal if open
        const modalProductId = document.getElementById('product-id').value;
        if (modalProductId === product._id) {
          const favoritesBtn = document.getElementById('add-to-favorites-btn');
          favoritesBtn.innerHTML = '<i class="far fa-heart"></i> Add to Favorites';
          favoritesBtn.classList.remove('btn-danger');
        }
      });
      
      favoritesContainer.appendChild(favoriteItem);
    });
  });
}