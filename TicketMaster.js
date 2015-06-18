#!/usr/bin/env node
"use strict";

var program = require("commander");
var open = require("open");
var clip = require("copy-paste").global();

var t = require("./lib/ticketmaster");
var trello_key = "";
var trello_token = "";
require("./lib/utils");


var debug = false;

program
.version("0.0.1")
.option("-k --trello_key <key>", "Trello authentication key.")
.option("-t --trello_token <token>", "Trello authentication token.")
.parseOptions(program.normalize(process.argv.slice(2)));

var options = {
	trello: {
		key: program.trello_key,
		token: program.trello_token
	},
	jira: {
		host: "jira.neontribe.org",
		username: "Oliver Barnwell",
		password: ""
	}
}

var TicketMaster = new t(options);

program
.command("gentrello [o]")
.description("Generate a token generation url for trello. [open: <y>] open url in browser (defaults to yes)")
.action(function(open_tab) {
	var gen_url = TicketMaster.trello.genTokenUrl()
	open_tab = open_tab || "y";
	if(open_tab.toLowerCase() == "y") {
		console.log("Attempting to open...");
		open(gen_url);
	} else {
		console.log("Copying to clipboard: " + gen_url);
		copy(gen_url, function() {
			process.exit();
		});
	}
});

program
.command("boards [output]")
.description("Retrieve a list of boards currently accessible to the user. Output -> [directory + filename] to place output, defaults to <username>_boards.json.")
.action(function(output) {
	TicketMaster.init(function(init_err, user) {
		output = output || user.fullName + "_boards.json";
		TicketMaster.trello.getBoards(function(err, data) {
			var Boards = {};
			console.log("Boards: ")
			for(var i = 0; i < data.length; i++) {
				var tmp_board = Board(data[i].id, data[i].name, data[i].desc, data[i].url);
				Boards[i] = tmp_board;
				console.log("-" + tmp_board.name);
			}
			TicketMaster.dumpJSON(output, Boards, genericCallbackHandler);
		});
	});
});

program
.command("lists [output] [board]")
.description("Retrieves lists in specified board. Output -> [directory + filename] to place output, defaults to <username>_boards.json.")
.action(function(output, board) {
	TicketMaster.init(function(init_err, user) {
		var board_id = 0;
		TicketMaster.trello.getBoards(function(e, d) {
			for(var i = 0; i < d.length; i++) {
				if(d[i].name == board) {
					board_id = d[i].id;
				}
			}
			output = output || user.fullName + board + "_lists.json";
			TicketMaster.trello.getLists(board_id, function(err, data) {
				var Lists = {};
				for(var i = 0; i < data.length; i++) {
					var tmp_list = Group(data[i].id, data[i].name, data[i].closed, data[i].idBoard);
					Lists[i] = tmp_list;
				}
				TicketMaster.dumpJSON(output, Lists, genericCallbackHandler);
			});
		});
	});
});

program
.command("populate")
.description("Generate a directory structure containing information concerning current user's board layout.")
.action(function() {
	TicketMaster.init(function() {
		TicketMaster.trello.genBoards("./dump", function(board_ids) {
			TicketMaster.trello.genCols("./dump", board_ids, function(col_ids) {
				TicketMaster.trello.genTickets("./dump", col_ids, function() {
					console.log(col_ids);
				});
			});
		});
	});
});

program
.command("testjira")
.description("Test jira")
.action(function() {
	TicketMaster.jira.get("rest/api/2/issue/WL-241", function(res) {
		
	});
});

program.parse(process.argv);