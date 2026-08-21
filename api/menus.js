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

menuRouter.post('/', (req, res, next) => {
    const menu = req.body.menu;
    const title = menu.title;

    if (!title) {
        res.sendStatus(400);
    };

    const sql = `INSERT INTO Menu (title) VALUES ($title)`;
    const values = {$title: title};

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, 
                (err, menu) => {
                    handleDbError(res, err, menu, next, {key: 'menu', status: 201});
                })
        }
    })
})

module.exports = menuRouter