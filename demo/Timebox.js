$(document).addEvent('domready', function () {
	var myTimebox = new gx.zeyos.Timebox('myTimebox', {
		'prefix': true,
		'seconds': true
	});
	$('btnTimeboxSet').addEvent('click', function() {
		myTimebox.set($('txtTimeboxTime').get('value'), $('txtTimeboxUnit').get('value'));
	});
	$('btnTimeboxGet').addEvent('click', function() {
		alert(myTimebox.get($('txtTimeboxUnit').get('value'), $('txtTimeboxPrecision').get('value')));
	});
});
