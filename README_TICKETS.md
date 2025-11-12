# Страница обращений (Tickets)

## Что было сделано

В проекте `utip-main` создана страница для работы с обращениями, аналогичная функциональности из проекта `mobileTradersRoom-master`.

### Созданные файлы:

1. **Модели и типы:**
   - `entities/ticket/model/ticket.ts` - типы для обращений и сообщений

2. **API клиент:**
   - `entities/ticket/api/ticketApi.ts` - функции для работы с API обращений

3. **Хуки:**
   - `features/tickets/model/useTickets.ts` - хуки `useTickets()` и `useTicket()`
   - `features/tickets/index.ts` - экспорт хуков

4. **Страница:**
   - `pages/TicketsPage.tsx` - страница отображения обращений

5. **Обновленные файлы:**
   - `app/App.tsx` - добавлен роутинг для страницы обращений
   - `app/providers/AuthProvider.tsx` - добавлено сохранение `acsUserId`
   - `pages/SymbolsPage.tsx` - добавлена кнопка перехода на страницу обращений
   - `pages/SettingsPage.tsx` - обновлены типы навигации

## Как использовать

1. **API endpoint уже настроен:**
   
   В проекте уже настроены следующие параметры:
   - Домен ЛК: `https://dev-weboffice.utip.work/`
   - API ключ: `Fiugkjyu76fhjt7hbk`
   
   Если нужно изменить настройки, создайте файл `.env` в корне проекта:
   ```env
   VITE_TICKETS_API_BASE=https://dev-weboffice.utip.work/api/v_2/
   VITE_API_KEY=Fiugkjyu76fhjt7hbk
   ```
   
   Или измените значения в `entities/ticket/api/ticketApi.ts`

2. **Разверните mobileTradersRoom-master локально:**
   
   Следуйте инструкциям в `TICKETS_SETUP.md` для настройки локального сервера.

3. **Запустите проект:**
   ```bash
   npm run dev
   ```

4. **Используйте страницу обращений:**
   - Войдите в систему
   - На странице Quotes нажмите кнопку "Обращения" в верхней панели
   - Просматривайте список обращений
   - Переключайтесь между активными и архивными обращениями

## API Endpoints

Страница использует следующие endpoints (аналогично mobileTradersRoom-master):

- `GET partner/GetAllTickets?resolved=0|1` - получение списка обращений
- `GET partner/ViewTicket?ticket_id={id}` - получение обращения с сообщениями
- `POST partner/CreateTicket` - создание обращения
- `POST partner/SendMessageToTicket` - отправка сообщения в обращение

## Важные замечания

1. **MD5 для ключа запроса:** В текущей реализации используется упрощенная версия генерации ключа. Для полной совместимости с `mobileTradersRoom-master` необходимо установить библиотеку `crypto-js` и обновить функцию `getRequestKey()` в `entities/ticket/api/ticketApi.ts`.

2. **User ID:** Теперь `user_id` получается из `acsUserId` в контексте аутентификации. Если `acsUserId` не доступен, используется fallback значение '1'.

3. **Формат запросов:** API использует формат `application/x-www-form-urlencoded` для POST запросов, как в `mobileTradersRoom-master`.

## Дальнейшее развитие

- Реализация страницы просмотра отдельного обращения
- Реализация создания обращения
- Реализация отправки сообщений
- Загрузка файлов
- Автообновление списка обращений

