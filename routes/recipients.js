var db = require('mongoskin')
	.db('mongodb://tinyels:tinyels@ds053778.mongolab.com:53778/irc_giving_tree',
	 {safe:true}); //todo get db info from config
var collection = db.collection('recipients');

exports.findById = function(req, res) {
    var id = req.params.id;
    collection.findOne(
    	{_id: db.ObjectID.createFromHexString(id)},
    	function(err, item) {
			res.send(item);
			}
	);
};

function find(query, res){
	collection.find(query||{}).toArray(function(err, items) {
		res.send(items);
	});

}
exports.findAll = function(req, res) {
	find({}, res);
};

exports.findWaiting = function(req, res) {
	find({"donor": {"$exists": false}}, res);
};
exports.findTaken = function(req, res) {
	find({"donor": {"$exists": true}}, res);
};


exports.findByEmail = function(req, res){
	var email = req.params.email;
	find({"donor.email": email}, res);
}

function GetTimeStamp(){
  function pad(n){return n<10 ? '0'+n : n}
  var d = new Date();
  return d.getUTCFullYear()+'-'
    + pad(d.getUTCMonth()+1)+'-'
    + pad(d.getUTCDate())+'T'
    + pad(d.getUTCHours())+':'
    + pad(d.getUTCMinutes())+':'
    + pad(d.getUTCSeconds())+'Z';
}

function setDonor(code, donor){
	collection.update({code:code}, {$set:{donor:donor, lastModified:GetTimeStamp()}}, function(err, result) {
    	if (!err) console.log('Year updated!');
	});
}