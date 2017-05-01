(function() {

    "use strict";
    var utils = chatbox.utils;
    var ui = chatbox.ui;

    ui.init.push(function() {

        // user edit username
        ui.$username.click(function(e) {


            $('[data-toggle="tooltip"]').tooltip('hide');

            if(!chatbox.showing) {
                return;
            }

            e.stopPropagation(); //don't propagate event to topbar

            //if(sendingFile) return; //add it back later

            if($('#socketchatbox-txt_fullname').length > 0) return;
            //if($('#socketchatbox-txt_fullname').is(":focus")) return;

            var name = $(this).text();
            $(this).html('');
            $('<input></input>')
                .attr({
                    'type': 'text',
                    'name': 'fname',
                    'id': 'socketchatbox-txt_fullname',
                    'size': '10',
                    'value': name
                })
                .appendTo('#socketchatbox-username');
            $('#socketchatbox-txt_fullname').focus();
            $('#socketchatbox-txt_fullname').blur(function(){
                cancelNameEdit();
            });

        });

    });

    function cancelNameEdit() {
        ui.$username.text(chatbox.username);
        ui.$inputMessage.focus();
    }

    // When user change his username by editing though GUI, go through server to get permission
    // since we may have rules about what names are forbidden in the future
    function changeNameByEdit() {
        var name = $('#socketchatbox-txt_fullname').val();
        name = utils.cleanInput(name);
        name = $.trim(name);
        // if (name === chatbox.username || name === "")  {
        //     ui.$username.text(chatbox.username);
        //     return;
        // }
        // console.log('changing chatbox username');

        if (name === chatbox.username) {
            cancelNameEdit();
            return;
        }

        var config = chatbox.config;
        config.chatbox_username = name;
        chrome.storage.local.set({ chatbox_config: config });



        //if (!sendingFile) {

        askServerToChangeName(name);
        
    }
    ui.changeNameByEdit = changeNameByEdit;


    // Change local username value and update local cookie
    function changeLocalUsername(name) {
        if(name) {
            chatbox.username = name;
            console.log("Server says username should be " + name);
            ui.$username.text(chatbox.username);
        }
    }

    ui.changeLocalUsername = changeLocalUsername;


    // Tell server that user want to change username
    function askServerToChangeName (newName) {
        chatbox.socket.emit('user edits name', {newName: newName});
        if (chatbox.showing)
            ui.$username.text('Changing your name...');
    }





})();
