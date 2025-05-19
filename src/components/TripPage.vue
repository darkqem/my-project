<template>
    <div>
        <!-- === Информация о поездке === -->
        <div v-if="trip" class="driver-details">
            <h2>Информация о поездке</h2>
            <div class="form-group">
                <label>Код поездки:</label>
                <input type="text" v-model="trip.id" disabled />
            </div>
            <div class="form-group">
                <label>Статус поездки:</label>
                <select v-model="trip.trip_status">
                    <option value="Завершена">Завершена</option>
                    <option value="В процессе">В процессе</option>
                    <option value="Отменена">Отменена</option>
                    <option value="Запланирована">Запланирована</option>
                </select>
            </div>

            <div class="form-group">
                <label>Точка отправления:</label>
                <input type="text" v-model="trip.departure_point" />
            </div>
            <div class="form-group">
                <label>Точка прибытия:</label>
                <input type="text" v-model="trip.arrival_point" />
            </div>
            <div class="form-group">
                <label>Дата и время начала:</label>
                <input type="datetime-local" v-model="formattedStartDateTime" />
            </div>
            <div class="form-group">
                <label>Дата и время окончания:</label>
                <input type="datetime-local" v-model="formattedEndDateTime" />
            </div>
            <div class="form-group">
                <label>Стоимость поездки (руб.):</label>
                <input type="number" v-model="trip.trip_cost" step="0.01" />
            </div>
            <div class="form-group">
                <label>ID сотрудника:</label>
                <input type="number" v-model="trip.employee_id" />
            </div>
            <div class="form-group">
                <label>Сотрудник:</label>
                <select v-model="trip.employee_id">
                    <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                        {{ formatEmployeeName(employee) }}
                    </option>
                </select>
            </div>
            <div class="form-group">
                <label>ID водителя:</label>
                <input type="number" v-model="trip.driver_id" />
            </div>
            <div class="form-group">
                <label>Водитель:</label>
                <select v-model="trip.driver_id">
                    <option v-for="driver in drivers" :key="driver.id" :value="driver.id">
                        {{ `${driver.last_name} ${driver.first_name} ${driver.middle_name}` }}
                    </option>
                </select>
            </div>
            <div class="form-group">
                <label>Комиссия (руб.):</label>
                <input type="number" v-model="trip.commission" step="0.01" />
            </div>
            <div class="form-group">
                <label>Дата сбора комиссии:</label>
                <input type="datetime-local" v-model="formattedCommissionDate" />
            </div>
            <div class="form-group">
                <label>ID автомобиля:</label>
                <input type="number" v-model="trip.car_id" />
            </div>
            <div class="form-group">
                <label>Автомобиль:</label>
                <select v-model="trip.car_id">
                    <option value="">Выберите автомобиль</option>
                    <option v-for="car in filteredCars" :key="car.id" :value="car.id">
                        {{ car.car_number }} ({{ getDriverFio(car.driver_id) }})
                    </option>
                </select>
            </div>
            <div class="form-group">
                <label>Количество мест:</label>
                <input type="number" :value="getCarSeats(trip.car_id)" disabled />
            </div>

            <div class="passengers-section">
                <h3>Пассажиры в поездке</h3>
                <div v-if="tripPassengers.length > 0" class="passengers-list">
                    <table>
                        <thead>
                            <tr>
                                <th>ID пассажира</th>
                                <th>ФИО</th>
                                <th>Телефон</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="passengerId in tripPassengers" :key="passengerId">
                                <td>{{ passengerId }}</td>
                                <td>{{ getPassengerName(passengerId) }}</td>
                                <td>{{ getPassengerPhone(passengerId) }}</td>
                                <td>
                                    <button @click="removePassengerFromTrip(passengerId)"
                                        class="remove-btn">Удалить</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="no-passengers">
                    <p>Нет пассажиров в этой поездке</p>
                </div>

                <!-- Добавление пассажира в поездку -->
                <div class="add-passenger">
                    <h4>Добавить пассажира</h4>
                    <div class="form-group">
                        <select v-model="selectedPassengerId">
                            <option value="">Выберите пассажира</option>
                            <option v-for="passenger in allPassengers" :key="passenger.id" :value="passenger.id">
                                {{ passenger.full_name }} (ID: {{ passenger.id }})
                            </option>
                        </select>
                    </div>
                    <button @click="addPassengerToTrip" :disabled="!selectedPassengerId || (cars.find(c => c.id === trip.car_id) && tripPassengers.length >= getCarSeats(trip.car_id))">Добавить</button>
                </div>

                <div v-if="cars.find(c => c.id === trip.car_id) && tripPassengers.length >= getCarSeats(trip.car_id)" style="color: red; margin-top: 5px;">
                    Достигнуто максимальное количество пассажиров для выбранной машины
                </div>
            </div>


            <div class="buttons">
                <button @click="updateTrip">Сохранить</button>
                <button @click="deleteTrip" type="button">Удалить</button>
            </div>
        </div>

        <div v-else>
            <p>Загрузка...</p>
        </div>

        <!-- Кнопки навигации внизу -->
        <div class="navigation-buttons">
            <button :disabled="tripId <= 1" @click="goToPrevious">Предыдущий</button>
            <button @click="goToNext">Следующий</button>
            <button @click="toggleAddForm">{{ showAddForm ? 'Скрыть форму' : 'Добавить новую' }}</button>
        </div>

        <!-- Add New Trip Form -->
        <div v-if="showAddForm" class="driver-details add-form">
            <h2>Добавить новую поездку</h2>
            <div class="form-group">
                <label>ID (авто):</label>
                <input type="text" v-model="newTrip.id" disabled />
            </div>
            <div class="form-group">
                <label>Статус поездки:</label>
                <select v-model="newTrip.trip_status">
                    <option value="Запланирована">Запланирована</option>
                    <option value="В процессе">В процессе</option>
                    <option value="Завершена">Завершена</option>
                    <option value="Отменена">Отменена</option>
                </select>
            </div>

            <div class="form-group">
                <label>Точка отправления:</label>
                <input type="text" v-model="newTrip.departure_point" />
            </div>
            <div class="form-group">
                <label>Точка прибытия:</label>
                <input type="text" v-model="newTrip.arrival_point" />
            </div>
            <div class="form-group">
                <label>Дата и время начала:</label>
                <input type="datetime-local" v-model="newTrip.start_datetime" />
            </div>
            <div class="form-group">
                <label>Дата и время окончания:</label>
                <input type="datetime-local" v-model="newTrip.end_datetime" />
            </div>
            <div class="form-group">
                <label>Стоимость поездки (руб.):</label>
                <input type="number" v-model="newTrip.trip_cost" step="0.01" />
            </div>
            <div class="form-group">
                <label>ID сотрудника:</label>
                <input type="number" v-model="newTrip.employee_id" />
            </div>
            <div class="form-group">
                <label>Сотрудник:</label>
                <select v-model="newTrip.employee_id">
                    <option value="">Выберите сотрудника</option>
                    <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                        {{ formatEmployeeName(employee) }} (ID: {{ employee.id }})
                    </option>
                </select>
            </div>
            <div class="form-group">
                <label>ID водителя:</label>
                <input type="number" v-model="newTrip.driver_id" />
            </div>
            <div class="form-group">
                <label>Водитель:</label>
                <select v-model="newTrip.driver_id">
                    <option value="">Выберите водителя</option>
                    <option v-for="driver in drivers" :key="driver.id" :value="driver.id">
                        {{ `${driver.last_name} ${driver.first_name} ${driver.middle_name}` }} (ID: {{ driver.id }})
                    </option>
                </select>
            </div>
            <div class="form-group">
                <label>Комиссия (руб.):</label>
                <input type="number" v-model="newTrip.commission" step="0.01" />
            </div>
            <div class="form-group">
                <label>Дата сбора комиссии:</label>
                <input type="datetime-local" v-model="newTrip.commission_collection_date" />
            </div>
            <div class="form-group">
                <label>ID автомобиля:</label>
                <input type="number" v-model="newTrip.car_id" />
            </div>
            <div class="form-group">
                <label>Автомобиль:</label>
                <select v-model="newTrip.car_id">
                    <option value="">Выберите автомобиль</option>
                    <option v-for="car in filteredNewCars" :key="car.id" :value="car.id">
                        {{ car.car_number }} ({{ getDriverFio(car.driver_id) }})
                    </option>
                </select>
            </div>
            <div class="form-group">
                <label>Количество мест:</label>
                <input type="number" :value="getCarSeats(newTrip.car_id)" disabled />
            </div>

            <div class="passengers-section">
                <h3>Добавить пассажиров в новую поездку</h3>
                <div v-if="newTripPassengers.length > 0" class="passengers-list">
                    <table>
                        <thead>
                            <tr>
                                <th>ID пассажира</th>
                                <th>ФИО</th>
                                <th>Телефон</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="passengerId in newTripPassengers" :key="passengerId">
                                <td>{{ passengerId }}</td>
                                <td>{{ getPassengerName(passengerId) }}</td>
                                <td>{{ getPassengerPhone(passengerId) }}</td>
                                <td>
                                    <button @click="removePassengerFromNewTrip(passengerId)"
                                        class="remove-btn">Удалить</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="no-passengers">
                    <p>Пассажиры не добавлены</p>
                </div>

                <!-- Форма добавления пассажира -->
                <div class="add-passenger">
                    <h4>Добавить пассажира</h4>
                    <div class="form-group">
                        <select v-model="newSelectedPassengerId">
                            <option value="">Выберите пассажира</option>
                            <option v-for="passenger in allPassengers" :key="passenger.id" :value="passenger.id">
                                {{ passenger.full_name }} (ID: {{ passenger.id }})
                            </option>
                        </select>
                    </div>
                    <button @click="addPassengerToNewTrip" :disabled="!newSelectedPassengerId || (cars.find(c => c.id === newTrip.car_id) && newTripPassengers.length >= getCarSeats(newTrip.car_id))">Добавить</button>
                </div>
            </div>

            <div v-if="cars.find(c => c.id === newTrip.car_id) && newTripPassengers.length >= getCarSeats(newTrip.car_id)" style="color: red; margin-top: 5px;">
                Достигнуто максимальное количество пассажиров для выбранной машины
            </div>

            <div class="buttons">
                <button @click="addNewTrip">Сохранить</button>
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
        document.title = 'Поездки'
    },
    data() {
        return {
            tripId: 1,
            trip: null,
            showAddForm: false,
            drivers: [],
            employees: [],
            cars: [],
            allPassengers: [],
            tripPassengers: [],
            selectedPassengerId: '',
            newTripPassengers: [], // Массив ID пассажиров для новой поездки
            newSelectedPassengerId: '',
            tripsData: {},
            newTrip: {
                id: null,
                trip_status: 'Запланирована',
                departure_point: '',
                arrival_point: '',
                start_datetime: '',
                end_datetime: '',
                trip_cost: '',
                employee_id: '',
                driver_id: '',
                car_id: '',
                commission: '',
                commission_collection_date: '',
                tripPassengers: [],
                allPassengers: [],
                selectedPassengerId: '',
            },
            reportStart: '',
            reportEnd: '',
            reportFormat: 'pdf',
        };
    },

    computed: {
        formattedStartDateTime: {
            get() {
                if (!this.trip || !this.trip.start_datetime) return '';
                return this.formatDateTimeForInput(this.trip.start_datetime);
            },
            set(value) {
                if (this.trip) {
                    this.trip.start_datetime = value ? new Date(value).toISOString() : null;
                }
            }
        },
        formattedEndDateTime: {
            get() {
                if (!this.trip || !this.trip.end_datetime) return '';
                return this.formatDateTimeForInput(this.trip.end_datetime);
            },
            set(value) {
                if (this.trip) {
                    this.trip.end_datetime = value ? new Date(value).toISOString() : null;
                }
            }
        },
        formattedCommissionDate: {
            get() {
                if (!this.trip || !this.trip.commission_collection_date) return '';
                return this.formatDateTimeForInput(this.trip.commission_collection_date);
            },
            set(value) {
                if (this.trip) {
                    this.trip.commission_collection_date = value ? new Date(value).toISOString() : null;
                }
            }
        },
        currentDriverName() {
            if (!this.trip || !this.drivers.length) return '';
            const driver = this.drivers.find(d => d.id === this.trip.driver_id);
            if (!driver) return 'Водитель не найден';
            return `${driver.last_name} ${driver.first_name} ${driver.middle_name}`;
        },
        filteredCars() {
            if (!this.trip || !this.trip.driver_id) return [];
            return this.cars.filter(car => car.driver_id === this.trip.driver_id);
        },
        filteredNewCars() {
            if (!this.newTrip || !this.newTrip.driver_id) return [];
            return this.cars.filter(car => car.driver_id === this.newTrip.driver_id);
        },
    },
    async created() {
        await Promise.all([
            this.fetchDrivers(),
            this.fetchEmployees(),
            this.fetchCars(),
            this.fetchAllPassengers()
        ]);
        await this.fetchTripData(this.tripId);
    },

    methods: {
        formatEmployeeName(employee) {
            if (!employee) return '';
            return `${employee.last_name} ${employee.first_name} ${employee.middle_name}`.trim();
        },
        async fetchEmployees() {
            try {
                const res = await fetchWithAuth('http://localhost:5000/api/employees');
                this.employees = res.data || [];
            } catch (err) {
                console.error('Ошибка загрузки сотрудников:', err);
                this.employees = [];
            }
        },
        async deleteTrip() {
            if (confirm('Вы уверены, что хотите удалить эту поездку?')) {
                try {
                    await fetchWithAuth(`http://localhost:5000/api/trips/${this.trip.id}`, { method: 'DELETE' });
                    alert('Поездка удалена!');
                    this.goToNext(); // Переходим к следующей записи после удаления
                } catch (err) {
                    console.error('Ошибка удаления:', err);
                    alert('Не удалось удалить поездку');
                }
            }
        },
        formatDateTimeForInput(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
        },
        async fetchTripData(id) {
            try {
                if (!this.tripsData[id]) {
                    const res = await fetchWithAuth(`http://localhost:5000/api/trips/${id}`);
                    this.tripsData[id] = res.data;
                }
                this.trip = this.tripsData[id];
                this.tripId = id;
                if (this.drivers.length === 0) {
                    await this.fetchDrivers();
                }

                // Загружаем пассажиров для текущей поездки
                await this.fetchTripPassengers(id);
            } catch (err) {
                console.error('Ошибка загрузки поездки:', err);
                this.trip = null;
            }
        },
        async updateTrip() {
            try {
                await fetchWithAuth(`http://localhost:5000/api/trips/${this.trip.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.trip)
                });
                alert('Данные обновлены!');
            } catch (err) {
                console.error('Ошибка обновления:', err);
                alert('Не удалось обновить данные');
            }
        },
        goToNext() {
            this.fetchTripData(this.tripId + 1);
        },
        goToPrevious() {
            if (this.tripId > 1) this.fetchTripData(this.tripId - 1);
        },
        toggleAddForm() {
            this.showAddForm = !this.showAddForm;
            if (this.showAddForm) {
                this.prepareNewTrip();
                // Очищаем список пассажиров для новой поездки
                this.newTripPassengers = [];
                this.newSelectedPassengerId = '';
            }
        },
        async prepareNewTrip() {
            try {
                const res = await fetchWithAuth('http://localhost:5000/api/count/trips');
                const maxId = Number(res.data.maxId);
                this.newTrip = {
                    id: maxId,
                    trip_status: 'Запланирована',
                    departure_point: '',
                    arrival_point: '',
                    start_datetime: '',
                    end_datetime: '',
                    trip_cost: '',
                    employee_id: '',
                    driver_id: '',
                    car_id: '',
                    commission: '',
                    commission_collection_date: ''
                };
            } catch (err) {
                console.error('Ошибка при получении количества записей:', err);
            }
        },
        async addNewTrip() {
            try {
                // Сначала создаем поездку
                const response = await fetchWithAuth('http://localhost:5000/api/trips', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.newTrip)
                });
                const newTripId = response.data.id;

                // Затем добавляем связи с пассажирами
                if (this.newTripPassengers.length > 0) {
                    const promises = this.newTripPassengers.map(passengerId => {
                        return fetchWithAuth('http://localhost:5000/api/trip_passengers', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                id: passengerId,
                                trip_id: newTripId
                            })
                        });
                    });

                    await Promise.all(promises);
                }

                alert('Поездка добавлена!');
                this.showAddForm = false;
                this.fetchTripData(newTripId);
            } catch (err) {
                console.error('Ошибка при добавлении поездки:', err);
                alert('Не удалось добавить поездку');
            }
        },
        async fetchDrivers() {
            try {
                const res = await fetchWithAuth('http://localhost:5000/api/drivers');
                this.drivers = res.data;
            } catch (err) {
                console.error('Ошибка загрузки водителей:', err);
            }
        },
        async fetchCars() {
            try {
                const res = await fetchWithAuth('http://localhost:5000/api/cars');
                this.cars = res.data;
            } catch (err) {
                console.error('Ошибка загрузки автомобилей:', err);
                this.cars = [];
            }
        },
        getDriverFio(driverId) {
            const driver = this.drivers.find(d => d.id === driverId);
            if (!driver) return 'Водитель не найден';
            return `${driver.last_name} ${driver.first_name} ${driver.middle_name}`;
        },
        getCarSeats(carId) {
            const car = this.cars.find(c => c.id === carId);
            return car ? car.seats_count : '';
        },
        async fetchAllPassengers() {
            try {
                const res = await fetchWithAuth('http://localhost:5000/api/passengers');
                this.allPassengers = res.data || [];
            } catch (err) {
                console.error('Ошибка загрузки пассажиров:', err);
                this.allPassengers = [];
            }
        },

        async fetchTripPassengers(tripId) {
            try {
                // Получаем список связей поездка-пассажир из таблицы trip_passengers
                const res = await fetchWithAuth('http://localhost:5000/api/trip_passengers');

                // Фильтруем только тех, кто относится к текущей поездке
                const tripPassengerLinks = res.data.filter(tp => tp.trip_id === tripId);

                // Извлекаем только ID пассажиров
                this.tripPassengers = tripPassengerLinks.map(tp => tp.id);
            } catch (err) {
                console.error('Ошибка загрузки пассажиров поездки:', err);
                this.tripPassengers = [];
            }
        },

        getPassengerName(passengerId) {
            const passenger = this.allPassengers.find(p => p.id === passengerId);
            return passenger ? passenger.full_name : 'Пассажир не найден';
        },

        getPassengerPhone(passengerId) {
            const passenger = this.allPassengers.find(p => p.id === passengerId);
            return passenger ? passenger.phone_number : '-';
        },

        async addPassengerToTrip() {
            if (!this.selectedPassengerId) return;

            // Проверка лимита мест
            const car = this.cars.find(c => c.id === this.trip.car_id);
            if (car && this.tripPassengers.length >= car.seats_count) {
                alert('Нельзя добавить больше пассажиров, чем мест в выбранной машине!');
                return;
            }

            try {
                // Создаем новую связь пассажир-поездка
                const newTripPassenger = {
                    id: Number(this.selectedPassengerId),
                    trip_id: this.tripId
                };

                await fetchWithAuth('http://localhost:5000/api/trip_passengers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newTripPassenger)
                });

                // Обновляем список пассажиров в поездке
                await this.fetchTripPassengers(this.tripId);

                // Сбрасываем выбранного пассажира
                this.selectedPassengerId = '';

                alert('Пассажир добавлен в поездку');
            } catch (err) {
                console.error('Ошибка при добавлении пассажира в поездку:', err);
                alert('Не удалось добавить пассажира в поездку');
            }
        },

        async removePassengerFromTrip(passengerId) {
            try {
                // Ищем нужную запись в таблице trip_passengers
                const res = await fetchWithAuth('http://localhost:5000/api/trip_passengers');
                const tripPassengerRecord = res.data.find(
                    tp => tp.id === passengerId && tp.trip_id === this.tripId
                );

                if (!tripPassengerRecord) {
                    console.error('Запись о пассажире в поездке не найдена');
                    return;
                }

                // Удаляем связь пассажир-поездка
                await fetchWithAuth(`http://localhost:5000/api/trip_passengers/${tripPassengerRecord.id}`, { method: 'DELETE' });

                // Обновляем список пассажиров в поездке
                await this.fetchTripPassengers(this.tripId);

                alert('Пассажир удален из поездки');
            } catch (err) {
                console.error('Ошибка при удалении пассажира из поездки:', err);
                alert('Не удалось удалить пассажира из поездки');
            }
        },

        // Добавление пассажира в новую поездку
        addPassengerToNewTrip() {
            if (!this.newSelectedPassengerId) return;

            const passengerId = Number(this.newSelectedPassengerId);

            // Проверяем, не добавлен ли пассажир уже
            if (this.newTripPassengers.includes(passengerId)) {
                alert('Этот пассажир уже добавлен в поездку');
                return;
            }

            // Проверка лимита мест
            const car = this.cars.find(c => c.id === this.newTrip.car_id);
            if (car && this.newTripPassengers.length >= car.seats_count) {
                alert('Нельзя добавить больше пассажиров, чем мест в выбранной машине!');
                return;
            }

            // Добавляем пассажира в список
            this.newTripPassengers.push(passengerId);

            // Сбрасываем выбранного пассажира
            this.newSelectedPassengerId = '';
        },

        // Удаление пассажира из новой поездки
        removePassengerFromNewTrip(passengerId) {
            const index = this.newTripPassengers.indexOf(passengerId);
            if (index !== -1) {
                this.newTripPassengers.splice(index, 1);
            }
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
            const response = await fetchWithAuth(`http://localhost:5000/api/reports/trips?${params.toString()}`);
            if (!response.ok) {
                alert('Ошибка при формировании отчёта');
                return;
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this.reportFormat === 'pdf' ? 'trips_report.pdf' : 'trips_report.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        },
    }
};

</script>

<style scoped>
.driver-page {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
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

.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
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

h3 {
  color: #333;
  margin: 20px 0 15px;
  font-size: 1.2em;
}

h4 {
  color: #555;
  margin: 15px 0 10px;
  font-size: 1.1em;
}

/* Стили для секции пассажиров */
.passengers-section {
  margin-top: 25px;
  border-top: 1px solid #eee;
  padding-top: 15px;
  width: 100%;
  box-sizing: border-box;
}

.passengers-list {
  margin-bottom: 20px;
  max-width: 100%;
  overflow-x: auto;
}

.passengers-list table {
  width: 100%;
  border-collapse: collapse;
  min-width: 100%;
}

.passengers-list th,
.passengers-list td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.passengers-list th {
  background-color: #f5f5f5;
  font-weight: 500;
}

.no-passengers {
  font-style: italic;
  color: #888;
  margin: 10px 0;
}

.add-passenger {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
}

.remove-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.remove-btn:hover {
  background-color: #d32f2f;
}

.report-form {
  width: 100%;
  margin-top: 20px;
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
  .driver-page {
    padding: 10px;
  }
  
  .driver-details {
    padding: 15px;
  }
  
  .form-group label {
    font-size: 14px;
  }
  
  .report-form {
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
  
  .passengers-list th,
  .passengers-list td {
    padding: 6px;
    font-size: 14px;
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