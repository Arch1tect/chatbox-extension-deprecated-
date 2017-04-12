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

    // This uuid is unique for each browser but not unique for each connection
    // because one browser can have multiple tabs each with connections to the chatbox server.
    // And this uuid should always be passed on login, it's used to identify/combine user,
    // multiple connections from same browser are regarded as same user.
    chatbox.uuid = "uuid not set!";
    chatbox.NAME = 'Chatbox';

    var d = new Date();
    var username = 'visitor#'+ d.getMinutes()+ d.getSeconds();
    chatbox.username = username;
    chrome.storage.sync.get('chatbox_username', function(data) {
        console.log("username from storage: " + data.chatbox_username);
        if (data.chatbox_username) {
            chatbox.username = data.chatbox_username; 
        }
    });

    chatbox.init = function() {

        // load jquery objects and register events
        for (var i = 0; i < ui.init.length; i++) {
            ui.init[i]();
        }

        // Read old uuid from cookie if exist
        if(utils.getCookie('chatuuid')!=='') {

            chatbox.uuid = utils.getCookie('chatuuid');

        }else {

            chatbox.uuid = utils.guid();
            utils.addCookie('chatuuid', chatbox.uuid);
        }

        historyHandler.load();


        // Show/hide chatbox base on chrome storage value

        chrome.storage.sync.get('chatbox_show', function(data) {

            if (data.chatbox_show) {
                ui.show();
            } else {
                ui.hide();
            }
        });


        chatbox.roomID = location.search;
        // TODO: ignore # part in url
        console.log('room ' + chatbox.roomID);

        // now make your connection with server!
        chatbox.socket = io(chatbox.domain, {path:'/socket.io'});
        chatbox.socket.joined = false;
        socketEvent.register();
    };


})();

$( document ).ready(function() {
    chatbox.init();
});
