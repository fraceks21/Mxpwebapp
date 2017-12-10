var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PlaneSchema = new Schema(
    {
        company: {type: String, max: 100},
        aircraft_type: {type: String, max: 100},
        extended_aircraft_type: {type: String, max: 100},
        tailnumber: {type: String, required: true, max: 8},
        livery: {type: String},
    }
);

// Virtual for author's full name
PlaneSchema
    .virtual('name')
    .get(function () {
        return this.company + ' ' + this.extended_aircraft_type + ', ' + this.tailnumber + ' - ' + this.livery;
    });

// Virtual for author's URL
PlaneSchema
    .virtual('url')
    .get(function () {
        return '/catalog/planes/' + this._id;
    });

//Export model
module.exports = mongoose.model('planes', PlaneSchema);