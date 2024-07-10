const TelegramBot = require('node-telegram-bot-api');
const token = '7488860731:AAEOQIjOx720ea2zprp9Ymix5l-DnifQ2ws';

//bot link https://t.me/oktagon_test_bot

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    bot.sendMessage(chatId, resp);
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привет, Октагон!');
});
