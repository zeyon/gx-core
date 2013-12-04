'use strict';

/**
 * @class gx.ui.Hud
 * @description Creates a "Head-Up Display" to display elements (e.g. popups or forms) above other elements
 * @extends gx.ui.Container
 * @implements gx.ui.Blend
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
 * @option {string} background
 * @option {float} opacity
 * @option {string} transition The MooTools Fx.Transition function
 * @option {int} duration The duration of the blend effect
 * @option {bool} open Open on initialization
 * @option {bool} blend
 * @option {string} x
 * @option {string} y
 *
 * @event click When the HUD blend is clicked
 * @event dblclick When the HUD blend is double-clicked
 *
 * @sample Hud Displaying a element above another one inside a HUD
 */
gx.ui.Hud = new Class({
	gx: 'gx.ui.Hud',
	Extends: gx.ui.Container,
	options: {
		'background': '#333',
		'opacity': '0.8',
		'transition': 'quad:in',
		'duration': '300',
		'open': true,
		'blend': true,
		'x': 'center',
		'y': 'center'
	},
	_isOpen: false,
	_children: {},
	_active: [],
	_position: {},
	initialize: function(display, options) {
		var root = this;
		try {
			if (display == null)
				display = document.body;
			this.parent(display, options);
			this._display.hud = new Element('div', {'styles': {'position': 'relative', 'background': this.options.background}});
			this._blend = new gx.ui.Blend(display, {
				'opacity': root.options.opacity,
				'transition': root.options.transition,
				'loader': false,
				'open': false
			});
			display.adopt(this._display.hud);

			// Forward some events from the blend
			this._blend.addEvent('click', function(event) { root.fireEvent('click', [ event ]); });
			this._blend.addEvent('dblclick', function(event) { root.fireEvent('dblclick', [ event ]); });

			if (this.options.open) {
				this._isOpen = true;
				this._display.hud.setStyles({
					'opacity': 1,
					'display': 'block'
				});
			}

			this._parent.addEvent('resize', function() {
				root.getCoordinates();
				var coordinates = Object.clone(root._coordinates);
				delete coordinates.height;
				root._display.hud.setStyles(coordinates);
			}.bind(this));
		} catch(e) { gx.util.Console('gx.ui.Hud->initialize', e.stack); }
	},

	/**
	 * @method setPosition
	 * @description Sets the position of a element within the HUD (mind z-index in intersections)
	 * @param {node} elem The HTML element to be positioned
	 * @param {string} x The position along the x axis (left, right, center)
	 * @param {string} y The position along the y axis (top, bottom, center)
	 */
	setPosition: function(elem, x, y) {
		var root = this;
		try {
			if (x == null) x = this.options.x;
			if (y == null) y = this.options.y;
			this.getCoordinates();
			var coordinates = elem.getCoordinates();
			if (x == 'left')
				elem.setStyle('left', 0);
			else if (x == 'right')
				elem.setStyle('left', this._coordinates.width - coordinates.width);
			else
				elem.setStyle('left', (this._coordinates.width - coordinates.width)/2);
			if (y == 'top')
				elem.setStyle('top', 0);
			else if (y == 'bottom')
				elem.setStyle('top', this._coordinates.height - coordinates.height);
			else
				elem.setStyle('top', (this._coordinates.height - coordinates.height)/2);

		} catch(e) { gx.util.Console('gx.ui.Hud->setPosition: ', e.message); }
	},

	/**
	 * @method add
	 * @description Adds a HTML element as child of the HUD
	 * @param {string} name Name of the child element
	 * @param {node} elem The HTML element to be added
	 * @param {string} position Object defining the element's position, e.g. {x: 'center', y: 'top}
	 * @param {bool} fixed Add the position as fixed rather than absolute
	 */
	add: function(name, elem, position, fixed) {
		var root = this;
		if (position == null) position = {};
		if (position.x == null) position.x = this.options.x;
		if (position.y == null) position.y = this.options.y;
		if (fixed == true)
			var pos = 'fixed';
		else
			var pos = 'absolute';
		this._children[name] = elem;
		this._position[name] = position;
		elem.inject(this._display.hud);
		elem.setStyles({'opacity': 0, 'visibility': 'hidden', 'position': pos});
		this._parent.addEvent('resize', function() {
			root.setPosition(elem, position.x, position.y);
		});
		this.setPosition(elem, position.x, position.y);
	},

	/**
	 * @method show
	 * @description Shows a child element
	 * @param {string} name Name of the child element
	 * @param {bool} hideOther Hides all other open elements
	 * @param {bool} withBlend Opens the HUD with a blend
	 */
	show: function(name, withBlend, hideOthers) {
		if (withBlend == true) this.showBlend();
		if (hideOthers != null && hideOthers == true) {
			for (child in this._children) {
				if (child == name) {
					this._children[child].fade('in');
					this._active.push(child);
				} else {
					this._children[child].fade('out');
					this._active.erase(child);
				}
			}
		} else if (this._children[name] != null) {
			this._children[name].fade('in');
			this._active.push(name);
		}
		if (this._children[name] != null)
			this.setPosition(this._children[name], this._position[name].x, this._position[name].y);
	},

	/**
	 * @method hide
	 * @description Hides a specified child or (if not specified) all children. If all children are closed, the HUD will be closed
	 * @param {string|null} name Name of the child element (if none specified, all children will be hidden)
	 */
	hide: function(name) {
		if (name != null)
			this._children[name].fade('out');
		else
			for (child in this._children)
				this.hide(child);
		if (this._active.length < 1)
			alert(JSON.encode(this._active));
		this.hideBlend();
	},

	/**
	 * @method showBlend
	 * @description Shows the blend
	 */
	showBlend: function() {
		this._blend.freeze();
	},

	/**
	 * @method hideBlend
	 * @description Hides the blend
	 */
	hideBlend: function() {
		this._blend.unfreeze();
	}
});
