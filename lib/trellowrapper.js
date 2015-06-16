var Trello = require("node-trello");

function TrelloWrapper(key, token) {
	this.key = key;
	this.token = token;

	this.trello = new Trello(this.key, this.token);
	
	this.user = {};
}

TrelloWrapper.prototype.init = function(callback) {
	this.trello.get("/1/members/me", {}, function(err, data) {
		if(err) {
			callback(err, data);
		}

		callback(null, data);
	});
};

TrelloWrapper.prototype.getBoards = function(callback) {
	this.trello.get("/1/members/me/boards", {}, function(err, data) {
		if(err) {
			callback(err, data);
		};

		callback(null, data);
	});
};

TrelloWrapper.prototype.getLists = function(boardId, callback) {
	this.trello.get("/1/boards/" + boardId + "/lists", {}, function(err, data) {
		callback(err, data);
	});

};

TrelloWrapper.prototype.genTokenUrl = function(access, duration) {
	if(!this.key) return "Specify a trello key, see help.";
	
	duration = duration || "1day"
	access = access || "read,write";

	var return_url = "https://trello.com/1/authorize?key=" +  this.key + "&name=TicketMaster&expiration="+ duration +"&response_type=token&scope="+access;
	return return_url;
};


module.exports = TrelloWrapper;