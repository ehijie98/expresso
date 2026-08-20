const express = require('express');
const timesheetRouter = express.Router({mergeParams: true});
const db = require('./db');
const handleDbError = require('./handleDbError');

timesheetRouter.get('/', (req, res, next) => {
   const sql = `SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId`;
   const values = {$employeeId: req.params.employeeId};

   db.all(sql, values, (err, timesheets) => {
    if (err) {
        next(err);
    } else {
        res.status(200).json({timesheets: timesheets});
    }
   });
});

timesheetRouter.post('/', (req, res, next) => {
    const timesheet = req.body.timesheet;
    const hours = timesheet.hours;
    const rate = timesheet.rate;
    const date = timesheet.date;
    const employeeId = req.params.employeeId;
    const employeeSql = `SELECT * FROM Employee WHERE Employee.id = $employeeId`;
    const employeeValues = {$employeeId: employeeId};

    if (!hours || !rate || !date) {
        return res.sendStatus(400);
    };

    db.get(employeeSql, employeeValues, (err, employee) => {
        if (err) {
            next(err);
        } else {
            if (!employee) {
                return res.sendStatus(404);
            }
            const sql = `INSERT INTO Timesheet (hours, rate, date, employee_id)
            VALUES ($hours, $rate, $date, $employeeId)`;
            const values = {
                $hours: hours,
                $rate: rate,
                $date: date,
                $employeeId: employeeId
            };

            db.run(sql, values, function(err) {
                if (err){
                    next(err);
                } else {
                    db.get(`SELECT * FROM Timesheet where Timesheet.id = ${this.lastID}`, 
                        (err, timesheet) => {
                            res.status(201).json({timesheet: timesheet});
                        }
                    );
                }
            });
        } 
    });
});

timesheetRouter.param('timesheetId', (req, res, next, timesheetId) => {
    const sql = `SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId`;
    const values = {$timesheetId: timesheetId};

    db.get(sql, values, (err, timesheet) => {
        if (err) {
            next(err);
        } else if (timesheet) {
            req.timesheet = timesheet;
            next();
        } else {
            res.sendStatus(404);
        }
    });
})

module.exports = timesheetRouter;