"use strict";
//Includes
var fs = require("fs");

var TrelloWrapper = require("./trellowrapper");
var JiraWrapper = require("./jirawrapper");

function TicketMaster(options) {
	this.options = options || {};

	this.trello = new TrelloWrapper(options.trello.key, options.trello.token, this);
	this.jira = new JiraWrapper(options.jira.host, options.jira.username, options.jira.password);

}

TicketMaster.prototype.init = function(callback) {
	this.trello.init(function(e, d) {
		callback(e, d);
	});
}

TicketMaster.prototype.dumpJSON = function(path, data, callback) {
	if(!(typeof data == "string")) {
		data = JSON.stringify(data);
	}
	
	fs.writeFile(path, data, function(e) {
		if(e) {
			callback(e);
		} else {
			callback(null);
		}
	});
};

module.exports = TicketMaster;