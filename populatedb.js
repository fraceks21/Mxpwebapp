#! /usr/bin/env node

console.log('We are going to insert a lot of planes in this database. Thanks for you help');

//Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

var async = require('async')
var Plane = require('./models/planes')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {
    useMongoClient: true
});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var planes = []


function planeCreate(company, aircraft_type, extended_aircraft_type, tailnumber, livery, cb) {
    planedetail = {company: company , aircraft_type: aircraft_type , extended_aircraft_type: extended_aircraft_type, tailnumber: tailnumber, livery: livery};


    var plane = new Plane (planedetail);

    plane.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New Plane: ' + plane);
        planes.push(plane)
        cb(null, plane)
    }  );
}



function createPlanes(cb) {
    async.parallel([
            function(callback) {
                planeCreate('Air China', 'B738', 'Boeing 737-89L', 'B-5422', 'Phoenix Livery', callback);
            },
            function(callback) {
                planeCreate('Air China', 'B738', 'Boeing 737-89L', 'B-5390', 'Gold Peony Livery', callback);
            },
            function(callback) {
                planeCreate('Air China', 'B738', 'Boeing 737-89L', 'B-5198', 'Yellow Peony Livery', callback);
            },
            function(callback) {
                planeCreate('Air China', 'B738', 'Boeing 737-89L', 'B-5178', 'Silver Peony Livery', callback);
            },
            function(callback) {
                planeCreate('Air China', 'B738', 'Boeing 737-89L', 'B-5177', 'Pink Peony Livery', callback);
            },
            function(callback) {
                planeCreate('Air China', 'B738', 'Boeing 737-89L', 'B-5176', 'Silver Peony Livery', callback);
            },
            function(callback) {
                planeCreate('Air China', 'B738', 'Boeing 737-89L', 'B-2642', 'Pink Peony Livery', callback);
            },
            function(callback) {
                planeCreate('Air China', 'B738', 'Boeing 737-89L', 'B-5214', 'Pink Peony Livery', callback);
            },
            function(callback) {
                planeCreate('Air China', 'B738', 'Boeing 737-89L', 'B-5211', 'Pink Peony Livery', callback);
            },
            function(callback) {
                planeCreate('Air China', 'A332', 'Airbus A330-243', 'B-6076', 'Zichen Hao (Capital Pavilion Liner) Livery', callback);
            },
            function(callback) {
                planeCreate('Air China', 'A332', 'Airbus A330-243', 'B-6075', 'Zijin Hao (Forbidden Pavilion Liner) Livery', callback);
            },
            function(callback) {
                planeCreate('Air China', 'A321', 'Airbus A321-213', 'B-6365', 'Beautiful Sichuan II Livery', callback);
            },
            function(callback) {
                planeCreate('Air China', 'A321', 'Airbus A321-213', 'B-6361', 'Beautiful Sichuan Livery', callback);
            },
            function(callback) {
                planeCreate('Air China', 'A320', 'Airbus A320-214', 'B-6075', 'Plum Blossom / Splendid Hubei (锦绣湖北) Livery', callback);
            },



        
            /* function(callback) {
                planeCreate('company', 'type', 'airicraft', 'tail', 'OneWorld Livery', callback);
            }, */





            





            
            




            
        ],
        // optional callback
        cb);
}



async.series([
        createPlanes
    ],

// optional callback
    function(err, results) {
        if (err) {
            console.log('FINAL ERR: '+err);
        }
        else {
            console.log('All inserted');

        }
        //All done, disconnect from database
        mongoose.connection.close();
    });
