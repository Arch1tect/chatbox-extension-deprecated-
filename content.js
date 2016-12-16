// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	// If the received message has the expected format...
	if (msg.text === 'report_back') {
		// Call the specified callback, passing
		// the web-page's DOM content as argument
		responseObj = {};
		responseObj.name = document.title;
		responseObj.link = document.location.href;
		console.log(responseObj);
		sendResponse(responseObj);

		document.body.insertBefore(chatboxIFrame, document.body.firstChild);

	}
});





var chatboxIFrame  = document.createElement ("iframe");
chatboxIFrame.src  = chrome.extension.getURL ("chatbox/index.html");
chatboxIFrame.id="chatbox-iframe";
chatboxIFrame.allowtransparency = true;

function resizeIFrameToFitContent(e) {

	var msg = JSON.parse(e.data);
	if (msg.state ==='full size') {
		chatboxIFrame.style.width  = "100%";
		chatboxIFrame.style.height = "100%";
	}
	else if (msg.state === 'minimize') {
		chatboxIFrame.style.width  = "200px";
		chatboxIFrame.style.height = "30px";
	}
	else if (msg.state === 'close') {	//only hide but still running?
		chatboxIFrame.style.display  = "none";
	}
	else {
		var size = msg.size;
		chatboxIFrame.style.width  = size.width + "px";
		chatboxIFrame.style.height = size.height + "px";
		chatboxIFrame.style.background = 'transparent';
	}
}

window.addEventListener("message", resizeIFrameToFitContent, false);
