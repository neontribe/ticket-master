var assert = require("assert");
var chai = require("chai");
var expect = chai.expect;

var t = require("../../lib/ticketmaster");


var options = {
    trello: {
        key: "871a2695a447edbd7ed0e5fa4ea8c390",
        token: "7da0903ee016460595090b92b130aedf2dc00f45cbde83617133aa85dffa8d84"
    },
    jira: {
        host: "jira.neontribe.org",
        api_path: "rest/api/2",
        username: "",
        password: ""
    }
}

describe("Trello", function() {
    describe('#getBoards', function() {
        it("should return an array containing a specified board or all boards if no board is specified.", function(done) {
        	this.timeout(5000);
            var board_to_test = "Welcome Board";
            var TicketMaster = new t(options);
            TicketMaster.init(function() {
                TicketMaster.trello.getBoards(board_to_test, function(err, data) {
                	expect(data).to.be.an("array");
                	expect(err).to.be.a("null");
                    done();
                });
            });
        });
    });

    describe("#getCols()", function() {
        it("should return an array containing a specified column in a board.", function(done) {
        	this.timeout(5000);
            var TicketMaster = new t(options);
            TicketMaster.init(function() {
                var board_to_test = "Welcome Board";
                var column_to_test = "55685e38d96bc0534015bccd";
                TicketMaster.trello.getCols(column_to_test, board_to_test, function(err, data) {
                    expect(data).to.be.an("array");
                    expect(err).to.be.a("null");
                    done();
                });
            });
        });

        it("should return an array containing all columns in board if no column is specified.", function(done) {
        	this.timeout(5000);
            var TicketMaster = new t(options);
            TicketMaster.init(function() {
                var board_to_test = "53b2927f9d8a6ff2e1e2492b";
                TicketMaster.trello.getCols(null, board_to_test, function(err, data) {
                    expect(data).to.be.an("array");
                    expect(err).to.be.a("null");
                    done();
                });
            });
        });
    });
});