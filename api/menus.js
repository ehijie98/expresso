const express = require('express');
const menuRouter = express.Router();
const db = require('./db');
const handleDbError = require('./handleDbError');

menuRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Menu`, (err, menus) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({menus: menus});
        }
    });
});

module.exports = menuRouter