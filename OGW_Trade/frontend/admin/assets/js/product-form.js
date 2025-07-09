document.addEventListener('DOMContentLoaded', function() {
  // Initialize product form functionality
  const productForm = document.getElementById('product-form');
  const productImages = document.getElementById('product-images');
  const imagePreview = document.getElementById('image-preview');
  
  if (productImages && imagePreview) {
    // Handle image upload and preview
    productImages.addEventListener('change', function() {
      const files = this.files;
      
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          const previewDiv = document.createElement('div');
          previewDiv.className = 'preview-image';
          previewDiv.innerHTML = `
            <img src="${e.target.result}" alt="Preview">
            <button class="remove-image">&times;</button>
          `;
          imagePreview.appendChild(previewDiv);
        };
        
        reader.readAsDataURL(files[i]);
      }
    });
    
    // Handle image removal
    imagePreview.addEventListener('click', function(e) {
      if (e.target.classList.contains('remove-image')) {
        e.target.closest('.preview-image').remove();
      }
    });
  }
  
  // Form validation
  if (productForm) {
    productForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Validate required fields
      const requiredFields = ['product-name', 'product-price', 'product-category', 'product-stock'];
      let isValid = true;
      
      requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
          field.style.borderColor = 'var(--danger-color)';
          isValid = false;
        } else {
          field.style.borderColor = '';
        }
      });
      
      if (!isValid) {
        alert('Please fill in all required fields');
        return;
      }
      
      // Submit form programmatically
      document.getElementById('save-product-btn').click();
    });
  }
});