var dataAccess = require('./dataAccess').mongoAccess,
		sortTweet = require('./util').util.sortByDate;

var TweetListModel = function () {
	this.displayList = [];
	this.pendingList = [];
	this.bannedList = [];

	this.tempDisplayList = [];
	this.tempPendingList = [];
	this.tempBannedList = [];
};

TweetListModel.prototype.load = function (callback) {
	var files,
			i,
			self = this;

	this.displayList = [];
	this.pendingList = [];
	this.bannedList = [];

	this.tempDisplayList = [];
	this.tempPendingList = [];
	this.tempBannedList = [];

	dataAccess.getLists(function (err, result) {
		if (err) {
		 	console.log(err);
		} else {
			for (i = 0; i < result.length; i++) {
				if (result[i].list == "display") {
					self.tempDisplayList.push(result[i]);
				} else if (result[i].list == "pending") {
					self.tempPendingList.push(result[i]);
				} else if (result[i].list == "banned") {
					self.tempBannedList.push(result[i]);
				} else {
					return;
				}
			}
			self.updateLists(function () {
				callback();
			});
		}
	});
};

TweetListModel.prototype.add = function (elemToAdd, callback) {
	if (elemToAdd.list == "display") {
		this.tempDisplayList.push(elemToAdd);
	} else if (elemToAdd.list == "pending") {
		this.tempPendingList.push(elemToAdd);
	} else if (elemToAdd.list == "banned") {
		this.tempBannedList.push(elemToAdd);
	}
	
	dataAccess.upsert(elemToAdd, function (err, elementUpdated) {
		if (err) {
			console.log(err);
		} else {
			callback(elementUpdated);
		}
	});
};

TweetListModel.prototype.changeList = function (idToChange, newList, callback) {
	var self = this;

	dataAccess.getTweetById(idToChange, function (err, doc) {
		var i;

		doc.list = newList;

		if (newList == "display") {
			for (i = 0; i < self.tempPendingList.length; i++) {
				if (idToChange == self.tempPendingList[i].id) {
					self.tempPendingList.splice(i, 1);
				}
			}
			self.tempDisplayList.push(doc);
		} else if (newList == "pending") {
			for (i = 0; i < self.tempDisplayList.length; i++) {
				if (idToChange == self.tempDisplayList[i].id) {
					self.tempDisplayList.splice(i, 1);
				}
			}
			self.tempPendingList.push(doc);
		} else if (newList == "banned") {
			for (i = 0; i < self.tempPendingList.length; i++) {
				if (idToChange == self.tempPendingList[i].id) {
					self.tempPendingList.splice(i, 1);
				}
			}
			self.tempBannedList.push(doc);
		}

		dataAccess.upsert(doc, function (err, elementUpdated) {
			if (err) {
				console.log(err);
			} else {
				self.updateLists(function () {
					callback(elementUpdated);
				});
			}
		});
	});
};

TweetListModel.prototype.updateLists = function (callback) {
	var self = this;
	_removeOldTweets(self.tempDisplayList, function (resultList) {
		self.tempDisplayList.sort(sortTweet);
		_removeOldTweets(self.tempPendingList, function (resultList) {
			self.tempPendingList.sort(sortTweet);
			_removeOldTweets(self.tempBannedList, function (resultList) {
				self.tempBannedList.sort(sortTweet);
				self.displayList = self.tempDisplayList;
				self.pendingList = self.tempPendingList;
				self.bannedList = self.tempBannedList;
			});
		});
  }); 

	callback();
	return;
};

TweetListModel.prototype.isIndexed = function (idToCheck) {
	var i, j, k, l, m, n;

	
	for (i = 0; i < this.displayList.length; i++) {
		if (this.displayList[i].id == idToCheck) {
			return true;
		}
	}
	for (j = 0; j < this.tempDisplayList.length; j++) {
		if (this.tempDisplayList[j].id == idToCheck) {
			return true;
		}
	}
	for (k = 0; k < this.pendingList.length; k++) {
		if (this.pendingList[k].id == idToCheck) {
			return true;
		}
	}
	for (l = 0; l < this.tempPendingList.length; l++) {
		if (this.tempPendingList[l].id == idToCheck) {
			return true;
		}
	}
	for (m = 0; m < this.bannedList.length; m++) {
		if (this.bannedList[m].id == idToCheck) {
			return true;
		}
	}
	for (n = 0; n < this.tempBannedList.length; n++) {
		if (this.tempBannedList[n].id == idToCheck) {
			return true;
		}
	}
	return false;
};

var _removeOldTweets = function (list, callback) {
	var i,
			breakLoop = false,
			currentDate,
			tempDate;

	if (list.length > 0) {
		for (i = list.length - 1; i >= 0; i--) {

			if (!breakLoop) {
				currentDate = new Date();
				tempDate = new Date(parseInt(list[i].date.year, 10), (parseInt(list[i].date.month, 10) - 1), parseInt(list[i].date.day, 10));
				if (Math.ceil((currentDate.getTime() - tempDate.getTime()) / 86400000) >= 7) {
					list.splice(0, i + 1);
					breakLoop = true;
				}
			}
		}
	}
	
	callback(list);
};

var tweetListModel = new TweetListModel();
exports.tweetListModel = tweetListModel;