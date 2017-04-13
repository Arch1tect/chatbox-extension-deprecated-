(function() {
    "use strict";


    var utils = chatbox.utils;
    var msgHandler = chatbox.msgHandler;
    var historyHandler = chatbox.historyHandler;
    var ui = chatbox.ui;

    
    historyHandler.load = function() {
        console.log("Load chat history");



        chrome.storage.sync.get('chatbox_history', function(data) {

            if (data.chatbox_history) {


                var chatHistory = data.chatbox_history;

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


    historyHandler.save = function(username, msg) {

        // TO CHECK: possible duplicate save when user open multiple tabs?
        chrome.storage.sync.get('chatbox_history', function(data) {

            var chatHistory = [];

            if (data.chatbox_history) {
                chatHistory = data.chatbox_history;
            }
            var new_history_entry = {username: username, message: msg}
            chatHistory.push(new_history_entry)
            chrome.storage.sync.set({ chatbox_history: chatHistory });


        });

    };


})();

