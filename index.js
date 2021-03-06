const express = require("express");
const mysql = require('mysql');
const cors = require('cors');

const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const session = require("express-session");

const bcrypt = require('bcrypt');
const saltRounds = 10;

const jwt = require("jsonwebtoken");
const jwtSecret = "jwbtsecret"

const app = express();

app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    key: "userId",
    secret: "subscribe",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24
    }
}));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "mysql",
    database: "loginSystem"
});

app.post('/register', (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) console.log(err);
        else {
            db.query("Insert INTO users (username, password) values(?, ?)", [username, hash],
                (err, result) => {
                    console.log(err);
                });
        }
    })


});

const verifyJWT = (req, res, next)=>{
    const token = req.headers["x-access-token"];
    if(!token){
        res.send("We need a token!");
    }else {
        jwt.verify(token, jwtSecret, (err, decoded)=>{
            if(err){
                res.json({auth: false, message: "Your faild to authenticated"})
            }else{
                req.userId = decoded.id;
                next();
            }
        })
    }
}

app.get('/isUserAuth', verifyJWT, (req, res)=>{
    res.send("You are authenticated!");
});

app.get("/login", (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user })
    } else {
        res.send({ loggedIn: false });
    }
})

app.post('/login', (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    db.query("SELECT `id`, `username`, `password` FROM `users` WHERE username = ?", [username],
        (err, result) => {
            if (err) res.send({ err });

            if (result.length > 0) {
                bcrypt.compare(password, result[0].password, (err, response) => {
                    if (response) {

                        const id = result[0].id;
                        const token = jwt.sign({ id }, jwtSecret, {
                            expiresIn: 300
                        });

                        req.session.user = result;

                        res.json({ auth: true, token, result });
                    }
                    else res.json({ auth: false, message: "Wrong username/password combination" });
                })
                // res.send(result);
            }
            else res.json({ auth: false, message: "no user exist" });
        });
});

app.listen(3001, () => {
    console.log("runing server")
})
