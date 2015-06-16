#!/usr/bin/env node
var program = require("commander");

program
.version("0.0.1")
.option("-k --trello_key <key>", "Trello authentication key.", String, "871a2695a447edbd7ed0e5fa4ea8c390")
.option("-t --trello_token <token>", "Trello authentication token.", String, "8077e49daea2a73864d47da3561918650e387bf23330064acc5668cc8fa38b76")


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

var TicketMaster = require("./lib/ticketmaster")(options);

program
.command("gentrello")
.description("Generate a token generation url for trello.")
.action(function(service) {
	console.log(TicketMaster.trello.genTokenUrl());
});

program
.command("boards")
.description("Generate a JSON file containing the boards owned by current user.")
.action(function(output) {
	TicketMaster.trello.getBoards();
});

program.parse(process.argv);
