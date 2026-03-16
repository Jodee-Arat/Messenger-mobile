# MesArat Mobile

Мобильный клиент MesArat на базе Expo и React Native. Приложение повторяет ключевую функциональность веб-версии, но адаптировано под смартфоны: быстрый доступ к личным сообщениям, группам, чатам, настройкам профиля и защищённым secret chat с end-to-end шифрованием.

## Что это за приложение

`apps/mobile` - самостоятельный mobile frontend для корпоративного и личного мессенджера MesArat. Клиент работает с тем же GraphQL API, что и остальные части проекта, поддерживает real-time обновления через subscriptions и хранит часть чувствительных данных локально на устройстве.

Основной сценарий использования:

- вход или регистрация пользователя;
- просмотр списка друзей и заявок;
- работа с группами и вложенными чатами;
- личные переписки;
- обычные и секретные чаты;
- управление ролями, участниками и правами;
- настройка профиля, TOTP и активных сессий.

## Основные возможности

### Аутентификация и доступ

- регистрация по `email + password`;
- вход по логину и паролю;
- дополнительный шаг TOTP при включённой двухфакторной аутентификации;
- автоматическое восстановление сессии при запуске приложения;
- автоматический refresh access token при его истечении;
- принудительный logout при невалидных токенах или ошибках авторизации.

### Главный экран

Экран `Home` - стартовая точка после авторизации. Он объединяет несколько сценариев:

- быстрые действия: добавить друга, перейти к direct messages;
- список друзей;
- входящие заявки в друзья;
- исходящие заявки;
- боковая панель групп.

Фактически `Home` играет роль центра коммуникации: отсюда пользователь либо начинает личный диалог, либо переходит в группу и дальше в нужный чат.

### Direct Messages

Отдельный экран `DirectMessages` показывает личные переписки пользователя. Через него открываются приватные диалоги без привязки к группе.

### Группы и чаты

Мобильный клиент поддерживает структуру:

- группа;
- внутри группы несколько чатов;
- внутри чата обмен сообщениями и управление участниками.

Возможности на этом уровне:

- создание групп;
- приглашение друзей в группу;
- просмотр списка чатов группы;
- создание чатов внутри группы;
- закрепление чатов;
- перетаскивание закреплённых чатов и сохранение порядка;
- удаление чатов;
- выход из чата;
- переход в настройки группы и конкретного чата.

### Сообщения

Для обычных чатов реализованы:

- отправка текстовых сообщений;
- отправка файлов;
- закрепление сообщений;
- удаление сообщений;
- пересылка сообщений;
- отображение pinned message;
- работа с draft-сообщениями;
- подписка на новые сообщения и изменения чатов в реальном времени;
- индикатор набора текста через GraphQL subscription.

### Secret Chat и E2EE

В мобильной версии есть отдельный поток для secret chat:

- секретные чаты определяются по флагу `isSecret`;
- для них используется отдельный экран `SecretChat`;
- сообщения шифруются end-to-end;
- для обмена ключами используется собственная реализация на базе GOST;
- локально хранятся ключи, pre-key и сообщения;
- для участников можно сверять криптографические fingerprint;
- для group secret chat поддерживается распределение общего ключа новым участникам;
- при ротации ключей локальный session key удаляется и пересоздаётся;
- для секретных чатов может быть включён дополнительный TOTP gate на вход в чат.

Это одна из самых нетривиальных частей мобильного клиента: приложение не просто показывает данные с сервера, а ведёт локальное криптографическое состояние пользователя и синхронизирует его с серверными событиями.

### Настройки пользователя

Экран `UserSettings` разделён на несколько вкладок:

- `Profile` - изменение аватара и базовой информации;
- `Appearance` - переключение светлой/тёмной темы и языка;
- `Security` - включение и отключение TOTP;
- `Sessions` - просмотр активных пользовательских сессий.

### Управление ролями и правами

Для групп и чатов есть отдельные экраны настроек:

- `GroupSettings`;
- `ChatSettings`.

На этих экранах можно:

- редактировать информацию о группе или чате;
- менять аватар;
- создавать роли;
- удалять роли;
- назначать роли участникам;
- выдавать и отзывать permissions;
- приглашать новых участников;
- удалять участников;
- удалять группу или чат;
- включать `requireTotp` для secret chat, если это разрешено текущей ролью.

