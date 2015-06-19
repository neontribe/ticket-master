var utils = require("./utils");


//Templates
//==========
function Board(data) {
    this.name = data.name.replace(/\//g, "-").toLowerCase();
    this.uneditedName = data.name;
    this.id = data.id;
    this.url = data.url;
    this.desc = data.desc;
}

function Column(data) {
    this.name = data.name.replace(/\//g, "-").toLowerCase();
    this.uneditedName = data.name;
    this.id = data.id;
    this.parentBoard = data.idBoard;
}

function Ticket(data) {
    data = data || {name: "nothing_here", id: "nothing_here", content: "nothing_here", actions: "nothing_here", attachments: "nothing_here"};
    this.name = utils.truncate(data.name.replace(/\//g, "-").toLowerCase(), 30, true);
    this.uneditedName = data.name;
    this.id = data.id;
    this.content = data.desc;

    this.comments = data.actions;
    this.attachments = data.attachments;
}
//=========

module.exports = {
    board: Board,
    column: Column,
    ticket: Ticket
};