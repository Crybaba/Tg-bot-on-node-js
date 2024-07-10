const TelegramBot = require('node-telegram-bot-api');
const token = '7488860731:AAEOQIjOx720ea2zprp9Ymix5l-DnifQ2ws';

// bot link https://t.me/oktagon_test_bot

const bot = new TelegramBot(token, {polling: true});

// Определяем клавиатуру
const keyboard = [
    [{ text: '/help' }],
    [{ text: '/site' }],
    [{ text: '/creator' }]
];

const options = {
    reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true
    }
};

// Команда /start для начала работы с ботом и отображения меню
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = 'Добро пожаловать! Выберите команду из меню:';
    bot.sendMessage(chatId, welcomeMessage, options);
});

// Команда /help возвращает список доступных команд с их описанием
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
Доступные команды:
- /help - возвращает список команд с их описанием
- /site - отправляет в чат ссылку на сайт Октагона
- /creator - ФИО автора
    `;
    bot.sendMessage(chatId, helpMessage, options);
});

// Команда /site отправляет в чат ссылку на сайт
bot.onText(/\/site/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'https://students.forus.ru/', options);
});

// Команда /creator отправляет в чат информацию о создателе
bot.onText(/\/creator/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Starkov Alexander Sergeevich', options);
});

// Обработка всех остальных сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // Если сообщение является командой, не реагируем
    if (msg.text.startsWith('/')) {
        return;
    }

    bot.sendMessage(chatId, 'Привет, Октагон!', options);
});
