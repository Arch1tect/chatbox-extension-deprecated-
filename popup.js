
var url = "http://quotime.me";
var lang = 'en'

function parseTabContent(responseObj) {

	$("#name").val(responseObj.name);
	$("#link").val(responseObj.link);

	// window.close();
}




function addEntry() {

	var newEntry = {};
	newEntry.name = $("#name").val();
	newEntry.duration = $("#duration").val();
	newEntry.category = $("#category").val();
	newEntry.link = $("#link").val();
	newEntry.note = $("#note").val();
				
	$("#msg").text("sending...");
	$("#msg").show();

	$.ajax({
		type: "POST",
		contentType : 'application/json',
		url: url+'/api/entry',
		dataType: 'json',
		data: JSON.stringify(newEntry),
		complete: function (data) {
			console.log(data);
			var jsonObj = data.responseJSON;
			if ("error" in jsonObj)
				$("#msg").text(jsonObj.error);
			else	
				$("#msg").text("success!");

		}
	});
}

function getStatus () {
	$.ajax({
		type: "GET",
		dataType: 'json',
		url: url+'/api/status',
		success: function (data, textStatus, jqXHR) {


			$('#qtime-add-entry').show();
			$('.qtime-login-info').show();
			$('#qtime-username').text(data.username);
			$('#qtime-not-login').hide();
			if (data.lang==='cn') {
				$('#qtime-name').text('名称');
				$('#qtime-time').text('时长');
				$('#qtime-category').text('类别');
				$('#qtime-link').text('链接');
				$('#qtime-note').text('描述');
				$('#qtime-add-btn').text('加入我的清单');
			}

		},
		error: function (jqXHR, textStatus, errorThrown) {

		}
	});




}

document.addEventListener('DOMContentLoaded', function () {



	var buttons = document.querySelectorAll('button');
	buttons[0].addEventListener('click', addEntry);

	$('body').on('click', 'a', function(){
		chrome.tabs.create({url: $(this).attr('href')});
		return false;
	});

	getStatus();


	chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {

		// since only one tab should be active and in the current window at once
		// the return variable should only have one entry
		var activeTab = arrayOfTabs[0];
		var activeTabId = activeTab.id; // or do whatever you need
		
		// TBD: activeTab.url and activeTab.title are available, no need
		// to call .sendMessage if those are only info need from tab

		chrome.tabs.sendMessage(activeTabId, {text: 'report_back'}, parseTabContent);

	});


});
