
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

    chrome.storage.local.get('open_chatbox_when', function(data) {

        if (data.open_chatbox_when) {
        	console.log("saved option: "+data.open_chatbox_when)
        	var checkbox = "input[name=open_chatbox_when][value="+data.open_chatbox_when+"]";
			$(checkbox).prop("checked",true);
        }

    });

	$('input:radio[name="open_chatbox_when"]').change(function() {

		console.log('open_chatbox_when ' + $(this).val());
		chrome.storage.local.set({ open_chatbox_when: $(this).val() });

	});


	chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {

		// since only one tab should be active and in the current window at once
		// the return variable should only have one entry
		var activeTab = arrayOfTabs[0];
		var activeTabId = activeTab.id; // or do whatever you need
		
		// TBD: activeTab.url and activeTab.title are available, no need
		// to call .sendMessage if those are only info need from tab

		// Ask chatbox whether it's open or not
		// And how many users online at current page
		chrome.tabs.sendMessage(activeTabId, {msg: 'is_chatbox_open'}, function(resp){
			
			
			$('#user-count').text(resp.userCount);
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