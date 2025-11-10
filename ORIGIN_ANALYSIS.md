# Анализ проблемы с Origin

## Обнаруженная разница:

### Локально:
- ✅ Отправляется **OPTIONS preflight** запрос
- ✅ Origin: `http://localhost:3000`
- ✅ Сервер отвечает: `access-control-allow-origin: *` (разрешает все)

### Google AI Studio:
- ❌ OPTIONS запрос **НЕ отправляется**
- Это означает, что запрос идет с того же origin или через прокси

## Важно для WebSocket:

WebSocket **НЕ использует CORS preflight** (OPTIONS), но сервер все равно может проверять заголовок `Origin` в WebSocket handshake.

### Что нужно проверить:

1. **Origin в WebSocket запросе локально:**
   - Открыть Network → WS → выбрать WebSocket соединение
   - Посмотреть Headers → найти `Origin: http://localhost:3000`

2. **Origin в WebSocket запросе в Google AI Studio:**
   - Открыть Network → WS → выбрать WebSocket соединение  
   - Посмотреть Headers → найти `Origin` (скорее всего `https://ai.studio` или отсутствует)

3. **Проверка на сервере:**
   - Сервер может блокировать WebSocket соединения с `Origin: http://localhost:3000`
   - Или требовать определенный Origin для отправки сообщения `symbols`

## Возможные решения:

### 1. Изменить Origin локально (для тестирования):
   - Использовать расширение браузера (например, "Modify Header Value")
   - Или настроить прокси

### 2. Использовать другой домен локально:
   - Настроить hosts файл: `127.0.0.1 local.utip.test`
   - Запустить Vite на `local.utip.test:3000`
   - Но это не решит проблему, если сервер проверяет конкретные домены

### 3. Проверить, есть ли прокси в Google AI Studio:
   - Возможно, Google AI Studio использует прокси, который меняет Origin
   - Или запросы идут через их инфраструктуру

## Гипотеза:

Сервер `dev-virt-point.utip.work` может:
1. Разрешать WebSocket соединения с любого Origin
2. Но отправлять сообщение `symbols` только для определенных Origin (например, `https://ai.studio`)
3. Или проверять Origin и блокировать `symbols` для `localhost`

## Что проверить в первую очередь:

1. **Сравнить Origin в WebSocket Headers** между двумя средами
2. **Проверить, приходит ли `symbols` с задержкой** (подождать 5-10 секунд)
3. **Проверить все WebSocket сообщения** в Google AI Studio - возможно, `symbols` приходит после других сообщений



