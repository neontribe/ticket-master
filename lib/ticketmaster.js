//Includes
var fs = require("fs");

var TrelloWrapper = require("./trellowrapper");

function TicketMaster(options) {
	this.options = options || {};

	this.trello = new TrelloWrapper(options.trello.key, options.trello.token);
	this.jira = null;

	return this;
}


module.exports = TicketMaster;