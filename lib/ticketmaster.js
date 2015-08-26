"use strict";
//Includes
var fs = require("fs");
var readline = require("readline");
require('colors')
var jsdiff = require('diff');

var TrelloWrapper = require("./trellowrapper");
var JiraWrapper = require("./jirawrapper");

function TicketMaster(options) {
    this.options = options || {};

    this.trello = new TrelloWrapper(options.trello.key, options.trello.token, this);
    this.jira = new JiraWrapper(options.jira.host, options.jira.api_path, options.jira.username, options.jira.password);
};

TicketMaster.prototype.init = function(callback) {
    this.trello.init(function(e, d) {
        callback(e, d);
    });
};

//Takes the output of the genTickets function as only paramater.
TicketMaster.prototype.reviewTickets = function(tickets, callback) {
	var _this = this;
    var keys = Object.keys(tickets);

    (function ticketTick(i) {
        var ticket_obj = tickets[keys[i]];

        if (ticket_obj.ticket.diff != null) {
            ticket_obj.ticket.resolveDiff(function(ans) {

            	if(ans.toLowerCase() == "y") {
            		var new_ver = ticket_obj.ticket.diff.new_ver;
            		ticket_obj.ticket.diff = null;
            		_this.dumpJSON(ticket_obj.save_dir, new_ver);
            		console.log("Saved.")
            	} else {
            		console.log("Not saved.")
            	};

                if (++i < keys.length) {
                    ticketTick(i);
                } else {
                    return callback();
                };
            });
        } else {
            if (++i < keys.length) {
                ticketTick(i);
            } else {
                return callback();
            };
        };
    })(0)
};

TicketMaster.prototype.dumpJSON = function(path, data, callback) {
    if (typeof data !== "string") {
        data = JSON.stringify(data);
    }

    fs.writeFileSync(path, data);
};

module.exports = TicketMaster;