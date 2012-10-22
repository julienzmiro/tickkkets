var https = require("https"),
		tweetListModel;

var Filter = function () {
	this.spamList = [];
};

Filter.prototype.init = function (model, callback) {
	tweetListModel = model;
	callback();
};

Filter.prototype.isADribbbleInvite = function (message, callback) {
	var exp = [/Okay okay\. I think we're going to have to have a dribbble invite contest\. Stay tuned for details\!/gi, /Who wants a dribbble invite\?\?/gi, /I want a dribbble invite/gi, /draftim/gi, /draft\.im/gi, /seeking a Dribbble invite/gi, /send me a dribbble invite/gi, /congratulations/gi, /congrats/gi, /congratz/gi, /thanks/gi, /thank you/gi, /have any extra dribbble invites/gi, /have any dribbble invites/gi, /got any dribbble invites/gi, /got any extra dribbble invites/gi, /has any dribbble invites/gi, /has any extra dribbble invites/gi, /cribbble/gi],
		expQuestions = [/Any dribbble invite.+\?/gi, /who has.+\?/gi, /who got.+\?/gi, /anyone has.+\?/gi, /anyone got.+\?/gi, /does anyone have.+\?/gi, /does anyone got.+\?/gi, /do any of you have.+\?/gi, /do any of you got.+\?/gi, /do you have.*invite.*\?/gi, /anybody has.*invite.*\?/gi, /anyone has.*invite.*\?/gi],// Filtre + "?"
		i,
		j;
	//'
	// First we filter messages addressed to someone else than @dribbble
	if (_messageIsAddressed(message)) {
		callback(false);
		return;
	}
	
	// Then we check if one of the exp is in the message
	for (i = 0; i < exp.length; i++) {
		if (exp[i].test(message)) {
			callback(false);
			return;
		}
	}
	
	// Finally let's check if one of the question expression is in the message
	for (j = 0; j < expQuestions.length; j++) {
		if (expQuestions[j].test(message)) {
			callback(false);
			return;
		}
	}
	
	callback(true);
};

Filter.prototype.isNotASpammer = function (sender, message, callback) {
	var requestConf,
			request,
			i,
			self = this;

	for (i = 0; i < this.spamList.length; i++) {
		if (this.spamList[i] == message) {
			callback(false);
			return;
		}
	}

	requestConf = {
		host: "api.twitter.com",
		path: "/1/users/show.json?screen_name=" + sender + "&include_entities=false",
		method: "GET"
	};

	request = https.request(requestConf, function (res) {
		var resBody = "",
				result;

		res.setEncoding("utf8");

		res.on("data", function (data) {
			resBody += data;
		});

		res.addListener("end", function () {
			result = JSON.parse(resBody);

			if (result.error) {
				console.log("ERROR at the end of the user request : " + result.error);
			}

			if (result.statuses_count < 26) {
				self.spamList.push(message);
				callback(false);
			} else {
				callback(true);
			}
		});

	});

	request.setTimeout(60000, function () {
		senderIsASpammer(sender, message, callback);
	});
	
	request.on('error', function(e) {
	  console.error(e);
	});

	request.end();
};

// Private
var _messageIsAddressed = function (message) {
	var regAddressed = /^@(?!dribbble)+\b/ig;

	if (regAddressed.test(message)) {
		return true;
	}
	
	return false;
};

var filter = new Filter();

exports.filter = filter;