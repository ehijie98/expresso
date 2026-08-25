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
        handleDbError(res, err, menuItems, next, {key: 'menuItems'});
    });
});

menuItemRouter.post('/', (req, res, next) => {
    const menuItem = req.body.menuItem;
    const name = menuItem.name;
    const description = menuItem.description;
    const inventory = menuItem.inventory;
    const price = menuItem.price;
    const menuId = req.params.menuId;

    if (!name || !inventory || !price ) {
        return res.sendStatus(400);
    };

    const menuSql = `SELECT * FROM Menu WHERE Menu.id = $menuId`;
    const menuValues = {$menuId: menuId};
    
    db.get(menuSql, menuValues, (err, menu) => {
        if (err) {
            next(err);
        } else {
            if (!menu) {
                return res.sendStatus(404);
            }
            
            const sql = `INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES 
            ($name, $description, $inventory, $price, $menuId)`;
            const values = {
                $name: name,
                $description: description,
                $inventory: inventory,
                $price: price,
                $menuId: menuId
            };

            db.run(sql, values, function(err) {
                if (err) {
                    next(err);
                } else {
                    db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`, 
                        (err, menuItem) => {
                            handleDbError(res, err, menuItem, next, {key: 'menuItem', status: 201});
                        }
                    );
                }
            });
        }
    });
});

menuItemRouter.param('menuItemId', (req, res, next, menuItemId) => {
    const sql = `SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId`;
    const values = {$menuItemId: menuItemId};

    db.get(sql, values, (err, menuItem) => {
        if (err) {
            next(err);
        } else if (menuItem) {
            req.menuItem = menuItem;
            next();
        } else {
            return res.sendStatus(404);
        }
    });
});

menuItemRouter.put('/:menuItemId', (req, res, next) => {
    const menuItem = req.body.menuItem;
    const name = menuItem.name;
    const description = menuItem.description;
    const inventory = menuItem.inventory;
    const price = menuItem.price;
    const menuId = req.params.menuId;

    if (!name || !inventory || !price) {
        return res.sendStatus(400);
    };

    if (req.menuItem.menu_id !== Number(menuId)) {
        return res.sendStatus(404);
    };

    const sql = `UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price
    WHERE MenuItem.id = $menuItemId`;
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuItemId: req.params.menuItemId
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`, 
                (err, menuItem) => {
                    res.status(200).json({menuItem: menuItem});
                }
            );
        }
    });
});

module.exports = menuItemRouter;