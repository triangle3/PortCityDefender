var basic_auth = require('basic-auth');

var authentications = require('../models/authentications');

var auth = {};

function allows_ip(ip) {
    return ip == '127.0.0.1' || ip == 'localhost' || ip == '::1' || ip == '121.40.97.40';
}

auth.forAllUsers = function (req, res, next) {
    console.log('req.ip =', req.ip);
    if (allows_ip(req.ip)) {
        return next();
    }

    var auth = basic_auth(req);
    console.log('auth =', auth);
    if (!auth) {
        res.status(401).send({
            status: 401,
            message: 'No Authorization information'
        });
    } else {
        authentications.readOne(auth.name, function (err, authentication) {
            if (err) {
                return next(new Error(err));
            }
            console.log('authentication =', authentication);
            if (!authentication) {
                res.status(401).send({
                    status: 401,
                    message: 'Authorization failed - username does not exist'
                });
            } else if (authentication.password != auth.pass) {
                res.status(401).send({
                    status: 401,
                    message: 'Authorization failed - invalid password'
                });
            } else {
                next();
            }
        });
    }
};

// only used in /authentications
auth.forUsername = function (req, res, next) {
    console.log('req.ip =', req.ip);
    if (allows_ip(req.ip)) {
        return next();
    }

    var auth = basic_auth(req);
    console.log('auth =', auth);
    if (!auth) {
        res.status(401).send({
            status: 401,
            message: 'No Authorization information'
        });
    } else if (auth.name != req.params.username) {
        res.status(403).send({
            status: 403,
            message: 'Authorization inconsistent with username'
        });
    } else {
        authentications.readOne(auth.name, function (err, authentication) {
            if (err) {
                return next(new Error(err));
            }
            console.log('authentication =', authentication);
            if (!authentication) {
                res.status(401).send({
                    status: 401,
                    message: 'Authorization failed - username does not exist'
                });
            } else if (authentication.password != auth.pass) {
                res.status(401).send({
                    status: 401,
                    message: 'Authorization failed - invalid password'
                });
            } else {
                next();
            }
        });
    }
};

auth.forAdmin = function (req, res, next) {
    console.log('req.ip =', req.ip);
    if (allows_ip(req.ip)) {
        return next();
    }

    var auth = basic_auth(req);
    console.log('auth =', auth);
    if (!auth) {
        res.status(401).send({
            status: 401,
            message: 'No Authorization information'
        });
    } else if (auth.name != 'admin') {
        res.status(403).send({
            status: 403,
            message: 'Administrator only'
        });
    } else if (auth.pass != 'admin') {
        res.status(401).send({
            status: 401,
            message: 'Authorization failed - invalid password'
        });
    } else {
        next();
    }
};

module.exports = auth;
