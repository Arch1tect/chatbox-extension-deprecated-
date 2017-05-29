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

        var msg_post_time = "";  

        var sentByMe = data.sender === chatbox.uuid || data.username === chatbox.username;

        if (options.inbox) {
            // console.log(data.create_time);
            d = new Date(data.create_time + ' UTC');
            var _time = ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
            var _month_date = (d.getMonth()+1) + '/' + d.getDate();
            var _post_time = _month_date+' '+_time;
            msg_post_time = _post_time;

        }                  

        else if (options.history) {

            msg_post_time = data.post_time;

        } else {
            var d = new Date();
            msg_post_time = ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
        }
        

        var $usernameDiv = $('<div></div>').html(utils.cleanInput(data.username));

        $usernameDiv.addClass('socketchatbox-msg-username');
        $usernameDiv.data('uid', data.uid);

        var $messageBodyDiv = $('<span class="socketchatbox-messageBody">');
        
        $messageBodyDiv.prop('title', msg_post_time);
        // $messageBodyDiv.attr('data-toggle', "tooltip"); commented out because seems to be too eye-catching
        // $messageBodyDiv.tooltip();

        if (sentByMe) {
            $messageBodyDiv.addClass('socketchatbox-messageBody-me');
        } else {
            $messageBodyDiv.addClass('socketchatbox-messageBody-others');
        }

        var stringForNotification = '';
        // received image file in base64
        if (data.file) {
            stringForNotification = 'file';
            var mediaType = "img";
            if (data.file.substring(0,10)==='data:video'){
                stringForNotification = 'video';
                mediaType = "video controls";
            }
            if (data.file.substring(0,10)==='data:image' || data.file.substring(0,10)==='data:video') {
                stringForNotification = 'image';
                $messageBodyDiv.addClass("image-or-video");
                $messageBodyDiv.html("<a target='_blank' href='" + data.file + "'><"+mediaType+" class='chatbox-image' src='"+data.file+"'></a>");
            }else{
                $messageBodyDiv.html("<a target='_blank' download='" + data.fileName +"' href='"+data.file+"'>"+data.fileName+"</a>");
            }

            if(data.username === chatbox.username){
                ui.receivedFileSentByMyself();
            }


        }else{
            stringForNotification = data.message;
            if (utils.checkImageUrl(data.message)) { // may cause secure issue?
                // receiving image url
                $messageBodyDiv.addClass("image-or-video");
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
        if (!options.history && !options.typing && !options.inbox) {
            historyHandler.save(data);


            // wait until I can know if the msg is read
            // try {
            //     if(data.username !== chatbox.username) {
            //         chrome.notifications.create('new_msg', {
            //                 type: 'basic',
            //                 iconUrl: '/icon.png',
            //                 title: data.username,
            //                 message: stringForNotification
            //             }, function(notificationId) {});

            //     }
            // } catch (err) {
            //     console.log('Error sending notification');
            //     console.log(err);
            // }

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

        if (!options.inbox){

            $messageDiv.append($usernameDiv);
            if (!sentByMe)
                $messageDiv.append($('<br/>'));
        }
        
        $messageDiv.append($messageBodyDiv);

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

        var privateMsg = ui.$inboxArea.is(':visible');

        if (privateMsg) {
            var receiverId = $('.socketchatbox-friend-list div.selected').data('uid');
            var payload = {
                'sender': chatbox.uuid,
                'receiver': receiverId,
                'message': msg
            }
            console.log('Send private message to ' + receiverId);

            $.post(chatbox.inboxUrl + "/db/message", payload, function(resp) {
              console.log(resp);
              chatbox.inbox.pullMessages();
            });

        }else {
            var data = {};
            data.username = chatbox.username;
            data.msg = msg+'';//cast string
            chatbox.socket.emit('new message', data);
        }
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
