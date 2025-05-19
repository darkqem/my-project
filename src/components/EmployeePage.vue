<template>
    <div>

        <div v-if="employee" class="employee-details">
            <h2>Информация о сотруднике</h2>
            <div class="form-group">
                <label>Код сотрудника:</label>
                <input type="text" v-model="employee.id" disabled />
            </div>
            <div class="form-group">
                <label>Фамилия:</label>
                <input v-model="employee.last_name" type="text">
            </div>
            <div class="form-group">
                <label>Имя:</label>
                <input v-model="employee.first_name" type="text">
            </div>
            <div class="form-group">
                <label>Отчество:</label>
                <input v-model="employee.middle_name" type="text">
            </div>
            <div class="form-group">
                <label>Дата рождения:</label>
                <input v-model="formattedBirthDate" type="date">
            </div>
            <div class="form-group">
                <label>Телефон:</label>
                <input v-model="employee.phone_number" type="tel">
            </div>
            <div class="form-group">
                <label>Дата начала работы:</label>
                <input v-model="formattedStartDate" type="date">
            </div>
            <div class="form-group">
                <label>Должность:</label>
                <input v-model="employee.position" type="text">
            </div>
            <div class="buttons">
                <button @click="updateEmployee">Сохранить</button>
                <button @click="deleteEmployee" type="button">Удалить</button>
            </div>
        </div>

        <div v-else>
            <p>Загрузка...</p>
        </div>

        <div class="navigation-buttons">
            <button :disabled="employeeId <= 1" @click="goToPrevious">Предыдущий</button>
            <button @click="goToNext">Следующий</button>
            <button @click="toggleAddForm">{{ showAddForm ? 'Скрыть форму' : 'Добавить нового' }}</button>
        </div>

        <div v-if="showAddForm" class="employee-details add-form">
            <h2>Добавить нового сотрудника</h2>
            <div class="form-group">
                <label>ID (авто):</label>
                <input type="text" v-model="newEmployee.id" disabled />
            </div>
            <div class="form-group">
                <label>Фамилия:</label>
                <input v-model="newEmployee.last_name" type="text">
            </div>
            <div class="form-group">
                <label>Имя:</label>
                <input v-model="newEmployee.first_name" type="text">
            </div>
            <div class="form-group">
                <label>Отчество:</label>
                <input v-model="newEmployee.middle_name" type="text">
            </div>
            <div class="form-group">
                <label>Дата рождения:</label>
                <input v-model="newEmployee.birth_date" type="date">
            </div>
            <div class="form-group">
                <label>Телефон:</label>
                <input v-model="newEmployee.phone_number" type="tel">
            </div>
            <div class="form-group">
                <label>Дата начала работы:</label>
                <input v-model="newEmployee.start_date" type="date">
            </div>
            <div class="form-group">
                <label>Должность:</label>
                <input v-model="newEmployee.position" type="text">
            </div>

            <div class="buttons">
                <button @click="addNewEmployee">Сохранить</button>
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
        document.title = 'Сотрудники'
    },
    data() {
        return {
            employeeId: 1,
            employee: null,
            showAddForm: false,
            newEmployee: {
                id: null,
                last_name: '',
                first_name: '',
                middle_name: '',
                birth_date: '',
                phone_number: '',
                start_date: '',
                position: '',
                company_id: 1  // Добавляем это поле
            }
        };
    },
    computed: {
        formattedBirthDate: {
            get() {
                if (!this.employee || !this.employee.birth_date) return '';
                return this.formatDateForInput(this.employee.birth_date);
            },
            set(value) {
                if (this.employee) {
                    this.employee.birth_date = value ? new Date(value).toISOString() : null;
                }
            }
        },
        formattedStartDate: {
            get() {
                if (!this.employee || !this.employee.start_date) return '';
                return this.formatDateForInput(this.employee.start_date);
            },
            set(value) {
                if (this.employee) {
                    this.employee.start_date = value ? new Date(value).toISOString() : null;
                }
            }
        }
    },
    created() {
        this.fetchEmployeeData(this.employeeId);
    },
    methods: {
        async deleteEmployee() {
            if (confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
                try {
                    await fetchWithAuth(`http://localhost:5000/api/employees/${this.employee.id}`, { method: 'DELETE' });
                    alert('Сотрудник удален!');
                    this.goToNext(); // Переходим к следующей записи после удаления
                } catch (err) {
                    console.error('Ошибка удаления:', err);
                    alert('Не удалось удалить сотрудника');
                }
            }
        },
        formatDateForInput(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        },
        async fetchEmployeeData(id) {
            try {
                const res = await fetchWithAuth(`http://localhost:5000/api/employees/${id}`);
                this.employee = res.data;
                this.employeeId = res.data.id;
            } catch (err) {
                console.error('Ошибка загрузки сотрудника:', err);
                this.employee = null;
            }
        },
        async updateEmployee() {
            try {
                await fetchWithAuth(`http://localhost:5000/api/employees/${this.employee.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.employee)
                });
                alert('Данные обновлены!');
            } catch (err) {
                console.error('Ошибка обновления:', err);
                alert('Не удалось обновить данные');
            }
        },
        goToNext() {
            this.fetchEmployeeData(this.employeeId + 1);
        },
        goToPrevious() {
            if (this.employeeId > 1) this.fetchEmployeeData(this.employeeId - 1);
        },
        goBack() {
            this.$router.go(-1);
        },
        toggleAddForm() {
            this.showAddForm = !this.showAddForm;
            if (this.showAddForm) {
                this.prepareNewEmployee();
            }
        },
        async prepareNewEmployee() {
            try {
                const res = await fetchWithAuth('http://localhost:5000/api/count/employees');
                const maxId = Number(res.data.maxId);
                this.newEmployee = {
                    id: maxId,
                    last_name: '',
                    first_name: '',
                    middle_name: '',
                    birth_date: '',
                    phone_number: '',
                    start_date: '',
                    position: '',
                };
            } catch (err) {
                console.error('Ошибка при получении количества записей:', err);
            }
        },
        async addNewEmployee() {
            try {
                await fetchWithAuth('http://localhost:5000/api/employees', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.newEmployee)
                });
                alert('Сотрудник добавлен!');
                this.showAddForm = false;
                // Обновляем список после добавления
                this.fetchEmployeeData(this.employeeId);
            } catch (err) {
                console.error('Ошибка при добавлении сотрудника:', err);
                alert('Не удалось добавить сотрудника');
            }
        },
    },
};
</script>

<style scoped>
.employee-page {
    padding: 20px;
}

.employee-details {
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

.employee-page {
    padding: 20px;
    max-width: 600px;
    /* Ограничиваем максимальную ширину страницы */
    margin: 0 auto;
    /* Центрируем содержимое */
}

.employee-details {
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
</style>