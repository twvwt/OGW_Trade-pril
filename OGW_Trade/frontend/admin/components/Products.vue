<template>
  <div class="products-container">
    <div class="header">
      <h2>Управление товарами</h2>
      <button @click="showAddModal" class="btn-primary">
        <i class="fas fa-plus"></i> Добавить товар
      </button>
    </div>

    <div class="filters">
      <select v-model="categoryFilter" @change="fetchProducts">
        <option value="">Все категории</option>
        <option value="iPhone">iPhone</option>
        <option value="Mac">Mac</option>
        <option value="iPad">iPad</option>
        <option value="AirPods">AirPods</option>
      </select>
      <input type="text" v-model="searchQuery" placeholder="Поиск..." @input="fetchProducts">
    </div>

    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Изображение</th>
            <th>Название</th>
            <th>Категория</th>
            <th>Цена</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product._id">
            <td>
              <img :src="product.images[0] || '/placeholder.jpg'" :alt="product.name" class="product-thumb">
            </td>
            <td>{{ product.name }}</td>
            <td>{{ product.category }}</td>
            <td>{{ formatPrice(product.price) }} ₽</td>
            <td>
              <span :class="['status', product.isActive ? 'active' : 'inactive']">
                {{ product.isActive ? 'Активен' : 'Неактивен' }}
              </span>
            </td>
            <td class="actions">
              <button @click="editProduct(product._id)" class="btn-edit">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="confirmDelete(product._id)" class="btn-delete">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Назад</button>
      <span>Страница {{ currentPage }} из {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Вперед</button>
    </div>

    <!-- Модальное окно добавления/редактирования товара -->
    <ProductModal 
      v-if="showModal"
      :product="currentProduct"
      :mode="modalMode"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import ProductModal from './ProductModal.vue';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

export default {
  components: {
    ProductModal
  },
  setup() {
    const toast = useToast();
    const products = ref([]);
    const currentPage = ref(1);
    const totalPages = ref(1);
    const categoryFilter = ref('');
    const searchQuery = ref('');
    const showModal = ref(false);
    const modalMode = ref('add');
    const currentProduct = ref(null);

    const fetchProducts = async () => {
      try {
        const params = {
          page: currentPage.value,
          limit: 10,
          category: categoryFilter.value,
          search: searchQuery.value
        };

        const response = await axios.get('/api/products', { params });
        products.value = response.data.data.products;
        totalPages.value = Math.ceil(response.data.results / 10);
      } catch (error) {
        toast.error('Ошибка при загрузке товаров');
        console.error(error);
      }
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('ru-RU').format(price);
    };

    const showAddModal = () => {
      modalMode.value = 'add';
      currentProduct.value = null;
      showModal.value = true;
    };

    const editProduct = (id) => {
      modalMode.value = 'edit';
      currentProduct.value = products.value.find(p => p._id === id);
      showModal.value = true;
    };

    const confirmDelete = async (id) => {
      if (confirm('Вы уверены, что хотите удалить этот товар?')) {
        try {
          await axios.delete(`/api/products/${id}`);
          toast.success('Товар успешно удален');
          fetchProducts();
        } catch (error) {
          toast.error('Ошибка при удалении товара');
          console.error(error);
        }
      }
    };

    const handleSave = async (productData) => {
      try {
        if (modalMode.value === 'add') {
          await axios.post('/api/products', productData);
          toast.success('Товар успешно добавлен');
        } else {
          await axios.patch(`/api/products/${currentProduct.value._id}`, productData);
          toast.success('Товар успешно обновлен');
        }
        closeModal();
        fetchProducts();
      } catch (error) {
        toast.error('Ошибка при сохранении товара');
        console.error(error);
      }
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
        fetchProducts();
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
        fetchProducts();
      }
    };

    onMounted(fetchProducts);

    return {
      products,
      currentPage,
      totalPages,
      categoryFilter,
      searchQuery,
      showModal,
      modalMode,
      currentProduct,
      fetchProducts,
      formatPrice,
      showAddModal,
      editProduct,
      confirmDelete,
      handleSave,
      closeModal,
      nextPage,
      prevPage
    };
  }
};
</script>

<style scoped>
.products-container {
  padding: 20px;
  background: #1a1a2e;
  border-radius: 10px;
  color: white;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.filters select, .filters input {
  padding: 8px 12px;
  border-radius: 5px;
  border: 1px solid #333;
  background: #252547;
  color: white;
}

.table-responsive {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #333;
}

th {
  background: #252547;
  font-weight: 600;
}

.product-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 5px;
}

.status {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status.active {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

.status.inactive {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn-edit, .btn-delete {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit {
  background: rgba(23, 162, 184, 0.2);
  color: #17a2b8;
}

.btn-edit:hover {
  background: rgba(23, 162, 184, 0.4);
}

.btn-delete {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}

.btn-delete:hover {
  background: rgba(220, 53, 69, 0.4);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.pagination button {
  padding: 5px 15px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.pagination button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}
</style>