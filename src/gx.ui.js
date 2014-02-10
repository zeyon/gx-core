/**
 * @class gx.ui.Container
 * @description Abstract class for container elements
 * @implements gx.core.Settings
 * @extends gx.core.Parse
 *
 * @author Peter-Christoph Haider <peter.haider@zeyon.net>
 * @version 1.00
 * @package com
 * @copyright Copyright (c) 2011-2013, Zeyon (www.zeyon.net)
 *
 * @param {string|node} display
 *
 * @option {window} parent The parent window
 */
gx.ui.Container = new Class({
	Extends: gx.core.Settings,
	options: {
		'parent': window
	},
	_coordinates: {
		width: 0,
		height: 0,
		top: 0,
		bottom: 0,
		left: 0,
		right: 0
	},
	_ui: {},
	_parent: null,
	_display: {},

	initialize: function (display, options) {
		var root = this;
		try {
			this.parent(options);

			this._display.root = this.initDisplay(display);
			this._ui.root = this._display.root;
			this._ui.root.store('com', this); // Store a pointer to the component

			if (typeOf(this.options.parent) == 'element' || typeOf(this.options.parent) == 'window')
				this._parent = this.options.parent;
			if (this.options.styles != null)
				this._ui.root.setStyles(this.options.styles);
			switch (typeOf(this.options.classes)) {
				case 'array':
					this.options.classes.each(function (className) { root._ui.root.addClass(className) });
					break;
				case 'string':
					this._ui.root.addClass(this.options.classes);
					break;
			}

			this.getCoordinates();
			this.fireEvent('build', this);
		} catch(e) {
			alert('gx.ui.Container->initialize: ' + e.stack);
		}
	},

	/**
	 * @method initDisplay
	 * @description Initializes the display element
	 * @param {string|element|object} elem
	 * @param {bool} str Return a text node, if a string is specified
	 */
	initDisplay: function (elem, str) {
		switch (typeOf(elem)) {
			case 'string':
				return str == null ? $(elem) : document.createTextNode(elem);
			case 'number':
				return document.createTextNode(elem.toString());
			case 'element':
				return elem;
			case 'object':
				if (instanceOf(elem, gx.ui.Container) && typeOf(elem.display) == 'function')
					return elem.display();
				else
					return __(elem);
			default:
				return new Element('div');
		}
	},

	/**
	 * @method display
	 * @description Returns a display element
	 * @param {string} elem Display key
	 */
	display: function (elem) {
		this.fireEvent('display');
		return this._ui[ elem ? elem : 'root' ];
	},

	/**
	 * @method toElement
	 * @description Returns the main display element.
	 */
	toElement: function () {
		return this.display();
	},

	/**
	 * @method setCoordinates
	 * @description Sets the coordinates and measurements to the root element and fires the "resize" event
	 * @param {object} options
	 */
	setCoordinates: function (options) {
		var root = this;
		try {
			var coordinates = new Object();
			if (typeOf(options.width) == 'number') coordinates.width = options.width;
			if (typeOf(options.height) == 'number') coordinates.height = options.height;
			if (typeOf(options.top) == 'number') coordinates.top = options.top;
			if (typeOf(options.bottom) == 'number') coordinates.bottom = options.bottom;
			if (typeOf(options.left) == 'number') coordinates.left = options.left;
			if (typeOf(options.right) == 'number') coordinates.right = options.right;
			this._display.root.setStyles(coordinates);
			this.fireEvent('resize');
		} catch(e) { gx.util.Console(root.gx + '->setCoordinates', e.message); }
	},

	/**
	 * @method getCoordinates
	 * @description Calculates the coordinates and measurements of the root element
	 */
	getCoordinates: function () {
		try {
			this._coordinates = this._display.root.getCoordinates();
			this._coordinates.scrollx = this._display.root.getScrollSize().x;
			this._coordinates.scrolly = this._display.root.getScrollSize().y;
			this._coordinates.paddingtop = this._display.root.getStyle('padding-top').toInt();
			this._coordinates.paddingright = this._display.root.getStyle('padding-right').toInt();
			this._coordinates.paddingbottom = this._display.root.getStyle('padding-bottom').toInt();
			this._coordinates.paddingleft = this._display.root.getStyle('padding-left').toInt();
			this._coordinates.bordertop = this._display.root.getStyle('border-top-width').toInt();
			this._coordinates.borderright = this._display.root.getStyle('border-right-width').toInt();
			this._coordinates.borderbottom = this._display.root.getStyle('border-bottom-width').toInt();
			this._coordinates.borderleft = this._display.root.getStyle('border-left-width').toInt();
			this._coordinates.innerwidth = this._coordinates.width - this._coordinates.borderleft - this._coordinates.borderright - this._coordinates.paddingleft - this._coordinates.paddingright;
			this._coordinates.innerheight = this._coordinates.height - this._coordinates.bordertop - this._coordinates.borderbottom - this._coordinates.paddingtop - this._coordinates.paddingbottom;
		} catch(e) {}

		return this._coordinates;
	},

	/**
	 * @method set
	 * @description Sets an option to the root element
	 * @param {string} option The option to set
	 * @param {string} value The option's value to set
	 */
	set: function (option, value) {
		try {
			this._ui.root.set(option, value);
		} catch(e) {}
	},

	/**
	 * @method setStyle
	 * @description Sets a style to the root element
	 * @param {string} option The option to set
	 * @param {string} value The option's value to set
	 */
	setStyle: function (option, value) {
		try {
			this._ui.root.setStyle(option, value);
		} catch(e) {}
	},

	doDestroy: function () {
		if ( this._ui.root instanceof Element ) {
			this._ui.root.destroy();
			delete this._ui.root;
		}

		delete this._coordinates;
		delete this._ui;
		delete this._parent;
		delete this._display;

		this.parent();
	}
});
