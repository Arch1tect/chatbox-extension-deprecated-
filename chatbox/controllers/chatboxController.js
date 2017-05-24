(function() {

	"use strict";

	var utils = chatbox.utils;

	var ui = chatbox.ui;
	// ui.CHATBOX_MIN_WIDTH = 100;
	// ui.CHATBOX_MIN_HEIGHT = 30;
	// ui.CHATBOX_DEFAULT_WIDTH = 350;
	// ui.CHATBOX_DEFAULT_HEIGHT = 415;


	ui.init.push(function() {

		ui.$inputMessage = $('.socketchatbox-inputMessage');
		ui.$messages = $('.socketchatbox-messages');
		ui.$username = $('#socketchatbox-username');
		ui.$usernameInput = $('.socketchatbox-usernameInput'); 
		ui.$chatBox = $('.socketchatbox-page');
		ui.$topbar = $('#socketchatbox-top');
		ui.$chatBody = $('#socketchatbox-body');
		ui.$chatArea = $(".socketchatbox-chatArea");
		ui.$inboxArea = $('.socketchatbox-inbox');
		ui.$showHideChatbox =  $('#socketchatbox-showHideChatbox');
		ui.$chatboxResize = $('.socketchatbox-resize');
		ui.$cross = $('#socketchatbox-closeChatbox');
		ui.$topbarOptions = $('#topbar-options');
		ui.$at = $('#socketchatbox-change-room');
		ui.$inboxBtn = $('#socketchatbox-inbox');
		ui.$refreshBtn = $('#socketchatbox-refresh');
		
		ui.$onlineUserNum = $('#socketchatbox-online-usercount');
		ui.$onlineUsers = $('.socketchatbox-onlineusers');
		ui.$msgModalContent = $('#socketchatbox-msgpopup-content');
		ui.$msgModal = $('#socketchatbox-msgpopup-modal');
		ui.$changeRoomBtn = $('#go-to-room-btn');
		ui.$toggleRoomLock = $('#chatroom-lock-unlock');

		ui.$friendList = $('.socketchatbox-friend-list');
		ui.$friend = $('.socketchatbox-friend-list div');
		ui.$friendMessages = $('.socketchatbox-friend-messages');

		ui.displayMode = 'min'; // default css sytle
    	$('[data-toggle="tooltip"]').tooltip();   


		var config = chatbox.config;
		if (config.width) {
			ui.$chatBody.css({ "width":config.width+"px", "height":config.height+"px"});
			console.log('loaded config width: ' + config.width + ' height: ' + config.height);
		}
        if(config.lockRoom) {
            ui.$toggleRoomLock.removeClass('fa-unlock-alt');
            ui.$toggleRoomLock.addClass('fa-lock');
        }else {
            ui.$toggleRoomLock.removeClass('fa-lock');
            ui.$toggleRoomLock.addClass('fa-unlock-alt');	
        }
        
        ui.$at.attr('data-original-title', chatbox.roomID);  

		ui.$topbar.click(function() {
			$('#socketchatbox-sticker-picker').hide();
			ui.$inputMessage.emojiPicker('hide'); // hide emoij picker if open


			if(ui.$chatBody.is(":visible")){
				minimize();

			}else {
			
				maximize();
				ui.scrollToBottom();
			}

		});

		ui.$topbarOptions.click(function(e) {
			$('[data-toggle="tooltip"]').tooltip('hide');

			e.preventDefault();
			e.stopPropagation();
			$('#socketchatbox-sticker-picker').hide();
			ui.$inputMessage.emojiPicker('hide'); // hide emoij picker if open
			
		});

		ui.$friend.click(function(e) {
			console.log(this);
			var options = {};
            options.inbox = true;
			var index;

			for (index=0; index<chatbox.inbox.messages.length; index++) {
				chatbox.msgHandler.processChatMessage(chatbox.inbox.messages[index], options);
			}
			
		});

		ui.$refreshBtn.click(function(e) {

			$('[data-toggle="tooltip"]').tooltip('hide');

			e.preventDefault();
			e.stopPropagation();
			$('#socketchatbox-sticker-picker').hide();
			ui.$inputMessage.emojiPicker('hide'); // hide emoij picker if open
			

			chatbox.socket.disconnect();
			ui.welcomeMsgShown = false;
			chatbox.connect();
            
		});

		ui.$inboxBtn.click(function(e) {
			$('[data-toggle="tooltip"]').tooltip('hide');

			e.preventDefault();
			e.stopPropagation();
			$('#socketchatbox-sticker-picker').hide();
			ui.$inputMessage.emojiPicker('hide'); // hide emoij picker if open
			
			if(ui.$inboxArea.is(':visible')) 
				ui.$inboxBtn.attr('data-original-title', 'Open inbox');  
			else
				ui.$inboxBtn.attr('data-original-title', 'Close inbox');  

			ui.$inboxBtn.toggleClass('selected');
			ui.$chatArea.slideToggle();
			ui.$inboxArea.slideToggle();

		});

		ui.$cross.click(function(e) {
			$('[data-toggle="tooltip"]').tooltip('hide');

			close();
			e.preventDefault();

			e.stopPropagation();

		});

		ui.$at.click(function(e) {
			$('[data-toggle="tooltip"]').tooltip('hide');

			e.preventDefault();
			e.stopPropagation();
			$('#socketchatbox-sticker-picker').hide();
			ui.$inputMessage.emojiPicker('hide'); // hide emoij picker if open

			ui.$msgModalContent.val(chatbox.roomID);
			ui.$msgModal.modal('show');

		});

		ui.$changeRoomBtn.click(function() {

			var newRoomID = ui.$msgModalContent.val();
			if (newRoomID !== chatbox.roomID) {

				chatbox.roomID = newRoomID;
				chatbox.config.roomID = chatbox.roomID;
				chatbox.socket.disconnect();
				ui.addLog('Changing chat room...');
				chatbox.historyHandler.load(); // must call to set correct key to save new msg
				ui.addLog('Chat room changed.');
				ui.welcomeMsgShown = false;
				chatbox.connect();
            	chrome.storage.local.set({ chatbox_config: chatbox.config });
        		ui.$at.attr('data-original-title', 'Room: ' + chatbox.roomID);  
            }

		});

		ui.$toggleRoomLock.click(function(){
			
			if(chatbox.config.lockRoom) {

				ui.$toggleRoomLock.addClass('fa-unlock-alt');
				ui.$toggleRoomLock.removeClass('fa-lock');

			} else {

				ui.$toggleRoomLock.addClass('fa-lock');
				ui.$toggleRoomLock.removeClass('fa-unlock-alt');

			}
			chatbox.config.lockRoom = !chatbox.config.lockRoom;

            chrome.storage.local.set({ chatbox_config: chatbox.config });


		});

		ui.$msgModalContent.focus(function() {
			// Auto select content in textarea
		    var $this = $(this);
		    $this.select();

		    // Work around Chrome's little problem
		    $this.mouseup(function() {
		        // Prevent further mouseup intervention
		        $this.unbind("mouseup");
		        return false;
		    });
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
			$('#socketchatbox-sticker-picker').hide();
			ui.$inputMessage.emojiPicker('hide'); // hide emoij picker if open
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
			if(boxH<120)     boxH = 120;

			ui.$chatBody.css({ "width":(boxW)+"px", "height":(boxH)+"px"});
			console.log('chatBody width: ' + boxW + ' height: ' + boxH);
			chatbox.config.width = boxW;
			chatbox.config.height = boxH;
			prev_x = e.screenX;
			prev_y = e.screenY;

		});

		$(document).mouseup(function(){
			if (prev_x !== -1) {
				prev_x = -1;
				prev_y = -1;
				refreshSize();
				chrome.storage.local.set({ chatbox_config: chatbox.config });

			}
		});

		// TODO: move emoji and sticker code below to a new controller.js

		// emoji
		ui.$inputMessage.emojiPicker({
			width: '350px',
			height: '350px',
			button: false
		});
		$('#socketchatbox-emoji-btn').click(function(e) {
			$('[data-toggle="tooltip"]').tooltip('hide');
			$('.socketchatbox-inputMessage').emojiPicker('toggle');
		});
		// Open then close emoji picker programmatically because first time open is too slow
		// $('.socketchatbox-inputMessage').emojiPicker('toggle');
		$('.socketchatbox-inputMessage').emojiPicker('toggle');

		$('#socketchatbox-sticker-btn').click(function(e) {
			$('[data-toggle="tooltip"]').tooltip('hide');

			$('#socketchatbox-sticker-picker').slideToggle();
			$('.socketchatbox-inputMessage').emojiPicker('hide');
			e.stopPropagation();
		});
		$('#socketchatbox-sticker-picker img').click(function(e) {
			// console.log($(this).attr('src'));
			chatbox.msgHandler.sendMessage($(this).attr('src'));
		});

        $(window).keydown(function (event) {

            // When the client hits ENTER on their keyboard
            if (event.which === 13) {
                chatbox.ui.$inputMessage.emojiPicker('hide'); // hide emoij picker if open
            }

            // When the client hits ESC on their keyboard
            if (event.which === 27) {
                $('#socketchatbox-sticker-picker').hide();
                chatbox.ui.$inputMessage.emojiPicker('hide'); // hide emoij picker if open
            }

        });


	});

	function refreshSize() {
		// Update iframe size after mouse up
		// Could not call utils.updateIframeSize('fit') directly

		// Minimize then maximize to deal with a 
		// strange bug that scroll doesn't work
		// after resizinng
		ui.minimize();
		setTimeout(function() {
			ui.maximize();
		}, 1);
	}
	ui.refreshSize = refreshSize;

	function close() {
		utils.updateIframeSize('close'); 
	}
	ui.close = close;

	function maximize() {
		console.log('maximize chatbox');
		ui.$showHideChatbox.text("↓");
		ui.$username.text(chatbox.username);
		ui.$chatBody.show();
		ui.$username.show();
		ui.$topbar.css('background','rgba(0, 0, 0, 0.75)');
		ui.$topbarOptions.show();

		//show resize cursor
		ui.$chatboxResize.css('z-index', 999999999);
		ui.$messages[0].scrollTop = ui.$messages[0].scrollHeight;

        utils.updateIframeSize('fit');
		ui.displayMode = 'max';
	}
	ui.maximize = maximize;

	function minimize() {

		console.log('minimize chatbox');

		ui.$showHideChatbox.text("↑");
		// ui.$username.html("<a href='https://quotime.me' target='_blank'>" + chatbox.NAME + '</a>');
		ui.$username.hide();
		ui.$chatBody.hide();
		ui.$topbarOptions.hide();
		ui.$topbar.css('background','none');
		ui.$chatboxResize.css('z-index', -1); //hide resize cursor
        utils.updateIframeSize('minimize');
		ui.displayMode = 'min';

	}

	ui.minimize = minimize;

	ui.updateOnlineUserCount = function (num) {ui.$onlineUserNum.text(num);};



})();
