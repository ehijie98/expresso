const handleDbError = (res, err, data, next, options) => {
    const {key = 'data', status = 200} = options;
    if (err) {
        next(err);
    } else if (!data) {
        return res.sendStatus(404);
    } else {
        res.status(status).json({[key]: data })
    }
}

module.exports = handleDbError;