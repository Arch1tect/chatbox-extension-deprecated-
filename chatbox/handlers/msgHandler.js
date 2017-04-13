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
        var cur_time = ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
        var cur_month_date = d.getMonth() + '/' + d.getDate();
                    

        if (options.history) {

            msg_post_time_html += ' ('+ data.time +')';

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
        var messageToSaveIntoHistory = "";

        // receiving image file in base64
        if (options.file) {
            var mediaType = "img";
            if (data.file.substring(0,10)==='data:video')
                mediaType = "video controls";

            if (data.file.substring(0,10)==='data:image' || data.file.substring(0,10)==='data:video') {
                $messageBodyDiv.addClass("hasMedia");
                $messageBodyDiv.html("<a target='_blank' href='" + data.file + "'><"+mediaType+" class='chatbox-image' src='"+data.file+"'></a>");
            }else{
                $messageBodyDiv.html("<a target='_blank' download='" + data.fileName +"' href='"+data.file+"'>"+data.fileName+"</a>");
            }

            messageToSaveIntoHistory = data.fileName+" (File)";
            if(data.username === chatbox.username){
                ui.receivedFileSentByMyself();
            }


        }else{

            messageToSaveIntoHistory = data.message;

            if (utils.checkImageUrl(data.message)) { // may cause secure issue?
                //receiving image url
                $messageBodyDiv.html("<a target='_blank' href='" + data.message + "'><img class='chatbox-image' src='" + data.message + "'></a>");
            }else {
                //receiving plain text
                $messageBodyDiv.text(data.message);
            }
        }

        // receiving new message
        if (!options.history && !options.typing) {
            historyHandler.save(data.username, messageToSaveIntoHistory, cur_month_date+' '+cur_time);
        }


        var typingClass = options.typing ? 'socketchatbox-typing' : '';
        var $messageWrapper = $("<div class='socketchatbox-message-wrapper'></div>");
        var $messageDiv = $("<div class='socketchatbox-message'></div>")
            .data('username', data.username)
            .addClass(typingClass)
            .append($usernameDiv, $messageBodyDiv);
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
