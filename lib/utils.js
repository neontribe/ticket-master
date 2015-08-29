'use strict';

var fs = require("fs");
var path = require("path");

//credit stackoverflow person
function truncate(word, n, useWordBoundary) {
    var toLong = word.length > n,
        s_ = toLong ? word.substr(0, n - 1) : word;
    s_ = useWordBoundary && toLong ? s_.substr(0, s_.lastIndexOf(' ')) : s_;
    return toLong ? '' + s_ + '' : '' + s_ + '';
};

function genericCallbackHandler(a) {
    if (debug) {
        console.log(a);
    }
}

function readFileSync(path) {
    try {
        var file = fs.readFileSync(path, {
            encoding: 'utf-8'
        });
        return file;
    } catch (e) {
        return false;
    }
}

function fileExists(path) {
    try {
        var statCheck = fs.lstatSync(path);
        if (statCheck.isFile()) {
            return true;
        }
    } catch (e) {
        return false;
    }
};

//Extracts a jira issue id from a string (i.e filename)
//Example:
//  ticket_add new styles jira<delim>TIL-1
function extractJiraIssueId(string, delim) {
    if(typeof string != "String") {
        return "Invalid string";
    }

    string.split(delim)[1];
};

function directoryExists(path) {
    try {
        var statCheck = fs.lstatSync(path);
        if (statCheck.isDirectory()) {
            return true;
        }
    } catch (e) {
        return false;
    }
};

function listDirs(dir) {
    return fs.readdirSync(dir).filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
    });
};

function listFilenames(dir) {
    return fs.readdirSync(dir).filter(function(file) {
        return fs.statSync(path.join(dir, file)).isFile();
    });
};


module.exports = {
    truncate: truncate,
    genericCallbackHandler: genericCallbackHandler,
    listDirs: listDirs,
    listFilenames: listFilenames,
    fileExists: fileExists,
    directoryExists: directoryExists,
    readFile: readFileSync
};