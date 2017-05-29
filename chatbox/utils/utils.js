(function() {

    "use strict";
    window.chatbox = window.chatbox || {}; 
    var utils = {};
    chatbox.utils = utils;

    $(document.body).click(function(){
        $('.socketchatbox-username-action-wrapper').remove();
        $('#socketchatbox-sticker-picker').hide();
    } );

    $(document).on('click', '.chatbox-image', function(e) {

        e.preventDefault();
        utils.updateIframeSize('full size');

        $('#socketchatbox-imagepopup-src').attr('src', $(this).attr('src')); 
        $('#socketchatbox-imagepopup-modal').modal('show'); 


    });

    $('#socketchatbox-imagepopup-modal').on("hidden.bs.modal", function () {

        chatbox.ui.refreshSize();
        
    });


    chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
        // Receive message sent from extension

        if (request.msg == "open_chatbox"){
            chatbox.ui.maximize();
            sendResponse({msg: "shown"});

        } 

        if (request.msg == "close_chatbox"){ 
            utils.updateIframeSize('close'); 
            sendResponse({msg: "closed"}); // updateIframeSize is async so this response is wrong 
        }

        if (request.msg == "is_chatbox_open") {
            sendResponse(
                {
                    is_chatbox_open: chatbox.ui.displayMode == 'max' && chatbox.showing,
                    userCount: chatbox.ui.$onlineUserNum.text()
                }
            );
        }

    });


    function updateIframeSize(state) {
        // send chat box size to content.js
        var resizeMsg = {};
        resizeMsg.state = state;

        if (state == "close") 
            chatbox.showing = false;

        else
            chatbox.showing = true;

        // hide chatbox for a sec just because 
        // the second iframe goes full window
        // chatbox would jump to the top of the window
        // then come back down

        if (state == "fit") {
        }

        if (state == "full size") {
            chatbox.ui.$chatBox.hide();
            setTimeout(function() {
                chatbox.ui.$chatBox.show();
            }, 100);
        }

        resizeMsg.size = { height: chatbox.ui.$chatBody.outerHeight()+chatbox.ui.$inputMessage.outerHeight()+chatbox.ui.$topbar.outerHeight(), width: chatbox.ui.$chatBody.outerWidth()};
        window.parent.postMessage(resizeMsg, "*");

    }
    utils.updateIframeSize = updateIframeSize;

    // generate a unique guid for each browser, will pass in cookie
    utils.guid = function() {

        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };


    function getCookie(cname) {

        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) === 0) return c.substring(name.length,c.length);
        }

        return "";
    }

    utils.getCookie = getCookie;

    function addCookie(cname, cvalue) {

        var exdays = 365;
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires + "; domain=" + getCookieDomain() + "; path=/";
    }

    utils.addCookie = addCookie;


    function doNothing(e){

        e.preventDefault();
        e.stopPropagation();
    }

    utils.doNothing = doNothing;

    function getCookieDomain() {

        var host = location.hostname;
        var ip = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
        if (ip.test(host) === true || host === 'localhost') return host;
        var regex = /([^]*).*/;
        var match = host.match(regex);
        if (typeof match !== "undefined" && null !== match) {
            host = match[1];
        }
        if (typeof host !== "undefined" && null !== host) {
            var strAry = host.split(".");
            if (strAry.length > 1) {
            host = strAry[strAry.length - 2] + "." + strAry[strAry.length - 1];
            }
        }
        return '.' + host;
    }

    function checkImageUrl(url) {
        return(url.match(/\.(jpeg|jpg|gif|png)$/) !== null);
    }
    utils.checkImageUrl = checkImageUrl;

    // Prevents input from having injected markup
    function cleanInput(input) {
        return $('<div/>').html(input).text();
    }
    utils.cleanInput = cleanInput;


    function stringOnlyContainEmojis (string) {

      return string.replace(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g, '') == '';
    
    }
    utils.stringOnlyContainEmojis = stringOnlyContainEmojis;

})();

// just to center bootstrap modals
(function ($) {
    "use strict";
    function centerModal() {
        $(this).css('display', 'block');
        var $dialog  = $(this).find(".modal-dialog"),
        offset       = ($(window).height() - $dialog.height()) / 2,
        bottomMargin = parseInt($dialog.css('marginBottom'), 10);

        // Make sure you don't hide the top part of the modal w/ a negative margin if it's longer than the screen height, and keep the margin equal to the bottom margin of the modal
        if(offset < bottomMargin) offset = bottomMargin;
        $dialog.css("margin-top", offset);
    }

    $(document).on('show.bs.modal', '.modal', centerModal);
    $(window).on("resize", function () {
        $('.modal:visible').each(centerModal);
    });
}(jQuery));
