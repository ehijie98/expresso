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
        res.status(200).send({timesheets: timesheets});
    }
   });
});

module.exports = timesheetRouter;