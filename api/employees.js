const express = require('express');
const employeeRouter = express.Router();
const db = require('./db');
const handleDbError = require('./handleDbError');
const timesheetRouter = require('./timesheets');


employeeRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Employee WHERE Employee.is_current_employee = 1`, 
        (err, employees) => {
            handleDbError(res, err, employees, next, {key: 'employees', status: 201});
        });
});

employeeRouter.post('/', (req, res, next) => {
    const employee = req.body.employee;
    const name = employee.name;
    const position = employee.position;
    const wage = employee.wage;
    const isCurrentEmployee = employee.isCurrentEmployee === 0 ? 0 : 1;

    if (!employee || !name || !position || !wage) {
        return res.sendStatus(400);
    } 

    const sql = `INSERT INTO Employee (name, position, wage, is_current_employee) 
                VALUES ($name, $position, $wage, $isCurrentEmployee)`;
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`,
                (err, employee) => {
                    handleDbError(res, err, employee, next, {key: 'employee', status: 200});
                }
            );
        }
    });
});

employeeRouter.param('employeeId', (req, res, next, employeeId) => {
    const sql = `SELECT * FROM Employee WHERE id = $employeeId`;
    const values = {$employeeId: employeeId};
    db.get(sql, values, (err, employee) => {
        if (err) {
            next(err);
        } else if (employee) {
            req.employee = employee;
            next();
        } else {
            return res.sendStatus(404);
        }
    });
});

employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

employeeRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({employee: req.employee});
})

employeeRouter.put('/:employeeId', (req, res, next) => {
    const employee = req.body.employee;
    const name = employee.name;
    const position = employee.position;
    const wage = employee.wage;
    const isCurrentEmployee = employee.isCurrentEmployee === 0 ? 0 : 1;

    if (!name || !position || !wage) {
        return res.sendStatus(400);
    }

    const sql = `UPDATE Employee SET name = $name,
    position = $position,
    wage = $wage,
    is_current_employee = $isCurrentEmployee
    WHERE id = $employeeId`;
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee,
        $employeeId: req.params.employeeId
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        }
        db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`,
            (err, employee) => {
                handleDbError(res, err, employee, next, {key: 'employee'});
            }
        );
    });
});

employeeRouter.delete('/:employeeId', (req, res, next) => {
    const sql = `UPDATE Employee SET is_current_employee = 0 WHERE id = $employeeId`;
    const values = {$employeeId: req.params.employeeId};

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`,
                (err, employee) => {
                    handleDbError(res, err, employee, next, {key: 'employee'});
                }
            );
        }
    });
});



module.exports = employeeRouter;