var express = require('express');
var util = require('util');
var router = express.Router();

var database = require('../models/database');
var users = require('../models/users');
var informations = require('../models/informations');
var documents = require('../models/documents');
var regions = require('../models/regions');


router.get('/', function(req, res, next) {
    res.redirect('/dashboard/users');
});

router.get('/users', function(req, res, next) {
    users.read({}, function(err, users) {
        if (err) {
            return next(new Error(err));
        }
        res.render('dashboard', {
            subsystem: 'users',
            data: {
                users: users,
            }
        });
    });
});

router.get('/users/_new', function(req, res, next) {
   res.render('dashboard', {
       subsystem: 'user',
       data: {
           do: 'create',
       }
   });
});

router.get('/users/:id', function(req, res, next) {
    var id = req.params.id;
    users.readOne(id, function(err, user) {
        if (err) {
            return next(new Error(err));
        }
        res.render('dashboard', {
            subsystem: 'user',
            data: {
                user: user,
                do: req.query.do,
            }
        });
    });
});

router.get('/informations', function(req, res, next) {
    informations.read({}, function(err, informations) {
        if (err) {
            return next(new Error(err));
        }
        res.render('dashboard', {
            subsystem: 'informations',
            data: {
                informations: informations,
            }
        });
    });
});

router.get('/informations/:id', function(req, res, next) {
    var id = req.params.id;
    informations.readOne(id, function(err, info) {
        if (err) {
            return next(new Error(err));
        }
        res.render('dashboard', {
           subsystem: 'information',
            data: {
                information: info,
                do: req.query.do,
            }
        });
    })
});

router.get('/documents', function (req, res, next) {
    documents.read({}, function (err, documents) {
        if (err) {
            return next(new Error(err));
        }
        res.render('dashboard', {
            subsystem: 'documents',
            data: {
                documents: documents
            }
        });
    });
});

router.get('/documents/_new', function(req, res, next) {
    res.render('dashboard', {
        subsystem: 'document',
        data: {
            do: 'create'
        }
    });
});

router.get('/documents/:id', function (req, res, next) {
    var id = req.params.id;
    documents.readOne(id, function (err, document) {
        if (err) {
            return next(new Error(err));
        }
        res.render('dashboard', {
            subsystem: 'document',
            data: {
                document: document,
                do: req.query.do
            }
        });
    });
});

router.get('/regions', function (req, res, next) {
    regions.read(function (err, region_list) {
        if (err) {
            return next(new Error(err));
        }
        users.read({}, function(err, users) {
            if (err) {
                return next(new Error(err));
            }
            res.render('dashboard', {
                subsystem: 'regions',
                data: {
                    users: users,
                    regions: region_list
                }
            });
        });

    });
});


router.get('/user/check-password', function (req, res, next) {
    var username = req.query.username;
    var password = req.query.password;
    console.log('username = %s, password = %s', username, password);
    users.checkPassword(username, password, function(result) {
        res.send(result);
    });
});

module.exports = router;