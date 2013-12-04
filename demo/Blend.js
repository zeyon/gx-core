window.addEvent('domready',function(){
	// var myBlend = new gx.ui.Blend('body', {'loader': true});
	var myBlend = new gx.ui.Blend($('myArea'), {'loader': true});
	$('btnToggle').addEvent('click', function() {
		myBlend.toggle();
	});
	$('btnFreeze').addEvent('click', function() {
		myBlend.freeze();
	});
	$('btnUnfreeze').addEvent('click', function() {
		myBlend.unfreeze();
	});
});
