const express = require('express');
const menuItemRouter = express.Router({mergeParams: true});
const db = require('./db');
const handleDbError = require('./handleDbError');

menuItemRouter.get('/', (req, res, next) => {
    const sql = `SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId`;
    const values = {
        $menuId: req.params.menuId
    };

    db.all(sql, values, (err, menuItems) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({menuItems: menuItems});
        }
    });
});

module.exports = menuItemRouter;