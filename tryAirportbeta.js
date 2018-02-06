var Client = require('node-rest-client').Client;
var json2html = require('node-json2html');
var http = require('http');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/mydb";
var Twit = require('twit');
var TwitterBot = require("node-twitterbot").TwitterBot;








    var username = '';
    var apiKey = '';
    var fxmlUrl = 'https://flightxml.flightaware.com/json/FlightXML3/';

    var client_options = {
    	user: username,
    	password: apiKey
    };

    var twitter_BOT = new Twit({
        consumer_key: '',
        consumer_secret: '',
        access_token: ,
        access_token_secret: ''
    });



    var client = new Client(client_options);

    client.registerMethod('findAirportBoards', fxmlUrl + 'AirportBoards', 'GET');
    client.registerMethod('weatherConditions', fxmlUrl + 'WeatherConditions', 'GET');
    client.registerMethod('weatherConditions', fxmlUrl + 'WeatherConditions', 'GET');

    var findAirportBoardsArgs = {
        parameters: {
            airport_code: 'LIMC',
            howMany: 10
        }
    };


    client.methods.findAirportBoards(findAirportBoardsArgs, function (data, response) {


        console.log('Arrival Flight for: ' + data.AirportBoardsResult.airport + '-' + data.AirportBoardsResult.airport_info.name);

        var enrouteData;
        var tailnumber_query;

        var howMany = findAirportBoardsArgs.parameters.howMany;
        var totRecords = 0;
        var counter;


        var tailnumber_array = [];


        for (counter = 0; counter < howMany; counter++) {

             tailnumber_query = data.AirportBoardsResult.enroute.flights[counter].tailnumber;


             if (typeof (tailnumber_query) == 'string') {
                tailnumber_array[totRecords] = tailnumber_query;
                console.log(tailnumber_array[totRecords]);
                totRecords++;


            } else console.log('Not yet defined');


        }

        console.log('Proceeding with screening');
        console.log('Valore di Tot records: ' + totRecords);

        for (counter = 0; counter < totRecords; counter ++) { 

            MongoClient.connect(url, function (err, db) {
                console.log('Ingresso nel database');
                var query = {tailnumber: tailnumber_array[counter]};
                db.collection("specialLivery").find(query).toArray(function (err, result) {
                    console.log('Query numero : ' + tailnumber_array[counter]);
                    console.log(result);
                    if (result[0] != null) {
                        console.log("I'm in the right side of the IF");
                        console.log(result[0].tailnumber);
                        livery = result[0].livery;
                        enrouteData = enrouteData + ('Special Livery is: ' + livery);
                        console.log(enrouteData);
                        twitter_BOT.post('statuses/update', {status: enrouteData}, function (err, data, response) { });
                    }
                    else
                        console.log('This is the wrong side of the IF');

                    db.close();
                })


            })

        }

       







    });







/*  (function wait () {
     if (flag == 1) {
         console.log("Timeout 2");
         setTimeout(wait, 5000);
     }
 })(); */
/*

            } else {
                console.log('Tailnumber is still undefined for ' + data.AirportBoardsResult.enroute.flights[counter].ident);
                flag = 0;
                i = i + 1;
            }

*/


         /*   function timeOut() {
                console.log('Timeout is running');
            }

            setTimeout(timeOut, 2000);


*/        /* enrouteData = (data.AirportBoardsResult.enroute.flights[counter].ident + ' with tailnumber ' + data.AirportBoardsResult.enroute.flights[counter].tailnumber + ' (' + data.AirportBoardsResult.enroute.flights[counter].aircrafttype + ') ');
            enrouteData = enrouteData + (' is coming from ' + data.AirportBoardsResult.enroute.flights[counter].origin.alternate_ident + ' - ' + data.AirportBoardsResult.enroute.flights[counter].origin.airport_name + '. ');
            enrouteData = enrouteData + ('Standard Arrival time is: ' + data.AirportBoardsResult.enroute.flights[counter].filed_arrival_time.time + ' ' + data.AirportBoardsResult.enroute.flights[counter].filed_arrival_time.tz + ' and Estimated Arrival Time is ' + data.AirportBoardsResult.enroute.flights[counter].estimated_arrival_time.time + ' ' + data.AirportBoardsResult.enroute.flights[counter].estimated_arrival_time.tz + '. ');
            enrouteData = enrouteData + ('Status of the flight is: ' + data.AirportBoardsResult.enroute.flights[counter].status + ' ');
 */


     /*  var arrival_flights = data.AirportBoardsResult.arrivals.flights;

        var transforms = {
            "flight_info" :[
                {"<>": "b", "html":"${ident}"},
                {"<>": "", "html":"${tailnumber}"},
                {"<>": "p", "html":"${origin.alternate_ident}"},
                {"<>": "p", "html":"${origin.airport_name}"},
                {"<>": "b", "html":"${full_aircrafttype}"}

            ]

        };



        var html1 = json2html.transform(arrival_flights,transforms.flight_info);

        console.log(html1);

    */
        /*  http.createServer(fuction (req, res) {
            res.write('<html><head></head><body>');
            res.write('Flight Stats' + html1);
            res.end('</body></html>');
        }).listen(8080);

        */






