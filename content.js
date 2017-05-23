var chatboxCreated = false;
var chatboxIFrame;


function createChatbox() {

	if (!chatboxCreated) {

		chatboxIFrame  = document.createElement ("iframe");
		chatboxIFrame.src  = chrome.extension.getURL ("chatbox/index.html?"+location.href);
		chatboxIFrame.id = "chatbox-iframe";

		document.body.insertBefore(chatboxIFrame, document.body.firstChild);
		chatboxCreated = true;
	}
}


function resizeIFrameToFitContent(e) {

	if (!e || !e.data )
		return;
	var msg = e.data;

	if (!msg.state)
		return;
		
	if (msg.state ==='show') {
		chatboxIFrame.style.display  = "block";
		console.log('show iframe');

	}
	else if (msg.state ==='full size') {
		chatboxIFrame.style.display  = "block";
		chatboxIFrame.style.width  = "100%";
		chatboxIFrame.style.height = "100%";
		console.log('resize iframe to 100%');
	}
	else if (msg.state === 'minimize') {
		chatboxIFrame.style.display  = "block";
		chatboxIFrame.style.width  = "100px";
		chatboxIFrame.style.height = "31px";
		chatboxIFrame.style.minHeight = "31px";
		console.log('resize iframe to 100 x 31');

	}
	else if (msg.state === 'close') {	//only hide but still running
		chatboxIFrame.style.display  = "none";
		console.log('hide iframe');

	}
	else { // fit - make page same size as chatbox
		var size = msg.size;
		chatboxIFrame.style.display  = "block";
		chatboxIFrame.style.width  = size.width + "px";
		chatboxIFrame.style.height = size.height + "px";
		console.log('resize iframe to ' + size.width + ' x ' + size.height);

	}
}

// NOTE: window.addEventListener("message" ...) only receive msg from tab,
// can't receive msg from extension directly, to receive msg from extension,
// use chrome.runtime.onMessage.addListener
window.addEventListener("message", resizeIFrameToFitContent, false);

createChatbox(); // always create the chatbox and make connections, if user don't want it, he can disable the extension
