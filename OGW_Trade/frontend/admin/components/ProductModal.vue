<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ mode === 'add' ? 'Добавить товар' : 'Редактировать товар' }}</h3>
        <button @click="close" class="close-btn">&times;</button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="save">
          <div class="form-group">
            <label>Название</label>
            <input v-model="formData.name" type="text" required>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Категория</label>
              <select v-model="formData.category" required>
                <option value="iPhone">iPhone</option>
                <option value="Mac">Mac</option>
                <option value="iPad">iPad</option>
                <option value="AirPods">AirPods</option>
                <option value="Repair">Ремонт</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Подкатегория</label>
              <input v-model="formData.subcategory" type="text">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Цена (₽)</label>
              <input v-model.number="formData.price" type="number" min="0" required>
            </div>
            
            <div class="form-group">
              <label>Старая цена (₽)</label>
              <input v-model.number="formData.oldPrice" type="number" min="0">
            </div>
          </div>
          
          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="formData.description" rows="3"></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Память</label>
              <input v-model="formData.specs.storage" type="text">
            </div>
            
            <div class="form-group">
              <label>Цвет</label>
              <input v-model="formData.specs.color" type="text">
            </div>
          </div>
          
          <div class="form-group">
            <label>Страна</label>
            <input v-model="formData.specs.country" type="text">
          </div>
          
          <div class="form-group">
            <label>Изображения (URL через запятую)</label>
            <input v-model="imageInput" type="text" @change="processImages">
            <div class="image-preview">
              <img v-for="(img, index) in formData.images" :key="index" :src="img" alt="Preview" @click="removeImage(index)">
            </div>
          </div>
          
          <div class="form-group">
            <label>
              <input v-model="formData.isActive" type="checkbox">
              Активный товар
            </label>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="close" class="btn-cancel">Отмена</button>
            <button type="submit" class="btn-save">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  props: {
    product: {
      type: Object,
      default: null
    },
    mode: {
      type: String,
      default: 'add'
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const formData = ref({
      name: '',
      category: 'iPhone',
      subcategory: '',
      price: 0,
      oldPrice: null,
      description: '',
      specs: {
        storage: '',
        color: '',
        country: ''
      },
      images: [],
      isActive: true
    });
    
    const imageInput = ref('');

    // Если режим редактирования, заполняем форму данными продукта
    watch(() => props.product, (newProduct) => {
      if (newProduct && props.mode === 'edit') {
        formData.value = {
          name: newProduct.name,
          category: newProduct.category,
          subcategory: newProduct.subcategory || '',
          price: newProduct.price,
          oldPrice: newProduct.oldPrice || null,
          description: newProduct.description || '',
          specs: {
            storage: newProduct.specs?.storage || '',
            color: newProduct.specs?.color || '',
            country: newProduct.specs?.country || ''
          },
          images: [...newProduct.images],
          isActive: newProduct.isActive
        };
        imageInput.value = newProduct.images.join(', ');
      }
    }, { immediate: true });

    const processImages = () => {
      if (imageInput.value) {
        formData.value.images = imageInput.value.split(',')
          .map(url => url.trim())
          .filter(url => url.length > 0);
      } else {
        formData.value.images = [];
      }
    };

    const removeImage = (index) => {
      formData.value.images.splice(index, 1);
      imageInput.value = formData.value.images.join(', ');
    };

    const save = () => {
      emit('save', formData.value);
    };

    const close = () => {
      emit('close');
    };

    return {
      formData,
      imageInput,
      processImages,
      removeImage,
      save,
      close
    };
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a2e;
  border-radius: 10px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  color: white;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #aaa;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

input, select, textarea {
  width: 100%;
  padding: 8px 12px;
  border-radius: 5px;
  border: 1px solid #333;
  background: #252547;
  color: white;
}

textarea {
  resize: vertical;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.image-preview img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.2s;
}

.image-preview img:hover {
  transform: scale(1.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel, .btn-save {
  padding: 8px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-save {
  background: #28a745;
  color: white;
}
</style>