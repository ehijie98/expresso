const express = require('express');
const employeeRouter = express.Router();
const db = require('./db');

module.exports = employeeRouter;

employeeRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Employee WHERE Employee.is_current_employee = 1`, 
        (err, employees) => {
            if (err) {
                next(err);
            } else { 
                res.status(200).json({employees: employees});
            }
        });
});