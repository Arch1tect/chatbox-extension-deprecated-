var chatboxCreated = false;
var chatboxIFrame;


function createChatbox() {

	if (!chatboxCreated) {

		chatboxIFrame  = document.createElement ("iframe");
		chatboxIFrame.src  = chrome.extension.getURL ("chatbox/index.html?"+location.href);
		chatboxIFrame.id="chatbox-iframe";
		chatboxIFrame.allowtransparency = true;
		document.body.insertBefore(chatboxIFrame, document.body.firstChild);
		chatboxCreated = true;
	}
}

function openChatbox() {

	if (!chatboxCreated) {

		createChatbox();
	}

	chatboxIFrame.style.display  = "block";
	// chatboxIFrame.contentWindow.postMessage('open_chatbox', "*");
}

function resizeIFrameToFitContent(e) {
	// console.log('resizeIFrameToFitContent(e)');
	console.log(e);
	if (!e || !e.data )
		return;
	var msg = e.data;

	if (!msg.state)
		return;
	
	// chatboxIFrame.style.background = 'transparent';

	if (msg.state ==='full size') {
		chatboxIFrame.style.width  = "100%";
		chatboxIFrame.style.height = "100%";
		chatboxIFrame.style.display  = "block";
	}
	else if (msg.state === 'minimize') {
		chatboxIFrame.style.width  = "150px";
		chatboxIFrame.style.height = "30px";
		chatboxIFrame.style.minHeight = "30px";
		chatboxIFrame.style.display  = "block";

	}
	else if (msg.state === 'close') {	//only hide but still running
		chatboxIFrame.style.display  = "none";
	}
	else { // fit - make page same size as chatbox
		var size = msg.size;
		chatboxIFrame.style.display  = "block";
		chatboxIFrame.style.width  = size.width + "px";
		chatboxIFrame.style.height = size.height + "px";
	}
}

// NOTE: window.addEventListener("message" ...) only receive msg from tab,
// can't receive msg from extension directly, to receive msg from extension,
// use chrome.runtime.onMessage.addListener
window.addEventListener("message", resizeIFrameToFitContent, false);

createChatbox();




// var httpRequest;

// function makeRequest(url) {

// 	if (location.href==="https://quotime.me/")
// 		return;

// 	httpRequest = new XMLHttpRequest();

// 	if (!httpRequest) {
// 		console.log('Giving up :( Cannot create an XMLHTTP instance');
// 		return false;
// 	}
// 	httpRequest.onreadystatechange = ajaxResultHandler;

// 	httpRequest.open('POST', url);
//     httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//     httpRequest.send('url=' + encodeURIComponent(location.href)+'&title='+encodeURIComponent(document.title));

// }

// function ajaxResultHandler() {
// 	if (httpRequest.readyState === XMLHttpRequest.DONE) {
// 	  if (httpRequest.status === 200) {
// 		console.log('success: '+httpRequest.responseText);
// 	  } else {
// 		console.log('not 200 response: '+httpRequest.responseText);
// 	  }
// 	}
// }

// always create the chatbox and make connections, if user don't want it, he can disable the extension
