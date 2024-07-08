const express = require("express");
const mysql = require('mysql2');

const port = 3000;
const app = express();

app.use(express.json()); // Для обработки JSON в теле запроса

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    database: "chatbottests",
    password: "",
    charset: "UTF8_GENERAL_CI"
});

// Подключение к базе данных
connection.connect(function(err) {
    if (err) {
        return console.error("Error: " + err.message);
    } else {
        console.log("Подключение к серверу MySQL успешно установлено");
    }
});

// Маршрут для получения всех элементов
app.get('/getAllItems', (req, res) => {
    connection.query('SELECT * FROM test', (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// Маршрут для добавления нового элемента
app.post('/addItem', (req, res) => {
    const { name, desc } = req.body; // Получаем параметры из тела запроса
    if (!name || !desc) {
        return res.json(null); // Возвращаем null при неправильных параметрах
    }
    const query = 'INSERT INTO test (name, `desc`) VALUES (?, ?)';
    connection.query(query, [name, desc], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json({ id: results.insertId, name, desc });
    });
});

// Маршрут для удаления элемента
app.post('/deleteItem', (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.json(null); // Возвращаем null при неправильных параметрах
    }
    const query = 'DELETE FROM test WHERE id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.affectedRows === 0) {
            return res.json({}); // Возвращаем пустой объект, если элемент не найден
        }
        res.json({ message: `Item with ID ${id} deleted` });
    });
});

// Маршрут для обновления элемента
app.post('/updateItem', (req, res) => {
    const { id, name, desc } = req.body;
    if (!id || !name || !desc) {
        return res.json(null); // Возвращаем null при неправильных параметрах
    }
    const query = 'UPDATE test SET name = ?, `desc` = ? WHERE id = ?';
    connection.query(query, [name, desc, id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.affectedRows === 0) {
            return res.json({}); // Возвращаем пустой объект, если элемент не найден
        }
        res.json({ id, name, desc });
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер начал прослушивание запросов на http://localhost:${port}`);
});
