var Client = require('node-rest-client').Client;
var http = require('http');
var MongoClient = require('mongodb').MongoClient;
var url = "Insert here your database url";
var Twit = require('twit');
var TwitterBot = require("node-twitterbot").TwitterBot;





    var username = 'Insert here your Username';
    var apiKey = 'Insert here your APIkei';
    var fxmlUrl = 'https://flightxml.flightaware.com/json/FlightXML3/';

    var client_options = {
    	user: username,
    	password: apiKey
    };

    var twitter_BOT = new Twit({
        consumer_key: 'Insert here your consumer key',
        consumer_secret: 'Insert here your consumer secret',
        access_token: 'Insert here your access token',
        access_token_secret: 'Insert here your access token secret'
    });



    var client = new Client(client_options);

    client.registerMethod('findAirportBoards', fxmlUrl + 'AirportBoards', 'GET');
    client.registerMethod('flightInfoStatus', fxmlUrl + 'FlightInfoStatus', 'GET');

    var findAirportBoardsArgs = {
        parameters: {
            airport_code: 'Select your airport',
            howMany: Select how many plane do you want to scan
        }
    };




    client.methods.findAirportBoards(findAirportBoardsArgs, function (data, response) {

        var tailnumber_query;
        var flightAwareID;

        var howMany = findAirportBoardsArgs.parameters.howMany;
        var totRecords = 0;
        var counter;


        var tailnumber_array = [];
        var flightAwareID_array = [];


        for (counter = 0; counter < howMany; counter++) {

             tailnumber_query = data.AirportBoardsResult.enroute.flights[counter].tailnumber;
             flightAwareID = data.AirportBoardsResult.enroute.flights[counter].faFlightID;


             if (typeof (tailnumber_query) == 'string') {
                tailnumber_array[totRecords] = tailnumber_query;
                flightAwareID_array[totRecords] = flightAwareID;
                console.log(tailnumber_array[totRecords]);
                console.log(flightAwareID_array[totRecords]);

                totRecords++;


            } else console.log('Not yet defined');


        }

        console.log('Proceeding with screening');
        console.log('Valore di Tot records: ' + totRecords);

        var checkOnDatabase = function(loopValue, flightID) {
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
                        var tweetData;
                        client.methods.flightInfoStatus(findFlightInfoStatusArgs, function (data, response) {
                            tweetData = ('Flight ' + data.FlightInfoStatusResult.flights[0].ident + ' is coming from ' + data.FlightInfoStatusResult.flights[0].origin.alternate_ident + ' - ' + data.FlightInfoStatusResult.flights[0].origin.city + ' ' + data.FlightInfoStatusResult.flights[0].origin.airport_name + '. ');
                            tweetData = tweetData + ('STA is ' + data.FlightInfoStatusResult.flights[0].filed_arrival_time.time + ' ' + data.FlightInfoStatusResult.flights[0].filed_arrival_time.tz + ' and ETA is ' + data.FlightInfoStatusResult.flights[0].estimated_arrival_time.time + ' ' + data.FlightInfoStatusResult.flights[0].estimated_arrival_time.tz + ' on ' + data.FlightInfoStatusResult.flights[0].estimated_arrival_time.date + '. ');
                  //        tweetData = tweetData + ('Status is: ' + data.FlightInfoStatusResult.flights[0].status + '. ');
                            tweetData = tweetData + ('Aircraft type is: ' + result[0].aircraft_type + ' (' + result[0].tailnumber + ') with ' + result[0].livery);
                            console.log(tweetData);



                            MongoClient.connect(url, function (err, db) {
                                var query = {text: tweetData};
                                db.collection("tweetDataPosted").find(query).toArray(function (err, result) {
                                    if (result[0] == null) {

                                        MongoClient.connect(url, function (err, db) {
                                            if (err) throw err;
                                            var insertTime = new Date();
                                            console.log(insertTime);
                                            var myobj = {
                                                text: tweetData,
                                                timeOfCheck: insertTime
                                            };

                                            db.collection("tweetDataPosted").insertOne(myobj, function (err, res) {
                                                if (err) throw err;
                                                console.log("1 document inserted");
                                                db.close();
                                            });
                                        });

                                        twitter_BOT.post('statuses/update', {status: tweetData}, function (err, data, response) { });
                                    } else console.log('Already posted');
                                })

                                db.close();
                            });






                        })
                    }

                    db.close();
                })


            })

        };

        for (counter = 0; counter < totRecords; counter ++) {
            checkOnDatabase(tailnumber_array[counter], flightAwareID_array[counter]);
        }





    });