## Архитектура мобильного приложения

Структура проекта построена вокруг папки [`apps/mobile/app`](/d:/ararat/vs/messenger/apps/mobile/app):

- [`components`](/d:/ararat/vs/messenger/apps/mobile/app/components) - экранные и UI-компоненты;
- [`hooks`](/d:/ararat/vs/messenger/apps/mobile/app/hooks) - пользовательские хуки со сценарной логикой;
- [`graphql`](/d:/ararat/vs/messenger/apps/mobile/app/graphql) - `.graphql` документы, subscriptions, queries, mutations и сгенерированные типы;
- [`libs`](/d:/ararat/vs/messenger/apps/mobile/app/libs) - Apollo Client, константы, E2EE-реализация;
- [`providers`](/d:/ararat/vs/messenger/apps/mobile/app/providers) - провайдеры приложения;
- [`navigation`](/d:/ararat/vs/messenger/apps/mobile/app/navigation) - маршрутизация;
- [`store`](/d:/ararat/vs/messenger/apps/mobile/app/store) - Zustand store;
- [`services`](/d:/ararat/vs/messenger/apps/mobile/app/services) - auth/api helper-слой;
- [`schemas`](/d:/ararat/vs/messenger/apps/mobile/app/schemas) - валидационные схемы форм;
- [`utils`](/d:/ararat/vs/messenger/apps/mobile/app/utils) - утилиты, файловое хранилище, математика и crypto helper.

### Точка входа

Приложение стартует из [`App.tsx`](/d:/ararat/vs/messenger/apps/mobile/App.tsx). На верхнем уровне подключаются:

- `GestureHandlerRootView`;
- `ApolloClientProvider`;
- `AuthProvider`;
- `SafeAreaProvider`;
- `Navigation`;
- `Toast`;
- `StatusBar`, цвет которого зависит от текущей темы.

### Навигация

Маршруты описаны в [`app/navigation/routes.ts`](/d:/ararat/vs/messenger/apps/mobile/app/navigation/routes.ts). Основные экраны:

- `Auth`;
- `Home`;
- `ChatsList`;
- `DirectMessages`;
- `Chat`;
- `ChatSettings`;
- `GroupSettings`;
- `FriendProfile`;
- `Profile`;
- `UserSettings`.

Экран `Chat` выступает как роутер: если у чата `isSecret = true`, открывается `SecretChat`, иначе обычный чат.

### Состояние приложения

В проекте используется `Zustand`:

- [`auth.store.ts`](/d:/ararat/vs/messenger/apps/mobile/app/store/auth/auth.store.ts) хранит флаг `isAuthenticated`;
- [`settings.store.ts`](/d:/ararat/vs/messenger/apps/mobile/app/store/settings/settings.store.ts) хранит `theme` и `language`;
- [`user.store.ts`](/d:/ararat/vs/messenger/apps/mobile/app/store/user/user.store.ts) хранит идентификатор текущего пользователя.

Часть состояния сохраняется между перезапусками через `persist` и `AsyncStorage`.

### Темизация и локализация

Хук [`useTheme.ts`](/d:/ararat/vs/messenger/apps/mobile/app/hooks/useTheme.ts) объединяет:

- палитры для светлой и тёмной темы;
- доступ к настройкам темы;
- доступ к текущему языку;
- простой встроенный словарь переводов `ru/en`.

То есть в мобильной версии пока нет внешней i18n-подсистемы: переводы лежат прямо в коде и выбираются через Zustand store.

## Работа с API и real-time

### GraphQL

Мобильный клиент целиком завязан на GraphQL:

- `queries` - загрузка профиля, друзей, чатов, ролей, групп, сессий, ключей;
- `mutations` - логин, регистрация, отправка сообщений, изменение профиля, TOTP, управление ролями и участниками;
- `subscriptions` - новые сообщения, события дружбы, обновления чатов и групп, события secret chat.

Все документы лежат в [`app/graphql`](/d:/ararat/vs/messenger/apps/mobile/app/graphql), а итоговые типы и Apollo hooks генерируются в [`app/graphql/generated/output.ts`](/d:/ararat/vs/messenger/apps/mobile/app/graphql/generated/output.ts).

