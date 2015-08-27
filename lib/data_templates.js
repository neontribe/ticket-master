var utils = require("./utils");
var readline = require("readline");

require('colors')
var jsdiff = require('diff');

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
    data = data || {
        name: "nothing_here",
        id: "nothing_here",
        content: "nothing_here",
        actions: "nothing_here",
        attachments: "nothing_here"
    };

    this.name = utils.truncate(data.name.replace(/\//g, "-").toLowerCase(), 30, true);
    this.uneditedName = data.name;
    this.id = data.id;
    this.jiraId = data.key || "";
    this.parentBoard = data.idBoard;

    this.showChanges = data.showChanges || true;
    this.noJira = data.noJira || false;
    this.diff = null;

    this.content = data.desc;

    this.comments = data.actions;
    this.attachments = data.attachments;
};

Ticket.prototype.setDiff = function(new_ver, old_ver) {
    this.diff = jsdiff.diffWords(new_ver, old_ver);

    this.diff.new_ver = new_ver;
    this.diff.old_ver = old_ver;
};

Ticket.prototype.resolveDiff = function(callback) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    process.stdout.write("\n");

    this.diff.forEach(function(part) {
        var color = part.added ? 'green' :
            part.removed ? 'red' : 'white';
        process.stdout.write(part.value[color]);
    });

    console.log();

    rl.question("Are you happy with these changes (update file)? Y/n", function(ans) {
        rl.close();
        callback(ans);
    });
};

//=========

module.exports = {
    board: Board,
    column: Column,
    ticket: Ticket
};