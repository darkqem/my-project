<template>
  <div>
    <!-- === Текущий клиент === -->
    <div v-if="client" class="client-details">
      <h2>Информация о клиенте</h2>
      <div class="form-group">
        <label>ID клиента:</label>
        <input type="text" v-model="client.id" disabled />
      </div>
      <div class="form-group">
        <label>ФИО:</label>
        <input type="text" v-model="client.full_name" />
      </div>
      <div class="form-group">
        <label>Телефон:</label>
        <input type="tel" v-model="client.phone_number" />
      </div>
      <div class="buttons">
        <button @click="updateClient">Сохранить</button>
        <button @click="deleteClient" type="button">Удалить</button>
      </div>
    </div>
    <div v-else>
      <p>Загрузка...</p>
    </div>
    <!-- === Навигация === -->
    <div class="navigation-buttons">
      <button :disabled="clientId <= 1" @click="goToPrevious">Предыдущий</button>
      <button @click="goToNext">Следующий</button>
      <button @click="toggleAddForm">{{ showAddForm ? 'Скрыть форму' : 'Добавить нового' }}</button>
    </div>
    <!-- === Добавление нового клиента === -->
    <div v-if="showAddForm" class="client-details add-form">
      <h2>Добавить нового клиента</h2>
      <div class="form-group">
        <label>ID (авто):</label>
        <input type="text" v-model="newClient.id" disabled />
      </div>
      <div class="form-group">
        <label>ФИО:</label>
        <input type="text" v-model="newClient.full_name" />
      </div>
      <div class="form-group">
        <label>Телефон:</label>
        <input type="tel" v-model="newClient.phone_number" />
      </div>
      <div class="buttons">
        <button @click="addNewClient">Сохранить</button>
        <button @click="toggleAddForm">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchWithAuth } from '@/api.js';
import '@/assets/styles/index.css';

export default {
  mounted() {
    document.title = 'Клиенты';
  },
  data() {
    return {
      clientId: 1,
      client: null,
      showAddForm: false,
      newClient: {
        id: null,
        full_name: '',
        phone_number: '',
      },
    };
  },
  created() {
    this.fetchClientData(this.clientId);
  },
  methods: {
    async deleteClient() {
      if (confirm('Вы уверены, что хотите удалить этого клиента?')) {
        try {
          await fetchWithAuth(`http://localhost:5000/api/clients/${this.client.id}`, { method: 'DELETE' });
          alert('Клиент удалён!');
          this.goToNext();
        } catch (err) {
          console.error('Ошибка удаления:', err);
          alert('Не удалось удалить клиента');
        }
      }
    },
    async fetchClientData(id) {
      try {
        const res = await fetchWithAuth(`http://localhost:5000/api/clients/${id}`);
        this.client = res.data;
        this.clientId = res.data.id;
      } catch (err) {
        console.error('Ошибка загрузки клиента:', err);
        this.client = null;
      }
    },
    async updateClient() {
      try {
        await fetchWithAuth(`http://localhost:5000/api/clients/${this.client.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.client),
        });
        alert('Данные обновлены!');
      } catch (err) {
        console.error('Ошибка обновления:', err);
        alert('Не удалось обновить данные');
      }
    },
    goToNext() {
      this.fetchClientData(this.clientId + 1);
    },
    goToPrevious() {
      if (this.clientId > 1) this.fetchClientData(this.clientId - 1);
    },
    toggleAddForm() {
      this.showAddForm = !this.showAddForm;
      if (this.showAddForm) {
        this.prepareNewClient();
      }
    },
    async prepareNewClient() {
      try {
        const res = await fetchWithAuth('http://localhost:5000/api/count/clients');
        const maxId = Number(res.data.maxId);
        this.newClient = {
          id: maxId,
          full_name: '',
          phone_number: '',
        };
      } catch (err) {
        console.error('Ошибка при получении количества записей:', err);
      }
    },
    async addNewClient() {
      try {
        await fetchWithAuth('http://localhost:5000/api/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.newClient),
        });
        alert('Клиент добавлен!');
        this.showAddForm = false;
      } catch (err) {
        console.error('Ошибка при добавлении клиента:', err);
        alert('Не удалось добавить клиента');
      }
    },
  },
};
</script>

<style scoped>
/* Компонент-специфические стили */
</style> 