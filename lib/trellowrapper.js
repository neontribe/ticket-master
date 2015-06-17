"use strict";

var Trello = require("node-trello");
var mkdirp = require('mkdirp');
var fs = require("fs");
var path = require("path");

var debug = false;

function genericCallbackHandler(a) {
    if (debug) {
        console.log(a);
    }
}

function listDirs(dir) {
    return fs.readdirSync(dir).filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
    });
}

//Templates
//==========
function Board(data) {
    this.name = data.name.replace(/\//g, "-");
    this.id = data.id;
    this.url = data.url;
    this.desc = data.desc;
}

function Column(data) {
    this.name = data.name.replace(/\//g, "-");
    this.id = data.id;
    this.parentBoard = data.idBoard;
}

function Ticket(data) {
    this.name = data.name;
    this.id = data.id;
    this.content = data.content;
}
//=========


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
TrelloWrapper.prototype.genBoards = function(dir, callback) {
    var _this = this;

    var board_ids = [];

    mkdirp.sync(dir)
    _this.getBoards(function parseBoards(err, data) {
        //For each board make directory and give it a <board>.json file
        (function boardTick(i) {
            var newBoard = new Board(data[i]);
            board_ids.push([newBoard.name, newBoard.id]);
            mkdirp(dir + "/" + newBoard.name);
            _this.parent.dumpJSON(dir + "/" + newBoard.name + "/" + newBoard.name + ".json", JSON.stringify(newBoard), function() {
                if (i < data.length - 1) {
                  boardTick(i + 1);
                } else if (i == data.length - 1) {
                    callback(board_ids);
                }
            });
        })(0);
    });
};


//Gen Filetree For Cols
//dir: base directory of file tree
TrelloWrapper.prototype.genCols = function(dir, board_ids, callback) {
    var _this = this;

    var col_ids = [];

    (function boardTick(i) {
        var currDir = dir + "/" + board_ids[i][0] + "/";
        _this.getCols(board_ids[i][1], function(err, data) {
            if (i < board_ids.length - 1) {
              boardTick(i + 1);
            }
            (function colTick(j) {
                var newColumn = new Column(data[j]);
                col_ids.push([newColumn.name, newColumn.id]);
                mkdirp.sync(currDir + newColumn.name);
                _this.parent.dumpJSON(currDir + newColumn.name + "/" + newColumn.name + ".json", JSON.stringify(newColumn), function() {
                    if (j < data.length - 1) {
                      colTick(j + 1);
                    } else if (j == data.length - 1 && i == board_ids.length - 1) {
                        callback(col_ids);
                    }
                });
            })(0);
        });
    })(0);
};

TrelloWrapper.prototype.genTickets = function(dir, callback) {
    var _this = this;
    var tickets = listDirs(dir);



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
    this.trello.get("/1/lists/" + colId + "/cards", {}, function(err, data) {
        if (err) {
            return callback(err, data);
        }

        return callback(null, data);
    });
};

TrelloWrapper.prototype.genTokenUrl = function(access, duration) {
    if (!this.key) return "Specify a trello key, see help.";

    duration = duration || "1day"
    access = access || "read,write";

    var return_url = "https://trello.com/1/authorize?key=" + this.key + "&name=TicketMaster&expiration=" + duration + "&response_type=token&scope=" + access;
    return return_url;
};


module.exports = TrelloWrapper;