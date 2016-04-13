/**
 * @class gx.ui.Blend
 * @description Puts a blend over a defined container
 * @extends gx.ui.Container
 * @implements gx.util.Console
 *
 * @author Peter-Christoph Haider <peter.haider@zeyon.net>
 * @version 1.00
 * @package Gx
 * @copyright Copyright (c) 2010, Peter Haider
 * @license http://opensource.org/licenses/gpl-license.php GNU Public License
 *
 * @param {string|node} display
 * @param {object} options
 *
 * @option {string} color The color of the blend mask
 * @option {string} freezeColor The freeze color of the blend mask
 * @option {float} opacity Target opacity of the mask
 * @option {string} transition MooTools Fx.Transition function
 * @option {int} duration Blend effect duration in milliseconds
 * @option {bool} loader Show a loader bar
 * @option {bool} open Open on initialization
 * @option {int} z-index The z index of the blend
 *
 * @event show When the blend is being displayed
 * @event hide When the blend is being hided
 * @event complete When either show/hide is completed
 *
 * @sample Blend Displaying and hiding a div element using gx.ui.Blend
 */
gx.ui.Blend = new Class({

	gx: 'gx.ui.Blend',
	Extends: gx.ui.Container,
	options: {
		'color': '#FFF',
		'freezeColor': '#333',
		'opacity': '0.8',
		'transition': 'quad:in',
		'duration': '300',
		'loader': true,
		'open': false,
		'z-index': 100
	},
	_isOpen: false,
	_isFrozen: false,
	_inAction: false,
	initialize: function(display, options) {
		var root = this;
		try {
			this.parent(display, options);
			var top = 0;
			var left = 0;
			// Set your parent position:relative;
			var position = 'absolute';
			if (this._display.root == document.body) {
				var position = 'fixed';
				top = root._coordinates.top;
				left = root._coordinates.left;
			}

			this._display.blend = new Element('div', {'class': 'gxUiBlend', 'styles': {
				'background-color': root.options.color,
				'opacity': '0',
				'display': 'none',
				'z-index': root.options['z-index'],
				'position': position,
				'top': top,
				'left': left,
			}});
			if (this.options.loader)
				this._display.blend.addClass('class', 'gxUiBlendLoader');

			this.init();

			this._display.blend.inject(this._display.root);

			if (this.options.open) {
				this._isOpen = true;
				this._display.blend.setStyles({
					'opacity': root.options.opacity,
					'display': 'block'
				});
			}
			this._parent.addEvent('resize', function() {
				root.getCoordinates();
				root._display.blend.setStyles(root._coordinates);
			});
			this._display.blend.addEvent('click', function(event) { root.fireEvent('click', [ event ]); });
			this._display.blend.addEvent('dblclick', function(event) { root.fireEvent('dblclick', [ event ]); });
		} catch(e) { gx.util.Console('gx.ui.Blend->initialize', e.message); }
	},

	init: function() {
		var root = this;
		this.getCoordinates();
		var correction = 0;
		if (this._display.root == document.body) {
			correction = 100;
		}
		this._display.blend.setStyles({
			'width': root._coordinates.width + correction,
			'height': root._coordinates.height + correction
		});

	},

	/**
	 * @method start
	 * @description Executes the open/close action
	 * @param {bool} doOpen Show the blend
	 */
	start: function(doOpen) {
		var root = this;
		try {
			if (this._isOpen != doOpen && !this._isFrozen) {
				if (doOpen)
					this._display.blend.setStyle('display', 'block');

				this._isOpen = doOpen;
				var tween = new Fx.Tween(this._display.blend, {
					property: 'opacity',
					duration: root.options.duration,
					transition: root.options.transition,
					link: 'cancel',
					onComplete: function() {
						if (doOpen)
							root.fireEvent('show');
						else {
							root._display.blend.setStyle('display', 'none');
							root.fireEvent('hide');
						}
						root.fireEvent('complete');
					}
				});
				this._display.blend.store('tween', tween);
				tween.start( doOpen ? this.options.opacity : 0.01 );
			}
		} catch(e) { gx.util.Console(root.gx + '->start', e.message); }
	},
	/**
	 * @method lock
	 * @description Freezes/Unfreezes the blend
	 * @param {bool} doFreeze Freeze the blend
	 */
	lock: function(doFreeze) {
		var root = this;
		try {
			if (this._isFrozen != doFreeze) {
				var morph = new Fx.Morph(this._display.blend, {
					duration: root.options.duration,
					transition: root.options.transition,
					onStart: function() {
						if (doFreeze)
							root._display.blend.removeClass('class', 'gxUiBlendLoader');
					},
					onComplete: function() {
						root._isOpen = doFreeze;
						root._isFrozen = doFreeze;
						if (doFreeze)
							root.fireEvent('freeze');
						else {
							root._display.blend.setStyle('display', 'none');
							root.fireEvent('unfreeze');
							if (root.options.loader)
								root._display.blend.addClass('class', 'gxUiBlendLoader');
						}
					}
				});
				if (doFreeze)
					this._display.blend.setStyle('display', 'block');
				morph.start({
					'background-color': doFreeze ? root.options.freezeColor : root.options.color,
					'opacity': doFreeze ? root.options.opacity : 0
				});
			}
		} catch(e) { gx.util.Console(root.gx + '->lock', e.message); }
	},

	/**
	 * @method freeze
	 * @description Freezes the blend
	 */
	freeze: function() {
		this.lock(1);
	},

	/**
	 * @method unfreeze
	 * @description Unfreezes the blend
	 */
	unfreeze: function() {
		this.lock(0);
	},

	/**
	 * @method show
	 * @description Shows the blend
	 */
	show: function() {
		this.start(1);
	},

	/**
	 * @method hide
	 * @description Hides the blend
	 */
	hide: function() {
		this.start(0);
	},

	/**
	 * @method toggle
	 * @description Toggles between hiding and showing the blend
	 */
	toggle: function() {
		this.start(!this._isOpen);
	}

});
