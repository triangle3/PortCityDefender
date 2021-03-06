var express = require('express');
var fs = require('fs');
var util = require('util');

var mime = require('mime');

var documents = require('../models/documents');
// var images = require('../models/images');
// var users = require('../models/users');

var router = express.Router();

function documentEssentialChecker(req, res, next) {
    var info = req.body;
    if (documents.hasEssentials(info)) {
        next();
    } else {
        var error = new Error('document object essentials missing');
        error.status = 422;
        next(error);
    }
}

function documentExistenceChecker(req, res, next) {
    var id = req.params.id;
    documents.existsId(id, function(err, exists) {
        if (err) {
            return next(new Error(err));
        }
        if (exists) {
            next();
        } else {
            console.log('document does not exist');
            var error = new Error('information id does not exist');
            error.status = 404;
            next(error);
        }
    });
}

function documentCreator(req, res, next) {
    var document = req.body;
    documents.create(document, function(err, result) {
        if (err) {
            next(new Error(err));
        } else {
            res.status(201).send(result);
        }
    });
}

function documentListReader(req, res, next) {
    var condition = {
        'class': req.params['class'],
        'subclass': req.params['subclass']
    };
    console.log(condition);
    documents.read(condition, function(err, list) {
        if (err) {
            next(new Error(err));
        } else {
            res.status(200).send(list);
        }
    });
}

function documentReader(req, res, next) {
    var id = req.params.id;
    documents.readOne(id, function(err, info) {
        if (err) {
            next(new Error(err));
        } else {
            // FIXME check info == null, return 404
            res.status(200).send(info);
        }
    });
}

function documentUpdater(req, res, next) {
    var id = req.params.id;
    var updater = req.body;
    documents.update(id, updater, function(err, result) {
        if (err) {
            return next(new Error(err));
        }
        res.status(201).send(result);
    });
}


function documentDeleter(req, res, next) {
    var id = req.params.id;
    documents.deleteById(id, function(err) {
        if (err) {
            next(new Error(err));
        } else {
            res.status(204).send({});
        }
    });
}

function infoImageCreator(req, res, next) {
    if (!req.is('image/*')) {
        var error = new Error('Content-Type should be image/*');
        error.status = 406;
        return next(error);
    }

    var id = req.params.id;
    var size = req.get('Content-Length');
    var mime_type = req.get('Content-Type');

    var extension = mime.extension(mime_type);
    if (!extension) {
        var error = new Error(util.format('Invalid MIME type %s', mime_type));
        error.status = 406;
        return next(error);
    }

    images.create(id, {size: size, mime_type: mime_type}, function(err, image, image_id) {
        console.log('image_id =', image_id);
        if (err) {
            return next(new Error(err));
        }
        var filepath = util.format('%s/%s.%s', images.image_dir, image.id, extension);
        var out_file = fs.createWriteStream(filepath);
        req.pipe(out_file);
        console.log('write file to', filepath);
        informations.addImageById(id, image_id, function(err) {
            if (err) {
                return next(new Error(err));
            }
            res.status(201).send(image);
        });
    });
}

function infoReplicationCreator(req, res, next) {
    var id = req.params.id;
    var replication = req.body;

    if (!replication.replier || !replication.content) {
        var error = new Error('replication not complete');
        error.status = 422;
        return next(error);
    }

    informations.addReplicationById(id, replication, function(err) {
        if (err) {
            return next(new Error(err));
        }

        users.readOne(replication.replier, function (err, replier) {
            if (err) {
                return next(new Error(err));
            }
            replication.replier = replier;
            res.status(201).send(replication);
        });
    });
}

// CREATE new info 
router.post('/', documentEssentialChecker, documentCreator);

// READ document list
router.get('/:class/:subclass/', documentListReader);

// READ document
router.get('/:class/:subclass/:id', documentReader);

// UPDATE document
router.put('/:id', documentExistenceChecker, documentUpdater);

// DELETE document
router.delete('/:id', documentExistenceChecker, documentDeleter);

module.exports = router;
