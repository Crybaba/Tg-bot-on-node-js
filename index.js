const TelegramBot = require('node-telegram-bot-api');
const token = '7488860731:AAEOQIjOx720ea2zprp9Ymix5l-DnifQ2ws';
const mysql = require('mysql2');

// bot link https://t.me/oktagon_test_bot

const bot = new TelegramBot(token, { polling: true });

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    database: "chatbottests",
    password: "",
    charset: "UTF8_GENERAL_CI"
});

connection.connect(err => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        return;
    }
    console.log('Соединение с базой данных установлено.');
});

const keyboard = [
    [{ text: '/help' }],
    [{ text: '/site' }],
    [{ text: '/creator' }],
    [{ text: '/randomItem' }],
    [{ text: '/deleteItem' }],
    [{ text: '/getItemByID' }]
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
- /randomItem - возвращает случайный предмет из БД
- /deleteItem - удаляет предмет из БД по ID
- /getItemByID - возвращает предмет из БД по ID
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

// Команда /randomItem возвращает случайный предмет из БД
bot.onText(/\/randomItem/, (msg) => {
    const chatId = msg.chat.id;
    connection.query('SELECT * FROM test ORDER BY RAND() LIMIT 1', (error, results) => {
        if (error) {
            console.error('Ошибка при выполнении запроса:', error);
            bot.sendMessage(chatId, 'Ошибка при получении случайного предмета.', options);
            return;
        }

        if (results.length > 0) {
            const item = results[0];
            console.log('Полученный предмет:', item);
            bot.sendMessage(chatId, `(${item.id}) - ${item.name}: ${item.desc}`, options);
        } else {
            bot.sendMessage(chatId, 'Нет предметов в базе данных.', options);
        }
    });
});

// Команда /deleteItem отправляет запрос на ввод ID
bot.onText(/\/deleteItem/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Введите ID предмета для удаления:', options);
});

// Команда /getItemByID отправляет запрос на ввод ID
bot.onText(/\/getItemByID/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Введите ID предмета для получения:', options);
});

// Обработка ввода ID для команд /getItemByID и /deleteItem
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Если сообщение начинается с цифры, предполагаем, что это ID
    if (/^\d+$/.test(text)) {
        const itemId = parseInt(text, 10);

        // Обработка получения предмета по ID
        if (bot.lastCommand === '/getItemByID') {
            connection.query('SELECT * FROM test WHERE ID = ?', [itemId], (error, results) => {
                if (error) {
                    console.error('Ошибка при выполнении запроса:', error);
                    bot.sendMessage(chatId, 'Ошибка при получении предмета.', options);
                    return;
                }

                if (results.length > 0) {
                    const item = results[0];
                    console.log('Полученный предмет:', item);
                    bot.sendMessage(chatId, `(${item.id}) - ${item.name}: ${item.desc}`, options);
                } else {
                    bot.sendMessage(chatId, 'Предмета с таким ID не существует.', options);
                }
            });
        }

        // Обработка удаления предмета по ID
        if (bot.lastCommand === '/deleteItem') {
            connection.query('DELETE FROM test WHERE ID = ?', [itemId], (error, results) => {
                if (error) {
                    console.error('Ошибка при выполнении запроса:', error);
                    bot.sendMessage(chatId, 'Ошибка при удалении предмета.', options);
                    return;
                }

                if (results.affectedRows > 0) {
                    bot.sendMessage(chatId, 'Удачно.', options);
                } else {
                    bot.sendMessage(chatId, 'Ошибка: предмета с таким ID не существует.', options);
                }
            });
        }
    } else if (!msg.text.startsWith('/')) {
        // Если сообщение не является командой и не числом (ID)
        bot.sendMessage(chatId, 'Ошибка. Введите команду или корректный ID.', options);
    }
});

// Запоминаем последнюю команду для корректной обработки ID
bot.on('message', (msg) => {
    if (msg.text.startsWith('/getItemByID') || msg.text.startsWith('/deleteItem')) {
        bot.lastCommand = msg.text.split(' ')[0];
    }
});
