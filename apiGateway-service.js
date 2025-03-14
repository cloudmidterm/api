const express = require('express');
const app = express()

const httpProxy = require('http-proxy')
const proxy = httpProxy.createProxyServer();

const jwt = require('jsonwebtoken')
require('dotenv').config()
const JWT_SECRETE = process.env.JWT_SECRETE;

const port = 5010;


app.get("/", (req, res) => {
    console.log("API Gateway is running..")
    return res.send("API Gateway is running..")
})

function authToken(req, res, next) {
    console.log(req.headers.authorization)
    const header = req?.headers.authorization;
    const token = header && header.split(' ')[1];

    if (token == null) return res.status(401).json("Please send token");

    jwt.verify(token, JWT_SECRETE, (err, user) => {
        if (err) return res.status(403).json("Invalid token", err);
        req.user = user;
        next()
    })
}

function authRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json("Unauthorized");
        }
        next();
    }
}

// app.use('/reg', (req, res) => {
//     console.log("INSIDE API GATEWAY AUTHENTICATION/LOGIN")
//     proxy.web(req, res, { target: 'http://localhost:5000' });
// })

// app.use('/login', (req, res) => {
//     console.log("INSIDE API GATEWAY AUTHENTICATION/LOGIN")
//     proxy.web(req, res, { target: 'http://localhost:5002' });
// })

app.use('/viewMenu', authToken, authRole('user'), (req, res) => {
    console.log("INSIDE API GATEWAY ORDER VIEW");
    proxy.web(req, res, { target: 'http://44.202.102.74:5004' });
});


app.use('/placeOrder', authToken, authRole('user'), (req, res) => {
    proxy.web(req, res, { target: 'http://44.202.102.74:5006' });
})

app.use('/addMenu', authToken, authRole('restaurant'), (req, res) => {
    proxy.web(req, res, { target: 'http://44.202.102.74:5003' });
})

app.use('/removeMenu', authToken, authRole('restaurant'), (req, res) => {
    proxy.web(req, res, { target: 'http://44.202.102.74:5005' });
})

app.use('/viewOrder', authToken, authRole('restaurant'), (req, res) => {
    console.log("INSIDE API GATEWAY VIEW ORDER");
    proxy.web(req, res, { target: 'http://44.202.102.74:5008' });
});


app.use('/acceptOrder/:orderId', authToken, authRole('restaurant'), (req, res) => {
    proxy.web(req, res, { target: 'http://44.202.102.74:5007' });
})

app.listen(port, () => {
    console.log("API Gateway Service is running on PORT NO : ", port)
})