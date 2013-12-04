window.addEvent('domready',function(){
	var myContent = new Element('div', {'html': '<p>Just a Test</p>', 'styles': {
		'background-color': '#FFF',
		'border': '4px solid #404040',
		'padding': 20,
		'width': 200,
		'height': 100
	}});
	var myLogin = new gx.ui.Popup($('body'), {
		'content': myContent,
		'x': 'center',
		'y': 'center'
	});
	var btnClose = new Element('input', {
		'type': 'button', 
		'value': 'Close'
	})
	btnClose.addEvent('click', function() {
		myLogin.hide();
	});
	
	// You can also adopt more content as you go...
	myContent.adopt(btnClose);
	
	$('btnOpen').addEvent('click', function() {
		myLogin.show();
	});
});