### Apollo Client

Ключевая клиентская логика находится в [`app/libs/apollo-client.ts`](/d:/ararat/vs/messenger/apps/mobile/app/libs/apollo-client.ts):

- HTTP-запросы идут через `apollo-upload-client`;
- subscriptions идут через `WebSocketLink`;
- link split разделяет subscription и обычные операции;
- токен авторизации добавляется автоматически;
- есть защита от параллельного refresh токена;
- при `401` клиент пытается обновить access token и повторить операцию;
- после обновления токена пересоздаётся WebSocket link, чтобы подписки использовали новый bearer token.

Это важный слой, потому что мобильный клиент рассчитан на долгоживущую сессию и фоновое/повторное открытие приложения.

## Безопасность и хранение данных

### Где хранятся токены

- `refreshToken` хранится в `expo-secure-store`;
- `accessToken` хранится в `AsyncStorage`;
- `userId` хранится в `AsyncStorage`.

Файлы:

- [`auth.helper.ts`](/d:/ararat/vs/messenger/apps/mobile/app/services/auth/auth.helper.ts);
- [`auth.service.ts`](/d:/ararat/vs/messenger/apps/mobile/app/services/auth/auth.service.ts);
- [`auth.interface.ts`](/d:/ararat/vs/messenger/apps/mobile/app/types/interface/auth.interface.ts).

### Локальные данные secret chat

Secret chat использует файловое хранилище на устройстве через `expo-file-system`. Основная логика находится в [`secretChat.ts`](/d:/ararat/vs/messenger/apps/mobile/app/utils/secret-chat/secretChat.ts).

Локально создаются и читаются:

- `messages.json` - история секретных сообщений;
- `chat.json` или `<chatId>.json` - данные секретного чата;
- `keys.json` / `my-keys.json` - локальные ключи;
- `pre-keys.json` - pre-key bundle пользователя.

Для групповых secret chat создаются отдельные директории внутри папки группы. Для direct secret chat используется отдельный storage flow.

### Криптография

В проекте есть отдельный модуль [`app/libs/e2ee`](/d:/ararat/vs/messenger/apps/mobile/app/libs/e2ee):

- используется `gost-crypto` и `crypto-gost`;
- через `metro.config.js` подставляется RN-совместимый `gostEngine`;
- присутствуют helper-утилиты для генерации ключей, работы с pre-key, математические функции для crypto-процессов;
- при логине и регистрации приложение генерирует pre-key и отправляет его на сервер.

## Ключевые хуки и сценарная логика

Некоторые хуки являются центральными для приложения:

- [`useAuth.ts`](/d:/ararat/vs/messenger/apps/mobile/app/hooks/useAuth.ts) - доступ к auth-состоянию;
- [`useCurrentUser.ts`](/d:/ararat/vs/messenger/apps/mobile/app/hooks/useCurrentUser.ts) - профиль текущего пользователя;
- [`useFriends.ts`](/d:/ararat/vs/messenger/apps/mobile/app/hooks/useFriends.ts) - друзья, заявки и подписки на их изменения;
- [`useSecretChat.ts`](/d:/ararat/vs/messenger/apps/mobile/app/hooks/useSecretChat.ts) - загрузка secret chat, ключей, сообщений и подписок;
- [`useGroupChats.ts`](/d:/ararat/vs/messenger/apps/mobile/app/components/screens/chats-list/useGroupChats.ts) - чаты группы, pinned chat и reorder;
- [`useChatSettings.ts`](/d:/ararat/vs/messenger/apps/mobile/app/components/screens/chat-settings/useChatSettings.ts) - права, участники и настройки чата;
- [`useGroupSettings.ts`](/d:/ararat/vs/messenger/apps/mobile/app/components/screens/group-settings/useGroupSettings.ts) - управление группой;
- [`useTypingIndicator.ts`](/d:/ararat/vs/messenger/apps/mobile/app/hooks/useTypingIndicator.ts) - индикатор печати.

## Экранная карта

Ниже кратко описано назначение основных экранов.

### `Auth`

Экран авторизации и регистрации:

