(function() {

    "use strict";

    var ui = chatbox.ui;
    var msgHandler = chatbox.msgHandler;
    var utils = chatbox.utils;


    ui.init.push(function() {

        $(window).keydown(function (event) {

            // When the client hits ENTER on their keyboard
            if (event.which === 13) {

                if (ui.$inputMessage.is(":focus")) {
                    sendMessage();
                    chatbox.socket.emit('stop typing', {name: chatbox.username});
                    //typing = false;
                }

            } else {

                if (ui.$inputMessage.is(":focus") && !(ui.$inboxArea.is(':visible'))) {

                    chatbox.socket.emit('typing', {});

                }

            }

        });

    });



    // Send a message
    function sendMessage() {
        var message = ui.$inputMessage.val();
        // Prevent markup from being injected into the message
        message = utils.cleanInput(message);

        // if there is a non-empty message
        if (message) {
            // empty the input field
            ui.$inputMessage.val('');
            msgHandler.sendMessage(message);
        }
    }
 
    function scrollToBottom() {

        ui.$chatArea[0].scrollTop = ui.$chatArea[0].scrollHeight;
    }
    
    ui.scrollToBottom = scrollToBottom;

    // Add it to chat area
    function addMessageElement($el, options) {


        if (options && options.inbox) {
            
            ui.$friendMessages.append($el);
            ui.$friendMessages[0].scrollTop = ui.$friendMessages[0].scrollHeight;

        } else {

            // calculate this boolean before appending msg element
            
            var shouldAutoScrollToBottom = ui.$chatArea[0].scrollHeight - ui.$chatArea[0].scrollTop - ui.$chatBody.height() < 100;
            shouldAutoScrollToBottom = true;
            // always scroll until we add a noty about getting new message
            ui.$messages.append($el);
            // don't auto scroll to bottom if user was reading something above
            if (shouldAutoScrollToBottom) {
                //loading media takes time so we delay the scroll down
                setTimeout(function(){scrollToBottom();}, 100);
            }

        }

        
    }

    ui.addMessageElement = addMessageElement;

    // Log a message
    function addLog(log) {
        var $el = $('<li>').addClass('socketchatbox-log').text(log);
        addMessageElement($el);
    }

    ui.addLog = addLog;


    function addParticipantsMessage(numUsers) {

        var message = '';
        if (numUsers === 1) {

            message += "You are the only user here.";

        }else {

            message += "There are " + numUsers + " users here.";
        }

        addLog(message);

    }

    ui.addParticipantsMessage = addParticipantsMessage;

})();
