# Настройка для работы с локальным weboffice

## Обзор

Проект `utip-main` настроен для работы с локально развернутым проектом `weboffice`.

## Конфигурация

### 1. Настройка API endpoint

В файле `entities/ticket/api/ticketApi.ts` настроены следующие параметры:

```typescript
// По умолчанию используется локальный weboffice
const TICKETS_API_BASE = process.env.VITE_TICKETS_API_BASE || 'http://weboffice.apf/api/v_2/';
const API_KEY = process.env.VITE_API_KEY || 'Fiugkjyu76fhjt7hbk';
```

### 2. Создание файла .env

Создайте файл `.env` в корне проекта `utip-main`:

```env
# Локальный weboffice (по умолчанию)
VITE_TICKETS_API_BASE=http://weboffice.apf/api/v_2/

# Или если нужно использовать другой адрес:
# VITE_TICKETS_API_BASE=http://localhost/api/v_2/
# VITE_TICKETS_API_BASE=http://localhost:8080/api/v_2/

# API Key для аутентификации
VITE_API_KEY=Fiugkjyu76fhjt7hbk

# Для тестирования можно использовать фиксированный auth_token
# Если установлен, он будет использоваться вместо токена из сессии
VITE_TEST_AUTH_TOKEN=3497b648dc95af5dbd3dee757609faeb
```

### 3. Запуск локального weboffice

Убедитесь, что локальный weboffice запущен и доступен:

1. Перейдите в директорию `weboffice`
2. Убедитесь, что база данных настроена
3. Запустите веб-сервер (Apache/Nginx/PHP built-in server)
4. Проверьте доступность: `http://weboffice.apf/api/v_2/partner/GetAllTickets`

### 4. Настройка hosts (если необходимо)

Если домен `weboffice.apf` не настроен в системе, добавьте в файл `hosts`:
- Windows: `C:\Windows\System32\drivers\etc\hosts`
- Linux/Mac: `/etc/hosts`

```
127.0.0.1    weboffice.apf
```

## Используемые API endpoints

Все endpoints находятся в `weboffice/protected/controllers/rest_v2/PartnerRestController.php`:

1. **Получение списка обращений:**
   - Endpoint: `GET /api/v_2/partner/GetAllTickets`
   - Параметры: `auth_token`, `user_id`, `resolved` (0 или 1)
   - Ответ: `response.values` - JSON строка с массивом обращений

2. **Создание обращения:**
   - Endpoint: `POST /api/v_2/partner/CreateTicket`
   - Параметры: `auth_token`, `subject`, `text`, `department`, `files` (опционально)
   - Ответ: `response.values.ticked_id` - ID созданного обращения

3. **Просмотр обращения:**
   - Endpoint: `GET /api/v_2/partner/ViewTicket`
   - Параметры: `auth_token`, `ticket_id`
   - Ответ: `response.values` - объект с данными обращения и массивом сообщений

4. **Отправка сообщения:**
   - Endpoint: `POST /api/v_2/partner/SendMessageToTicket`
   - Параметры: `auth_token`, `ticket_id`, `text`, `files` (опционально)

## Требования к auth_token

Важно: `auth_token` должен быть **ровно 32 символа** (как указано в валидации weboffice).

В текущей реализации токен обрезается до 32 символов:
```typescript
const trimmedToken = authToken.length > 32 ? authToken.substring(0, 32) : authToken;
```

## Проверка работы

1. Запустите локальный weboffice
2. Запустите `utip-main`: `npm run dev`
3. Войдите в систему
4. Перейдите на страницу обращений
5. Проверьте, что обращения загружаются с локального weboffice

## Отладка

Если возникают проблемы:

1. Проверьте, что weboffice доступен: откройте `http://localhost` в браузере
2. Проверьте CORS настройки в weboffice (если запросы блокируются)
3. Проверьте консоль браузера на наличие ошибок
4. Проверьте Network tab в DevTools для просмотра запросов

## Переключение на удаленный API

Если нужно использовать удаленный API вместо локального:

```env
VITE_TICKETS_API_BASE=https://dev-weboffice.utip.work/api/v_2/
VITE_API_KEY=Fiugkjyu76fhjt7hbk
```

