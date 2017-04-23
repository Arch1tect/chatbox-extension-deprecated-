(function() {

	"use strict";

	var ui = chatbox.ui;
	var utils = chatbox.utils;
	ui.init.push(function() {

		ui.$onlineUserNum.click(function(e) {

			if (ui.$chatBody.is(":visible")){

				ui.$onlineUsers.slideToggle(300,function(){
					// ui.height = $('.socketchatbox-page').height();
					// utils.updateIframeSize('fit');

				});

				e.stopPropagation();
			}

		});
	});

	ui.updateUserList = function(userList) {

		ui.$onlineUsers.html('');
		var counter = 0;
		for (var username in userList) {
			// console.log(username);
			counter++;
			var $onlineUser = $('<span></span>');
			$onlineUser.text(username);
			ui.$onlineUsers.append($onlineUser);

		}

		ui.$onlineUserNum.text(counter);

	};

})();
