'use strict';

/**
 * @class gx.ui.Popup
 * @description Displays a message box or status bar.
 * @extends gx.ui.Blend
 * @implements gx.util.Console
 *
 * @author Peter-Christoph Haider <peter.haider@zeyon.net>
 * @version 1.00
 * @package Gx
 * @copyright Copyright (c) 2010, Peter Haider
 * @license http://opensource.org/licenses/gpl-license.php GNU Public License
 *
 * @param {string|node} display
 *
 * @option {string} color The color of the blend mask
 * @option {string} freezeColor The freeze color
 * @option {int} z-index The 'z' index
 * @option {float} opacity The opacity of the popup
 * @option {string} position The position modifier
 * @option {string} transition MooTools Fx.Transition function
 * @option {string} duration Blend effect duration
 * @option {bool} loader Show a loader bar
 * @option {bool} open Open on initialization
 * @option {object} content The content of the popup
 * @option {string} x The x coordinate of the popup
 * @option {string} y The y coordinate of the popup
 *
 * @sample Popup A sample popup window
 */
gx.ui.Popup = new Class({
	gx: 'gx.ui.Popup',
	Extends: gx.ui.Blend,
	options: {
		'color': '#FFF',
		'freezeColor': '#FFF',
		'z-index': 110,
		'opacity': '0.95',
		'position': 'fixed',
		'transition': 'quad:in',
		'duration': '300',
		'loader': false,
		'open': false,
		'content': null,
		'x': 'center',
		'y': 'center'
	},
	isOpen: true,
	initialize: function(display, options) {
		var root = this;
		try {
			this.parent(display, options);
			this.build();
			if (this.options.content)
				this.addContent(this.options.content);
			this._parent.addEvent('resize', function() {
				root.setPosition();
			});
		} catch(e) { gx.util.Console('gx.ui.Popup->initialize: ', e.message); }
	},

	/**
	 * @method build
	 * @description Builds the popup
	 */
	build: function() {
		var root = this;
		try {
			this._display.content = new Element('div', {'styles': {
				'position': this.options.position,
				'display': 'none',
				'z-index': this.options['z-index'],
				'opacity': 0
			}});
			this._display.content.inject(this._display.root);
		} catch(e) { gx.util.Console('gx.ui.Popup->build: ', e.message); }
	},

	/**
	 * @method addContent
	 * @description Adds a node to the popup
	 * @param {node} elem The node to add
	 */
	addContent: function(elem) {
		var root = this;
		try {
			elem = this.initDisplay(elem);
			this._display.content.adopt(elem);
			this.setPosition();
		} catch(e) { gx.util.Console('gx.ui.Popup->addContent: ', e.message); }
	},

	/**
	 * @method setPosition
	 * @description Sets the popup position
	 * @param {string} x Horizontal position (left, right, center)
	 * @param {string} y Vertical position (top, bottom, center)
	 */
	setPosition: function(x, y) {
		var root = this;
		try {
			if (x == null) x = this.options.x;
			if (y == null) y = this.options.y;
			this.getCoordinates();
			var coordinates = this._display.content.getCoordinates();

			if (x == 'left')
				this._display.content.setStyle('left', 0);
			else if (x == 'right')
				this._display.content.setStyle('left', this._coordinates.width - coordinates.width);
			else
				this._display.content.setStyle('left', (this._coordinates.width - coordinates.width)/2);
			if (y == 'top')
				this._display.content.setStyle('top', 0);
			else if (y == 'bottom')
				this._display.content.setStyle('top', this._coordinates.height - coordinates.height);
			else
				this._display.content.setStyle('top', (this._coordinates.height - coordinates.height)/2);
		} catch(e) { gx.util.Console('gx.ui.Popup->setPosition: ', e.message); }
	},

	/**
	 * @method show
	 * @description Shows the popup
	 */
	show: function() {
		var root = this;
		try {

			var morph = new Fx.Morph(this._display.content, {
				'onStart': function() {
					root._display.content.setStyle('display', 'block');
				}
			});
			this.lock(1);
			morph.start({
				'opacity': 1
			});
			this.setPosition();
			this.fireEvent('show');
		} catch(e) { gx.util.Console('gx.ui.Popup->show: ', e.message); }
	},

	/**
	 * @method hide
	 * @description Hides the popup
	 */
	hide: function() {
		var root = this;
		try {
			var morph = new Fx.Morph(this._display.content, {
				'onComplete': function() {
					root._display.content.setStyle('display', 'none');
				}
			});
			this.lock(0);
			morph.start({
				'opacity': 0
			});
			this.fireEvent('hide');
		} catch(e) { gx.util.Console('gx.ui.Popup->hide: ', e.message); }
	}
});
