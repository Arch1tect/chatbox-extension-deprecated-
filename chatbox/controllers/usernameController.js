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
                    'size': '15',
                    'value': name
                })
                .appendTo('#socketchatbox-username');
            $('#socketchatbox-txt_fullname').focus();
            $('#socketchatbox-txt_fullname').blur(function(){
                cancelNameEdit();
            });

        });

        $(window).keydown(function (event) {

            // When the client hits ENTER on their keyboard
            if (event.which === 13) {
                // alert('ENTER');
                if ($('#socketchatbox-txt_fullname').is(":focus")) {
                    changeNameByEdit();
                    ui.$inputMessage.focus();
                    return;
                }

            }

            // When the client hits ESC on their keyboard
            if (event.which === 27) {
                $('#socketchatbox-sticker-picker').hide();
                ui.$inputMessage.emojiPicker('hide'); // hide emoij picker if open

                if ($('#socketchatbox-txt_fullname').is(":focus")) {
                    cancelNameEdit();
                    return;
                }
            }

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
        name = name.substring(0,15);
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

        var payload = {
            'uuid': chatbox.uuid,
            'name': name
        }

        $.post(chatbox.inboxUrl + "/db/user/change_name", payload, function(resp) {
          console.log(resp);
        });

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
