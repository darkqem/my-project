<template>
  <div>
    <!-- === Текущий автомобиль === -->
    <div v-if="car" class="car-details">
      <h2>Информация об автомобиле</h2>
      <div class="form-group">
        <label>ID автомобиля:</label>
        <input type="text" v-model="car.id" disabled />
      </div>
      <div class="form-group">
        <label>ID водителя:</label>
        <input type="number" v-model="car.driver_id" />
      </div>
      <div class="form-group">
        <label>ФИО водителя:</label>
        <input type="text" :value="getDriverFio(car.driver_id)" disabled />
      </div>
      <div class="form-group">
        <label>Гос. номер:</label>
        <input type="text" v-model="car.car_number" />
      </div>
      <div class="form-group">
        <label>Количество мест:</label>
        <input type="number" v-model="car.seats_count" />
      </div>
      <div class="buttons">
        <button @click="updateCar">Сохранить</button>
        <button @click="deleteCar" type="button">Удалить</button>
      </div>
    </div>
    <div v-else>
      <p>Загрузка...</p>
    </div>
    <!-- === Навигация === -->
    <div class="navigation-buttons">
      <button :disabled="carId <= 1" @click="goToPrevious">Предыдущий</button>
      <button @click="goToNext">Следующий</button>
      <button @click="toggleAddForm">{{ showAddForm ? 'Скрыть форму' : 'Добавить новый' }}</button>
    </div>
    <!-- === Добавление нового автомобиля === -->
    <div v-if="showAddForm" class="car-details add-form">
      <h2>Добавить новый автомобиль</h2>
      <div class="form-group">
        <label>ID (авто):</label>
        <input type="text" v-model="newCar.id" disabled />
      </div>
      <div class="form-group">
        <label>ID водителя:</label>
        <input type="number" v-model="newCar.driver_id" />
      </div>
      <div class="form-group">
        <label>ФИО водителя:</label>
        <input type="text" :value="getDriverFio(newCar.driver_id)" disabled />
      </div>
      <div class="form-group">
        <label>Гос. номер:</label>
        <input type="text" v-model="newCar.car_number" />
      </div>
      <div class="form-group">
        <label>Количество мест:</label>
        <input type="number" v-model="newCar.seats_count" />
      </div>
      <div class="buttons">
        <button @click="addNewCar">Сохранить</button>
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
    document.title = 'Автомобили';
  },
  data() {
    return {
      carId: 1,
      car: null,
      showAddForm: false,
      drivers: [],
      newCar: {
        id: null,
        driver_id: '',
        car_number: '',
        seats_count: '',
      },
    };
  },
  async created() {
    await this.fetchDrivers();
    this.fetchCarData(this.carId);
  },
  methods: {
    async fetchDrivers() {
      try {
        const res = await fetchWithAuth('http://localhost:5000/api/drivers');
        this.drivers = res.data;
      } catch (err) {
        console.error('Ошибка загрузки водителей:', err);
        this.drivers = [];
      }
    },
    getDriverFio(driverId) {
      const driver = this.drivers.find(d => d.id === driverId);
      if (!driver) return 'Водитель не найден';
      return `${driver.last_name} ${driver.first_name} ${driver.middle_name}`;
    },
    async deleteCar() {
      if (confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
        try {
          await fetchWithAuth(`http://localhost:5000/api/cars/${this.car.id}`, { method: 'DELETE' });
          alert('Автомобиль удалён!');
          this.goToNext();
        } catch (err) {
          console.error('Ошибка удаления:', err);
          alert('Не удалось удалить автомобиль');
        }
      }
    },
    async fetchCarData(id) {
      try {
        const res = await fetchWithAuth(`http://localhost:5000/api/cars/${id}`);
        this.car = res.data;
        this.carId = res.data.id;
      } catch (err) {
        console.error('Ошибка загрузки автомобиля:', err);
        this.car = null;
      }
    },
    async updateCar() {
      try {
        await fetchWithAuth(`http://localhost:5000/api/cars/${this.car.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.car)
        });
        alert('Данные обновлены!');
      } catch (err) {
        console.error('Ошибка обновления:', err);
        alert('Не удалось обновить данные');
      }
    },
    goToNext() {
      this.fetchCarData(this.carId + 1);
    },
    goToPrevious() {
      if (this.carId > 1) this.fetchCarData(this.carId - 1);
    },
    toggleAddForm() {
      this.showAddForm = !this.showAddForm;
      if (this.showAddForm) {
        this.prepareNewCar();
      }
    },
    async prepareNewCar() {
      try {
        const res = await fetchWithAuth('http://localhost:5000/api/count/cars');
        const maxId = Number(res.data.maxId);
        this.newCar = {
          id: maxId,
          driver_id: '',
          car_number: '',
          seats_count: '',
        };
      } catch (err) {
        console.error('Ошибка при получении количества записей:', err);
      }
    },
    async addNewCar() {
      try {
        await fetchWithAuth('http://localhost:5000/api/cars', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.newCar)
        });
        alert('Автомобиль добавлен!');
        this.showAddForm = false;
      } catch (err) {
        console.error('Ошибка при добавлении автомобиля:', err);
        alert('Не удалось добавить автомобиль');
      }
    },
  },
};
</script>

<style scoped>
.car-details {
  background-color: #ffffff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.form-group {
  margin-bottom: 15px;
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
}
.buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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
</style> 