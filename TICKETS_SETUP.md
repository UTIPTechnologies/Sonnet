# Настройка страницы обращений (Tickets)

## Описание

В проекте `utip-main` создана страница для работы с обращениями, аналогичная функциональности из проекта `mobileTradersRoom-master`.

## Структура

- `entities/ticket/` - модели и API для работы с обращениями
- `features/tickets/` - хуки для работы с обращениями
- `pages/TicketsPage.tsx` - страница отображения обращений

## API Endpoints

Страница использует следующие API endpoints (аналогично mobileTradersRoom-master):

- `GET partner/GetAllTickets` - получение списка обращений
- `GET partner/ViewTicket` - получение обращения с сообщениями
- `POST partner/CreateTicket` - создание обращения
- `POST partner/SendMessageToTicket` - отправка сообщения в обращение

## Настройка

### 1. Настройка API endpoint

В файле `entities/ticket/api/ticketApi.ts` уже настроены следующие переменные:

```typescript
const TICKETS_API_BASE = process.env.VITE_TICKETS_API_BASE || 'https://dev-weboffice.utip.work/api/v_2/';
const API_KEY = process.env.VITE_API_KEY || 'Fiugkjyu76fhjt7hbk';
```

**Текущие настройки:**
- Домен ЛК: `https://dev-weboffice.utip.work/`
- API ключ: `Fiugkjyu76fhjt7hbk`

Если нужно изменить настройки, создайте файл `.env` в корне проекта:

```env
VITE_TICKETS_API_BASE=https://dev-weboffice.utip.work/api/v_2/
VITE_API_KEY=Fiugkjyu76fhjt7hbk
```

### 2. Развертывание mobileTradersRoom-master локально (опционально)

**Примечание:** Если вы используете удаленный API (`https://dev-weboffice.utip.work/`), развертывание локального сервера не требуется. Страница обращений будет работать напрямую с удаленным API.

Если нужно развернуть проект `mobileTradersRoom-master` локально для тестирования:

1. Перейдите в директорию `mobileTradersRoom-master`
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Настройте конфигурацию в `app/settings/config.js`:
   ```javascript
   window.config = {
       webofficeDomain: "https://dev-weboffice.utip.work/",
       apiKey: "Fiugkjyu76fhjt7hbk",
       // ... другие настройки
   };
   ```
4. Запустите локальный сервер (зависит от используемого сервера)

### 3. Получение user_id

В текущей реализации используется заглушка для `user_id`. В реальном проекте необходимо:

1. Получать `user_id` из токена аутентификации
2. Или использовать отдельный API endpoint для получения информации о пользователе
3. Обновить функцию `getUserId()` в `features/tickets/model/useTickets.ts`

### 4. Аутентификация

API использует тот же формат аутентификации, что и в `mobileTradersRoom-master`:
- `auth_token` - токен аутентификации (используется `acsToken` из AuthProvider)
- `user_id` - ID пользователя
- `key` - ключ запроса (генерируется на основе `apiKey` и случайного параметра)
- `rand_param` - случайный параметр

**Важно**: В `mobileTradersRoom-master` используется MD5 для генерации ключа. В текущей реализации используется упрощенная версия. Для полной совместимости необходимо:

1. Установить библиотеку для MD5 (например, `crypto-js`)
2. Обновить функцию `getRequestKey()` в `entities/ticket/api/ticketApi.ts`:

```typescript
import md5 from 'crypto-js/md5';

function getRequestKey(randParam: number, apiKey: string): string {
  return md5(apiKey + randParam).toString();
}
```

## Использование

1. Запустите проект `utip-main`:
   ```bash
   npm run dev
   ```

2. Войдите в систему

3. Нажмите кнопку "Обращения" в верхней панели на странице Quotes

4. Страница отобразит список обращений (открытых или архивных)

## Функциональность

- Просмотр списка открытых обращений
- Просмотр списка архивных обращений
- Переключение между активными и архивными обращениями
- Отображение новых сообщений (подсветка)
- Форматирование дат
- Кнопка создания нового обращения (заглушка)

## Дальнейшее развитие

- Реализация страницы просмотра отдельного обращения
- Реализация создания обращения
- Реализация отправки сообщений в обращение
- Загрузка файлов
- Автообновление списка обращений

