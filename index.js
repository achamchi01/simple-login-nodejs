const express = require("express");
const mysql = require('mysql');
var cors = require('cors');

const bcrypt = require('bcrypt');
const saltRounds = 10;

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

    bcrypt.hash(password, saltRounds, (err, hash)=>{
        if(err) console.log(err);
        else{
            db.query("Insert INTO users (username, password) values(?, ?)", [username, hash],
            (err, result) => {
                console.log(err);
            });
        }
    })


});

app.post('/login', (req, res) => {
 
    const username = req.body.username;
    const password = req.body.password;

    db.query("SELECT `id`, `username`, `password` FROM `users` WHERE username = ?", [username],
        (err, result) => {
            if (err) res.send({ err });

            if (result.length > 0){
                bcrypt.compare(password, result[0].password, (err, response)=>{
                    if(response) res.send(result)
                    else res.send({ message: "Wrong username/password combination" });
                })
                // res.send(result);
            }
            else res.send({ message: "User doesn't exist!" });
        });
});

app.listen(3001, () => {
    console.log("runing server")
})
