
function showHideChatbox() {
	var msg = 'open_chatbox';
	if ($('#open-chatbox').text().toLowerCase().indexOf("close") >= 0) {
        msg = 'close_chatbox';
    }
	chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {

		// since only one tab should be active and in the current window at once
		// the return variable should only have one entry
		var activeTab = arrayOfTabs[0];
		var activeTabId = activeTab.id; // or do whatever you need


		// This message is listened by chatbox, but not content.js. chatbox pass msg to content.js
		chrome.tabs.sendMessage(activeTabId, {msg: msg}, function(resp){
			if (resp && resp.msg == "shown") { 
				$('#open-chatbox').text('Close Chatbox');
			}
			if (resp.msg == "closed") { 
				$('#open-chatbox').text('Open Chatbox');
			}

		});

	});
}

document.addEventListener('DOMContentLoaded', function () {

	$('#open-chatbox').click(showHideChatbox);

	$('body').on('click', 'a', function(){
		chrome.tabs.create({url: $(this).attr('href')});
		return false;
	});

	chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {

		// since only one tab should be active and in the current window at once
		// the return variable should only have one entry
		var activeTab = arrayOfTabs[0];
		var activeTabId = activeTab.id; // or do whatever you need
		
		// TBD: activeTab.url and activeTab.title are available, no need
		// to call .sendMessage if those are only info need from tab

		chrome.tabs.sendMessage(activeTabId, {msg: 'is_chatbox_open'}, function(resp){
			if (resp.is_chatbox_open) { 
				$('#open-chatbox').text('Close Chatbox');
			}
			else { 
				$('#open-chatbox').text('Open Chatbox');
			}

		});	});
});

// function parseTabContent(responseObj) {

// 	$("#name").val(responseObj.name);
// 	$("#link").val(responseObj.link);

// 	// window.close();
// }