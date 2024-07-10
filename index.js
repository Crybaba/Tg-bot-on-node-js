const express = require("express");
const app = express();
app.use(express.json());

app.get("/static", (req, res) => {
    const jsonResponse = {
        header: "Hello",
        body: "Octagon NodeJS Test"
    };
    res.json(jsonResponse);
});

app.get("/dynamic", (req, res) => {
    const { a, b, c } = req.query;
    const values = [a, b, c];
    const numbers = values.map(value => parseFloat(value));

    for (let number of numbers) {
        if (isNaN(number)) {
            return res.json({ header: "Error" });
        }
    }

    const result = numbers.reduce((acc, number) => acc * number) / 3;
    res.json({
        header: "Calculated",
        body: result.toString()
    });
});


app.listen(3000, () => {
    console.log(`Сервер начал прослушивание запросов на порту 3000`);
});
