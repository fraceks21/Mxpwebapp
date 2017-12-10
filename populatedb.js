#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

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
                planeCreate('Aegean Airlines', 'A320', 'Airbus A320-232', 'SX-DGI', 'Visitgreece.com Livery', callback);
            },
            function(callback) {
                planeCreate('AeroMexico', 'B772', 'Boeing 777-2QR(ER)', 'N774AM', 'CDMX—Ciudad de Mexico Livery', callback);
            },
            function(callback) {
                planeCreate('AeroMexico', 'B772', 'Boeing 777-2QR(ER)', 'N776AM', 'CDMX—Ciudad de Mexico Livery', callback);
            },
            function(callback) {
                planeCreate('Air China', 'B77W', 'Boeing 777-39L(ER)', 'B-2035', 'Smiling China Livery', callback);
            },
            function(callback) {
                planeCreate('Air China', 'B77W', 'Boeing 777-2QR(ER)', 'B-2006', 'Love China Livery', callback);
            },
            function(callback) {
                planeCreate('Air France', 'B772', 'Boeing 777-328(ER)', 'F-GSQI', 'French Flag Livery', callback);
            },
            function(callback) {
                planeCreate('Air Macau', 'A321', 'Airbus A321-231', 'B-MBM', 'Macau Welcomes You Livery', callback);
            },
            function(callback) {
                planeCreate('AirAsia X', 'A333', 'Airbus A330-343', '9M-XXF', 'Fly to Malaysia Livery', callback);
            },
            function(callback) {
                planeCreate('Allegiant Air', 'A320', 'Airbus A320-214', 'N228NV', 'Visit Florida Livery', callback);
            },
            function(callback) {
                planeCreate('Azul Linhas Aereas', 'E190', 'Embraer ERJ-195', 'PR-AYV', 'Brazilian Flag Livery', callback);
            },
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
