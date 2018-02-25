var Client = require('node-rest-client').Client;
var json2html = require('node-json2html');
var http = require('http');
var MongoClient = require('mongodb').MongoClient;
var url = "";   // Insert here database url 
var Twit = require('twit');
var TwitterBot = require("node-twitterbot").TwitterBot;








    var username = '';  // Insert here your username on Flightaware
    var apiKey = '';    // Insert here your apiKey
    var fxmlUrl = 'https://flightxml.flightaware.com/json/FlightXML3/';

    var client_options = {
    	user: username,
    	password: apiKey
    };

    var twitter_BOT = new Twit({
        consumer_key: '',       // You have to insert your Twitter App key
        consumer_secret: '',
        access_token: ,
        access_token_secret: ''
    });



    var client = new Client(client_options);

    client.registerMethod('findAirportBoards', fxmlUrl + 'AirportBoards', 'GET');
  

    var findAirportBoardsArgs = {
        parameters: {
            airport_code: '',   // Insert here airport code of your interest (eg: KJFK)
            howMany: n          // Insert here how many planes you want to track
        }
    };


    client.methods.findAirportBoards(findAirportBoardsArgs, function (data, response) {


    console.log('Arrival Flight for: ' + data.AirportBoardsResult.airport + '-' + data.AirportBoardsResult.airport_info.name);

    var enrouteData;
    var tailnumber_query_enroute;
    var tailnumber_query_scheduled;

    var flightAwareID_enroute;
    var flightAwareID_scheduled;

    var howMany = findAirportBoardsArgs.parameters.howMany;
    var totRecords_enroute = 0;
    var totRecords_scheduled = 0;
    var counter;


    var tailnumber_array_enroute = [];
    var tailnumber_array_scheduled = [];

    var flightAwareID_array_enroute = [];
    var flightAwareID_array_scheduled = [];





    for (counter = 0; counter < howMany; counter++) {

        tailnumber_query_enroute = data.AirportBoardsResult.enroute.flights[counter].tailnumber;
        flightAwareID_enroute = data.AirportBoardsResult.enroute.flights[counter].faFlightID;


        if (typeof (tailnumber_query_enroute) == 'string') {
            tailnumber_array_enroute[totRecords_enroute] = tailnumber_query_enroute;
            flightAwareID_array_enroute[totRecords_enroute] = flightAwareID_enroute;
            console.log(tailnumber_array_enroute[totRecords_enroute]);
            console.log(flightAwareID_array_enroute[totRecords_enroute]);

            totRecords_enroute++;


        } else console.log('Enroute tailnumber is not yet defined');

    }


    for (counter = 0; counter < howMany; counter++) {
        tailnumber_query_scheduled = data.AirportBoardsResult.scheduled.flights[counter].tailnumber;
        flightAwareID_scheduled = data.AirportBoardsResult.scheduled.flights[counter].faFlightID;

        if (typeof (tailnumber_query_scheduled) == 'string') {
            tailnumber_array_scheduled[totRecords_scheduled] = tailnumber_query_scheduled;
            flightAwareID_array_scheduled[totRecords_scheduled] = flightAwareID_scheduled;
            console.log(tailnumber_array_scheduled[totRecords_scheduled]);
            console.log(flightAwareID_array_scheduled[totRecords_scheduled]);

            totRecords_scheduled++;


        } else console.log('Scheduled tailnumber is not yet defined');

    }

    console.log('Proceeding with screening');
    console.log('Valore di Tot records: ' + totRecords_enroute);




    console.log('Proceeding with screening');
    console.log('Valore di Tot records scheduled: ' + totRecords_scheduled);
    console.log('Valore di Tot records enorute: ' + totRecords_enroute);


    var checkOnDatabase_enroute = function(loopValue, flightID) {
        MongoClient.connect(url, function (err, db) {
            var query = {tailnumber: loopValue};
            db.collection("planes").find(query).toArray(function (err, result) {
                console.log(loopValue);
                console.log(flightID);
                console.log(result);
                if (result[0] != null) {

                    var findFlightInfoStatusArgs = {
                        parameters: {
                            ident: flightID,
                            howMany: 1
                        }
                    };
                    console.log('findFlightInfoStatusArgs.parameters.ident ' + findFlightInfoStatusArgs.parameters.ident);
                    var tweetData_enroute;
                    client.methods.flightInfoStatus(findFlightInfoStatusArgs, function (data, response) {
                        tweetData_enroute = ('Flight ' + data.FlightInfoStatusResult.flights[0].ident + ' is coming from ' + data.FlightInfoStatusResult.flights[0].origin.alternate_ident + ' - ' + data.FlightInfoStatusResult.flights[0].origin.city + '. ');
                        tweetData_enroute = tweetData_enroute + ('STA is ' + data.FlightInfoStatusResult.flights[0].filed_arrival_time.time + ' ' + data.FlightInfoStatusResult.flights[0].filed_arrival_time.tz + ' and ETA is ' + data.FlightInfoStatusResult.flights[0].estimated_arrival_time.time + ' ' + data.FlightInfoStatusResult.flights[0].estimated_arrival_time.tz + ' on ' + data.FlightInfoStatusResult.flights[0].estimated_arrival_time.date + '. ');
                        //        tweetData = tweetData + ('Status is: ' + data.FlightInfoStatusResult.flights[0].status + '. ');
                        tweetData_enroute = tweetData_enroute + ('Aircraft type is: ' + result[0].aircraft_type + ' (' + result[0].tailnumber + ') with ' + result[0].livery + '. ');
                        console.log(tweetData_enroute);


                        MongoClient.connect(url, function (err, db) {
                            var query = {text: tweetData_enroute};
                            db.collection("tweetDataPosted").find(query).toArray(function (err, result) {
                                if (result[0] == null) {

                                    MongoClient.connect(url, function (err, db) {
                                        if (err) throw err;
                                        var insertTime = new Date();
                                        console.log(insertTime);
                                        var myobj = {
                                            text: tweetData_enroute,
                                            timeOfCheck: insertTime
                                        };

                                        db.collection("tweetDataPosted").insertOne(myobj, function (err, res) {
                                            if (err) throw err;
                                            console.log("1 document inserted");
                                            db.close();
                                        });
                                    });

                                    twitter_BOT.post('statuses/update', {status: tweetData_enroute}, function (err, data, response) { });
                                } else console.log('Already posted');
                            });

                            db.close();
                        });






                    })
                }

                db.close();
            })


        })

    };


    for (counter = 0; counter < totRecords_enroute; counter ++) {
        checkOnDatabase_enroute(tailnumber_array_enroute[counter], flightAwareID_array_enroute[counter]);
    }



    var checkOnDatabase_scheduled = function(loopValue, flightID) {
        MongoClient.connect(url, function (err, db) {
            var query = {tailnumber: loopValue};
            db.collection("planes").find(query).toArray(function (err, result) {
                console.log(loopValue);
                console.log(flightID);
                console.log(result);
                if (result[0] != null) {

                    var findFlightInfoStatusArgs = {
                        parameters: {
                            ident: flightID,
                            howMany: 1
                        }
                    };
                    console.log('findFlightInfoStatusArgs.parameters.ident ' + findFlightInfoStatusArgs.parameters.ident);
                    var tweetData_scheduled;
                    client.methods.flightInfoStatus(findFlightInfoStatusArgs, function (data, response) {
                        tweetData_scheduled = ('Flight ' + data.FlightInfoStatusResult.flights[0].ident + " is leaving to " + data.FlightInfoStatusResult.flights[0].destination.alternate_ident + ' - ' + data.FlightInfoStatusResult.flights[0].destination.city + '. ');
                        tweetData_scheduled = tweetData_scheduled + ('STA is ' + data.FlightInfoStatusResult.flights[0].filed_departure_time.time + ' and ETA is ' + data.FlightInfoStatusResult.flights[0].estimated_departure_time.time + ' on ' + data.FlightInfoStatusResult.flights[0].estimated_departure_time.date + '. ');
                        tweetData_scheduled = tweetData_scheduled + ('Aircraft type is: ' + result[0].aircraft_type + ' (' + result[0].tailnumber + ') with ' + result[0].livery);

                        console.log(tweetData_scheduled);


                        MongoClient.connect(url, function (err, db) {
                            var query = {text: tweetData_scheduled};
                            db.collection("tweetDataPosted").find(query).toArray(function (err, result) {
                                if (result[0] == null) {

                                    MongoClient.connect(url, function (err, db) {
                                        if (err) throw err;
                                        var insertTime = new Date();
                                        console.log(insertTime);
                                        var myobj = {
                                            text: tweetData_scheduled,
                                            timeOfCheck: insertTime
                                        };

                                        db.collection("tweetDataPosted").insertOne(myobj, function (err, res) {
                                            if (err) throw err;
                                            console.log("1 document inserted");
                                            db.close();
                                        });
                                    });

                                    twitter_BOT.post('statuses/update', {status: tweetData_scheduled}, function (err, data, response) { });
                                } else console.log('Already posted');
                            });

                            db.close();
                        });






                    })
                }

                db.close();
            })


        })

    };

    for (counter = 0; counter < totRecords_scheduled; counter ++) {
        checkOnDatabase_scheduled(tailnumber_array_scheduled[counter], flightAwareID_array_scheduled[counter]);
    }




});
