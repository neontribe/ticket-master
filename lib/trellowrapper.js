"use strict";

//Includes
var Trello = require("node-trello");
var mkdirp = require('mkdirp');
var fs = require("fs");
var path = require("path");

var Templates = require("./data_templates");

//Global Functions
function genericCallbackHandler(a) {
    if (debug) {
        console.log(a);
    }
}

function listDirs(dir) {
    return fs.readdirSync(dir).filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
    });
};
//


//Trello wrapper, wraps all trello functionality used in application.
function TrelloWrapper(key, token, parent) {
    this.key = key;
    this.token = token;
    this.parent = parent;

    this.trello = new Trello(this.key, this.token);

    this.user = {};
}

TrelloWrapper.prototype.init = function(callback) {
    this.trello.get("/1/members/me", {}, function(err, data) {
        if (err) {
            return callback(err, data);
        }
        return callback(null, data);
    });
};

//Gen Filetree For Boards
//Populate each directory with <board_name>.json
TrelloWrapper.prototype.genBoards = function(dir, callback) {
    var _this = this;
    var board_ids = [];
    mkdirp.sync(dir);
    _this.getBoards(function parseBoards(err, data) {
        //For each board make directory and give it a <board>.json file
        (function boardTick(i) {
            var newBoard = new Templates.board(data[i]);
            board_ids.push([newBoard.name, newBoard.id]);
            mkdirp.sync(dir + "/" + newBoard.name);
            _this.parent.dumpJSON(dir + "/" + newBoard.name + "/board_" + newBoard.name + ".json", JSON.stringify(newBoard));           
            if (i < data.length - 1) {
                boardTick(i + 1);
            } else if (i == data.length - 1) {
                return callback(board_ids);
            }
        })(0);
    });
};


//Gen Filetree For Cols, populates each directory with column_<col_name>.json
//dir: base directory of file tree
//board_ids: [parent_board_name, parent_board_id]
TrelloWrapper.prototype.genCols = function(dir, board_ids, callback) {
    var _this = this;
    var col_ids = [];
    (function boardTick(i) {
        var currDir = dir + "/" + board_ids[i][0] + "/";
        _this.getCols(board_ids[i][1], function(err, data) {
            if (i < board_ids.length - 1) {
                boardTick(i + 1);
                return false;
            }
            (function colTick(j) {
                var newColumn = new Templates.column(data[j]);
                if(data[j] == undefined) {
                    console.log("No columns exist for this board.", "<Name: " + board_ids[i][0] + ", " + "ID: " + board_ids[i][1] + ">");
                }
                col_ids.push([board_ids[i][0], board_ids[i][1], newColumn.name, newColumn.id]);
                mkdirp.sync(currDir + newColumn.name);
                _this.parent.dumpJSON(currDir + newColumn.name + "/column_" + newColumn.name + ".json", JSON.stringify(newColumn));
                if (j < data.length - 1) {
                    colTick(j + 1);
                } else if (j == data.length - 1 && i == board_ids.length - 1) {
                    return callback(col_ids);
                }
            })(0);
        });
    })(0);
};

//Gen filetree for tickets
//Populates each directory with ticket_<truncated name>.json

//col_ids: [parent_board_name, parent_board_id, parent_column_name, parent_column id]
TrelloWrapper.prototype.genTickets = function(dir, col_ids, callback) {
    var _this = this;
    var tickets = listDirs(dir);
    var ticket_ids = [];
    (function boardColTick(i) {
        var currDir = dir + "/" + col_ids[i][0] + "/" + col_ids[i][2] + "/";
        _this.getTickets(col_ids[i][3], function(err, data) {
            if (i < col_ids.length - 1) {
                boardColTick(i + 1);
            }
            (function ticketTick(j) {
                var newTicket = new Templates.ticket(data[j]);
                if (data[j] == undefined) {
                    //TODO: implement proper logging system
                    console.log("No tickets exist for this column: ", "<Name: " + col_ids[i][0] + ", ID: " + col_ids[i][1] + ">");
                    return false;
                }
                ticket_ids.push([col_ids[i], newTicket.name, newTicket.id]);
                mkdirp.sync(currDir + newTicket.name);
                _this.parent.dumpJSON(currDir + newTicket.name + "/ticket_" + newTicket.name + ".json", JSON.stringify(newTicket));
                if (j < data.length - 1) {
                    ticketTick(j + 1);
                } else if (j == data.length - 1 && i == ticket_ids.length - 1) {
                    return callback(ticket_ids);
                }

            })(0);
        });
    })(0);
}

TrelloWrapper.prototype.getBoards = function(callback) {
    this.trello.get("/1/members/me/boards", {}, function(err, data) {
        if (err) {
            return callback(err, data);
        };

        return callback(null, data);
    });
};

TrelloWrapper.prototype.getCols = function(boardId, callback) {
    this.trello.get("/1/boards/" + boardId + "/lists", {}, function(err, data) {
        if (err) {
            return callback(err, data);
        }

        return callback(null, data);
    });
};

TrelloWrapper.prototype.getTickets = function(colId, callback) {
    this.trello.get("/1/lists/" + colId + "/cards", {
        attachments: true,
        actions: "commentCard"
    }, function(err, data) {
        if (err) {
            return callback(err, data);
        }

        return callback(null, data);
    });
};

TrelloWrapper.prototype.genTokenUrl = function(access, duration) {
    if (!this.key) return "Specify a trello key, see help.";

    // = duration || "1day"
    duration = duration || "never"
    access = access || "read,write";

    var return_url = "https://trello.com/1/authorize?key=" + this.key + "&name=TicketMaster&expiration=" + duration + "&response_type=token&scope=" + access;
    return return_url;
};


module.exports = TrelloWrapper;