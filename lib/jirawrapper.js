var mkdirp = require('mkdirp');
var request = require("request");
var fs = require("fs");
var path = require("path");
var url = require("url");

var Templates = require("./data_templates");

var api_path = "rest/api/2/";

//Module constructor
function JiraWrapper(host, user, password) {
	this.host = host;
	this.user = user;
	this.password = password;
	this.request_options = this.genJiraRequest("rest/api/2");
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

//make a get request to the api
JiraWrapper.prototype.get = function(path, callback) {
	var get_request = this.genJiraRequest(path, "GET", true);
	

	request(get_request, function(error, response, body) {
		console.log(body);
	});
};

JiraWrapper.prototype.test = function(callback) {

};

module.exports = JiraWrapper;