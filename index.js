#!/usr/bin/env node

"use strict";

var program = require("commander");
var open = require("open");
var clip = require("copy-paste").global();
var http = require("http");
var glob = require("glob");
var fs = require("fs");


var t = require("./lib/ticketmaster");
var utils = require("./lib/utils");

program
    .version(require('./package').version)
    .option("-k --trello_key <key>", "Trello authentication key.", String, "871a2695a447edbd7ed0e5fa4ea8c390")
    .option("-t --trello_token <token>", "Trello authentication token.", String, "7da0903ee016460595090b92b130aedf2dc00f45cbde83617133aa85dffa8d84")
    .option("-u --jira_username <username>", "Jira username.", String, "Oliver Barnwell")
    .option("-p --jira_password <password>", "Jira password.", String, "***REMOVED***")
    .option("-d --debug", "Set debug mode <bool>.", Boolean, false)
    .parseOptions(program.normalize(process.argv.slice(2)));

program._name = "ticket-master";

GLOBAL.debug = program.debug;

var options = {
    trello: {
        key: program.trello_key,
        token: program.trello_token
    },
    jira: {
        host: "jira.neontribe.org",
        api_path: "rest/api/2",
        username: program.jira_username,
        password: program.jira_password
    }
};

var TicketMaster = new t(options);

program
    .command("gentrello [o]")
    .description("Generate a token generation url for trello. [open: <y>] open url in browser (defaults to yes)")
    .action(function(open_tab) {
        var gen_url = TicketMaster.trello.genTokenUrl()
        open_tab = open_tab || "y";
        if (open_tab.toLowerCase() == "y") {
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
    .command("search [term] [limit]")
    .description("Perform a search of the trello api for boards and tickets " /*current api version doesn't support search for lists..*/ + "based on the supplied search term.")
    .action(function(input, limit) {

        limit = limit || 1;
        
        TicketMaster.init(function(init_err, user_data) {
            TicketMaster.trello.search(input, limit, limit, limit, function(err, data) {
                console.log(data);
            });
        });
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
                for (var i = 0; i < data.length; i++) {
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
    .description("Retrieves cols in specified board. Output -> [directory + filename] to place output, defaults to <username>_boards.json.")
    .action(function(output, board) {
        TicketMaster.init(function(init_err, user) {
            var board_id = 0;
            TicketMaster.trello.getBoards(function(e, d) {
                for (var i = 0; i < d.length; i++) {
                    if (d[i].name == board) {
                        board_id = d[i].id;
                    }
                }
                output = output || user.fullName + board + "_cols.json";
                TicketMaster.trello.getLists(board_id, function(err, data) {
                    var Lists = {};
                    for (var i = 0; i < data.length; i++) {
                        var tmp_list = Group(data[i].id, data[i].name, data[i].closed, data[i].idBoard);
                        Lists[i] = tmp_list;
                    }
                    TicketMaster.dumpJSON(output, Lists, genericCallbackHandler);
                });
            });
        });
    });

program
    .command("populate [board] [column] [ticket]")
    .description("Generate a directory structure containing information concerning current user's board layout. | [board], specific board as name/id | [column], specific column as name/id | [ticket], specific ticket as name/id|")
    .action(function(board, column, ticket) {
        if (board) {
            board = board || null;
            column = column || null;
            if (column) {
                ticket = ticket || null;
            } else {
                ticket = null;
            }
        } else {
            column = null;
            ticket = null;
        }

        TicketMaster.init(function() {
            TicketMaster.trello.genBoards("./dump", board, true, function(board_ids) {
                TicketMaster.trello.genCols("./dump", column, board_ids, true, function(col_ids) {
                    TicketMaster.trello.genTickets("./dump", ticket, col_ids, true, function(tick_ids) {
                        TicketMaster.reviewTickets(tick_ids, function() {

                        });
                    });
                });
            });
        });
    });

program
    .command("testjira [issue]")
    .description("Test jira")
    .action(function(issue) {
        TicketMaster.jira.getIssue(issue, function(err, res) {
            console.log(res.body);
        });
    });

program
    .command("serve")
    .description("Start ticket management server (port 8080)")
    .action(function() {
        console.log("TODO: make a module for this");
        // http.createServer(function(req, res) {
        //     var path = req.url.split("/");
        //     switch (path[1]) {
        //         case "board":
        //         	var board_name = path[2];
        //         	if(board_name == "") {
        //         		res.write(JSON.stringify({
        //         			"boards": utils.listDirs("./dump/")
        //         		}));
        //         		res.end();
        //         	}
        //             fs.readFile("./dump/" + board_name + "/board_" + board_name + ".json", function(err, data) {
        //             	if(err) {
        //             		res.write(err.toString());
        //             		res.end();
        //             		return;
        //             	}
        //             	res.write(data.toString());
        //             	res.end();
        //             	return;
        //             });
        //             break;
        //         default:
        //             res.write("Hello");
        //             res.end();
        //             break;
        //     }
        // }).listen(8080);
    });

program.parse(process.argv);