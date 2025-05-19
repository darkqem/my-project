<template>
    <div class="passenger-page">

        <div v-if="passenger" class="passenger-details">
            <h2>Информация о пассажире</h2>
            <div class="form-group">
                <label>Код пассажира:</label>
                <input type="text" v-model="passenger.id" disabled />
            </div>
            <div class="form-group">
                <label>Фамилия:</label>
                <input type="text" v-model="lastName" />
            </div>
            <div class="form-group">
                <label>Имя:</label>
                <input type="text" v-model="firstName" />
            </div>
            <div class="form-group">
                <label>Отчество:</label>
                <input type="text" v-model="middleName" />
            </div>
            <div class="form-group">
                <label>Телефон:</label>
                <input type="tel" v-model="passenger.phone_number" />
            </div>
            <div class="buttons">
                <button @click="updatePassenger">Сохранить</button>
                <button @click="deletePassenger" type="button">Удалить</button>
            </div>
        </div>

        <div v-else>
            <p>Загрузка...</p>
        </div>

        <!-- Навигация -->
        <div class="navigation-buttons">
            <button :disabled="passengerId <= 1" @click="goToPrevious">Предыдущий</button>
            <button @click="goToNext">Следующий</button>
            <button @click="toggleAddForm">{{ showAddForm ? 'Скрыть форму' : 'Добавить нового' }}</button>

        </div>

        <!-- Форма добавления -->
        <div v-if="showAddForm" class="passenger-details add-form">
            <h2>Добавить нового пассажира</h2>
            <div class="form-group">
                <label>ID (авто):</label>
                <input type="text" v-model="newPassenger.id" disabled />
            </div>
            <div class="form-group">
                <label>Фамилия:</label>
                <input type="text" v-model="newLastName" />
            </div>
            <div class="form-group">
                <label>Имя:</label>
                <input type="text" v-model="newFirstName" />
            </div>
            <div class="form-group">
                <label>Отчество:</label>
                <input type="text" v-model="newMiddleName" />
            </div>
            <div class="form-group">
                <label>Телефон:</label>
                <input type="tel" v-model="newPassenger.phone_number" />
            </div>
            <div class="buttons">
                <button @click="addNewPassenger">Сохранить</button>
                <button @click="toggleAddForm">Отмена</button>
            </div>
        </div>
    </div>
</template>

<script>
import { fetchWithAuth } from '@/api.js';

export default {
    mounted() {
        document.title = 'Пассажиры'
    },
    data() {
        return {
            passengerId: 1,
            passenger: null,
            showAddForm: false,
            lastName: '',
            firstName: '',
            middleName: '',
            newLastName: '',
            newFirstName: '',
            newMiddleName: '',
            newPassenger: {
                id: null,
                full_name: '',
                phone_number: ''
            }
        };
    },
    created() {
        this.fetchPassengerData(this.passengerId);
    },
    methods: {
        async deletePassenger() {
            if (confirm('Вы уверены, что хотите удалить этого пассажира?')) {
                try {
                    await fetchWithAuth(`http://localhost:5000/api/passengers/${this.passenger.id}`, { method: 'DELETE' });
                    alert('Пассажир удален!');
                    this.goToNext(); // Переходим к следующей записи после удаления
                } catch (err) {
                    console.error('Ошибка удаления:', err);
                    alert('Не удалось удалить пассажира');
                }
            }
        },
        splitFullName(fullName) {
            const parts = fullName.split(' ');
            this.lastName = parts[0] || '';
            this.firstName = parts[1] || '';
            this.middleName = parts[2] || '';
        },
        combineFullName(last, first, middle) {
            return [last, first, middle].filter(Boolean).join(' ');
        },
        async fetchPassengerData(id) {
            try {
                const res = await fetchWithAuth(`http://localhost:5000/api/passengers/${id}`);
                this.passenger = res.data;
                this.passengerId = res.data.id;
                this.splitFullName(res.data.full_name);
            } catch (err) {
                console.error('Ошибка загрузки пассажира:', err);
                this.passenger = null;
            }
        },
        async updatePassenger() {
            try {
                const updatedPassenger = {
                    ...this.passenger,
                    full_name: this.combineFullName(this.lastName, this.firstName, this.middleName)
                };
                await fetchWithAuth(`http://localhost:5000/api/passengers/${this.passenger.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedPassenger)
                });
                alert('Данные обновлены!');
            } catch (err) {
                console.error('Ошибка обновления:', err);
                alert('Не удалось обновить данные');
            }
        },
        goToNext() {
            this.fetchPassengerData(this.passengerId + 1);
        },
        goToPrevious() {
            if (this.passengerId > 1) this.fetchPassengerData(this.passengerId - 1);
        },
        goBack() {
            this.$router.go(-1);
        },
        toggleAddForm() {
            this.showAddForm = !this.showAddForm;
            if (this.showAddForm) {
                this.prepareNewPassenger();
            }
        },
        async prepareNewPassenger() {
            try {
                const res = await fetchWithAuth('http://localhost:5000/api/count/passengers');
                const maxId = Number(res.data.maxId);
                this.newPassenger = {
                    id: maxId,
                    full_name: '',
                    phone_number: ''
                };
                this.newLastName = '';
                this.newFirstName = '';
                this.newMiddleName = '';
            } catch (err) {
                console.error('Ошибка при получении количества записей:', err);
            }
        },
        async addNewPassenger() {
            try {
                const newPassengerData = {
                    ...this.newPassenger,
                    full_name: this.combineFullName(this.newLastName, this.newFirstName, this.newMiddleName)
                };
                await fetchWithAuth('http://localhost:5000/api/passengers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newPassengerData)
                });
                alert('Пассажир добавлен!');
                this.showAddForm = false;
                this.fetchPassengerData(this.passengerId);
            } catch (err) {
                console.error('Ошибка при добавлении пассажира:', err);
                alert('Не удалось добавить пассажира');
            }
        }
    }
};
</script>

<style scoped>
.passenger-page {
    max-width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
}

.passenger-details {
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

.navigation-buttons {
    margin-top: 20px;
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    width: 100%;
    padding: 0 20px;
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
    background-color: #f9f9f9;
    box-sizing: border-box;
    max-width: 100%;
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

h1 {
    margin-bottom: 20px;
    color: #333;
    font-size: 1.8em;
}

h2 {
    color: #333;
    margin-bottom: 20px;
    font-size: 1.5em;
}

/* Медиа-запросы для мобильных устройств */
@media (max-width: 768px) {
    .passenger-details {
        padding: 15px;
    }
    
    .form-group label {
        font-size: 14px;
    }
    
    .navigation-buttons {
        padding: 0 10px;
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
    
    h1 {
        font-size: 1.6em;
    }
    
    h2 {
        font-size: 1.3em;
    }
}
</style>