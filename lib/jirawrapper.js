//Includes
var mkdirp = require('mkdirp');
var request = require("request");
var fs = require("fs");
var path = require("path");
var url = require("url");

var Templates = require("./data_templates");

var api_path = "rest/api/2/";

//Module constructor
function JiraWrapper(host, apiPath, user, password) {
	this.host = host;
	this.user = user;
	this.password = password;
	this.request_options = this.genJiraRequest(apiPath);
};

JiraWrapper.prototype.genJiraRequest = function(path, method, json) {
	method = method || "GET";

	var temp_url = url.format({
		protocol: "https",
		host: this.host,
		port: 443,
		pathname: path
	});

	var options = {
		uri: temp_url,
		auth: {
			'username': this.user,
			'password': this.password
		},
		method: method,
		json: json
	};

	return options;
};

//Grab a specific issue from jira
JiraWrapper.prototype.getIssue = function(issue_id, callback) {
	this.get("rest/api/2/issue/" + issue_id, function(err, data) {
		if(err) {
			callback(err, data);
		}

		callback(null, data);
	});
};

//make a get request to the api
JiraWrapper.prototype.get = function(path, callback) {
	var get_request = this.genJiraRequest(path, "GET", true);
	request(get_request, function(err, response, body) {
		if(err) {
			callback(err, response);
		}
		callback(null, response);
	});
};

//make a post request to the api (not tested)
JiraWrapper.prototype.post = function(path, callback) {
	var get_request = this.genJiraRequest(path, "POST", true);
	request(get_request, function(err, response, body) {
		if(err) {
			callback(err, response);
		}
		callback(null, response);
	});
};

module.exports = JiraWrapper;