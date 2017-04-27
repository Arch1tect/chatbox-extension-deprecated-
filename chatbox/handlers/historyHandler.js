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


        chrome.storage.local.get(chat_history_in_cur_room_key, function(data) {

            if (data[chat_history_in_cur_room_key]) {


                var chatHistory = data[chat_history_in_cur_room_key];

                if(chatHistory.length) {

                    // ui.addLog("Chat History");

                    var options = {};
                    options.history = true;

                    for(var i=0; i<chatHistory.length; i++) {

                        var data = chatHistory[i];
                        msgHandler.processChatMessage(data, options);
                    }

                    ui.addLog('____ End of Chat History ____');
                    // ui.addLog('.');
                }

            }
        });


    };

    historyHandler.save = function(data_to_save) {


        console.log("Save msg to Chrome storage.");
        // TO CHECK: possible duplicate save when user open multiple tabs?
        // Testing shows no duplicate msg saved, probably because get/set is 
        // called almost same time. Still, it's potential issue
        chrome.storage.local.get(chat_history_in_cur_room_key, function(data) {

            var chatHistory = [];

            if (data[chat_history_in_cur_room_key]) {
                chatHistory = data[chat_history_in_cur_room_key];
            }
                
            var d = new Date();
            var cur_time = ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
            var cur_month_date = (d.getMonth()+1) + '/' + d.getDate();
            var post_time = cur_month_date+' '+cur_time;
            data_to_save.post_time = post_time;

            chatHistory.push(data_to_save);

            var history_obj = {};
            history_obj[chat_history_in_cur_room_key] = chatHistory
            chrome.storage.local.set(history_obj);


        });

    };


})();

