document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const loginModal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form');
  const loginSubmitBtn = document.getElementById('login-submit-btn');
  const sidebarLinks = document.querySelectorAll('.sidebar-nav li');
  const contentSections = document.querySelectorAll('.content-section');
  const sectionTitle = document.getElementById('section-title');
  const logoutBtn = document.getElementById('logout-btn');
  const productModal = document.getElementById('product-modal');
  const adminModal = document.getElementById('admin-modal');
  const importModal = document.getElementById('import-modal');
  const orderModal = document.getElementById('order-modal');
  const addProductBtn = document.getElementById('add-product-btn');
  const addAdminBtn = document.getElementById('add-admin-btn');
  const importProductsBtn = document.getElementById('import-products-btn');
  const closeModalBtns = document.querySelectorAll('.close-modal');
  const saveProductBtn = document.getElementById('save-product-btn');
  const saveAdminBtn = document.getElementById('save-admin-btn');
  const importSubmitBtn = document.getElementById('import-submit-btn');
  const updateStatusBtn = document.getElementById('update-status-btn');
  
  // Auth state
  let currentUser = null;
  let authToken = localStorage.getItem('authToken');
  
  // Check if user is logged in
  if (authToken) {
    loginModal.classList.remove('active');
    fetchAdminProfile();
  } else {
    loginModal.classList.add('active');
  }
  
  // Login form submission
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    loginSubmitBtn.disabled = true;
    loginSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      localStorage.setItem('authToken', data.token);
      authToken = data.token;
      loginModal.classList.remove('active');
      await fetchAdminProfile();
      
      // Show success notification
      showNotification('Login successful', 'success');
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      loginSubmitBtn.disabled = false;
      loginSubmitBtn.textContent = 'Login';
    }
  });
  
  // Fetch admin profile
  async function fetchAdminProfile() {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }
      
      currentUser = data;
      updateUIForUserRole(data.role);
      
      // Update user profile in sidebar
      const usernameEl = document.querySelector('.user-profile .username');
      const roleEl = document.querySelector('.user-profile .role');
      
      if (usernameEl) usernameEl.textContent = data.username;
      if (roleEl) roleEl.textContent = data.role === 'superadmin' ? 'Super Admin' : 'Admin';
      
      // Load dashboard data
      loadDashboardData();
      loadProducts();
      loadOrders();
      loadUsers();
      
      if (data.role === 'superadmin') {
        loadAdmins();
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      logout();
    }
  }
  
  // Update UI based on user role
  function updateUIForUserRole(role) {
    const adminsSection = document.getElementById('admins-section');
    const adminsContent = document.getElementById('admins-section-content');
    
    if (role === 'superadmin') {
      if (adminsSection) adminsSection.style.display = 'flex';
    } else {
      if (adminsSection) adminsSection.style.display = 'none';
    }
  }
  
  // Logout
  logoutBtn.addEventListener('click', logout);
  
  function logout() {
    localStorage.removeItem('authToken');
    window.location.reload();
  }
  
  // Sidebar navigation
  sidebarLinks.forEach(link => {
    link.addEventListener('click', function() {
      const section = this.getAttribute('data-section');
      
      // Update active state
      sidebarLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      
      // Update content section
      contentSections.forEach(sec => sec.classList.remove('active'));
      document.getElementById(`${section}-section`).classList.add('active');
      
      // Update title
      sectionTitle.textContent = this.querySelector('span').textContent;
    });
  });
  
  // Modal handling
  function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  // Open modals
  if (addProductBtn) {
    addProductBtn.addEventListener('click', () => {
      document.getElementById('product-modal-title').textContent = 'Add New Product';
      document.getElementById('product-form').reset();
      document.getElementById('image-preview').innerHTML = '';
      document.getElementById('product-id').value = '';
      openModal(productModal);
    });
  }
  
  if (addAdminBtn) {
    addAdminBtn.addEventListener('click', () => {
      document.getElementById('admin-form').reset();
      openModal(adminModal);
    });
  }
  
  if (importProductsBtn) {
    importProductsBtn.addEventListener('click', () => {
      document.getElementById('import-form').reset();
      openModal(importModal);
    });
  }
  
  // Close modals
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const modal = this.closest('.modal');
      closeModal(modal);
    });
  });
  
  // Close modal when clicking outside
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal(this);
      }
    });
  });
  
  // Save product
  if (saveProductBtn) {
    saveProductBtn.addEventListener('click', async function() {
      const form = document.getElementById('product-form');
      const productId = document.getElementById('product-id').value;
      const formData = new FormData();
      
      // Append all form data
      formData.append('name', document.getElementById('product-name').value);
      formData.append('description', document.getElementById('product-description').value);
      formData.append('price', document.getElementById('product-price').value);
      formData.append('category', document.getElementById('product-category').value);
      formData.append('stock', document.getElementById('product-stock').value);
      formData.append('isFeatured', document.getElementById('product-featured').value);
      formData.append('attributes[weight]', document.getElementById('product-weight').value);
      formData.append('attributes[dimensions]', document.getElementById('product-dimensions').value);
      formData.append('attributes[color]', document.getElementById('product-color').value);
      
      // Append images
      const imageInput = document.getElementById('product-images');
      for (let i = 0; i < imageInput.files.length; i++) {
        formData.append('images', imageInput.files[i]);
      }
      
      // Get existing image URLs
      const imagePreviews = document.querySelectorAll('#image-preview .preview-image[data-url]');
      imagePreviews.forEach(preview => {
        formData.append('existingImages', preview.getAttribute('data-url'));
      });
      
      saveProductBtn.disabled = true;
      saveProductBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      
      try {
        let response;
        const url = productId ? `/api/products/${productId}` : '/api/products';
        const method = productId ? 'PUT' : 'POST';
        
        response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          body: formData,
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to save product');
        }
        
        showNotification(`Product ${productId ? 'updated' : 'added'} successfully`, 'success');
        closeModal(productModal);
        loadProducts();
      } catch (error) {
        showNotification(error.message, 'error');
      } finally {
        saveProductBtn.disabled = false;
        saveProductBtn.textContent = 'Save Product';
      }
    });
  }
  
  // Save admin
  if (saveAdminBtn) {
    saveAdminBtn.addEventListener('click', async function() {
      const form = document.getElementById('admin-form');
      const username = document.getElementById('admin-username').value;
      const password = document.getElementById('admin-password').value;
      const role = document.getElementById('admin-role').value;
      
      saveAdminBtn.disabled = true;
      saveAdminBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      
      try {
        const response = await fetch('/api/admins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({ username, password, role }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to save admin');
        }
        
        showNotification('Admin added successfully', 'success');
        closeModal(adminModal);
        loadAdmins();
      } catch (error) {
        showNotification(error.message, 'error');
      } finally {
        saveAdminBtn.disabled = false;
        saveAdminBtn.textContent = 'Save Admin';
      }
    });
  }
  
  // Import products
  if (importSubmitBtn) {
    importSubmitBtn.addEventListener('click', async function() {
      const fileInput = document.getElementById('import-file');
      
      if (!fileInput.files.length) {
        showNotification('Please select a file', 'error');
        return;
      }
      
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      
      importSubmitBtn.disabled = true;
      importSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
      
      try {
        const response = await fetch('/api/products/import', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          body: formData,
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to import products');
        }
        
        showNotification(`Successfully imported ${data.count} products`, 'success');
        closeModal(importModal);
        loadProducts();
      } catch (error) {
        showNotification(error.message, 'error');
      } finally {
        importSubmitBtn.disabled = false;
        importSubmitBtn.textContent = 'Import';
      }
    });
  }
  
  // Load dashboard data
  async function loadDashboardData() {
    try {
      // Load stats
      const statsResponse = await fetch('/api/products/stats', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      const statsData = await statsResponse.json();
      
      if (statsResponse.ok) {
        document.getElementById('total-products').textContent = statsData.totalProducts || 0;
        document.getElementById('total-orders').textContent = statsData.totalOrders || 0;
        document.getElementById('total-users').textContent = statsData.totalUsers || 0;
        document.getElementById('total-revenue').textContent = `$${(statsData.totalRevenue || 0).toFixed(2)}`;
      }
      
      // Load recent orders
      const ordersResponse = await fetch('/api/orders?limit=5', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      const ordersData = await ordersResponse.json();
      
      if (ordersResponse.ok) {
        const ordersBody = document.getElementById('recent-orders-body');
        ordersBody.innerHTML = '';
        
        ordersData.orders.forEach(order => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${order._id.substring(0, 8)}...</td>
            <td>${order.telegramId || 'Guest'}</td>
            <td>$${order.totalAmount.toFixed(2)}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
          `;
          row.addEventListener('click', () => showOrderDetails(order));
          ordersBody.appendChild(row);
        });
      }
      
      // Initialize chart
      initSalesChart();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }
  
  // Load products
  async function loadProducts(page = 1, search = '', category = '') {
    try {
      let url = `/api/products?page=${page}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load products');
      }
      
      // Update products table
      const productsBody = document.getElementById('products-table-body');
      productsBody.innerHTML = '';
      
      data.products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><img src="${product.images[0] || 'https://via.placeholder.com/50'}" alt="${product.name}" class="product-image"></td>
          <td>${product.name}</td>
          <td>${product.category}</td>
          <td>$${product.price.toFixed(2)}</td>
          <td>${product.stock}</td>
          <td>${product.stock > 0 ? '<span class="status-badge status-delivered">In Stock</span>' : '<span class="status-badge status-cancelled">Out of Stock</span>'}</td>
          <td>
            <div class="table-actions">
              <button class="action-btn edit" data-id="${product._id}"><i class="fas fa-edit"></i></button>
              <button class="action-btn delete" data-id="${product._id}"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        `;
        productsBody.appendChild(row);
      });
      
      // Update pagination
      const pageInfo = document.getElementById('page-info');
      const prevPageBtn = document.getElementById('prev-page');
      const nextPageBtn = document.getElementById('next-page');
      
      pageInfo.textContent = `Page ${data.currentPage} of ${data.totalPages}`;
      prevPageBtn.disabled = data.currentPage === 1;
      nextPageBtn.disabled = data.currentPage === data.totalPages;
      
      prevPageBtn.onclick = () => loadProducts(data.currentPage - 1, search, category);
      nextPageBtn.onclick = () => loadProducts(data.currentPage + 1, search, category);
      
      // Update categories filter
      const categoryFilter = document.getElementById('category-filter');
      if (categoryFilter && categoryFilter.children.length <= 1) {
        const categories = [...new Set(data.products.map(p => p.category))];
        categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category;
          categoryFilter.appendChild(option);
        });
        
        // Also update datalist for product form
        const categoriesList = document.getElementById('categories-list');
        if (categoriesList) {
          categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            categoriesList.appendChild(option);
          });
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
      showNotification(error.message, 'error');
    }
  }
  
  // Load orders
  async function loadOrders(page = 1, status = '') {
    try {
      let url = `/api/orders?page=${page}`;
      if (status) url += `&status=${status}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load orders');
      }
      
      // Update orders table
      const ordersBody = document.getElementById('orders-table-body');
      ordersBody.innerHTML = '';
      
      data.orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${order._id.substring(0, 8)}...</td>
          <td>${order.telegramId || 'Guest'}</td>
          <td>${new Date(order.createdAt).toLocaleDateString()}</td>
          <td>$${order.totalAmount.toFixed(2)}</td>
          <td><span class="status-badge status-${order.status}">${order.status}</span></td>
          <td>
            <div class="table-actions">
              <button class="action-btn view" data-id="${order._id}"><i class="fas fa-eye"></i></button>
            </div>
          </td>
        `;
        row.addEventListener('click', () => showOrderDetails(order));
        ordersBody.appendChild(row);
      });
      
      // Update pagination
      const pageInfo = document.getElementById('orders-page-info');
      const prevPageBtn = document.getElementById('prev-orders-page');
      const nextPageBtn = document.getElementById('next-orders-page');
      
      pageInfo.textContent = `Page ${data.currentPage} of ${data.totalPages}`;
      prevPageBtn.disabled = data.currentPage === 1;
      nextPageBtn.disabled = data.currentPage === data.totalPages;
      
      prevPageBtn.onclick = () => loadOrders(data.currentPage - 1, status);
      nextPageBtn.onclick = () => loadOrders(data.currentPage + 1, status);
    } catch (error) {
      console.error('Error loading orders:', error);
      showNotification(error.message, 'error');
    }
  }
  
  // Load users
  async function loadUsers(page = 1) {
    try {
      const response = await fetch(`/api/users?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load users');
      }
      
      // Update users table
      const usersBody = document.getElementById('users-table-body');
      usersBody.innerHTML = '';
      
      data.users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.telegramId}</td>
          <td>${user.username || '-'}</td>
          <td>${user.firstName || ''} ${user.lastName || ''}</td>
          <td>${user.orders ? user.orders.length : 0}</td>
          <td>${new Date(user.createdAt).toLocaleDateString()}</td>
          <td>
            <div class="table-actions">
              <button class="action-btn view" data-id="${user._id}"><i class="fas fa-eye"></i></button>
            </div>
          </td>
        `;
        usersBody.appendChild(row);
      });
      
      // Update pagination
      const pageInfo = document.getElementById('users-page-info');
      const prevPageBtn = document.getElementById('prev-users-page');
      const nextPageBtn = document.getElementById('next-users-page');
      
      pageInfo.textContent = `Page ${data.currentPage} of ${data.totalPages}`;
      prevPageBtn.disabled = data.currentPage === 1;
      nextPageBtn.disabled = data.currentPage === data.totalPages;
      
      prevPageBtn.onclick = () => loadUsers(data.currentPage - 1);
      nextPageBtn.onclick = () => loadUsers(data.currentPage + 1);
    } catch (error) {
      console.error('Error loading users:', error);
      showNotification(error.message, 'error');
    }
  }
  
  // Load admins
  async function loadAdmins() {
    try {
      const response = await fetch('/api/admins', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load admins');
      }
      
      // Update admins table
      const adminsBody = document.getElementById('admins-table-body');
      adminsBody.innerHTML = '';
      
      data.forEach(admin => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${admin.username}</td>
          <td>${admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}</td>
          <td>${new Date(admin.createdAt).toLocaleDateString()}</td>
          <td>
            <div class="table-actions">
              ${currentUser.role === 'superadmin' && admin._id !== currentUser._id ? `
                <button class="action-btn delete" data-id="${admin._id}"><i class="fas fa-trash"></i></button>
              ` : ''}
            </div>
          </td>
        `;
        adminsBody.appendChild(row);
      });
    } catch (error) {
      console.error('Error loading admins:', error);
      showNotification(error.message, 'error');
    }
  }
  
  // Show order details
  async function showOrderDetails(order) {
    try {
      const response = await fetch(`/api/orders/${order._id}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      const orderDetails = await response.json();
      
      if (!response.ok) {
        throw new Error(orderDetails.message || 'Failed to load order details');
      }
      
      // Update modal with order details
      document.getElementById('order-id').textContent = orderDetails._id;
      document.getElementById('order-date').textContent = new Date(orderDetails.createdAt).toLocaleString();
      document.getElementById('order-status').textContent = orderDetails.status;
      document.getElementById('order-total').textContent = `$${orderDetails.totalAmount.toFixed(2)}`;
      
      // Set status select
      const statusSelect = document.getElementById('order-status-select');
      statusSelect.value = orderDetails.status;
      
      // Update order items
      const itemsBody = document.getElementById('order-items-body');
      itemsBody.innerHTML = '';
      
      orderDetails.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item.productId.name}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>${item.quantity}</td>
          <td>$${(item.price * item.quantity).toFixed(2)}</td>
        `;
        itemsBody.appendChild(row);
      });
      
      // Update shipping address
      const shippingAddress = document.getElementById('shipping-address');
      if (orderDetails.shippingAddress) {
        shippingAddress.innerHTML = `
          <p>${orderDetails.shippingAddress.street || ''}</p>
          <p>${orderDetails.shippingAddress.city || ''}, ${orderDetails.shippingAddress.country || ''}</p>
          <p>${orderDetails.shippingAddress.postalCode || ''}</p>
        `;
      } else {
        shippingAddress.innerHTML = '<p>No shipping address provided</p>';
      }
      
      // Update payment info
      const paymentInfo = document.getElementById('payment-info');
      paymentInfo.innerHTML = `
        <p><strong>Method:</strong> ${orderDetails.paymentMethod || 'N/A'}</p>
        <p><strong>Status:</strong> ${orderDetails.paymentStatus || 'N/A'}</p>
      `;
      
      // Set up update status button
      updateStatusBtn.onclick = async () => {
        const newStatus = statusSelect.value;
        
        try {
          updateStatusBtn.disabled = true;
          updateStatusBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
          
          const updateResponse = await fetch(`/api/orders/${order._id}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ status: newStatus }),
          });
          
          const updateData = await updateResponse.json();
          
          if (!updateResponse.ok) {
            throw new Error(updateData.message || 'Failed to update order status');
          }
          
          showNotification('Order status updated successfully', 'success');
          closeModal(orderModal);
          loadOrders();
        } catch (error) {
          showNotification(error.message, 'error');
        } finally {
          updateStatusBtn.disabled = false;
          updateStatusBtn.textContent = 'Update Status';
        }
      };
      
      openModal(orderModal);
    } catch (error) {
      console.error('Error loading order details:', error);
      showNotification(error.message, 'error');
    }
  }
  
  // Edit product
  document.addEventListener('click', async function(e) {
    if (e.target.closest('.action-btn.edit')) {
      const productId = e.target.closest('.action-btn').getAttribute('data-id');
      
      try {
        const response = await fetch(`/api/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        
        const product = await response.json();
        
        if (!response.ok) {
          throw new Error(product.message || 'Failed to load product');
        }
        
        // Fill the form
        document.getElementById('product-modal-title').textContent = 'Edit Product';
        document.getElementById('product-id').value = product._id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-featured').value = product.isFeatured;
        document.getElementById('product-weight').value = product.attributes?.weight || '';
        document.getElementById('product-dimensions').value = product.attributes?.dimensions || '';
        document.getElementById('product-color').value = product.attributes?.color || '';
        
        // Display images
        const imagePreview = document.getElementById('image-preview');
        imagePreview.innerHTML = '';
        
        if (product.images && product.images.length) {
          product.images.forEach(image => {
            const preview = document.createElement('div');
            preview.className = 'preview-image';
            preview.setAttribute('data-url', image);
            preview.innerHTML = `
              <img src="${image}" alt="Product Image">
              <button class="remove-image">&times;</button>
            `;
            imagePreview.appendChild(preview);
          });
        }
        
        openModal(productModal);
      } catch (error) {
        console.error('Error loading product:', error);
        showNotification(error.message, 'error');
      }
    }
    
    // Delete product
    if (e.target.closest('.action-btn.delete')) {
      const button = e.target.closest('.action-btn');
      const id = button.getAttribute('data-id');
      const isProduct = button.closest('tr').querySelector('.product-image');
      const isAdmin = button.closest('tr').querySelector('td:first-child').textContent.includes('@');
      
      if (confirm(`Are you sure you want to delete this ${isProduct ? 'product' : isAdmin ? 'admin' : 'item'}?`)) {
        try {
          button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
          button.disabled = true;
          
          const url = isProduct ? `/api/products/${id}` : `/api/admins/${id}`;
          const response = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to delete');
          }
          
          showNotification(`${isProduct ? 'Product' : 'Admin'} deleted successfully`, 'success');
          
          if (isProduct) {
            loadProducts();
          } else {
            loadAdmins();
          }
        } catch (error) {
          console.error('Error deleting:', error);
          showNotification(error.message, 'error');
        }
      }
    }
    
    // View order
    if (e.target.closest('.action-btn.view') && !e.target.closest('.action-btn.edit')) {
      const orderId = e.target.closest('.action-btn').getAttribute('data-id');
      
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        
        const order = await response.json();
        
        if (!response.ok) {
          throw new Error(order.message || 'Failed to load order');
        }
        
        showOrderDetails(order);
      } catch (error) {
        console.error('Error loading order:', error);
        showNotification(error.message, 'error');
      }
    }
    
    // Remove image preview
    if (e.target.classList.contains('remove-image')) {
      e.target.closest('.preview-image').remove();
    }
  });
  
  // Image upload preview
  document.getElementById('product-images')?.addEventListener('change', function() {
    const files = this.files;
    const imagePreview = document.getElementById('image-preview');
    
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const preview = document.createElement('div');
        preview.className = 'preview-image';
        preview.innerHTML = `
          <img src="${e.target.result}" alt="Preview">
          <button class="remove-image">&times;</button>
        `;
        imagePreview.appendChild(preview);
      };
      
      reader.readAsDataURL(files[i]);
    }
  });
  
  // Product search
  document.getElementById('product-search')?.addEventListener('input', function() {
    const search = this.value;
    const category = document.getElementById('category-filter').value;
    loadProducts(1, search, category);
  });
  
  // Category filter
  document.getElementById('category-filter')?.addEventListener('change', function() {
    const category = this.value;
    const search = document.getElementById('product-search').value;
    loadProducts(1, search, category);
  });
  
  // Order status filter
  document.getElementById('order-status-filter')?.addEventListener('change', function() {
    const status = this.value;
    loadOrders(1, status);
  });
  
  // Show notification
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} fade-in`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  // Add notification CSS
  const style = document.createElement('style');
  style.textContent = `
    .notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: var(--border-radius);
      color: white;
      box-shadow: var(--box-shadow);
      z-index: 1000;
      max-width: 300px;
      animation: fadeIn 0.3s ease-out;
    }
    
    .notification.success {
      background-color: var(--success-color);
    }
    
    .notification.error {
      background-color: var(--danger-color);
    }
    
    .notification.fade-out {
      animation: fadeOut 0.3s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(20px); }
    }
  `;
  document.head.appendChild(style);
});