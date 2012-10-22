var Util = function () {};

// Private - Convert a string month to number
var monthStringToNum = function (string) {
	var numToReturn;

	switch (string) {
		case "Jan" :
			numToReturn = "01";
			break;
		case "Feb" :
			numToReturn = "02";
			break;
		case "Mar" :
			numToReturn = "03";
			break;
		case "Apr" :
			numToReturn = "04";
			break;
		case "May" :
			numToReturn = "05";
			break;
		case "Jun" :
			numToReturn = "06";
			break;
		case "Jul" :
			numToReturn = "07";
			break;
		case "Aug" :
			numToReturn = "08";
			break;
		case "Sep" :
			numToReturn = "09";
			break;
		case "Oct" :
			numToReturn = "10";
			break;
		case "Nov" :
			numToReturn = "11";
			break;
		case "Dec" :
			numToReturn = "12";
			break;
	}

	return numToReturn;
	
};

// Convert a twitter date to a display date
Util.prototype.datify = function (dateToChange) {

	var dateToReturn = {};

	//Thu, 06 Oct 2011 19:36:17 +0000
	dateToReturn.year = dateToChange.substr(12, 4);
	dateToReturn.month = monthStringToNum(dateToChange.substr(8, 3));
	dateToReturn.monthString = dateToChange.substr(8, 3);
	dateToReturn.day = dateToChange.substr(5, 2);
	dateToReturn.hour = dateToChange.substr(17, 2);
	dateToReturn.minutes = dateToChange.substr(20, 2);
	dateToReturn.seconds = dateToChange.substr(23, 2);

	return dateToReturn;

};

// Used by Array.sort() to compare tweets by date
Util.prototype.sortByDate = function (a, b) {
	var dateA,
		dateB;
	
	dateA = new Date(parseInt(a.date.year, 10), parseInt(a.date.month, 10), parseInt(a.date.day, 10), parseInt(a.date.hour, 10) ,parseInt(a.date.minutes, 10), parseInt(a.date.seconds, 10));
	dateB = new Date(parseInt(b.date.year, 10), parseInt(b.date.month, 10), parseInt(b.date.day, 10), parseInt(b.date.hour, 10) ,parseInt(b.date.minutes, 10), parseInt(b.date.seconds, 10));
	
	if (dateA.getTime() < dateB.getTime()) {
		return 1;
	} else {
		return -1;
	}
	return 0;
};

var util = new Util();

exports.util = util;