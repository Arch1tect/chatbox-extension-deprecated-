(function() {

	"use strict";

	var ui = chatbox.ui;
	var utils = chatbox.utils;

	ui.init.push(function() {

		ui.$inputMessage = $('.socketchatbox-inputMessage');
		ui.$messages = $('.socketchatbox-messages');
		ui.$username = $('#socketchatbox-username');
		ui.$usernameInput = $('.socketchatbox-usernameInput'); 
		ui.$chatBox = $('.socketchatbox-page');
		ui.$topbar = $('#socketchatbox-top');
		ui.$chatBody = $('#socketchatbox-body');
		ui.$showHideChatbox =  $('#socketchatbox-showHideChatbox');
		ui.$chatboxResize = $('.socketchatbox-resize');
		ui.$cross = $('#socketchatbox-closeChatbox');
		ui.$chatArea = $(".socketchatbox-chatArea");

		ui.$topbar.click(function() {


			if(ui.$chatBody.is(":visible")){

				minimize();

			}else {
			
				show();
				ui.scrollToBottom();
			}

			chrome.storage.local.set({ chatbox_show: chatbox.showing });


		});


		ui.$cross.click(function(e) {
			close();
			e.preventDefault();
			e.stopPropagation();

		});


		//resize chatbox
		var prev_x = -1;
		var prev_y = -1;
		var dir = null;

		ui.$chatboxResize.mousedown(function(e){
			prev_x = e.screenX;
			prev_y = e.screenY;
			dir = $(this).attr('id');
			e.preventDefault();
			e.stopPropagation();

			utils.updateIframeSize('full size');

		});

		$(document).mousemove(function(e){

			if (prev_x == -1) return;
			var boxW = ui.$chatBody.outerWidth();
			var boxH = ui.$chatBody.outerHeight();
			var dx = e.screenX - prev_x;
			var dy = e.screenY - prev_y;


			//Check directions
			if (dir.indexOf('n') > -1)  boxH -= dy;
			if (dir.indexOf('w') > -1)  boxW -= dx;
			if (dir.indexOf('e') > -1)  boxW += dx;

			if(boxW<250)    boxW = 250;
			if(boxH<70)     boxH = 70;

			ui.$chatBody.css({ "width":(boxW)+"px", "height":(boxH)+"px"});

			prev_x = e.screenX;
			prev_y = e.screenY;

		});

		$(document).mouseup(function(){
			prev_x = -1;
			prev_y = -1;
			// update iframe size after mouse up
			utils.updateIframeSize('fit');
		});
	});

	function close() {
		utils.updateIframeSize('close'); 
	}
	ui.close = close;
	function show() {
		ui.$showHideChatbox.text("↓");
		ui.$username.text(chatbox.username);
		ui.$chatBody.show();
		//show resize cursor
		ui.$chatboxResize.css('z-index', 99999);
		ui.$messages[0].scrollTop = ui.$messages[0].scrollHeight;
		
		utils.updateIframeSize('fit');
		chatbox.showing = true;
	}

	ui.show = show;

	function minimize() {
		ui.$showHideChatbox.text("↑");
		// ui.$username.html("<a href='https://quotime.me' target='_blank'>" + chatbox.NAME + '</a>');
		ui.$username.html(chatbox.NAME);
		ui.$chatBody.hide();
		//hide resize cursor
		ui.$chatboxResize.css('z-index', -999);
		utils.updateIframeSize('minimize');
		chatbox.showing = false;
	}

	ui.minimize = minimize;

	ui.updateOnlineUserCount = function (num) {ui.$onlineUserNum.text(num);};

	// Receive message sent from extension
	chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {

		if (request.msg == "open_chatbox"){
			show();
			utils.updateIframeSize('fit');
			sendResponse({msg: "shown"});

		} 

		if (request.msg == "close_chatbox"){ 
			utils.updateIframeSize('close'); 
			sendResponse({msg: "closed"}); // updateIframeSize is async so this response is wrong 
		}

		if (request.msg == "is_chatbox_open") {
			sendResponse({is_chatbox_open: chatbox.showing});
		}

	});



})();
