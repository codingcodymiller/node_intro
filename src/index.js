/* eslint-disable no-console linebreak-style */

// DEFAULT NODE SERVER SETUP
// const http = require('http');
// const hostname = '127.0.0.1';
// const port = 3000;
// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello World\n');
// });
// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

const Todo = require('./Todo');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const jwt = require('jwt-simple');
const express = require('express');
const PORT = 8888;
const ADMIN = 'admin';
const ADMIN_PASSWORD = 'password';
const SECRET = 'mysecret';

const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('cache-control', 'private, max-age=0, no-cache, no-store, must-revalidate');
    res.setHeader('expires', '0');
    res.setHeader('pragma', 'no-cache');
    next();
});

passport.use(new LocalStrategy((username, password, done) => {
    if(username === ADMIN && password === ADMIN_PASSWORD){
        done(null, jwt.encode({ username }, SECRET));
        return;
    }
    done(null, false);
}))

passport.use(new BearerStrategy((token, done) => {
    try {
      const { username } = jwt.decode(token, SECRET);
      if (username === ADMIN) {
        done(null, username);
        return;
      }
      done(null, false);
    } catch (error) {
      done(null, false);
    }
  }));

app.post('/login', passport.authenticate('local', { session: false }),
    (req, res) => {
        res.send({
            token: req.user,
        })
    }
)

app.get('/todos',
    passport.authenticate('bearer', { session: false }),
    (_, res) => {
        Todo.findAll().then((todos) => {
            res.send(todos);
        })
})

app.post('/todos',
    passport.authenticate('bearer', { session: false }),
    (req, res) => {
        Todos.create({ note: req.body.note })
            .then((todo) => {
                res.send(todo);
            })
})

app.delete('/todos/:id',
    passport.authenticate('bearer', { session: false }),
    (req, res) => {
        Todo.findById(req.param.id)
            .then(todo => todo.destroy())
            .then(() => res.send())
})

app.listen(PORT, () => {
    console.log(`Example app running on port ${PORT}!`);
})
