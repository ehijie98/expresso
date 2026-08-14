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

employeeRouter.post('/', (req, res, next) => {
    const employee = req.body.employee;
    const name = employee.name;
    const position = employee.position;
    const wage = employee.wage;
    const is_current_employee = employee.is_current_employee === 0 ? 0 : 1;

    if (!employee || !name || !position || !wage) {
        return res.sendStatus(400);
    } 

    const sql = `INSERT INTO Employee (name, position, wage, is_current_employee) 
                VALUES ($name, $position, $wage, $isCurrentEmployee)`;
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: is_current_employee
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`,
                (err, employee) => {
                    res.status(201).json({employee: employee});
                }
            );
        }
    });
});