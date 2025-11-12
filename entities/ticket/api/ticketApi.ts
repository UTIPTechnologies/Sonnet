import { API_BASE_URL } from '../../../shared/lib/api/http';
import { Ticket, TicketMessage, CreateTicketRequest, SendMessageRequest, ApiResponse } from '../model/ticket';
import md5 from 'md5';

// Генерируем случайный параметр для запроса
function getRandParam(): number {
  return Math.floor(Math.random() * (99999999 - 1000000 + 1)) + 1000000;
}

// Получаем ключ запроса (используем MD5, как в mobileTradersRoom)
function getRequestKey(randParam: number, apiKey: string): string {
  // В mobileTradersRoom используется: md5(config.apiKey + randParam)
  return md5(apiKey + randParam);
}

// Базовый URL для API (можно настроить через переменные окружения)
// По умолчанию используем локальный weboffice: http://weboffice.apf/
// Для использования удаленного API установите VITE_TICKETS_API_BASE в .env
const TICKETS_API_BASE = process.env.VITE_TICKETS_API_BASE || 'http://weboffice.apf/api/v_2/';
const API_KEY = process.env.VITE_API_KEY || 'Fiugkjyu76fhjt7hbk';

// Для тестирования можно использовать фиксированный auth_token через переменную окружения
// Если установлен VITE_TEST_AUTH_TOKEN, он будет использоваться вместо переданного токена
const TEST_AUTH_TOKEN = process.env.VITE_TEST_AUTH_TOKEN;

// Формируем параметры аутентификации
function getAuthParams(authToken: string, userId: string, apiKey: string, lang: string = 'en') {
  const randParam = getRandParam();
  // Используем тестовый токен, если он установлен, иначе используем переданный токен
  const tokenToUse = TEST_AUTH_TOKEN || authToken;
  // Обрезаем токен до 32 символов, если он длиннее (требование API)
  const trimmedToken = tokenToUse.length > 32 ? tokenToUse.substring(0, 32) : tokenToUse;
  return {
    key: getRequestKey(randParam, apiKey),
    rand_param: randParam,
    languages: lang,
    auth_token: trimmedToken,
    user_id: userId,
  };
}

// Преобразуем объект в URL-encoded строку (как в mobileTradersRoom)
function serializeParams(params: Record<string, any>): string {
  const parts: string[] = [];
  
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      if (Array.isArray(params[key])) {
        params[key].forEach((value: any, index: number) => {
          parts.push(`${encodeURIComponent(key)}[${index}]=${encodeURIComponent(value)}`);
        });
      } else if (typeof params[key] === 'object') {
        for (const subKey in params[key]) {
          parts.push(`${encodeURIComponent(key)}[${encodeURIComponent(subKey)}]=${encodeURIComponent(params[key][subKey])}`);
        }
      } else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
      }
    }
  }
  
  return parts.join('&');
}

// Выполняем запрос к API
async function apiQuery<T>(
  url: string,
  method: 'GET' | 'POST',
  authToken: string,
  userId: string,
  data?: Record<string, any>
): Promise<ApiResponse<T>> {
  const authParams = getAuthParams(authToken, userId, API_KEY);
  const allParams = { ...authParams, ...data };

  const requestUrl = `${TICKETS_API_BASE}${url}`;
  
  let requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
  };

  if (method === 'GET') {
    const queryString = serializeParams(allParams);
    const fullUrl = `${requestUrl}?${queryString}`;
    const response = await fetch(fullUrl, requestOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.result === 'failed') {
      const errorMsg = result.description || (result.error_number ? `Error ${result.error_number}` : 'Request failed');
      throw new Error(errorMsg);
    }
    
    return result;
  } else {
    // POST запрос
    requestOptions.body = serializeParams(allParams);
    const response = await fetch(requestUrl, requestOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.result === 'failed') {
      const errorMsg = result.description || (result.error_number ? `Error ${result.error_number}` : 'Request failed');
      throw new Error(errorMsg);
    }
    
    return result;
  }
}

// Получить все обращения
export async function getAllTickets(
  authToken: string,
  userId: string,
  resolved: number = 0
): Promise<Ticket[]> {
  const response = await apiQuery<string>(
    'partner/GetAllTickets',
    'GET',
    authToken,
    userId,
    { resolved }
  );
  
  // В weboffice response.values это JSON строка (как в mobileTradersRoom)
  try {
    const tickets = typeof response.values === 'string' 
      ? JSON.parse(response.values || '[]')
      : (response.values || []);
    return normalizeTicketList(tickets);
  } catch (e) {
    console.error('Failed to parse tickets JSON:', e);
    return [];
  }
}

// Получить одно обращение с сообщениями
export async function getTicket(
  authToken: string,
  userId: string,
  ticketId: number
): Promise<{ ticket: Ticket; messages: TicketMessage[] }> {
  const response = await apiQuery<any>(
    'partner/ViewTicket',
    'GET',
    authToken,
    userId,
    { ticket_id: ticketId }
  );
  
  const ticket: Ticket = {
    id: ticketId,
    subject: response.values.subject,
    text: response.values.subject,
    message: '',
    message_date: 0,
    resolved: response.values.in_archive ? 1 : 0,
    in_archive: response.values.in_archive,
    user_id: parseInt(userId),
    closed_by: response.values.closed_by,
  };
  
  const messages: TicketMessage[] = [];
  if (Array.isArray(response.values)) {
    response.values.forEach((msg: any) => {
      if (msg && typeof msg === 'object' && msg.id) {
        messages.push({
          id: msg.id,
          ticket_id: ticketId,
          user_id: msg.user_id,
          user_name: msg.user_name || '',
          user_first_name: msg.user_first_name,
          user_second_name: msg.user_second_name,
          text: msg.text || '',
          date: msg.date || 0,
          is_read: msg.is_read,
          files: msg.files || [],
        });
      }
    });
  }
  
  return { ticket, messages };
}

// Создать обращение
export async function createTicket(
  authToken: string,
  userId: string,
  data: CreateTicketRequest
): Promise<{ ticked_id: number }> {
  const response = await apiQuery<{ ticked_id: number }>(
    'partner/CreateTicket',
    'POST',
    authToken,
    userId,
    data
  );
  
  return response.values;
}

// Отправить сообщение в обращение
export async function sendMessageToTicket(
  authToken: string,
  userId: string,
  data: SendMessageRequest
): Promise<void> {
  await apiQuery<void>(
    'partner/SendMessageToTicket',
    'POST',
    authToken,
    userId,
    data
  );
}

// Нормализация списка обращений (как в mobileTradersRoom)
function normalizeTicketList(tickets: any[]): Ticket[] {
  return tickets.map(ticket => {
    const messageDate = new Date(ticket.message_date * 1000);
    const normalized: Ticket = {
      ...ticket,
      message_date_conv: messageDate.getTime(),
    };
    
    if (ticket.closing_date) {
      const closeDate = new Date(ticket.closing_date * 1000);
      normalized.close_date_conv = closeDate.getTime();
    }
    
    return normalized;
  });
}

