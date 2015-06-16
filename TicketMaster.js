#!/usr/bin/env node
var program = require("commander");

var debug = false;

program
.version("0.0.1")
.option("-k --trello_key <key>", "Trello authentication key.", String, "871a2695a447edbd7ed0e5fa4ea8c390")
.option("-t --trello_token <token>", "Trello authentication token.", String, "8077e49daea2a73864d47da3561918650e387bf23330064acc5668cc8fa38b76")

function genericCallbackHandler(a) {
	if(debug) {
		console.log(a);
	}
}

function Board(id, name, desc, url) {

	return {id: id, name: name, desc: desc, url: url};
}

//List
function Group(id, name, closed, parent_board) {
	return {id: id, name: name, closed: closed, parent_board: parent_board};
}

function Ticket() {

}

function Comment() {

}

var options = {
	trello: {
		key: program.trello_key,
		token: program.trello_token
	},
	jira: {
		key: "",
		token: ""
	}
}

var t = require("./lib/ticketmaster");
var TicketMaster = new t(options);

program
.command("gentrello")
.description("Generate a token generation url for trello.")
.action(function(service) {
	console.log(TicketMaster.trello.genTokenUrl());
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

program.parse(process.argv);
