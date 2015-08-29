//Includes
var mkdirp = require('mkdirp');
var request = require("request");
var fs = require("fs");
var path = require("path");
var url = require("url");

var Templates = require("./data_templates");
var utils = require("./utils");

var api_path = "rest/api/2/";

//Module constructor
function JiraWrapper(host, apiPath, user, password) {
    this.host = host;
    this.user = user;
    this.password = password;
    this.request_options = this.genJiraRequest(apiPath);
};

JiraWrapper.prototype.genJiraRequest = function(path, method, json, bodyObject) {

    bodyObject = bodyObject || {};
    method = method || "GET";

    var temp_url = url.format({
        protocol: "https",
        host: this.host,
        port: 443,
        pathname: path
    });

    //TODO: find out why this is replaced and how to fix it proper like
    temp_url = temp_url.replace("%3F", "?");

    var options = {
        uri: temp_url,
        auth: {
            'username': this.user,
            'password': this.password
        },
        body: bodyObject,
        method: method,
        json: json
    };

    return options;
};

//Updates tickets in the specified directory with updates from corresponding jira tickets.
JiraWrapper.prototype.getLatest = function(dir, boards, callback) {
    var _this = this;
    boardTick(0);

    function boardTick(i) {
        var curr_board_path = dir + "/" + boards[i].replace(/\//g, "-").toLowerCase();
        var curr_board_path_files = utils.listFilenames(curr_board_path);

        //Filter out non-jira-tickets
        curr_board_path_files = curr_board_path_files.filter(function(file) {
            if (file.indexOf("ticket_") == 0) {
                return true;
            } else {
                return false;
            }
        });

        if (!utils.directoryExists(curr_board_path)) {
            return callback("Directory doesn't exist, are the names the same between jira and trello?", null);
        };

        //Tickets, description, field.

        //Currently trello boards and jira projects need to be called the same thing.
        //TODO: allow them to be called different things.
        _this.getProjectByName(boards[i], true, function(err, data) {
            ticketTick(0);

            function ticketTick(j) {
                var newTicket = new Templates.ticket(data.issues[j], "jira");

                if (j < data.issues.length - 1) {
                    ticketTick(j + 1);
                } else if (j == data.issues.length - 1 && i == boards.length) {

                    return callback(null, "done");
                }

            };
        });

        if (++i < boards.length) {
            boardTick(i);
        };

    };
};

//Grab a specific issue from jira
JiraWrapper.prototype.getIssue = function(issueId, includeComments, callback) {
    this.get("rest/api/2/issue/" + issueId, function(err, data) {
        if (err) {
            callback(err, data);
        };

        if (includeComments) {
            this.get("rest/api/2/issue/" + issueId + "/comment", function(err_2, data_2) {
                var comments = data_2.body.comments;
                data.body.comments = comments;
                callback(null, data);

            });
        } else {
            callback(null, data);
        };
    });
};

JiraWrapper.prototype.getProjectByIdOrKey = function(projectKey, includeIssues, callback) {
    var _this = this;
    projectKey = projectKey || "";

    this.get("rest/api/2/project/" + projectKey, function(err, data) {
        if (err) {
            return callback(err, data);
        };

        if (includeIssues) {
            _this.getIssues(data.body.key, true, function(err_2, data_2) {
                data.body.issues = data_2.issues;
                callback(null, data);
            });
        } else {
            callback(null, data);
        }


    });
};

JiraWrapper.prototype.getProjectByName = function(projectName, includeIssues, callback) {
    var _this = this;

    projectName = projectName || "";

    this.get("rest/api/2/project", function(err, data) {
        if (err) {
            return callback(err, null);
        };

        var proj = null;

        for (var p = 0; p < data.body.length; p++) {
            var project = data.body[p];
            if (project.name.toLowerCase() == projectName.toLowerCase()) {
                proj = project;
                break;
            }
        };

        if (!proj) return callback("No project called: " + projectName + " could be found.", null);

        _this.getProjectByIdOrKey(proj.id, includeIssues, function(err_2, data_2) {
            if (err_2) {
                return callback(err, null);
            };
            callback(null, data_2.body);
        });
    });
};

//Gets all issues in a project
JiraWrapper.prototype.getIssues = function(projectKey, includeComments, callback, resultsLimit) {
    var _this = this;

    resultsLimit = resultsLimit || 100000;
    this.get("rest/api/2/search?jql=project=" + projectKey + "&maxResults=" + resultsLimit, function(err, data) {
        if (err) {
            return callback(err, null);
        };

        if (includeComments) {
            (function tickIssues(i) {
                _this.get("rest/api/2/issue/" + data.body.issues[i].key + "/comment", function(err_2, data_2) {
                    var comments = data_2.body.comments;
                    data.body.issues[i].comments = comments;

                    if (++i < data.body.issues.length) {
                        tickIssues(i);
                    } else {
                        callback(null, data.body);
                    };
                });
            })(0);
        } else {
            callback(null, data.body);
        };
    });
};

//make a get request to the api
JiraWrapper.prototype.get = function(path, callback) {
    var get_request = this.genJiraRequest(path, "GET", true);
    request(get_request, function(err, response, body) {
        if (err) {
            return callback(err, response);
        }
        callback(null, response);
    });
};

//make a post request to the api (not tested)
JiraWrapper.prototype.post = function(path, bodyObj, callback) {
    var post_request = this.genJiraRequest(path, "POST", true, bodyObj);
    request(post_request, function(err, response, body) {
        if (err) {
            return callback(err, response);
        }
        callback(null, response);
    });
};

JiraWrapper.prototype.put = function(path, bodyObj, callback) {
    var put_request = this.genJiraRequest(path, "PUT", true, bodyObj);
    request(put_request, function(err, response, body) {
        if (err) {
            return callback(err, response);
        }
        callback(null, response);
    });
};

module.exports = JiraWrapper;