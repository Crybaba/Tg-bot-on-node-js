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
    
    const numberA = parseFloat(a);
    const numberB = parseFloat(b);
    const numberC = parseFloat(c);

    if (isNaN(numberA) || isNaN(numberB) || isNaN(numberC)) {
        
        const jsonResponse = {
            header: "Error"
        };
        res.json(jsonResponse);
    } 
    
    else {
  
        const result = (numberA * numberB * numberC) / 3;
        const jsonResponse = {
            header: "Calculated",
            body: result.toString()
        };
        res.json(jsonResponse);
    }
});


app.listen(3000, () => {
    console.log(`Сервер начал прослушивание запросов на порту 3000`);
});
