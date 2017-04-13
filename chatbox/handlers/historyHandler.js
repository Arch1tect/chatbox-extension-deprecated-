(function() {
    "use strict";


    var utils = chatbox.utils;
    var msgHandler = chatbox.msgHandler;
    var historyHandler = chatbox.historyHandler;
    var ui = chatbox.ui;

    var chat_history_in_cur_room_key = 'not set';
    historyHandler.load = function() {
        console.log("Load chat history");

        chat_history_in_cur_room_key = 'chatbox_history'+chatbox.roomID;


        chrome.storage.sync.get(chat_history_in_cur_room_key, function(data) {

            if (data[chat_history_in_cur_room_key]) {


                var chatHistory = data[chat_history_in_cur_room_key];

                if(chatHistory.length) {

                    ui.addLog("----Chat History----");

                    var options = {};
                    options.history = true;

                    for(var i=0; i<chatHistory.length; i++) {

                        var data = chatHistory[i];
                        msgHandler.processChatMessage(data, options);
                    }

                    ui.addLog('-----End of History-----');
                }

            }
        });


    };


    historyHandler.save = function(username, msg, time) {

        // TO CHECK: possible duplicate save when user open multiple tabs?
        chrome.storage.sync.get(chat_history_in_cur_room_key, function(data) {

            var chatHistory = [];

            if (data[chat_history_in_cur_room_key]) {
                chatHistory = data[chat_history_in_cur_room_key];
            }
            var new_history_entry = {username: username, message: msg, time: time};
            chatHistory.push(new_history_entry);

            var history_obj = {};
            history_obj[chat_history_in_cur_room_key] = chatHistory
            chrome.storage.sync.set(history_obj);


        });

    };


})();

