# Feature-Sliced Design (FSD) Structure

Проект организован согласно методологии Feature-Sliced Design.

## Структура слоёв

```
utip-main/
├── app/                    # Инициализация приложения
│   ├── App.tsx            # Главный компонент приложения
│   ├── index.tsx          # Точка входа (альтернативная)
│   └── providers/         # Провайдеры контекста
│       ├── AuthProvider.tsx
│       ├── ThemeProvider.tsx
│       ├── SubscriptionProvider.tsx
│       └── index.tsx
│
├── pages/                  # Страницы приложения
│   ├── LoginPage.tsx
│   ├── SymbolsPage.tsx
│   └── SettingsPage.tsx
│
├── features/               # Бизнес-фичи
│   ├── auth/              # Авторизация
│   │   ├── model/
│   │   │   └── useAuth.ts
│   │   └── index.ts
│   ├── subscription/      # Подписки на символы
│   │   ├── model/
│   │   │   └── useSubscription.ts
│   │   └── index.ts
│   ├── theme/             # Тема приложения
│   │   ├── model/
│   │   │   └── useTheme.ts
│   │   └── index.ts
│   └── quotes/            # Котировки в реальном времени
│       ├── model/
│       │   └── useQuotes.ts
│       └── index.ts
│
├── entities/               # Бизнес-сущности
│   ├── symbol/            # Символы
│   │   ├── model/
│   │   │   └── types.ts
│   │   └── api/
│   │       └── symbolApi.ts
│   ├── quote/             # Котировки
│   │   ├── model/
│   │   │   └── types.ts
│   │   └── api/
│   │       └── quoteApi.ts
│   └── user/              # Пользователь
│       ├── model/
│       │   └── types.ts
│       └── api/
│           └── authApi.ts
│
└── shared/                 # Переиспользуемые модули
    ├── ui/                # UI компоненты
    │   └── spinner/
    │       ├── Spinner.tsx
    │       └── index.ts
    ├── lib/               # Утилиты и библиотеки
    │   ├── api/
    │   │   ├── http.ts
    │   │   └── websocket.ts
    │   └── storage.ts
    └── types/             # Общие типы
        └── index.ts
```

## Правила импорта

FSD использует строгие правила импорта между слоями:

1. **Слои могут импортировать только из нижележащих слоёв:**
   - `app` → `pages`, `widgets`, `features`, `entities`, `shared`
   - `pages` → `widgets`, `features`, `entities`, `shared`
   - `widgets` → `features`, `entities`, `shared`
   - `features` → `entities`, `shared`
   - `entities` → `shared`
   - `shared` → только внешние зависимости

2. **Запрещены импорты вверх по слоям:**
   - ❌ `entities` → `features`
   - ❌ `shared` → `entities`
   - ❌ `features` → `pages`

3. **Запрещены горизонтальные импорты между слайсами одного слоя:**
   - ❌ `features/auth` → `features/subscription`

## Описание слоёв

### `app/`
Инициализация приложения, провайдеры, роутинг, глобальные настройки.

### `pages/`
Страницы приложения - композиция виджетов и фич.

### `features/`
Бизнес-фичи приложения. Каждая фича инкапсулирует логику для конкретной функциональности:
- `auth` - авторизация пользователя
- `subscription` - управление подписками на символы
- `theme` - переключение темы
- `quotes` - получение котировок в реальном времени

### `entities/`
Бизнес-сущности приложения:
- `symbol` - символы для торговли
- `quote` - котировки
- `user` - пользователь

### `shared/`
Переиспользуемые модули, не зависящие от бизнес-логики:
- `ui` - UI компоненты (кнопки, спиннеры и т.д.)
- `lib` - утилиты (API клиенты, работа с хранилищем)
- `types` - общие типы TypeScript

## Миграция со старой структуры

Старые файлы были перемещены:
- `components/Spinner.tsx` → `shared/ui/spinner/Spinner.tsx`
- `context/AuthContext.tsx` → `features/auth/model/useAuth.ts`
- `context/SubscriptionContext.tsx` → `features/subscription/model/useSubscription.ts`
- `context/ThemeContext.tsx` → `features/theme/model/useTheme.ts`
- `types.ts` → `shared/types/index.ts`
- `App.tsx` → `app/App.tsx`

Все импорты обновлены для использования новой структуры.

