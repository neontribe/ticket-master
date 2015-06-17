var JiraApi = require('jira').JiraApi;

var mkdirp = require('mkdirp');
var fs = require("fs");
var path = require("path");

var Templates = require("./data_templates");

//Module constructor
function JiraWrapper(protocol, hostname, port, username, password) {
	this.protocol = protocol || "https"
    this.host = hostname || "jira.neontribe.org";
    this.port = port || 80;
    this.username = username || "Oliver Barnwell";
    this.password = password || "b191kwm";



    this.jira = new JiraApi(this.protocol, this.host, this.port, this.username, this.password, "2", true, true);
    this.user = {};
}

JiraWrapper.prototype.test = function(callback) {

	this.jira.findIssue(361, function(error, issue) {
		console.log(error);
    	console.log('Status: ' + issue.fields.status.name);
    	callback(issue.fields);
	});

}

module.exports = JiraWrapper;