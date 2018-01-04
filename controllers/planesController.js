var Plane = require('../models/planes');
var async = require('async');

exports.index = function(req, res) {

    async.parallel({

        planes_count: function(callback) {
            Plane.count(callback);
        },

    }, function(err, results) {
        res.render('index', { title: 'Special Livery Database', error: err, data: results });
    });
};

// Display list of all planes
exports.plane_list = function(req, res) {
    Plane.find()
        .sort([['company', 'ascending']])
        .exec(function (err, list_plane) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('plane_list', { title: 'Special Livery List', plane_list: list_plane });
        });

};


// Display detail page for a specific plane

exports.plane_detail = function(req, res, next) {

    async.parallel({
        plane: function(callback) {

            Plane.findById(req.params.id)
                .populate('plane')
                .exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('plane_detail', { title: 'Plane', plane: results.plane});
    });

};



// Display plane create form on GET
exports.plane_create_get = function(req, res, next) {
    res.render('plane_form', { title: 'Create Plane'});
};

// Handle plane create on POST
exports.plane_create_post = function(req, res, next) {

    req.checkBody('company', 'Insert Airline Name');
    req.checkBody('tailnumber', 'Required').notEmpty();
    req.checkBody('aircraft_type', 'Insert aircraft type (eg: A320)');
    req.checkBody('extended_aircraft_type', 'Insert extended aircraft type (eg: Boeing 777-200LR)');
    req.checkBody('livery', 'Required').notEmpty();

    req.sanitize('tailnumber').escape();
    req.sanitize('livery').escape();
    req.sanitize('tailnumber').trim();
    req.sanitize('livery').trim();

    var errors = req.validationErrors();

    var plane = new Plane(
        { company: req.body.company,
            tailnumber: req.body.tailnumber,
            aircraft_type: req.body.aircraft_type,
            extended_aircraft_type: req.body.extended_aircraft_type,
            livery: req.body.livery
        });

    if (errors) {
        res.render('plane_form', { title: 'Create Plane', plane: plane, errors: errors});
        return;
    }
    else {
        // Data from form is valid

        plane.save(function (err) {
            if (err) { return next(err); }
            //successful - redirect to new author record.
            res.redirect(plane.url);
        });
    }

};

// Display plane delete form on GET
exports.plane_delete_get = function(req, res, next) {

    async.parallel({
        plane: function(callback) {
            Plane.findById(req.params.id).exec(callback);
        }

    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('plane_delete', { title: 'Delete Plane', plane: results.plane } );
    });

};

// Handle plane delete on POST
exports.plane_delete_post = function(req, res, next) {

    req.checkBody('planeid', 'Plane id must exist').notEmpty();

    async.parallel({

        plane: function(callback) {
            Plane.findById(req.body.planeid).exec(callback);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        Plane.findByIdAndRemove(req.body.planeid, function deletePlane(err) {
            if (err) {
                return next(err);
            }
            //Success - got to author list
            res.redirect('/catalog/planes');
        });
    });
};



// Display plane update form on GET
exports.plane_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Plane update GET');
};

// Handle plane update on POST
exports.plane_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Plane update POST');
};


