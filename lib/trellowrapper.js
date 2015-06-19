"use strict";

//Includes
var Trello = require("node-trello");
var mkdirp = require('mkdirp');
var fs = require("fs");
var path = require("path");


var Templates = require("./data_templates");
var utils = require("./utils")


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
TrelloWrapper.prototype.genBoards = function(dir, board, callback) {
    var _this = this;
    var board_ids = [];
    mkdirp.sync(dir);
    _this.getBoards(board, function parseBoards(err, data) {
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
TrelloWrapper.prototype.genCols = function(dir, column, board_ids, callback) {
    var _this = this;
    var col_ids = [];
    (function boardTick(i) {
        var currDir = dir + "/" + board_ids[i][0] + "/";
        _this.getCols(column, board_ids[i][1], function(err, data) {
            if (i < board_ids.length - 1) {
                boardTick(i + 1);

            }
            (function colTick(j) {
                var newColumn = new Templates.column(data[j]);
                if (data[j] == undefined) {
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
TrelloWrapper.prototype.genTickets = function(dir, ticket, col_ids, callback) {
    var _this = this;
    var tickets = utils.listDirs(dir);
    var ticket_ids = [];

    (function boardColTick(i) {
        var currDir = dir + "/" + col_ids[i][0] + "/" + col_ids[i][2] + "/";
        _this.getTickets(ticket, col_ids[i][3], function(err, data) {
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
                //mkdirp.sync(currDir + newTicket.name);
                _this.parent.dumpJSON(currDir + "ticket_" + newTicket.name + ".json", JSON.stringify(newTicket));
                if (j < data.length - 1) {
                    ticketTick(j + 1);
                } else if (j == data.length - 1 && i == ticket_ids.length - 1) {
                    return callback(ticket_ids);
                }

            })(0);
        });
    })(0);
};

//Return an object containing <board> board or all boards
//board: specific board id, callback, return data
TrelloWrapper.prototype.getBoards = function(board, callback) {
    var _this = this;
    var real_id = null;

    board = board || null;

    this.search(board, 1, 1, 1, function(err, data) {
    if (err) {
        console.log("Error in searching: " + err);
    } else if (data.boards != undefined) {
        if (!(data.boards[0].id == real_id)) {
            real_id = data.boards[0].id;
        };
    };

    if (real_id) {
        _this.trello.get("/1/boards/" + real_id, {}, function(err_board, data_board) {
            if (err_board) {
                return callback(err_board, [data_board]);
            };

            return callback(null, [data_board]);
        });
    } else {
        _this.trello.get("/1/members/me/boards", {}, function(err_board, data_board) {
            if (err_board) {
                return callback(err_board, data_board);
            };

            return callback(null, data_board);
        });
    };
    });
}

//Return an object containing <column> columns of <boardId> or all columns of <boardId> if column is null
//column: specific column id, column: specific column id, callback, return data
TrelloWrapper.prototype.getCols = function(column, boardId, callback) {

    // can't search because API doesn't support list searching see: http://stackoverflow.com/questions/30937336/trello-api-search-for-list
    if (column) {
        this.trello.get("/1/lists/" + column, {}, function(err, data) {
            if (err) {
                return callback(err, [data]);
            }

            return callback(null, [data]);
        });
    } else {
        this.trello.get("/1/boards/" + boardId + "/lists", {}, function(err, data) {
            if (err) {
                return callback(err, data);
            }
            return callback(null, data);
        });
    }
};

TrelloWrapper.prototype.getTickets = function(ticket, colId, callback) {
    var real_id = ticket;
    var _this = this;

    ticket = ticket || null;
    this.search(ticket, 1, 1, 1, function(err, data) {
        if (err) {
            console.log("Error in searching: " + err);
        } else if (data.cards != undefined) {
            if (!(data.cards[0].id == real_id)) {
                real_id = data.cards[0].id;
            }
        }

        if (real_id) {
            _this.trello.get("/1/cards/" + real_id, {
                attachments: true,
                actions: "commentCard"
            }, function(err_ticket, data_ticket) {
                if (err) {
                    return callback(err_ticket, [data_ticket]);
                }
                return callback(null, [data_ticket]);
            });
        } else {
            _this.trello.get("/1/lists/" + colId + "/cards", {
                attachments: true,
                actions: "commentCard"
            }, function(err_ticket, data_ticket) {
                if (err_ticket) {
                    return callback(err_ticket, data_ticket);
                }
                return callback(null, data_ticket);
            });
        };
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

TrelloWrapper.prototype.search = function(query, boardLimit, columnLimit, ticketLimit, callback) {
    if(query == null) {
        return callback(null, [{}]);
    }
    //Execute a search using the api search path
    this.trello.get("/1/search/", {
        query: query,
        cards_limit: ticketLimit,
        boards_limit: boardLimit
    }, function(err, data) {
        if (err) {
            callback(err, data);
        }
        callback(null, data);
    });
};

module.exports = TrelloWrapper;