<template>
  <div>
    <!-- === Текущий поставщик === -->
    <div v-if="supplier" class="supplier-details">
      <h2>Информация о поставщике</h2>
      <div class="form-group">
        <label>ID поставщика:</label>
        <input type="text" v-model="supplier.id" disabled />
      </div>
      <div class="form-group">
        <label>Название:</label>
        <input type="text" v-model="supplier.supplier_name" />
      </div>
      <div class="form-group">
        <label>Адрес:</label>
        <input type="text" v-model="supplier.supplier_address" />
      </div>
      <div class="form-group">
        <label>Телефон:</label>
        <input type="tel" v-model="supplier.supplier_phone_number" />
      </div>
      <div class="buttons">
        <button @click="updateSupplier">Сохранить</button>
        <button @click="deleteSupplier" type="button">Удалить</button>
      </div>
    </div>
    <div v-else>
      <p>Загрузка...</p>
    </div>
    <!-- === Навигация === -->
    <div class="navigation-buttons">
      <button :disabled="supplierId <= 1" @click="goToPrevious">Предыдущий</button>
      <button @click="goToNext">Следующий</button>
      <button @click="toggleAddForm">{{ showAddForm ? 'Скрыть форму' : 'Добавить нового' }}</button>
    </div>
    <!-- === Добавление нового поставщика === -->
    <div v-if="showAddForm" class="supplier-details add-form">
      <h2>Добавить нового поставщика</h2>
      <div class="form-group">
        <label>ID (авто):</label>
        <input type="text" v-model="newSupplier.id" disabled />
      </div>
      <div class="form-group">
        <label>Название:</label>
        <input type="text" v-model="newSupplier.supplier_name" />
      </div>
      <div class="form-group">
        <label>Адрес:</label>
        <input type="text" v-model="newSupplier.supplier_address" />
      </div>
      <div class="form-group">
        <label>Телефон:</label>
        <input type="tel" v-model="newSupplier.supplier_phone_number" />
      </div>
      <div class="buttons">
        <button @click="addNewSupplier">Сохранить</button>
        <button @click="toggleAddForm">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchWithAuth } from '@/api.js';
import '@/assets/styles/buttons.css';

export default {
  mounted() {
    document.title = 'Поставщики';
  },
  data() {
    return {
      supplierId: 1,
      supplier: null,
      showAddForm: false,
      newSupplier: {
        id: null,
        supplier_name: '',
        supplier_address: '',
        supplier_phone_number: '',
      },
    };
  },
  created() {
    this.fetchSupplierData(this.supplierId);
  },
  methods: {
    async deleteSupplier() {
      if (confirm('Вы уверены, что хотите удалить этого поставщика?')) {
        try {
          await fetchWithAuth(`http://localhost:5000/api/suppliers/${this.supplier.id}`, { method: 'DELETE' });
          alert('Поставщик удалён!');
          this.goToNext();
        } catch (err) {
          console.error('Ошибка удаления:', err);
          alert('Не удалось удалить поставщика');
        }
      }
    },
    async fetchSupplierData(id) {
      try {
        const res = await fetchWithAuth(`http://localhost:5000/api/suppliers/${id}`);
        this.supplier = res.data;
        this.supplierId = res.data.id;
      } catch (err) {
        console.error('Ошибка загрузки поставщика:', err);
        this.supplier = null;
      }
    },
    async updateSupplier() {
      try {
        await fetchWithAuth(`http://localhost:5000/api/suppliers/${this.supplier.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.supplier),
        });
        alert('Данные обновлены!');
      } catch (err) {
        console.error('Ошибка обновления:', err);
        alert('Не удалось обновить данные');
      }
    },
    goToNext() {
      this.fetchSupplierData(this.supplierId + 1);
    },
    goToPrevious() {
      if (this.supplierId > 1) this.fetchSupplierData(this.supplierId - 1);
    },
    toggleAddForm() {
      this.showAddForm = !this.showAddForm;
      if (this.showAddForm) {
        this.prepareNewSupplier();
      }
    },
    async prepareNewSupplier() {
      try {
        const res = await fetchWithAuth('http://localhost:5000/api/count/suppliers');
        const maxId = Number(res.data.maxId);
        this.newSupplier = {
          id: maxId,
          supplier_name: '',
          supplier_address: '',
          supplier_phone_number: '',
        };
      } catch (err) {
        console.error('Ошибка при получении количества записей:', err);
      }
    },
    async addNewSupplier() {
      try {
        await fetchWithAuth('http://localhost:5000/api/suppliers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.newSupplier),
        });
        alert('Поставщик добавлен!');
        this.showAddForm = false;
      } catch (err) {
        console.error('Ошибка при добавлении поставщика:', err);
        alert('Не удалось добавить поставщика');
      }
    },
  },
};
</script>

<style scoped>
.supplier-details {
  background-color: #ffffff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  overflow-x: hidden;
  max-width: 100%;
}
.form-group {
  margin-bottom: 15px;
  width: 100%;
  box-sizing: border-box;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}
.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}
.form-group input:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}
.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
button {
  margin-right: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 14px;
}
button:hover {
  background-color: #45a049;
}
button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
.navigation-buttons {
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
}
.buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
}
.add-form {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5em;
}

/* Медиа-запросы для мобильных устройств */
@media (max-width: 768px) {
  .supplier-details {
    padding: 15px;
  }
  
  .form-group label {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .form-group input {
    font-size: 16px; /* Увеличиваем размер шрифта для лучшей читаемости на мобильных */
  }
  
  button {
    width: 100%;
    margin-right: 0;
    margin-bottom: 8px;
  }
  
  .buttons, .navigation-buttons {
    flex-direction: column;
    gap: 8px;
    padding: 0;
  }
}
</style> 