var mongoose = require("mongoose");	// mongoose for mongodb
var storeSchema = mongoose.Schema({
	placeId: {type: String, index: {unique: true}},
	name: String,
	address: String,
	open: [{type: Number}], // opening hours 0 index from Sunday
	close: [{type: Number}], // closing hours 0 index form Sunday
	weekdayText: [{type: String}], // Text of the opening-closing hours 0 index from Sunday
	createTime: Date,
	editTime: Date
});
module.exports = mongoose.model('Store', storeSchema);