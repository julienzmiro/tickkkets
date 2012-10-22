/* Author:
java -jar /usr/local/yuicompressor/build/yuicompressor-2.4.7.jar /Users/julienzmiro/Sites/tickkkets/tickkkets.com/public/js/script.js -o /Users/julienzmiro/Sites/tickkkets/tickkkets.com/public/js/script-min.js --type js --charset utf-8
java -jar /usr/local/yuicompressor/build/yuicompressor-2.4.7.jar /Users/julienzmiro/Sites/tickkkets/tickkkets.comv2/public/js/script.js -o /Users/julienzmiro/Sites/tickkkets/tickkkets.comv2/public/js/script-min.js --type js --charset utf-8
*/
$(document).ready(function () {

	//var username = window.location.pathname.split("/", 2);

	$(".adminLink").live("click", function (e) {
		// console.log("CLICK");
		e.preventDefault();
		var liTarget = $(e.target).closest("li");
		// console.log($(e.target).closest("li"));
		// console.log("click on : " + $(e.target).attr("href"));
		$.ajax("/admin/julien.zmiro" + $(e.target).attr("href"), {
        type: 'POST',
        dataType: 'json',
        success: function (data) {
        	// console.log("SUCCESS");
        	if (data) {
        		// console.log("AND DATA");
        		callback(data, liTarget);
        	}

        },
        error: function () {
        	console.log("ajax error");
        }
    });
	});

	function callback (data, target) {
		var targetSave = target,
				tmpId = "";

		// console.log("CALLBACK for : ");
		// console.log(target);
		// console.log("Of type : " + data.type);

		if (data.type == "add") {
			// console.log("ADDED ANIM");
			// rm from pending
			target.remove();
			// add to display
			$(".display ul").prepend(targetSave);
			targetSave.find(".adminLink").text("Remove this tweet");
			tmpId = targetSave.find(".adminLink").attr("href").substr(5);
			// console.log("ID : " + tmpId);
			targetSave.find(".adminLink").attr("href", "/rm/" + tmpId);
		} else if (data.type == "rm") {
			// console.log("RM ANIM");
			// rm from display
			target.remove();
			// add to pending
			$(".pending ul").prepend(targetSave);
			targetSave.find(".adminLink").text("Add this tweet");
			tmpId = targetSave.find(".adminLink").attr("href").substr(4);
			// console.log("ID : " + tmpId);
			targetSave.find(".adminLink").attr("href", "/add/" + tmpId);
		} else if (data.type == "ban") {
			// console.log("BAN ANIM");
			// rm from display
			target.remove();
		}
	};

});