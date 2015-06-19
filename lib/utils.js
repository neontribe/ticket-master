'use strict';

var fs = require("fs");
var path = require("path");

//credit stackoverflow person
function truncate(word, n, useWordBoundary) {
   var toLong = word.length>n,
       s_ = toLong ? word.substr(0,n-1) : word;
   s_ = useWordBoundary && toLong ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
   return  toLong ? '' + s_ + '-' : '' + s_ + '-';
};

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


module.exports = {
	truncate: truncate,
	genericCallbackHandler: genericCallbackHandler,
	listDirs: listDirs
};
