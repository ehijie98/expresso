const express = require('express');
const menuRouter = express.Router();
const db = require('./db');
const handleDbError = require('./handleDbError');
const menuItemRouter = require('./menuItem');

menuRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Menu`, (err, menus) => {
        handleDbError(res, err, menus, next, {key: 'menus', status: 200});
    });
});

menuRouter.post('/', (req, res, next) => {
    const menu = req.body.menu;
    const title = menu.title;

    if (!title) {
        return res.sendStatus(400);
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
                });
        }
    });
});

menuRouter.param('menuId', (req, res, next, menuId) => {
    const sql = `SELECT * FROM Menu WHERE Menu.id = $menuId`;
    const values = {$menuId: menuId};

    db.get(sql, values, (err, menu) => {
        if (err) {
            next(err);
        } else if (menu) {
            req.menu = menu;
            next();
        } else {
            return res.sendStatus(404);
        }
    });
});

menuRouter.use('/:menuId/menu-items', menuItemRouter);

menuRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});
});

menuRouter.put('/:menuId', (req, res, next) => {
    const menu = req.body.menu;
    const title = menu.title;

    if (!title) {
        return res.sendStatus(400);
    }

    const sql = `UPDATE Menu SET title = $title WHERE Menu.id = $menuId`;
    const values = {
        $title: title,
        $menuId: req.params.menuId
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
                (err, menu) => {
                    handleDbError(res, err, menu, next, {key: 'menu'});
                }
            );
        }
    });
});

menuRouter.delete('/:menuId', (req, res, next) => {
    const menuItemSql = `SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId`
    const menuItemValues = {$menuId: req.params.menuId};
    
    db.get(menuItemSql, menuItemValues, (err, menuItem) => {
        if (err) {
            next(err)        
        } else if (menuItem) {
            res.sendStatus(400)
        } else {
            const sql = `DELETE FROM Menu WHERE Menu.id = $menuId`;
            const values = {$menuId: req.params.menuId};

            db.run(sql, values, function(err) {
                if (err) {
                    next(err);
                } else {
                    res.sendStatus(204);
                }
            });
        }
    });
});

module.exports = menuRouter;