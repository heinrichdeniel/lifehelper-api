"use strict";

/**
 * Add CORS headers for all requests
 */
module.exports = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, x-access-token, Authorization, Content-Type, Accept");
    next();
};