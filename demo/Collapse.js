window.addEvent('domready',function(){
	var myCollapse = new gx.ui.Collapse('myArea', {
		'mode': 'both',
		// 'minHeight': 30,
		'minOpacity': 0.5,
		'minWidth': 200
	});
	// var myCollapse = new Fx.Reveal($('myArea'));
	$('btnToggle').addEvent('click', function() {
		myCollapse.toggle();
	});
});
