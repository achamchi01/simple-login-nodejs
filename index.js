const express = require("express");
const mysql = require('mysql');
var cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "mysql",
    database: "loginSystem"
});

app.post('/register', (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    db.query("Insert INTO users (username, password) values(?, ?)", [username, password],
        (err, result) => {
            console.log(err);
        });
});

app.post('/login', (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    db.query("SELECT `id`, `username`, `password` FROM `users` WHERE username = ? and password = ?", [username, password],
        (err, result) => {
            if (err) res.send({ err });

            if (result.length > 0) res.send(result);
            else res.send({ message: "Wrong username/password combination" });
        });
});

app.listen(3001, () => {
    console.log("runing server")
})
