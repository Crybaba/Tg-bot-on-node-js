process.env.NTBA_FIX_350 = 1;

const TelegramBot = require('node-telegram-bot-api');
const token = '7488860731:AAEOQIjOx720ea2zprp9Ymix5l-DnifQ2ws'; // Replace with your bot token
const mysql = require('mysql2');
const QRCode = require('qrcode');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

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
    [{ text: '/getItemByID' }],
    [{ text: '!qr' }],
    [{ text: '!webscr' }]
];

const options = {
    reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true
    }
};

const userContext = {};

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
- !qr - генерирует QR код по тексту или ссылке
- !webscr - возвращает скриншот сайта по веб-адресу
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
    userContext[chatId] = { command: '/deleteItem' };
    bot.sendMessage(chatId, 'Введите ID предмета для удаления:', options);
});

// Команда /getItemByID отправляет запрос на ввод ID
bot.onText(/\/getItemByID/, (msg) => {
    const chatId = msg.chat.id;
    userContext[chatId] = { command: '/getItemByID' };
    bot.sendMessage(chatId, 'Введите ID предмета для получения:', options);
});

// Команда !qr отправляет запрос на ввод текста или ссылки
bot.onText(/!qr/, (msg) => {
    const chatId = msg.chat.id;
    userContext[chatId] = { command: '!qr' };
    bot.sendMessage(chatId, 'Введите текст или ссылку для генерации QR-кода:', options);
});

// Команда !webscr отправляет запрос на ввод веб-адреса
bot.onText(/!webscr/, (msg) => {
    const chatId = msg.chat.id;
    userContext[chatId] = { command: '!webscr' };
    bot.sendMessage(chatId, 'Введите веб-адрес для получения скриншота:', options);
});

// Обработка сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Пропускаем сообщения, которые являются командами
    if (text.startsWith('/') || text.startsWith('!')) return;

    if (userContext[chatId] && userContext[chatId].command) {
        const command = userContext[chatId].command;

        if (command === '/getItemByID' || command === '/deleteItem') {
            const itemId = parseInt(text, 10);

            if (isNaN(itemId)) {
                bot.sendMessage(chatId, 'Некорректный ID. Попробуйте снова.', options);
                return;
            }

            if (command === '/getItemByID') {
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

            if (command === '/deleteItem') {
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
        } else if (command === '!qr') {
            QRCode.toFile(`qr-${chatId}.png`, text, {
                color: {
                    dark: '#000',  // Цвет самого QR
                    light: '#FFF'  // Цвет фона
                }
            }, (err) => {
                if (err) {
                    console.error('Ошибка при создании QR-кода:', err);
                    bot.sendMessage(chatId, 'Ошибка при создании QR-кода.', options);
                    return;
                }
                bot.sendPhoto(chatId, `qr-${chatId}.png`, { caption: 'Ваш QR-код', contentType: 'image/png' }, options)
                    .then(() => {
                        fs.unlinkSync(`qr-${chatId}.png`); // Delete the file after sending
                    });
            });
        } else if (command === '!webscr') {
            const url = text;
            (async () => {
                try {
                    const browser = await puppeteer.launch();
                    const page = await browser.newPage();
                    await page.goto(url, { waitUntil: 'networkidle2' });
                    const screenshotPath = `screenshot-${chatId}.png`;
                    await page.screenshot({ path: screenshotPath, fullPage: true });
                    await browser.close();

                    bot.sendPhoto(chatId, screenshotPath, { caption: 'Ваш скриншот', contentType: 'image/png' }, options)
                        .then(() => {
                            fs.unlinkSync(screenshotPath); // Delete the file after sending
                        });
                } catch (error) {
                    console.error('Ошибка при создании скриншота:', error);
                    bot.sendMessage(chatId, 'Ошибка при создании скриншота.', options);
                }
            })();
        }

        delete userContext[chatId];
    } else if (!text.startsWith('/')) {
        bot.sendMessage(chatId, 'Ошибка. Введите команду или корректный ID.', options);
    }
});