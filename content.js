var chatboxCreated = false;
var chatboxIFrame;
// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	// If the received message has the expected format...
	if (msg.text === 'report_back') {
		// Call the specified callback, passing
		// the web-page's DOM content as argument
		responseObj = {};
		responseObj.name = document.title;
		responseObj.link = document.location.href;
		// console.log(responseObj);
		sendResponse(responseObj);
		makeRequest('https://quotime.me/api/stats');
		// makeRequest('http://localhost:9000/api/stats');


	}
	else if (msg.text === 'open_chatbox') {
		openChatbox();
	}
});

function openChatbox() {

	if (!chatboxCreated) {

		chatboxIFrame  = document.createElement ("iframe");
		chatboxIFrame.src  = chrome.extension.getURL ("chatbox/index.html?"+location.href);
		chatboxIFrame.id="chatbox-iframe";
		chatboxIFrame.allowtransparency = true;
		document.body.insertBefore(chatboxIFrame, document.body.firstChild);
		chatboxCreated = true;
	
	} else {
		chatboxIFrame.style.display  = "block";

		chatboxIFrame.contentWindow.postMessage('open_chatbox',
              "*");
	}
}

function resizeIFrameToFitContent(e) {
	if (!e || !e.data )
		return;
	var msg = ''
	try {
		msg = JSON.parse(e.data);
	}
	catch (err) {
		// not event sent from our app
		return;
	}
	if (!msg.state)
		return;
	if (msg.state ==='full size') {
		chatboxIFrame.style.width  = "100%";
		chatboxIFrame.style.height = "100%";
	}
	else if (msg.state === 'minimize') {
		chatboxIFrame.style.width  = "150px";
		chatboxIFrame.style.height = "30px";
		chatboxIFrame.style.minHeight = "30px";
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




var httpRequest;

function makeRequest(url) {

	if (location.href==="https://quotime.me/")
		return;

	httpRequest = new XMLHttpRequest();

	if (!httpRequest) {
		console.log('Giving up :( Cannot create an XMLHTTP instance');
		return false;
	}
	httpRequest.onreadystatechange = ajaxResultHandler;

	httpRequest.open('POST', url);
    httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    httpRequest.send('url=' + encodeURIComponent(location.href)+'&title='+encodeURIComponent(document.title));

}

function ajaxResultHandler() {
	if (httpRequest.readyState === XMLHttpRequest.DONE) {
	  if (httpRequest.status === 200) {
		console.log('success: '+httpRequest.responseText);
	  } else {
		console.log('not 200 response: '+httpRequest.responseText);
	  }
	}
}

openChatbox();

