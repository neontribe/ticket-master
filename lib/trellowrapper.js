"use strict";

var Trello = require("node-trello");
var mkdirp = require('mkdirp');
var fs = require("fs");
var path = require("path");

var debug = false;

function genericCallbackHandler(a) {
	if(debug) {
		console.log(a);
	}
}

function listDirs(dir) {
  return fs.readdirSync(dir).filter(function(file) {
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
}

//Templates

//columns: array of column ids
function Board(data) {
	this.name = data.name;
	this.id = data.id;
	this.url = data.url;
	this.desc = data.desc;
}

function Column(data) {
	this.name = data.name;
	this.id = data.id;
	this.parentBoard = data.idBoard;
}

function Ticket(title, id, content) {
	this.name = title;
	this.id = id;
	this.content = content;
}

function TrelloWrapper(key, token, parent) {
	this.key = key;
	this.token = token;
	this.parent = parent;

	this.trello = new Trello(this.key, this.token);
	
	this.user = {};
}

TrelloWrapper.prototype.init = function(callback) {
	this.trello.get("/1/members/me", {}, function(err, data) {
		if(err) {
			return callback(err, data);
		}

		return callback(null, data);
	});
};

//Gen Filetree For Boards
TrelloWrapper.prototype.genBoards = function(dir, callback) {
	var _this = this;
	mkdirp(dir, function(err) {
		_this.getBoards(function parseBoards(err, data) {
			//For each board make directory and give it a <board>.json file
			for(var i = 0; i < data.length; i++) {
				(function(i) {
					var newBoard = new Board(data[i]);
					mkdirp(dir + "/" + newBoard.name, function parseLists() {
						_this.parent.dumpJSON(dir + "/" + newBoard.name + "/" + newBoard.name + ".json", JSON.stringify(newBoard), function() {
							if(i == data.length - 1) {
								callback();
							}
						});
					});
				})(i);
			}
		});	
	});
};

//Gen Filetree For Cols
//dir: base directory of file tree
TrelloWrapper.prototype.genCols = function(dir, callback) {
	var _this = this;
	var boards = listDirs(dir);
	for(var i = 0; i < boards.length; i++) {
		var currDir = dir + "/" + boards[i] + "/";
		//Get current ID
		(function(i, currDir) {
			fs.readFile(currDir + boards[i] + ".json", function(e, d) {
				var id = JSON.parse(d).id;
				_this.getCols(id, function(err, data) {
					for(var j = 0; j < data.length; j++) {
						(function(j, currDir) {
							var newColumn = new Column(data[j]);
							mkdirp(currDir + newColumn.name, function() {
								_this.parent.dumpJSON(currDir + newColumn.name + "/" + newColumn.name + ".json", JSON.stringify(newColumn), function() {
									if(j == data.length - 1 && i == boards.length - 1) {
										callback();
									}
								});
							});
						})(j, currDir);
					}
				});
			});
		})(i, currDir);
	}
};

TrelloWrapper.prototype.getBoards = function(callback) {
	this.trello.get("/1/members/me/boards", {}, function(err, data) {
		if(err) {
			return callback(err, data);
		};

		return callback(null, data);
	});
};

TrelloWrapper.prototype.getCols = function(boardId, callback) {
	this.trello.get("/1/boards/" + boardId + "/lists", {}, function(err, data) {
		if(err) {
			return callback(err, data);
		}

		return callback(null, data);
	});

};

TrelloWrapper.prototype.genTokenUrl = function(access, duration) {
	if(!this.key) return "Specify a trello key, see help.";
	
	duration = duration || "1day"
	access = access || "read,write";

	var return_url = "https://trello.com/1/authorize?key=" +  this.key + "&name=TicketMaster&expiration="+ duration +"&response_type=token&scope="+access;
	return return_url;
};


module.exports = TrelloWrapper;