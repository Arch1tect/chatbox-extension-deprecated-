(function() {
    "use strict";
    window.chatbox = window.chatbox || {};
    chatbox.ui = {};
    chatbox.ui.init = []; //init is an array of functions
    chatbox.historyHandler = {};
    chatbox.userListHandler = {};
    chatbox.fileHandler = {};
    chatbox.msgHandler = {};
    chatbox.typingHandler = {};
    chatbox.notification = {};
    chatbox.socketEvent = {};

    var utils = chatbox.utils;
    var ui = chatbox.ui;
    var historyHandler = chatbox.historyHandler;
    var socketEvent = chatbox.socketEvent;

    // change this to the port you want to use on server if you are hosting
    // TODO: move to config file
    chatbox.domain = "https://quotime.me";
    // chatbox.domain = "https://localhost";
    // chatbox.domain = "http://localhost:8088";

    // This uuid is unique for each browser but not unique for each connection
    // because one browser can have multiple tabs each with connections to the chatbox server.
    // And this uuid should always be passed on login, it's used to identify/combine user,
    // multiple connections from same browser are regarded as same user.
    chatbox.uuid = "uuid not set!";
    chatbox.NAME = 'Chatbox';

    var d = new Date();
    var username = 'visitor#'+ (''+d.getMinutes()).slice(-1)+ d.getSeconds();
    chatbox.username = username;


    chatbox.init = function() {

        console.log('Chatbox Init');

        // load jquery objects and register events
        for (var i = 0; i < ui.init.length; i++) {
            ui.init[i]();
        }


        // Show/hide chatbox base on chrome storage value
        chrome.storage.local.get('open_chatbox_when', function(data) {

            if (data.open_chatbox_when == "full_size") {
                ui.show();
            } 
            else if (data.open_chatbox_when == "minimized") {
                ui.minimize();
            }


        });


        chatbox.roomID = location.search.substring(1);
        console.log('room ' + chatbox.roomID);


        chrome.storage.local.get('chatbox_uuid', function(data) {

            if (data.chatbox_uuid) {
                console.log("Found uuid " + data.chatbox_uuid)
                chatbox.uuid = data.chatbox_uuid;
            } else {
                chatbox.uuid = utils.guid();
                chrome.storage.local.set({ chatbox_uuid: chatbox.uuid });

                console.log("Creating new uuid " + chatbox.uuid);
            }

            historyHandler.load();
            // now make your connection with server!
            chatbox.socket = io(chatbox.domain, {path:'/socket.io'});
            chatbox.socket.joined = false;
            socketEvent.register();

        });
    };


})();

$( document ).ready(function() {

    chrome.storage.local.get('chatbox_username', function(data) {
        if (data.chatbox_username) {
            console.log("username from storage: " + data.chatbox_username);

            chatbox.username = data.chatbox_username; 
        }
        chatbox.init();

    });
});
