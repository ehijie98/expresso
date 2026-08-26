const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('errorhandler');
const express = require('express');
const morgan = require('morgan');
const apiRouter = require('./api/api');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));


app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname, { index: false }));
;
app.use('/api', apiRouter);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(errorHandler());

module.exports = app;