- переключение между login и sign up;
- отправка логина/регистрации через GraphQL;
- отдельный TOTP step при ответе сервера, что код обязателен;
- генерация и отправка pre-key после успешного входа.

### `Home`

- отображение списка друзей и заявок;
- быстрые действия;
- открытие sidebar с группами;
- переход в DM.

### `ChatsList`

- список чатов выбранной группы;
- pinned/unpinned секции;
- drag-and-drop закреплённых чатов;
- создание нового чата, если позволяют права.

### `Chat`

- определяет, обычный это чат или секретный;
- маршрутизирует в `DefaultChat` или `SecretChat`.

### `ChatSettings`

- редактирование чата;
- управление ролями;
- управление участниками;
- удаление чата или выход из него;
- переключатель `requireTotp` для secret chat.

### `GroupSettings`

- редактирование группы;
- роли и права;
- приглашение и удаление участников;
- удаление группы.

### `UserSettings`

- профиль;
- тема;
- язык;
- TOTP;
- сессии.

## Технологический стек

### Базовый стек

- `Expo 51`;
- `React 18`;
- `React Native 0.74`;
- `TypeScript`.

### Данные и состояние

- `@apollo/client`;
- `subscriptions-transport-ws`;
- `apollo-upload-client`;
- `Zustand`;
- `AsyncStorage`;
- `expo-secure-store`.

### Формы и валидация

- `react-hook-form`;
- `zod`-style схемы в локальных `schemas`;
- `@hookform/resolvers`.

### UI и стили

- `nativewind`;
- `tailwindcss`;
- `tailwind-merge`;
- `class-variance-authority`;
- `lucide-react-native`;
- `react-native-toast-message`.

### Device/native возможности

- `expo-document-picker`;
- `expo-image-picker`;
- `expo-file-system`;
- `expo-media-library`;
- `expo-sharing`;
- `expo-clipboard`;
- `expo-splash-screen`.

### Криптография

- `gost-crypto`;
- `crypto-gost`.

## Конфигурация и переменные окружения

Мобильный клиент ожидает значения из `.env`, которые затем прокидываются в Expo config через [`app.config.js`](/d:/ararat/vs/messenger/apps/mobile/app.config.js).

Используются следующие переменные:

- `BASE_URL` - базовый хост backend без протокола, используется для сборки `SERVER_URL` и `WEBSOCKET_URL`;
- `EXPO_PUBLIC_MEDIA_URL` - базовый URL медиа-файлов;
- `EXPO_PUBLIC_SERVER_URL` - используется в `graphql.config.ts` для codegen schema.

Пример:

```env
BASE_URL=192.168.0.10
EXPO_PUBLIC_MEDIA_URL=http://192.168.0.10:4000/uploads
EXPO_PUBLIC_SERVER_URL=http://192.168.0.10:4000/graphql
```

На основе `BASE_URL` приложение формирует:

```txt
SERVER_URL=http://<BASE_URL>:4000/graphql
WEBSOCKET_URL=ws://<BASE_URL>:4000/graphql
```

Для реального устройства это должен быть доступный по сети адрес машины, где запущен backend. `localhost` подойдёт только для эмулятора/специально настроенного окружения.

## Установка и запуск

### Требования

- Node.js;
- Yarn 1.x;
- Expo CLI через `npx expo`;
- запущенный backend с GraphQL API;
- при необходимости Android Studio / Xcode / Expo Go.

### Установка зависимостей

```bash
cd apps/mobile
yarn install
```

### Запуск в dev-режиме

```bash
yarn start
```

Команда делает две вещи:

1. генерирует GraphQL типы через `graphql-codegen`;
2. запускает Expo dev server.

Дополнительные команды:

```bash
yarn android
yarn ios
yarn web
```

## GraphQL Codegen

Конфигурация находится в [`graphql.config.ts`](/d:/ararat/vs/messenger/apps/mobile/graphql.config.ts).

Codegen:

- берёт схему с `process.env.EXPO_PUBLIC_SERVER_URL` или `http://localhost:4000/graphql`;
- читает документы из `./app/graphql/**/*.graphql`;
- генерирует TypeScript типы и React Apollo hooks в `./app/graphql/generated/output.ts`.

