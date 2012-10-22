var http = require('http'),
		filter = require('./filter').filter,
		datify = require('./util').util.datify,
		twitter = require('twitter-text'),
		tweetListModel = require('./tweetListModel').tweetListModel;

var Streamer = function () {

	this.rpp = 100;
	this.lastId = 0;
	this.keyword = '"dribbble%20invite"OR"dribbble%20invites"OR"dribble%20invitation"OR"dribbble%20invitations"OR"dribbble%20contest"-RT';
	this.queryStr =  "";
	this.isPending = false;
	this.host = "search.twitter.com",
	this.connection = http.createClient(80, this.host);

};

Streamer.prototype.init = function (rpp, callback) {
	var self = this;

	this.rpp = rpp;
	console.log("streamer init : " + this.rpp);

	tweetListModel.load(function () {
		filter.init(tweetListModel, function () {
			callback(tweetListModel);
		});
	});
};

Streamer.prototype.stream = function () {
	var request,
			self = this;

	function requestByPage () {
	
		self.queryStr = "/search.json?q=" + self.keyword + "&since_id=" + self.lastId + "&rpp=" + self.rpp + "&page=1&include_entities=true&result_type=recent&lang=en";

		request = self.connection.request('GET', self.queryStr, {"host": self.host, "User-Agent": "tickkkets"});
		
		self.isPending = true;

		request.addListener("response", function (response) {
			var responseBody = "";

			response.setEncoding("utf8");

			response.addListener("data", function (chunk) {
				responseBody += chunk;
			});

			response.addListener("end", function () {
				var tweets,
						results;

				tweets = JSON.parse(responseBody);

				if (tweets.error) {
					console.log("ERROR at the end of the tweetStream request : " + result.error);
				}

				results = tweets["results"];
				
				_handleTweets(results, function () {

					self.isPending = false;

					tweetListModel.updateLists(function () {
						return;
					});
				});
			});
		});

		request.on('error', function(e) {
		  console.error(e);
		});

		request.end();
	};

	if (!this.isPending) {
		requestByPage();
	}
};

// Private
var _handleTweets = function (tweets, callback) {
	var x = 0;

	function forEachTweet(tweet) {
		var isADribbbleInviteTest = false,
			isNotASpammerTest = false;

		var loop = function () {
			if (x == tweets.length - 1)  {
				streamer.lastId = tweets[x].id_str;
				callback();
				return;
			} else {
				x += 1;
				forEachTweet(tweets[x]);
				return;
			}
		};
	
		if (!tweetListModel.isIndexed(tweet.id))  {
			filter.isADribbbleInvite(tweet.text, function (res) {
				isADribbbleInviteTest = res;
				if (isADribbbleInviteTest) {
					filter.isNotASpammer(tweet.from_user, tweet.text, function (res) {
						isNotASpammerTest = res;
						if (isNotASpammerTest) {
							_addToList(tweet, "display", function () {
								loop();
								return;
							});
						} else {
							_addToList(tweet, "banned", function () {
								loop();
								return;
							});
						}
					});
				} else {
					_addToList(tweet, "pending", function () {
						loop();
						return;
					});
				}
			});
		} else {
			loop();
			return;
		}
	};

	forEachTweet(tweets[x]);

};

var _addToList = function (tweetToAdd, list, callback) {
	var tempTweet = {};

	
	tempTweet.id = tweetToAdd.id_str;
	tempTweet.list = list;
	tempTweet.date = datify(tweetToAdd.created_at);
	tempTweet.userName = tweetToAdd.from_user;
	tempTweet.userId = tweetToAdd.from_user_id;
	tempTweet.userImg =tweetToAdd.profile_image_url;
	tempTweet.entities = tweetToAdd.entities;
	tempTweet.text = twttr.txt.autoLink(twttr.txt.htmlEscape(tweetToAdd.text));
	tempTweet.url = "https://twitter.com/" + tempTweet.userName + "/status/" + tempTweet.id;
	tempTweet.userUrl = "https://twitter.com/" + tempTweet.userName;
	
	tweetListModel.add(tempTweet, function () {
		callback();
	});

};

var streamer = new Streamer();

exports.streamer = streamer;