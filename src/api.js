// Универсальный fetch с авторизацией JWT
export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.headers || {}),
    'Authorization': 'Bearer ' + token
  };
  
  try {
    const response = await fetch(url, { ...options, headers });
    
    // Проверка статуса ответа
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    // Для скачивания файлов (PDF, Excel)
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/pdf') || contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      return response;
    }

    // Для обычных JSON-ответов
    try {
      const data = await response.json();
      // Для совместимости с axios-стилем
      return { data, status: response.status, ok: response.ok };
    } catch (error) {
      console.error('Ошибка парсинга JSON:', error);
      throw new Error('Получен некорректный формат данных от сервера');
    }
  } catch (error) {
    console.error('Ошибка запроса:', error);
    throw error;
  }
} 