Если backend недоступен, генерация типов перед запуском приложения завершится ошибкой.

## Тесты

В проекте настроен `Jest` через [`jest.config.js`](/d:/ararat/vs/messenger/apps/mobile/jest.config.js).

Сейчас тестами покрыты в основном utility-функции:

- форматирование размеров;
- преобразование цены;
- сравнение списков;
- media helper;
- store настроек.

Команды:

```bash
yarn test
yarn test:watch
```

Это не полный e2e-набор для мобильного клиента, а точечные unit-тесты на вспомогательную логику.

## Конфигурационные файлы

- [`package.json`](/d:/ararat/vs/messenger/apps/mobile/package.json) - зависимости и команды;
- [`app.config.js`](/d:/ararat/vs/messenger/apps/mobile/app.config.js) - Expo config и env binding;
- [`babel.config.js`](/d:/ararat/vs/messenger/apps/mobile/babel.config.js) - Babel, NativeWind, dotenv, reanimated;
- [`metro.config.js`](/d:/ararat/vs/messenger/apps/mobile/metro.config.js) - alias для `gostEngine`;
- [`tailwind.config.js`](/d:/ararat/vs/messenger/apps/mobile/tailwind.config.js) - токены цветов и тема;
- [`tsconfig.json`](/d:/ararat/vs/messenger/apps/mobile/tsconfig.json) - TypeScript config и alias `@/*`.

## Что важно учитывать при разработке

### 1. Mobile-клиент сильно зависит от backend

Без доступного GraphQL API не будут работать:

- авторизация;
- codegen;
- subscriptions;
- friends/groups/chats flow;
- TOTP;
- отправка и получение сообщений.

### 2. Secret chat зависит и от сервера, и от локального состояния

Даже если backend работает, secret chat требует корректного состояния на устройстве:

- pre-key пользователя;
- локальный session key;
- файловое хранилище чата;
- актуальные подписки на secret-события.

### 3. Есть логика, отличающаяся для DM и group chat

Это особенно заметно в:

- `useSecretChat`;
- `ChatSettings`;
- сценариях приглашения участников;
- распределении общего ключа и ротации ключей.

### 4. Часть интерфейса уже адаптирована под мобильные сценарии

Например:

- drag-and-drop для pinned chats;
- modal/action-sheet flow для создания и управления сущностями;
- Safe Area и keyboard handling;
- skeleton-компоненты для загрузки экранов.

## Текущее состояние мобильной версии

По текущему коду мобильный клиент уже покрывает значительную часть продуктовой логики:

- auth;
- profile;
- friends;
- groups;
- chats;
- messages;
- roles/permissions;
- TOTP;
- secret chat;
- real-time события.

При этом проект всё ещё выглядит как активно развиваемый mobile-клиент:

- часть UI и переводов хранится прямо в коде;
- есть закомментированные элементы навигации и меню;
- тестовое покрытие ограничено util-слоем;
- есть смешение разных подходов к хранению токенов и локальных crypto-данных, что стоит учитывать при дальнейшем рефакторинге.

## Краткий итог

`apps/mobile` - не просто "облегчённая версия" web-клиента, а отдельное React Native приложение с собственным UX, своим жизненным циклом сессии, локальным хранилищем, GraphQL subscriptions и сложной реализацией secret chat на базе GOST-криптографии.

Если использовать этот README как входную точку для разработчика, то начинать лучше в таком порядке:

1. [`App.tsx`](/d:/ararat/vs/messenger/apps/mobile/App.tsx)
2. [`app/navigation/routes.ts`](/d:/ararat/vs/messenger/apps/mobile/app/navigation/routes.ts)
3. [`app/libs/apollo-client.ts`](/d:/ararat/vs/messenger/apps/mobile/app/libs/apollo-client.ts)
4. [`app/providers/auth/AuthProvider.tsx`](/d:/ararat/vs/messenger/apps/mobile/app/providers/auth/AuthProvider.tsx)
5. [`app/components/screens`](/d:/ararat/vs/messenger/apps/mobile/app/components/screens)
6. [`app/hooks/useSecretChat.ts`](/d:/ararat/vs/messenger/apps/mobile/app/hooks/useSecretChat.ts)
