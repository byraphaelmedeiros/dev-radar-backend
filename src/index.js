const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');

const routes = require('./routes');
const { setupWebsocket } = require('./websocket');

const app = express();
const server = http.Server(app);

setupWebsocket(server);

// MongoDB (nao-relacional)
mongoose.connect('mongodb+srv://omnistack:57kWB0JjoWrMWPsP@cluster0-5pqqx.mongodb.net/week10?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
})

app.use(cors());
app.use(express.json()); // deve ser ANTES das rotas
app.use(routes);

server.listen(3333);