const express = require('express');
const { Pool } = require('pg'); // Для подключения к PostgreSQL
const cors = require('cors');
const { Parser } = require('json2csv');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // если будете хранить пароли в хэше

// Настройка сервера
const app = express();
const port = 5000;

// Разрешаем CORS для доступа с фронтенда
app.use(cors());
app.use(express.json());

// Подключение к базе данных PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'admin',
  port: 5432,
});

const JWT_SECRET = 'your_secret_key'; // Смените на свой секрет!

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Формат: ДД.ММ.ГГГГ ЧЧ:ММ
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getDriverFio(driverId) {
  const driver = drivers.find(d => d.id === driverId);
  if (!driver) return 'Неизвестно';
  return `${driver.last_name} ${driver.first_name} ${driver.middle_name || ''}`.trim();
}

function getTripPassengerNames(tripId) {
  const passengerLinks = tripPassengers.filter(tp => tp.trip_id === tripId);
  const names = passengerLinks.map(tp => {
    const p = passengers.find(pass => pass.id === tp.id);
    return p ? p.full_name : 'Неизвестно';
  });
  return names.length ? names.join(', ') : 'Нет пассажиров';
}
app.post('/api/login', async (req, res) => {
  console.log('BODY:', req.body);
  const { login, pass } = req.body;
  const result = await pool.query('SELECT * FROM login WHERE login = $1', [login]);
  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({ message: 'Неверный логин или пароль' });
  }

  console.log(result.rows[0]);

  if (user.pass !== pass) return res.status(401).json({ message: 'Неверный логин или пароль' });

  // Если пароли хранятся в хэше:
  //const isMatch = await bcrypt.compare(pass, user.pass);
 // if (!isMatch) return res.status(401).json({ message: 'Неверный логин или пароль' });

  // Генерируем токен
  const token = jwt.sign({ login: user.login }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.get('/api/reports/trips', async (req, res) => {
  const { startDate, endDate, format } = req.query;
  const result = await pool.query(
    `SELECT * FROM trips WHERE start_datetime >= $1 AND end_datetime <= $2`,
    [startDate, endDate]
  );
  const trips = result.rows;
  const totalCommission = trips.reduce((sum, t) => sum + Number(t.commission || 0), 0);

  // Получаем всех водителей
  const driversRes = await pool.query('SELECT * FROM drivers');
  const drivers = driversRes.rows;

  // Получаем все связи поездка-пассажир
  const tripPassengersRes = await pool.query('SELECT * FROM trip_passengers');
  const tripPassengers = tripPassengersRes.rows;

  // Получаем всех пассажиров
  const passengersRes = await pool.query('SELECT * FROM passengers');
  const passengers = passengersRes.rows;

  if (format === 'excel') {
    const ws = XLSX.utils.json_to_sheet(trips);

    // Автоматическое определение ширины столбцов
    const cols = [];
    const data = [Object.keys(trips[0] || {})].concat(trips.map(row => Object.values(row)));
    for (let i = 0; i < data[0].length; i++) {
      let maxLen = 10; // минимальная ширина
      for (let j = 0; j < data.length; j++) {
        const cell = data[j][i];
        const len = cell ? cell.toString().length : 0;
        if (len > maxLen) maxLen = len;
      }
      cols.push({ wch: maxLen + 2 }); // +2 для небольшого отступа
    }
    ws['!cols'] = cols;

    // Добавляем строку с суммой комиссии
    const numRows = trips.length + 1; // +1 за заголовок
    const commissionColIndex = Object.keys(trips[0] || {}).indexOf('commission');
    const sumLabelCell = XLSX.utils.encode_cell({ c: 0, r: numRows });
    const sumValueCell = XLSX.utils.encode_cell({ c: commissionColIndex, r: numRows });
    ws[sumLabelCell] = { t: 's', v: 'Сумма комиссии' };
    ws[sumValueCell] = { t: 'n', v: totalCommission };

    // Обновляем диапазон !ref
    const colCount = Object.keys(trips[0] || {}).length;
    ws['!ref'] = XLSX.utils.encode_range({
      s: { c: 0, r: 0 },
      e: { c: colCount - 1, r: numRows }
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trips');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="trips_report.xlsx"');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } else if (format === 'pdf') {
    // Получаем всех водителей
    const driversRes = await pool.query('SELECT * FROM drivers');
    const drivers = driversRes.rows;

    // Получаем все связи поездка-пассажир
    const tripPassengersRes = await pool.query('SELECT * FROM trip_passengers');
    const tripPassengers = tripPassengersRes.rows;

    // Получаем всех пассажиров
    const passengersRes = await pool.query('SELECT * FROM passengers');
    const passengers = passengersRes.rows;

    function getDriverFio(driverId) {
      const driver = drivers.find(d => d.id === driverId);
      if (!driver) return 'Неизвестно';
      return `${driver.last_name} ${driver.first_name} ${driver.middle_name || ''}`.trim();
    }

    function getTripPassengerNames(tripId) {
      const passengerLinks = tripPassengers.filter(tp => tp.trip_id === tripId);
      const names = passengerLinks.map(tp => {
        const p = passengers.find(pass => pass.id === tp.id);
        return p ? p.full_name : 'Неизвестно';
      });
      return names.length ? names.join(', ') : 'Нет пассажиров';
    }

    const doc = new PDFDocument();
    doc.font(path.join(__dirname, 'fonts', 'DejaVuSans.ttf'));
    res.setHeader('Content-Disposition', 'attachment; filename="trips_report.pdf"');
    res.type('application/pdf');
    doc.pipe(res);

    doc.fontSize(16).text('Отчёт по поездкам', { lineGap: 8 });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Период: ${startDate} — ${endDate}`, { lineGap: 6 });
    doc.text(`Сумма комиссии: ${totalCommission} руб.`, { lineGap: 6 });
    doc.moveDown();

    trips.forEach((trip, i) => {
      doc.text(
        `${i + 1}. Код поездки: ${trip.id}
        Водитель: ${getDriverFio(trip.driver_id)}
        Пассажиры: ${getTripPassengerNames(trip.id)}
        Откуда: ${trip.departure_point}
        Куда: ${trip.arrival_point}
        Комиссия: ${trip.commission} руб.
        Начало: ${formatDate(trip.start_datetime)}
        Конец: ${formatDate(trip.end_datetime)}`,
        { lineGap: 10 }
      );
      doc.moveDown(0.5);
    });

    doc.end();
  } else {
    res.status(400).json({ error: 'Unknown format' });
  }
});

app.get('/api/reports/repairs', async (req, res) => {
  const { startDate, endDate, format } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM repairs WHERE start_date >= $1 AND end_date <= $2`,
      [startDate, endDate]
    );
    const repairs = result.rows;
    const totalSum = repairs.reduce((sum, r) => sum + Number(r.repair_cost || 0), 0);

    // Получаем клиентов
    const clientsRes = await pool.query('SELECT * FROM clients');
    const clients = clientsRes.rows;
    // Получаем сотрудников (механиков)
    const employeesRes = await pool.query('SELECT * FROM employees');
    const employees = employeesRes.rows;

    function getClientFio(requestId) {
      const client = clients.find(c => c.id === requestId);
      return client ? client.full_name : 'Неизвестно';
    }
    function getMechanicFio(mechanicId) {
      const mechanic = employees.find(e => e.id === mechanicId);
      if (!mechanic) return 'Неизвестно';
      return `${mechanic.last_name} ${mechanic.first_name} ${mechanic.middle_name || ''}`.trim();
    }

    if (format === 'pdf') {
      const doc = new PDFDocument();
      doc.font(path.join(__dirname, 'fonts', 'DejaVuSans.ttf'));
      res.setHeader('Content-Disposition', 'attachment; filename="repairs_report.pdf"');
      res.type('application/pdf');
      doc.pipe(res);

      doc.fontSize(16).text('Отчёт по ремонтам', { lineGap: 8 });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Период: ${startDate} — ${endDate}`, { lineGap: 6 });
      doc.text(`Сумма ремонтов: ${totalSum} руб.`, { lineGap: 6 });
      doc.moveDown();

      repairs.forEach((repair, i) => {
        doc.text(
          `${i + 1}. Код ремонта: ${repair.id}
Клиент: ${getClientFio(repair.request_id)}
Механик: ${getMechanicFio(repair.mechanic_id)}
Описание: ${repair.work_description}
Стоимость: ${repair.repair_cost} руб.
Дата начала: ${repair.start_date}
Дата окончания: ${repair.end_date}`,
          { lineGap: 10 }
        );
        doc.moveDown(0.5);
      });

      doc.end();
    } else if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(repairs);

      // Автоматическая ширина столбцов
      const cols = [];
      const data = [Object.keys(repairs[0] || {})].concat(repairs.map(row => Object.values(row)));
      for (let i = 0; i < data[0].length; i++) {
        let maxLen = 10;
        for (let j = 0; j < data.length; j++) {
          const cell = data[j][i];
          const len = cell ? cell.toString().length : 0;
          if (len > maxLen) maxLen = len;
        }
        cols.push({ wch: maxLen + 2 });
      }
      ws['!cols'] = cols;

      // Итоговая строка (если есть поле repair_cost)
      const numRows = repairs.length + 1;
      const totalColIndex = Object.keys(repairs[0] || {}).indexOf('repair_cost');
      if (totalColIndex !== -1) {
        const sumLabelCell = XLSX.utils.encode_cell({ c: 0, r: numRows });
        const sumValueCell = XLSX.utils.encode_cell({ c: totalColIndex, r: numRows });
        ws[sumLabelCell] = { t: 's', v: 'Сумма ремонтов' };
        ws[sumValueCell] = { t: 'n', v: totalSum };
        const colCount = Object.keys(repairs[0] || {}).length;
        ws['!ref'] = XLSX.utils.encode_range({
          s: { c: 0, r: 0 },
          e: { c: colCount - 1, r: numRows }
        });
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Repairs');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Disposition', 'attachment; filename=\"repairs_report.xlsx\"');
      res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buf);
    } else {
      res.status(400).json({ error: 'Unknown format' });
    }
  } catch (err) {
    console.error('Ошибка формирования отчёта по заказам:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Ошибка формирования отчёта' });
    }
  }
});

// Защищаем все универсальные CRUD-эндпоинты
app.get('/api/:table', authenticateToken, async (req, res) => {
    const { table } = req.params; // Получаем имя таблицы из параметров запроса
    try {
      // Проверяем, что имя таблицы не является пустым и не содержит опасных символов
      if (!table || /[^a-zA-Z0-9_]/.test(table)) {
        return res.status(400).json({ error: 'Неверное имя таблицы' });
      }
  
      // Выполняем запрос к переданной таблице
      const result = await pool.query(`SELECT * FROM ${table}`);
      
      // Если таблица пуста, отправляем пустой массив
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Данные не найдены' });
      }
  
      // Отправляем полученные данные
      res.json(result.rows);
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      res.status(500).json({ error: 'Ошибка при получении данных' });
    }
  });

app.get('/api/count/:table', authenticateToken, async (req, res) => {
    const { table } = req.params; // Получаем имя таблицы
    console.log('Имя таблицы:', table);  // Логируем имя таблицы
  
    try {
      // Проверяем, что имя таблицы не является пустым и не содержит опасных символов
      if (!table || /[^a-zA-Z0-9_]/.test(table)) {
        return res.status(400).json({ error: 'Неверное имя таблицы' });
      }
  
      const result = await pool.query(`SELECT MAX(id) FROM ${table}`);
      const maxId = result.rows[0].max || 0; // Если maxID null, присваиваем 0
  
      res.json({ maxId: maxId + 1 });
    } catch (error) {
      console.error('Ошибка при подсчёте максимального ID:', error);
      res.status(500).json({ error: 'Ошибка при подсчёте записей' });
    }
  });

app.get('/api/:table/:id', authenticateToken, async (req, res) => {
    const { table, id } = req.params; // Получаем имя таблицы и id записи из параметров запроса
    try {
      // Проверяем, что имя таблицы не является пустым и не содержит опасных символов
      if (!table || /[^a-zA-Z0-9_]/.test(table) || !id || /[^0-9]/.test(id)) {
        return res.status(400).json({ error: 'Неверное имя таблицы или id' });
      }
  
      // Выполняем запрос к переданной таблице с фильтрацией по id
      const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
      
      // Если таблица пуста, отправляем ошибку
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Запись не найдена' });
      }
  
      // Отправляем полученные данные
      res.json(result.rows[0]); // Отправляем только первую запись
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      res.status(500).json({ error: 'Ошибка при получении данных' });
    }
  });

app.post('/api/:table', authenticateToken, async (req, res) => {
    const { table } = req.params; // Получаем имя таблицы из параметров запроса
    const data = req.body; // Получаем данные из тела запроса
  
    try {
      // Проверяем, что имя таблицы не является пустым и не содержит опасных символов
      if (!table || /[^a-zA-Z0-9_]/.test(table)) {
        return res.status(400).json({ error: 'Неверное имя таблицы' });
      }
  
      // Динамически формируем запрос для вставки данных в таблицу
      const columns = Object.keys(data).join(', ');
      const values = Object.values(data);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
  
      const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
  
      const result = await pool.query(query, values);
  
      // Отправляем добавленные данные в ответ
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Ошибка при добавлении данных в таблицу:', error);
      res.status(500).json({ error: 'Ошибка при добавлении данных' });
    }
  });

app.put('/api/:table/:id', authenticateToken, async (req, res) => {
    const { table, id } = req.params; // Получаем имя таблицы и id записи из параметров запроса
    const updatedData = req.body; // Получаем обновленные данные из тела запроса
  
    console.log('Полученные данные для обновления:', updatedData);  // Логируем полученные данные
  
    try {
      // Проверяем, что имя таблицы и ID корректны
      if (!table || /[^a-zA-Z0-9_]/.test(table) || !id || /[^0-9]/.test(id)) {
        return res.status(400).json({ error: 'Неверное имя таблицы или id' });
      }
  
      // Проверяем, что обновленные данные были переданы
      if (!updatedData || Object.keys(updatedData).length === 0) {
        return res.status(400).json({ error: 'Нет данных для обновления' });
      }
  
      // Формируем строку SET для обновления колонок в таблице
      const setClause = Object.keys(updatedData)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ');
  
      // Создаем массив значений для параметров запроса
      const values = Object.values(updatedData);
  
      // Добавляем ID в конец значений для использования в запросе
      values.push(id);
  
      // Выполняем запрос на обновление данных в таблице
      const query = `UPDATE ${table} SET ${setClause} WHERE id = $${values.length} RETURNING *`;
  
      const result = await pool.query(query, values);
  
      // Если запись не найдена, отправляем ошибку
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Запись не найдена' });
      }
  
      // Отправляем обновленные данные
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Ошибка при обновлении данных:', error);
      res.status(500).json({ error: 'Ошибка при обновлении данных' });
    }
  });

app.delete('/api/:table/:id', authenticateToken, async (req, res) => {
    const { table, id } = req.params; // Получаем имя таблицы и id записи из параметров запроса
    console.log(`Попытка удаления записи: таблица=${table}, id=${id}`);
  
    try {
      // Проверяем, что имя таблицы и ID корректны
      if (!table || /[^a-zA-Z0-9_]/.test(table) || !id || /[^0-9]/.test(id)) {
        console.log('Ошибка валидации входных данных');
        return res.status(400).json({ error: 'Неверное имя таблицы или id' });
      }
  
      // Выполняем запрос на удаление записи
      const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
      console.log('SQL запрос:', query, 'Параметры:', [id]);
      
      const result = await pool.query(query, [id]);
      console.log('Результат запроса:', result.rows);
  
      // Если запись не найдена, отправляем ошибку
      if (result.rows.length === 0) {
        console.log('Запись не найдена');
        return res.status(404).json({ error: 'Запись не найдена' });
      }
  
      // Отправляем данные удаленной записи
      console.log('Запись успешно удалена');
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Подробная ошибка при удалении данных:', error);
      res.status(500).json({ error: 'Ошибка при удалении данных', details: error.message });
    }
  });
  
// Пример: логин и пароль в базе (лучше хранить хэш пароля)


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.get('/api/clients', authenticateToken, async (req, res) => {
  // ...ваш код получения клиентов...
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер работает на порту ${port}`);
});




