var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('../config');

module.exports = function (req, res, next) {
    // check header or  parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'] ;

    if (!token) {
        return res.status(401).json({success: false, message: 'Token is missing'});
    }
    try {
        var decoded = jwt.decode(token, config.jwt.secret);
    } catch (err) {
        return res.status(400).json({success: false, message: 'Invalid token', err: err.toString()});
    }

    if (moment(decoded.exp).isBefore(moment())) {
        res.status(401).json({success: false, message: 'Expired token'});
    } else {
        req.user = decoded.iss;
        next();
    }
};