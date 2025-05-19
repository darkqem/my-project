<template>
  <div>

    <!-- === Текущий водитель === -->
    <div v-if="driver" class="driver-details">
      <h2>Информация о водителе</h2>
      <div class="form-group">
        <label>Код водителя:</label>
        <input type="text" v-model="driver.id" disabled />
      </div>
      <div class="form-group">
        <label>Фамилия:</label>
        <input type="text" v-model="driver.last_name" />
      </div>
      <div class="form-group">
        <label>Имя:</label>
        <input type="text" v-model="driver.first_name" />
      </div>
      <div class="form-group">
        <label>Отчество:</label>
        <input type="text" v-model="driver.middle_name" />
      </div>
      <div class="form-group">
        <label>Телефон:</label>
        <input type="tel" v-model="driver.phone_number" />
      </div>
      <div class="buttons">
        <button @click="updateDriver">Сохранить</button>
        <button @click="deleteDriver" type="button">Удалить</button>
      </div>
    </div>

    <div v-else>
      <p>Загрузка...</p>
    </div>

    <!-- === Навигация === -->
    <div class="navigation-buttons">
      <button :disabled="driverId <= 1" @click="goToPrevious">Предыдущий</button>
      <button @click="goToNext">Следующий</button>
      <button @click="toggleAddForm">{{ showAddForm ? 'Скрыть форму' : 'Добавить нового' }}</button>
    </div>
    <!-- === Добавление нового водителя === -->



    <div v-if="showAddForm" class="driver-details add-form">
      <h2>Добавить нового водителя</h2>
      <div class="form-group">
        <label>ID (авто):</label>
        <input type="text" v-model="newDriver.id" disabled />
      </div>
      <div class="form-group">
        <label>Фамилия:</label>
        <input type="text" v-model="newDriver.last_name" />
      </div>
      <div class="form-group">
        <label>Имя:</label>
        <input type="text" v-model="newDriver.first_name" />
      </div>
      <div class="form-group">
        <label>Отчество:</label>
        <input type="text" v-model="newDriver.middle_name" />
      </div>
      <div class="form-group">
        <label>Телефон:</label>
        <input type="tel" v-model="newDriver.phone_number" />
      </div>
      <div class="buttons">
        <button @click="addNewDriver">Сохранить</button>
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
    document.title = 'Водители'
  },
  data() {
    return {
      driverId: 1,
      driver: null,
      showAddForm: false,
      newDriver: {
        id: null,
        last_name: '',
        first_name: '',
        middle_name: '',
        phone_number: '',
      },
    };
  },
  created() {
    this.fetchDriverData(this.driverId);
  },
  methods: {
    async deleteDriver() {
      if (confirm('Вы уверены, что хотите удалить этого водителя?')) {
        try {
          await fetchWithAuth(`http://localhost:5000/api/drivers/${this.driver.id}`, { method: 'DELETE' });
          alert('Водитель удален!');
          this.goToNext(); // Переходим к следующей записи после удаления
        } catch (err) {
          console.error('Ошибка удаления:', err);
          alert('Не удалось удалить водителя');
        }
      }
    },
    async fetchDriverData(id) {
      try {
        const res = await fetchWithAuth(`http://localhost:5000/api/drivers/${id}`);
        this.driver = res.data;
        this.driverId = res.data.id;
      } catch (err) {
        console.error('Ошибка загрузки водителя:', err);
        this.driver = null;
      }
    },
    async updateDriver() {
      try {
        await fetchWithAuth(`http://localhost:5000/api/drivers/${this.driver.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.driver)
        });
        alert('Данные обновлены!');
      } catch (err) {
        console.error('Ошибка обновления:', err);
        alert('Не удалось обновить данные');
      }
    },
    goToNext() {
      this.fetchDriverData(this.driverId + 1);
    },
    goToPrevious() {
      if (this.driverId > 1) this.fetchDriverData(this.driverId - 1);
    },
    goBack() {
      this.$router.go(-1);
    },
    toggleAddForm() {
      this.showAddForm = !this.showAddForm;
      if (this.showAddForm) {
        this.prepareNewDriver();
      }
    },
    async prepareNewDriver() {
      try {
        const res = await fetchWithAuth('http://localhost:5000/api/count/drivers');
        const maxId = Number(res.data.maxId);
        this.newDriver = {
          id: maxId,
          last_name: '',
          first_name: '',
          middle_name: '',
          phone_number: '',
        };
      } catch (err) {
        console.error('Ошибка при получении количества записей:', err);
      }
    },
    async addNewDriver() {
      try {
        await fetchWithAuth('http://localhost:5000/api/drivers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.newDriver)
        });
        alert('Водитель добавлен!');
        this.showAddForm = false;
      } catch (err) {
        console.error('Ошибка при добавлении водителя:', err);
        alert('Не удалось добавить водителя');
      }
    },
  },
};
</script>

<style scoped>
.driver-page {
  padding: 20px;
  max-width: 600px;
  /* Ограничиваем максимальную ширину страницы */
  margin: 0 auto;
  /* Центрируем содержимое */
  box-sizing: border-box;
  overflow-x: hidden;
  width: 100%;
}

.driver-details {
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

/* Общие стили для всех кнопок */
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

/* Специальные стили для разных типов кнопок */
button[type="submit"],
button:not([type]) {
  background-color: #4CAF50;
}

button:not([type]):hover {
  background-color: #45a049;
}

.navigation-buttons {
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  width: 100%;
  /* Задаем полную ширину */
  padding: 0 20px;
  /* Добавляем отступы по бокам */
  box-sizing: border-box;
}

.buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  width: 100%;
  /* Задаем полную ширину */
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

/* Стили для кнопки "Назад" */
button[type="button"]:last-child {
  background-color: #f44336;
}

button[type="button"]:last-child:hover {
  background-color: #da190b;
}

/* Стили для кнопки "Сохранить" */
button[type="submit"],
button[type="button"]:first-child {
  background-color: #2196F3;
}

button[type="submit"]:hover,
button[type="button"]:first-child:hover {
  background-color: #0b7dda;
}

h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.driver-page {
  padding: 20px;
  max-width: 600px;
  /* Ограничиваем максимальную ширину страницы */
  margin: 0 auto;
  /* Центрируем содержимое */
}

.driver-details {
  background-color: #ffffff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navigation-buttons {
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  width: 100%;
  /* Задаем полную ширину */
  padding: 0 20px;
  /* Добавляем отступы по бокам */
}

.buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  width: 100%;
  /* Задаем полную ширину */
}

.add-form {
  margin-top: 20px;
  background-color: #f9f9f9;
}

/* Медиа-запросы для мобильных устройств */
@media (max-width: 768px) {
  .driver-page {
    padding: 10px;
  }
  
  .driver-details {
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