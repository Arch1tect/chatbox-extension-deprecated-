(function() {
    "use strict";

    var historyHandler = chatbox.historyHandler;
    var msgHandler = chatbox.msgHandler;
    var utils = chatbox.utils;
    var ui = chatbox.ui;


    // Process message before displaying
    function processChatMessage(data, options) {
        options = options || {};

        //avoid empty name
        if (typeof data.username === 'undefined' || data.username==='')
           data.username = "empty name";

        var d = new Date();
        var msg_post_time_html = "<span class='socketchatbox-messagetime'>";                    

        if (options.history) {

            msg_post_time_html += ' ('+ data.post_time +')';

        } else {

            msg_post_time_html += ' ('+('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2)+')';
        }
        
        msg_post_time_html += "</span>";

        var $usernameDiv = $('<div></div>').html(utils.cleanInput(data.username) + msg_post_time_html);

        $usernameDiv.addClass('socketchatbox-username');
        var $messageBodyDiv = $('<span class="socketchatbox-messageBody">');
        if (data.username === chatbox.username) {
            $messageBodyDiv.addClass('socketchatbox-messageBody-me');
        } else {
            $messageBodyDiv.addClass('socketchatbox-messageBody-others');
        }

        // received image file in base64
        if (data.file) {
            var mediaType = "img";
            if (data.file.substring(0,10)==='data:video')
                mediaType = "video controls";

            if (data.file.substring(0,10)==='data:image' || data.file.substring(0,10)==='data:video') {
                $messageBodyDiv.addClass("hasMedia");
                $messageBodyDiv.html("<a target='_blank' href='" + data.file + "'><"+mediaType+" class='chatbox-image' src='"+data.file+"'></a>");
            }else{
                $messageBodyDiv.html("<a target='_blank' download='" + data.fileName +"' href='"+data.file+"'>"+data.fileName+"</a>");
            }

            if(data.username === chatbox.username){
                ui.receivedFileSentByMyself();
            }


        }else{

            if (utils.checkImageUrl(data.message)) { // may cause secure issue?
                // receiving image url
                $messageBodyDiv.html("<a target='_blank' href='" + data.message + "'><img class='chatbox-image' src='" + data.message + "'></a>");
            }else {
                // receiving plain text

                // If it's emoji only message, style differently
                if (utils.stringOnlyContainEmojis(data.message)) {
                    $messageBodyDiv.addClass("emoji-only");
                }

                $messageBodyDiv.text(data.message);
                
            }
        }

        // receiving new message
        if (!options.history && !options.typing) {
            historyHandler.save(data);

            // If it's a new message, unless option set to never auto open
            // chatbox, we'll show chatbox.
            if (!chatbox.showing || chatbox.ui.displayMode == 'min') {
                chrome.storage.local.get('chatbox_config', function(data) {
                    // TODO: update the entire config object when user
                    // updated extension option
                    if (data.chatbox_config && data.chatbox_config.open_chatbox_when == "never"){
                        console.log('Received new msg while chatbox closed, but not allowed to open chatbox.') 
                    }else {
                        ui.maximize();

                    }
                });
            }

        }


        var typingClass = options.typing ? 'socketchatbox-typing' : '';
        var $messageWrapper = $("<div class='socketchatbox-message-wrapper'></div>");
        var $messageDiv = $("<div class='socketchatbox-message'></div>")
            .data('username', data.username)
            .addClass(typingClass)
            .append($usernameDiv, $messageBodyDiv);

        if (options.history)
            $messageDiv.addClass('history');
        
        $messageWrapper.append($messageDiv);
        if (data.username === chatbox.username) {
            $messageDiv.addClass('socketchatbox-message-me');
        } else {
            $messageDiv.addClass('socketchatbox-message-others');
        }

        ui.addMessageElement($messageWrapper, options);
    }

    msgHandler.processChatMessage = processChatMessage;



    function sendMessage(msg) {
        var data = {};
        data.username = chatbox.username;
        data.msg = msg+'';//cast string
        chatbox.socket.emit('new message', data);
    }

    msgHandler.sendMessage = sendMessage;

    // Different from sendMessageToServer(), only admin can see the message
    function reportToServer(msg) {
        var data = {};
        data.username = chatbox.username;
        data.msg = msg+'';//cast string
        chatbox.socket.emit('report', data);
    }

    msgHandler.reportToServer = reportToServer;




})();
