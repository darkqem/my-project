<template>
  <div>
    <!-- === Текущий ремонт === -->
    <div v-if="repair" class="repair-details">
      <h2>Информация о ремонте</h2>
      <div class="form-group">
        <label>ID ремонта:</label>
        <input type="text" v-model="repair.id" disabled />
      </div>
      <div class="form-group">
        <label>ID заявки:</label>
        <input type="number" :value="repair.request_id" disabled />
      </div>
      <div class="form-group">
        <label>Клиент (ФИО):</label>
        <select v-model="repair.request_id">
          <option value="">Выберите клиента</option>
          <option v-for="client in clients" :key="client.id" :value="client.id">
            {{ client.full_name }} (ID: {{ client.id }})
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>ID механика:</label>
        <input type="number" :value="repair.mechanic_id" disabled />
      </div>
      <div class="form-group">
        <label>Механик (ФИО):</label>
        <select v-model="repair.mechanic_id">
          <option value="">Выберите механика</option>
          <option v-for="mechanic in mechanics" :key="mechanic.id" :value="mechanic.id">
            {{ mechanic.last_name }} {{ mechanic.first_name }} {{ mechanic.middle_name }} (ID: {{ mechanic.id }})
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>Описание работ:</label>
        <input type="text" v-model="repair.work_description" />
      </div>
      <div class="form-group">
        <label>Стоимость ремонта (руб.):</label>
        <input type="number" v-model="repair.repair_cost" step="0.01" />
      </div>
      <div class="form-group">
        <label>Дата начала:</label>
        <input type="datetime-local" v-model="formattedStartDate" />
      </div>
      <div class="form-group">
        <label>Дата окончания:</label>
        <input type="datetime-local" v-model="formattedEndDate" />
      </div>
      <div class="buttons">
        <button @click="updateRepair">Сохранить</button>
        <button @click="deleteRepair" type="button">Удалить</button>
      </div>
    </div>
    <div v-else>
      <p>Загрузка...</p>
    </div>
    <!-- === Навигация === -->
    <div class="navigation-buttons">
      <button :disabled="repairId <= 1" @click="goToPrevious">Предыдущий</button>
      <button @click="goToNext">Следующий</button>
      <button @click="toggleAddForm">{{ showAddForm ? 'Скрыть форму' : 'Добавить новый' }}</button>
    </div>
    <!-- === Добавление нового ремонта === -->
    <div v-if="showAddForm" class="repair-details add-form">
      <h2>Добавить новый ремонт</h2>
      <div class="form-group">
        <label>ID (авто):</label>
        <input type="text" v-model="newRepair.id" disabled />
      </div>
      <div class="form-group">
        <label>ID заявки:</label>
        <input type="number" :value="newRepair.request_id" disabled />
      </div>
      <div class="form-group">
        <label>Клиент (ФИО):</label>
        <select v-model="newRepair.request_id">
          <option value="">Выберите клиента</option>
          <option v-for="client in clients" :key="client.id" :value="client.id">
            {{ client.full_name }} (ID: {{ client.id }})
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>ID механика:</label>
        <input type="number" :value="newRepair.mechanic_id" disabled />
      </div>
      <div class="form-group">
        <label>Механик (ФИО):</label>
        <select v-model="newRepair.mechanic_id">
          <option value="">Выберите механика</option>
          <option v-for="mechanic in mechanics" :key="mechanic.id" :value="mechanic.id">
            {{ mechanic.last_name }} {{ mechanic.first_name }} {{ mechanic.middle_name }} (ID: {{ mechanic.id }})
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>Описание работ:</label>
        <input type="text" v-model="newRepair.work_description" />
      </div>
      <div class="form-group">
        <label>Стоимость ремонта (руб.):</label>
        <input type="number" v-model="newRepair.repair_cost" step="0.01" />
      </div>
      <div class="form-group">
        <label>Дата начала:</label>
        <input type="datetime-local" v-model="newRepair.start_date" />
      </div>
      <div class="form-group">
        <label>Дата окончания:</label>
        <input type="datetime-local" v-model="newRepair.end_date" />
      </div>
      <div class="buttons">
        <button @click="addNewRepair">Сохранить</button>
        <button @click="toggleAddForm">Отмена</button>
      </div>
    </div>
    
    <!-- Форма отчета -->
    <div class="report-form">
      <div class="report-fields">
        <label>Период:</label>
        <input 
          type="text"
          class="date-input"
          v-model="reportStart"
          placeholder="дд.мм.гггг"
        />
        <input 
          type="text"
          class="date-input"
          v-model="reportEnd"
          placeholder="дд.мм.гггг"
        />
        <select class="format-select" v-model="reportFormat">
          <option value="pdf">PDF</option>
          <option value="excel">Excel</option>
        </select>
      </div>
      <button class="report-btn" @click="downloadReport">Сформировать отчёт</button>
    </div>
  </div>
</template>

<script>
import { fetchWithAuth } from '@/api.js';
import '@/assets/styles/buttons.css';

export default {
  mounted() {
    document.title = 'Ремонты';
  },
  data() {
    return {
      repairId: 1,
      repair: null,
      showAddForm: false,
      clients: [],
      mechanics: [],
      newRepair: {
        id: null,
        request_id: '',
        mechanic_id: '',
        work_description: '',
        repair_cost: '',
        start_date: '',
        end_date: '',
      },
      reportStart: '',
      reportEnd: '',
      reportFormat: 'pdf',
    };
  },
  computed: {
    formattedStartDate: {
      get() {
        if (!this.repair || !this.repair.start_date) return '';
        return this.formatDateForInput(this.repair.start_date);
      },
      set(value) {
        if (this.repair) {
          this.repair.start_date = value ? new Date(value).toISOString() : null;
        }
      }
    },
    formattedEndDate: {
      get() {
        if (!this.repair || !this.repair.end_date) return '';
        return this.formatDateForInput(this.repair.end_date);
      },
      set(value) {
        if (this.repair) {
          this.repair.end_date = value ? new Date(value).toISOString() : null;
        }
      }
    }
  },
  async created() {
    await Promise.all([
      this.fetchClients(),
      this.fetchMechanics()
    ]);
    this.fetchRepairData(this.repairId);
  },
  methods: {
    formatDateForInput(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
    },
    async deleteRepair() {
      if (confirm('Вы уверены, что хотите удалить этот ремонт?')) {
        try {
          await fetchWithAuth(`http://localhost:5000/api/repairs/${this.repair.id}`, { method: 'DELETE' });
          alert('Ремонт удалён!');
          this.goToNext();
        } catch (err) {
          console.error('Ошибка удаления:', err);
          alert('Не удалось удалить ремонт');
        }
      }
    },
    async fetchRepairData(id) {
      try {
        const res = await fetchWithAuth(`http://localhost:5000/api/repairs/${id}`);
        this.repair = res.data;
        this.repairId = res.data.id;
      } catch (err) {
        console.error('Ошибка загрузки ремонта:', err);
        this.repair = null;
      }
    },
    async updateRepair() {
      try {
        await fetchWithAuth(`http://localhost:5000/api/repairs/${this.repair.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.repair)
        });
        alert('Данные обновлены!');
      } catch (err) {
        console.error('Ошибка обновления:', err);
        alert('Не удалось обновить данные');
      }
    },
    goToNext() {
      this.fetchRepairData(this.repairId + 1);
    },
    goToPrevious() {
      if (this.repairId > 1) this.fetchRepairData(this.repairId - 1);
    },
    toggleAddForm() {
      this.showAddForm = !this.showAddForm;
      if (this.showAddForm) {
        this.prepareNewRepair();
      }
    },
    async prepareNewRepair() {
      try {
        const res = await fetchWithAuth('http://localhost:5000/api/count/repairs');
        const maxId = Number(res.data.maxId);
        this.newRepair = {
          id: maxId,
          request_id: '',
          mechanic_id: '',
          work_description: '',
          repair_cost: '',
          start_date: '',
          end_date: '',
        };
      } catch (err) {
        console.error('Ошибка при получении количества записей:', err);
      }
    },
    async addNewRepair() {
      try {
        await fetchWithAuth('http://localhost:5000/api/repairs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.newRepair)
        });
        alert('Ремонт добавлен!');
        this.showAddForm = false;
      } catch (err) {
        console.error('Ошибка при добавлении ремонта:', err);
        alert('Не удалось добавить ремонт');
      }
    },
    async fetchClients() {
      try {
        const res = await fetchWithAuth('http://localhost:5000/api/clients');
        this.clients = res.data;
      } catch (err) {
        console.error('Ошибка загрузки клиентов:', err);
        this.clients = [];
      }
    },
    async fetchMechanics() {
      try {
        const res = await fetchWithAuth('http://localhost:5000/api/employees');
        this.mechanics = res.data;
      } catch (err) {
        console.error('Ошибка загрузки механиков:', err);
        this.mechanics = [];
      }
    },
    getClientFio(requestId) {
      const client = this.clients.find(c => c.id === requestId);
      return client ? client.full_name : '';
    },
    getMechanicFio(mechanicId) {
      const mechanic = this.mechanics.find(m => m.id === mechanicId);
      if (!mechanic) return '';
      return `${mechanic.last_name} ${mechanic.first_name} ${mechanic.middle_name}`;
    },
    async downloadReport() {
      if (!this.reportStart || !this.reportEnd) {
        alert('Выберите период!');
        return;
      }
      // Преобразуем дату из дд.мм.гггг в гггг-мм-дд
      const [startDay, startMonth, startYear] = this.reportStart.split('.');
      const [endDay, endMonth, endYear] = this.reportEnd.split('.');
      const startDateISO = `${startYear}-${startMonth}-${startDay}`;
      const endDateISO = `${endYear}-${endMonth}-${endDay}`;
      const params = new URLSearchParams({
        startDate: startDateISO,
        endDate: endDateISO,
        format: this.reportFormat
      });
      const response = await fetchWithAuth(`http://localhost:5000/api/reports/repairs?${params.toString()}`);
      if (!response.ok) {
        alert('Ошибка при формировании отчёта');
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.reportFormat === 'pdf' ? 'repairs_report.pdf' : 'repairs_report.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
  },
};
</script>

<style scoped>
.order-page-flex {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
  overflow-x: hidden;
  width: 100%;
}

.order-details {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow-x: hidden;
  max-width: 100%;
  box-sizing: border-box;
}

.repair-details {
  background-color: #ffffff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: hidden;
  max-width: 100%;
  box-sizing: border-box;
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
.form-group select {
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
.form-group select:focus {
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
.report-form {
  min-width: auto;
  max-width: auto;
  margin-top: auto;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  box-sizing: border-box;
  overflow-x: auto;
}
.report-fields {
  display: flex;
  align-items: center;
  gap: 8px;
}
.report-fields input[type="text"].date-input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
  transition: border-color 0.2s;
  min-width: 120px;
  box-sizing: border-box;
  margin-right: 8px;
}
.report-fields input[type="text"].date-input:focus {
  border-color: #4CAF50;
  outline: none;
}
.format-select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  background: #f5f5f5;
  color: #333;
  transition: border-color 0.2s, box-shadow 0.2s;
  margin-left: 8px;
  min-width: 80px;
}
.format-select:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}
.report-btn {
  margin-left: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.report-btn:hover {
  background-color: #388e3c;
}

/* Медиа-запросы для мобильных устройств */
@media (max-width: 768px) {
  .order-page-flex {
    flex-direction: column;
  }
  
  .order-details, .repair-details {
    max-width: 100%;
    flex: none;
  }
  
  .report-form {
    min-width: 100%;
    max-width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
  
  .report-fields {
    flex-direction: column;
    align-items: stretch;
  }
  
  .report-fields input[type="text"].date-input {
    width: 100%;
    min-width: 100%;
    margin-right: 0;
    margin-bottom: 8px;
  }
  
  .format-select {
    width: 100%;
    margin-left: 0;
    margin-bottom: 8px;
  }
  
  .report-btn {
    margin-left: 0;
    width: 100%;
    margin-top: 8px;
  }
}

@media (max-width: 480px) {
  .form-group input,
  .form-group select {
    font-size: 16px; /* Увеличиваем размер шрифта для лучшей читаемости на мобильных */
  }
  
  button {
    width: 100%;
    margin-bottom: 8px;
  }
  
  .buttons, .navigation-buttons {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }
}
</style> 