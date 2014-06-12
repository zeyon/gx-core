'use strict';

/**
 * Gx JavaScript Library for MooTools
 *
 * @author Peter-Christoph Haider <peter.haider@zeyon.net>
 * @version 1.100
 * @package Gx
 * @copyright Copyright (c) 2013, Zeyon GmbH & Co. KG
 * @license http://opensource.org/licenses/gpl-license.php GNU Public License
 */

if (gx == undefined)
	var gx = {};

gx.version = '1.100';
gx.core = {};
gx.ui = {};
gx.util = {
	/**
	 * @method gx.util.Console
	 * @description Default console function - overwrite this, if you don't want Gx log messages in your browser console
	 * @param {string} source The source of the message
	 * @param {string} message The message text
	 */
	Console: function (source, message) {
		console.log(source + ': ' + message);
	},

	/**
	 * @method gx.util.initValue
	 * @description Parse catched errors to string.
	 * @param {object} obj The base object
	 * @param {string} key
	 * @param {string} def The default value
	 */
	initValue: function(obj, key, def) {
		return obj[key] == null ? def : obj[key];
	},

	/**
	 * @method gx.util.initNum
	 * @description Parse catched errors to string.
	 * @param {number|string} num The
	 * @return float
	 */
	initNum: function(num) {
		switch (typeOf(num)) {
			case 'number':
				return num;
			case 'string':
				return parseFloat(num);
			default:
				return 0;
		}
	},

	formatTime: function(mins) {
		if (gx.util.isString(mins)) {
			if (mins.match(/^[0-9]{1,}:[0-9]{2}$/))
				return mins;
			if (mins.match(/^[0-9]{1,}:[0-9]{2,}$/)) {
				mins = mins.replace(/[^0-9]/g, '');
				return mins.replace(/([0-9]{2})$/, ':$1');
			}

			mins = parseInt(mins.replace(/[^0-9]/g));
		}

		var prefix = '';
		if (mins == null || isNaN(mins))
			return '0:00';
		if (mins < 0) {
			mins = -mins;
			prefix = '-';
		}
		var minutes =  mins % 60;
		var hours = Math.floor(mins / 60);
		return prefix + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
	},

	getMinutes: function(ts) {
		ts = ts.replace(/[^0-9:]/, '');
		var parts = ts.replace(/[^0-9:]/, '').split(':');

		if (parts.length == 1)
			return parseInt(parts.pop());

		return parseInt(parts.shift()) * 60 + parseInt(parts.shift());
	},

	initFieldTime: function(input) {
		if (input == undefined)
			input = new Element('input', {'type': 'text'});

		input.addEvent('blur', function() {
			this.set('value', gx.util.formatTime(this.get('value')));
		});
		input.getMinutes = function() {
			return gx.util.getMinutes(input.get('value'));
		};
		input.set('value', gx.util.formatTime(input.get('value')));
		return input;
	},

	formatNum: function(num, decpoint, separator, deccount) {
		if (decpoint == null)
			decpoint = '.';
		if (separator == null)
			separator = ',';
		if (!gx.util.isNumber(deccount))
			deccount = 2;

		if (gx.util.isString(num)) {
			var reg = new RegExp('[^0-9'+decpoint+']', 'g');
			num = parseFloat(
				num.replace(new RegExp('[^0-9'+decpoint+']'), '')
				   .replace(decpoint, '.')
			);
		}
		if (isNaN(num))
			num = 0;

		num = Math.round(num * Math.pow(10, deccount)).toString();
		for (var i = num.length ; i <= deccount ; i++)
			num = '0' + num;
		var pos = num.length - deccount;

		if (deccount > 0)
			num = num.substring(0, pos) + decpoint + num.substring(pos);

		for (var i = pos-3 ; i > 0 ; i -= 3)
			num = num.substring(0, i) + separator + num.substring(i);

		return num;
	},

	getNumber: function(num, decpoint) {
		return parseFloat(
			num.replace(new RegExp('[^0-9'+decpoint+']'), '')
			   .replace(decpoint, '.')
		);
	},

	initFieldFloat: function(input, decpoint, separator, deccount) {
		if (input == undefined)
			input = new Element('input', {'type': 'text'});

		input.addEvent('blur', function() {
			this.set('value', gx.util.formatNum(this.get('value'), decpoint, separator, deccount));
		});
		input.getNumber = function() {
			return gx.util.getNumber(input.get('value'), decpoint);
		};
		input.set('value', gx.util.formatNum(input.get('value'), decpoint, separator, deccount));
		return input;
	},

	/**
	 * @method gx.util.setEleContentByType
	 * @description Adopt or set content to type depending on its type.
	 * @param {object} ele The element which gets the content.
	 * @param {string} content The content. Can be type of element, string, object
	 */
	setElementContentByType: function (ele, content) {
		switch (typeOf(content)) {
			case 'string':
				ele.set('html', content);
				break;
			case 'element':
				ele.empty();
				ele.adopt(content);
				break;
			case 'object':
				ele.empty();
				ele.adopt(__(content));
				break;
		}
		return ele;
	},

	/**
	 * @method gx.util.printf
	 * @description Inserts a single or multiple values into a string
	 *
	 * Sample:
	 * var forecast = "On %arg% the wheather is %arg%";
	 * console.log(gx.util.printf(forecast, ['Sunday', 'sunny']));
	 *
	 * @param {string} subject Target string, where the values are inserted
	 * @param {string|array} values A single value (string) or multiple values inside an array
	 */
	printf: function(subject, values) {
		try {
			if ( typeOf(values) == 'string' || typeOf(values) == 'number' )
				values = [values];
			if ( typeOf(values) == 'array' ) {
				var sections = subject.split("%arg%");
				subject = '';
				var i = 0;
				if ( values != null )
					while (i < values.length) {
						subject = subject + ' ' + sections[i];
						if ( typeOf(sections[i]) == 'string' )
							subject = subject + values[i];
						else if ( typeOf(sections[i]) == 'number' )
							subject = subject + values[i].toString();
						i++;
					}
				while (i < sections.length) {
					subject = subject + sections[i];
					i++;
				}
				return subject;
			} else
				return subject;
		} catch(e) {
			Console('printf', e.message);
			throw e;
		}
	},

	/**
	 * @method gx.util.parseResult
	 * @description Parses a typical API result
	 * @param {sting} json
	 * @return {mixed}
	 */
	parseResult: function(json) {
		var res = JSON.decode(json);
		var t = typeOf(res);
		if ( t == 'object' ) {
			if ( res.error != null )
				throw 'Server error: ' + String(res.error);
			else if ( res.result == null )
				throw 'Undefined result';
			else
				return res.result;
		} else {
			throw 'Invalid data type: ' + t;
		}

		return null;
	},

	/**
	 * @method gx.util.Parse
	 * @description Helper function to parse an element tree
	 * @param {object} obj The object to parse
	 */
	Parse: function(obj) {
		switch (typeOf(obj)) {
			case 'object':
				if ( gx && gx.ui && gx.ui.Container &&
					 instanceOf(obj, gx.ui.Container) && typeOf(obj.display) == 'function')
					return obj.display();

				obj.tag = obj.tag == null ? 'div' : obj.tag;
				var elem = new Element(obj.tag);
				for (var prop in obj) {
					switch (prop) {
						case 'styles':
							elem.setStyles(obj.styles);
							break;
						case 'classes':
							if (typeOf(obj.classes) == 'array')
								obj.classes.each(function(className) { elem.addClass(className) });
							else
								elem.addClass(obj.classes)
							break;
						case 'child':
							elem.adopt(gx.util.Parse(obj.child));
							break;
						case 'children':
							var names = [];
							for (var name in obj.children) {
								var child = gx.util.Parse(obj['children'][name]);
								elem.adopt(child);
								elem['_' + name] = (typeOf(child.retrieve) == 'function' && child.retrieve('com')) ? child.retrieve('com') : child;
								names.push(name);
							}
							elem.store('children', names);
							break;
						case 'tag':
							break;
						default:
							if (prop.length > 5 && prop.substring(0, 2) == 'on' && prop.substring(2, 3) == prop.substring(2, 3).toUpperCase())
								elem.addEvent(prop.substring(2).toLowerCase(), obj[prop]);
							else
								elem.set(prop, obj[prop]);
							break;
					}
				}
				return elem;
			case 'string':
				return document.createTextNode(obj);
			case 'element':
			case 'textnode':
			case 'whitespace':
				return obj;
		}

		return false;
	},
	/**
	 * @method gx.util.parseError
	 * @description Parse catched errors to string.
	 * @param {object} e The error object.
	 * @param {string} spr (optional) The separator string between the error infos.
	 */
	parseError: function (e) {
		var spr = '\n';
		if ( arguments[1] !== undefined )
			spr = arguments[1];

		var infos = [];
		if (e.fileName != undefined)
			infos.push('File: ' + e.fileName);

		if (e.lineNumber != undefined)
			infos.push('Line: ' + e.lineNumber);

		if (e.message != undefined)
			infos.push('Message: ' + e.message);

		var txt = '';
		for (var i = 0; i < infos.length; i++) {
			txt += infos[i] + spr;
		}
		return txt;
	},
	isArray: function(obj) {
		return typeOf(obj) == 'array';
	},
	isObject: function(obj) {
		return typeOf(obj) == 'object';
	},
	isFunction: function(obj) {
		return typeOf(obj) == 'function';
	},
	isString: function(obj) {
		return typeOf(obj) == 'string';
	},
	isNumber: function(obj) {
		return typeOf(obj) == 'number';
	},
	isElement: function(obj) {
		return typeOf(obj) == 'element';
	},
	isNode: function(obj) {
		var t = typeOf(obj);
		return t == 'element' || t == 'textnode';
	}
};

if (gx.noUnderscore != true) {
	/**
	 * @function __
	 * @description Shortcut function for gx.util.Parse
	 * @param {object} obj The object to parse
	 */
	var __ = gx.util.Parse;
}
/**
 * @class gx.core.Settings
 * @description Basic class to handle local class settings
 * @implements Events
 * @implements gx.util.printf
 * @options msg
 *
 * @author Peter-Christoph Haider <peter.haider@zeyon.net>
 * @version 1.00
 * @package Gx
 * @copyright Copyright (c) 2010, Peter Haider
 * @license http://opensource.org/licenses/gpl-license.php GNU Public License
 */
gx.core.Settings = new Class({
	gx: 'gx.core.Settings',
	Implements: Events,
	options: {
		'msg': {}
	},
	_theme:{},
	_language: null,
	_messages: null,

	/**
	 * @type Boolean
	 */
	_valid: true,

	/**
	 * @method setOption
	 * @description Sets a local option
	 * @param {string} option The option to set
	 * @param {string} value The new value of the option
	 */
	setOption: function(option, value) {
		this.options[option] = value;
		this.fireEvent('setOption');
	},

	/**
	 * @method setOptions
	 * @description Sets additional local options
	 *
	 * Portions Copyright (c) 2006-2010 Valerio Proietti & the MooTools
	 * production team, MIT-style license.
	 * http://mad4milk.net/, http://mootools.net/.
	 *
	 * @param {object} options The options object to set
	 */
	setOptions: function(options) {
		if ( options != null && options.theme != null ) {
			Object.append(this._theme, options.theme);
			delete options.theme;
		}

		if (typeOf(options) == 'object')
			Object.append(this.options, options);

		if (this.addEvent) {
			// Code from MooTools
			for (var option in options) {
				if ( (typeOf(options[option]) == 'function') &&
					 (/^on[A-Z]/).test(option) ) {
					this.addEvent(option, options[option]);
					delete options[option];

				}

			}
		}

		this.fireEvent('setOption');
	},

	/**
	 * @method dispatchEvents
	 * @description Makes another object dispatch events to the local object
	 * @param {node} target The target that shall add the event(s)
	 * @param {array} events The events to dispatch
	 */
	dispatchEvents: function(target, events) {
		var root = this;
		events.each(function(event) {
			target.addEvent(event, function() {
				root.fireEvent(event);
			})
		});
	},

	/**
	 * @method gxClass
	 * @description Returns the gx classname
	 * @param {object} gxObj The object in question
	 */
	gxClass: function(gxObj) {
		var type = typeOf(gxObj);
		if (!type)
			return this.gx;
		else if (type == 'object'){
			try {
				return gxObj.gxClass();
			} catch(e) {
				return false;
			}
		} else
			return false;
	},

	initialize: function(options) {
		this.setOptions(options);
		this._messages = this.options.msg;
		this._language = this.options.language;
	},

	/**
	 * @method getMessage
	 * @description Gets a message
	 * @param {string} message The message
	 * @param {array} arguments The printf arguments
	 */
	getMessage: function(message, args) {
		if (this._language != null && this._language != 'en' && this._messages[this._language] != null && this._messages[this._language][message] != null)
			return gx.util.printf(this._messages[this._language][message], arguments);
		if (this._messages[message] != null)
			return gx.util.printf(this._messages[message], args);
		return '';
	},

	/**
	 * @method setLanguage
	 * @description Sets the current language
	 * @param {string} language The language to set
	 */
	setLanguage: function(language) {
		this._language = language;
	},

	doDestroy: function () {
		delete this.options;
		delete this._language;
		delete this._messages;
	},

	/**
	 * Do *not* override this method. Override {@link doDestroy()} instead.
	 */
	destroy: function () {
		if ( !this._valid )
			return;

		delete this._valid;

		this.removeEvents();
		this.doDestroy();
	}

});
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
/**
 * @class gx.ui.Collapse
 * @description Collapses a specified element
 * @extends gx.ui.Container
 * @implements gx.util.Console
 *
 * @param {string|node} display
 * @param {object} options
 *
 * @option {int} duration Collapse effect duration in milliseconds
 * @option {string} transition MooTools Fx.Transition function
 * @option {bool} open Open on initialization
 * @option {string} mode The mode of the collapse
 * @option {string} width The width of the effect
 * @option {string} height The height of the effect
 * @option {int} minHeight The minimum height
 * @option {int} minWidth The minimum width
 * @option {int} minOpacity The minimum opacity
 *
 * @event show
 * @event hide
 * @event resize
 *
 * @sample Collapse Displaying and hiding a div element inside a collapsable element
 */
gx.ui.Collapse = new Class(
	/** @lends gx.ui.Collapse# */
	{
	gx: 'gx.ui.Collapse',
	Extends: gx.ui.Container,
	options: {
		'duration': '300',
		'transition': 'quad:in',
		'open': true,
		'mode': 'vertical',
		'width': 'auto',
		'height': 'auto',
		'minHeight': 0,
		'minWidth': 0,
		'minOpacity': 0
	},
	_isOpen: true,
	_refresh: false,
	_styleOpen: {'opacity': 1},
	_styleClose: null,
	initialize: function(display, options) {
		var root = this;
		try {
			this.parent(display, options);
			this.styleNative = {
				'display': 'block',
				'overflow': 'hidden',
				'width': root.options.width,
				'height': root.options.height
			};
			this._styleClose = {'opacity': root.options.minOpacity};
			root.update();
			this.addEvent('update', function() {
				root.update();
			});
			if (this.options.open) {
				this.show();
			} else {
				this.hide();
			}
		} catch(e) { gx.util.Console('gx.ui.Collapse->initialize', e.message); }
	},

	/**
	 * @method update
	 * @description Updates the animation parameters (target width and target height)
	 */
	update: function() {
		var root = this;
		try {
			if (this._isOpen) {
				if (this.options.mode == 'horizontal' || this.options.mode == 'both') {
					this._styleClose.width = [this._coordinates.width, this.options.minWidth];
					this._styleOpen.width = [this.options.minWidth, this._coordinates.width];
				}
				if (this.options.mode == 'vertical' || this.options.mode == 'both') {
					this._styleClose.height = [this._coordinates.height, this.options.minHeight];
					this._styleOpen.height = [this.options.minHeight, this._coordinates.height];
				}
			} else
				this.refresh = true;
		} catch(e) { gx.util.Console(root.gx + '->update', e.message); }
	},

	/**
	 * @method show
	 * @description Instantly shows the element
	 */
	show: function() {
		var root = this;
		try {
			this._isOpen = true;
			this._display.root.setStyles({
				'display': 'block',
				'width': this.options.width,
				'height': this.options.height
			});
		} catch(e) { gx.util.Console(root.gx + '->show: ', e.message); }
	},

	/**
	 * @method hide
	 * @description Instantly hides the element
	 */
	hide: function() {
		var root = this;
		try {
			this._isOpen = false;
			if (this.options.minWidth < 1 || this.options.minHeight < 1)
				this._display.root.setStyle('display', 'none');
			else if(typeOf(this.options.minWidth) == 'number' && (this.options.mode == 'horizontal' || this.options.mode == 'both'))
				this._display.root.setStyle('width', this.options.minWidth);
			else if(typeOf(this.options.minHeight) == 'number' && (this.options.mode == 'vertical' || this.options.mode == 'both'))
				this._display.root.setStyle('height', this.options.minHeight);
		} catch(e) { gx.util.Console(root.gx + '->hide: ', e.message); }
	},

	/**
	 * @method start
	 * @description Executes the opening/closing animation
	 * @param {bool} doOpen
	 */
	start: function(doOpen) {
		var root = this;
		try {
			if (this._isOpen != doOpen) {
				if (doOpen)
					this._display.root.setStyle('display', 'block');
				else
					this._display.root.setStyle('overflow', 'hidden');
				var morph = new Fx.Morph(this._display.root, {
					duration: root.options.duration,
					transition: root.options.transition,
					onComplete: function() {
						if (doOpen) {
							root.show();
							if (root.refresh)
								root.getCoordinates();
							root.fireEvent('show');
						} else {
							root.hide();
							root.fireEvent('hide');
						}
						// root._isOpen = doOpen;
						root.fireEvent('resize');
					}
				});
				morph.start(doOpen?this._styleOpen:this._styleClose);
			}
		} catch(e) { gx.util.Console(root.gx + '->start', e.message); }
	},

	/**
	 * @method open
	 * @description Opens the element
	 */
	open: function() {
		this.start(1);
	},

	/**
	 * @method close
	 * @description Closes the element
	 */
	close: function() {
		this.start(0);
	},

	/**
	 * @method toggle
	 * @description Toggles between hiding and showing the element
	 */
	toggle: function() {
		this.start(!this._isOpen);
	}
});
/**
 * @class gx.ui.HGroup
 * @description Horizontal Grouping Component
 * @extends gx.ui.Container
 *
 * @author Peter-Christoph Haider <peter.haider@zeyon.net>
 * @version 1.00
 * @package com
 * @copyright Copyright (c) 2011-2013, Zeyon (www.zeyon.net)
 *
 * @param {array} children The children elements
 */
gx.ui.HGroup = new Class({
	Extends: gx.ui.Container,
	options: {},
	_isOpen: true,

	initialize: function(children) {
		var root = this;
		display = new Element('table', {'class': 'group'});
		this.parent(display, {});

		this._ui.row  = new Element('tr');
		this._ui.body = new Element('tbody');
		this._ui.root.adopt(this._ui.body.adopt(this._ui.row));

		children.each(function(col) {
			root.addElem(col.content, col.width, col.styles, col.align, col.properties);
		});
	},

	/**
	 * @method addElem
	 * @description Adds an element to the hgroup
	 * @param {object} elem The element to add
	 * @param {string} width The width of the element (or null)
	 * @param {object} styles The styles to apply
	 * @param {string} align The alignment of the element
	 * @param {object} properties Additional properties to set
	 */
	addElem: function(elem, width, styles, align, properties) {
		var td = new Element('td', {'style': 'vertical-align:top;'});
		if (width != null)
			td.setStyle('width', width);
		if (styles != null)
			td.setStyles(styles);
		if (align != null)
			td.setStyle('vertical-align', align);

		td.adopt(this.initDisplay(elem));

		if ( properties )
			td.set(properties);

		this._ui.row.adopt(td);
	}

});
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
/**
 * @class gx.ui.Tabbox
 * @description Creates a tabbed box
 * @extends gx.ui.Container
 * @implements gx.util.Console
 *
 * @param {node} display: The target node
 *
 * @option {array} frames: The array containing the frames. [{name: STRING, title: STRING, content: NODE/HTML}]
 * @option {int} height: The height of the content area
 * @option {int} show: The first tab to show
 * @option {function} onChange: Called when the tab is changed
 *
 * @event change When the tab is changed
 */
gx.ui.Tabbox = new Class({
	gx: 'gx.ui.Tabbox',
	Extends: gx.ui.Container,
	options: {
		'frames': [],
		'height': false,
		'show': 1,
		'onChange': false
	},
	class_active: 'active',
	_tabs: [],
	_frames: [],
	_active: false,
	initialize: function (display, options) {
		var root = this;
		try {
			this.parent(display, options);

			this.build();

			var frames = this.options.frames;
			if ( isArray(frames) ) {
				frames.each(function (item) {
					root.addTab(item.name, item.title, item.content);
				});
			}

			if ( isFunction(this.options.onChange) )
				this.addEvent('change', this.options.onChange);

			if ( typeOf(this.options.show) == 'string' )
				this.openTab(this.options.show);
			else if(typeof this.options.show == 'number') {
				var index = this.getIndexName(this.options.show);
				if ( index )
					this.openTab(index);
			}
		} catch(e) { gx.util.Console('gx.ui.Tabbox->initialize', e.message); }
	},

	/**
	 * @method build
	 * @description Builds the HTML frame (my vary for derived classes)
	 * @return {element}
	 */
	build: function () {
		try {

			this._display = Object.merge({}, this._display, {
				'tabfull': new Element('td', {'class': 'fullw'}),
				'tablist': new Element('tr'),
				'table': new Element('table', {'class': 'tab'}),
				'content': new Element('div', {'styles': {'overflow': 'auto'}})
			});

			if ( root.options.height )
				this._display.content.setStyle('height', this.options.height);
			this._display.tablist.adopt(new Element('td'));
			this._display.tablist.adopt(this._display.tabfull);
			this._display.table.adopt(this._display.tablist);
			this._display.root.adopt(this._display.table);
			this._display.root.adopt(this._display.content);

		} catch(e) { gx.util.Console('gx.ui.Tabbox->build', e.message); }
	},

	/**
	 * @method buildTab
	 * @description Builds the HTML element for a single tab
	 * @param {string} name
	 * @param {string} title
	 * @return {element}
	 */
	buildTab: function (name, title) {
		var root = this;

		var link = new Element('a', {'html': title.replace(/ /g, '&nbsp;')});
		var tab = new Element('th');
		tab.adopt(link);
		tab.inject(this._display.tabfull, 'before');
		link.addEvent('click', function () {
			root.openTab(name);
		});

		return tab;
	},

	/**
	 * @method buildContent
	 * @description Builds the HTML element for the content section
	 * @param {element} content
	 * @return {element}
	 */
	buildContent: function (content) {
		this._display.content.adopt(content);
		return content;
	},

	/**
	 * @method setHeight
	 * @description Sets the height of the tabbed box
	 * @param {int} height The height to set
	 */
	setHeight: function (height) {
		this._display.content.setStyle('height', height);
	},

	/**
	 * @method addTab
	 * @description Adds a tab
	 * @param {string} name The name of the tab
	 * @param {string} title The title of the tab
	 * @param {string|node} content The content of the tab
	 */
	addTab: function (name, title, content) {
		var root = this;
		try {
			if ( typeOf(content) == 'string' )
				content = new Element('div', {'html': content});

			if ( typeOf(name) == 'string' && typeOf(title) == 'string' && typeOf(content) == 'element' ) {
				if ( typeOf(this._tabs[name]) != 'element' ) {
					var tab = root.buildTab(name, title);
					content = root.buildContent(content);
					content.setStyle('display', 'none');
					this._frames[name] = content;
					this._tabs[name] = tab;

					return true;
				}
			}
			return false;
		} catch(e) {
			gx.util.Console('gx.ui.Tabbox->addTab', e.message);
			throw e;
		}
	},

	/**
	 * @method getTabName
	 * @description Yields the current tab's name.
	 * @returns The name of the currently active tab.
	 * @type {String}
	 */
	getTabName: function () {
		return this._active;
	},

	/**
	 * @method closeTab
	 * @description Closes the tab with the given name
	 * @param {string} name The name of the tab
	 */
	closeTab: function (name) {
		try {
			if ( isNode(this._tabs[name]) ) {
				this._tabs[name].removeClass(this.class_active);
				this._frames[name].setStyle('display', 'none');
				this._active = false;
			}
		} catch(e) { gx.util.Console('gx.ui.Tabbox->closeTab', e.message); }
	},

	/**
	 * @method openTab
	 * @description Opens the tab with the given name
	 * @param {string} name The name of the tab
	 */
	openTab: function (name, options) {
		try {
			if ( !isNode(this._tabs[name]) )
				return this;

			if ( this._active )
				this.closeTab(this._active);

			this._active = name;
			this._tabs[name].addClass(this.class_active);
			this._frames[name].setStyle('display', 'block');
			this.fireEvent('change', [name, options]);

		} catch(e) {
			gx.util.Console('gx.ui.Tabbox->openTab', e.message);
		}

		return this;
	},

	reopen: function () {
		return this.openTab(this._active);
	},

	/**
	 * @method hideTab
	 * @description Hides a tab
	 * @param {String} name The name of the tab to hide.
	 */
	hideTab: function (name) {
		if ( isNode(this._tabs[name]) )
			this._tabs[name].hide();

		return this;
	},

	/**
	 * @method revealTab
	 * @description Reveals (unhides) a tab
	 * @param {String} name The name of the tab to unhide.
	 */
	revealTab: function (name) {
		if ( isNode(this._tabs[name]) )
			this._tabs[name].show();

		return this;
	},

	/**
	 * @method getIndexName
	 * @description Returns the name of the tab at the given index
	 * @param {int} index The index
	 */
	getIndexName: function (index) {
		// !!! TODO: This code will probably not work as expected on Chrome and
		// maybe Safari because properties of an object do not have any
		// particular order.
		var i = 0;
		for (name in this._tabs) {
			i++;
			if ( i == index )
				return name;
		}
		return false;
	}
});
/**
 * @class gx.ui.Table
 * @description Creates a dynamic select box, which dynamically loads the contents from a remote URL.
 * @extends gx.ui.Container
 * @implements gx.util.Console
 *
 * @event click
 * @event dblclick
 * @event filter
 * @event rowAdd
 * @event addData
 * @event setData
 * @event complete
 * @event beforeRowAdd
 * @event afterRowAdd
 *
 * @option {array} cols The table column structure
 * @option {function} structure Formatting row data into columns (returns an array). Called with three parameters: The row object, the index and a reference to this table object.
 * @option {array} data The list data
 * @option {bool} onClick when a row is clicked
 * @option {bool} onFilter when a filter is set
 * @option {bool} onRowAdd when a row is added
 */
gx.ui.Table = new Class({
    gx: 'gx.ui.Table',
    Extends: gx.ui.Container,
    options: {
        'cols': [
            {'label': 'Column 1', 'id': 'col1', 'width': '20px', 'filter': 'asc'},
            {'label': 'Column 2', 'id': 'col2'}
        ],
        'structure': function(row, index) {
            return [
                row.col1,
                {'label': row.col2, 'className': row.col2class}
            ];
        },
        'data'        : [],
        'scroll'      : true,
        'autoresize'  : true,
        'selectable'  : false,
        'checkOnClick': true,
        'sortable'    : false,
        'height'      : '400px',
        'syncDelay'   : 100
    },
    _cols: [],
    _rows: [],
    _filter: false,
    _colspan: 0,
    _scrollBarCol: false,
    _theme: {
        filterAsc   : 'asc',
        filterDesc  : 'desc',
        unfiltered  : '',
        th          : 'th',
        filter      : 'filter',
        filterElem  : 'div',
        mainTable   : 'tbl',
        mainThead   : '',
        mainTheadRow: 'tbl_head',
        mainTbody   : '',
        wrapper     : '',
        emptyCol    : '',
        headerTable : 'tbl',
        tbodyTr     : 'tbl_row',
        oddRow      : 'bg',
        colCheck    : 'tbl_chk'
    },
    initialize: function(display, options) {
        var root = this;
        try {
            this.parent(display, options);
            //this.addEvent('complete', this.adoptSizeToHead.bind(this));

            this._display.table    = new Element('table', {'class': this._theme.mainTable});
            this._display.thead    = new Element('thead', {'class': this._theme.mainThead});
            this._display.theadRow = new Element('tr', {'class': this._theme.mainTheadRow});
            this._display.tbody    = new Element('tbody', {'class': this._theme.mainTbody});

            this._display.root.adopt(
                this._display.table.adopt([
                    this._display.thead.adopt(
                        this._display.theadRow
                    ),
                    this._display.tbody
                ])
            );

            this.buildCols();

            if (this.options.scroll) {
                this._display.header = new Element('table', {'class': this._theme.headerTable});
                this._display.header.inject(this._display.root, 'top');
                this._display.header.adopt(this._display.thead);
                this._display.wrapper = new Element('div', {'class': this._theme.wrapper, 'styles': {'overflow-y': 'scroll', 'height': this.options.height}});
                this._display.wrapper.wraps(this._display.table);

                this._display.emptyCol = new Element('th', {'class': this._theme.emptyCol});
                this._display.theadRow.adopt(this._display.emptyCol);

                this.addEvent('display', function() {
                    this.syncColWith.delay(this.options.syncDelay, this);
                }.bind(this));

                if (this.options.autoresize) {
                    window.addEvent('resize', function() {
                        this.syncColWith();
                    }.bind(this));
                }
                this.addEvent('complete', function() {
                    this.syncColWith();
                }.bind(this));
            }

            if (this.options.selectable && this.options.checkOnClick) {
                this.addEvent('click', function(row) {
                    if (event.target == row.checkbox)
                        return;
                    row.checkbox.checked = !row.checkbox.checked;
                }.bind(this));
            }

            this.setData(this.options.data);

            //window.addEvent('resize', this.adoptSizeToHead.bind(this));
        } catch(e) {
            e.message = 'gx.ui.Table->initialize: ' + e.message;
            throw e;
        }
    },

    /**
     * @method syncColWidth
     * @description Synchronize the column width
     */
    syncColWith: function() {
        if (!this.options.scroll)
            return;

        var scrollWidth = this._display.header.getSize().x - this._display.table.getSize().x;
        this._display.emptyCol.setStyle('width', scrollWidth);
        // this._display.emptyCol.setStyle('background', 'red');

        var row = this._display.tbody.getElement('tr');
        if (row == null)
            return;

        var th = this._display.theadRow.getElements('th');
        row.getElements('td').each(function(td, index) {
            if (!td.getSize().x)
                return;
            if (th[index] != null)
                th[index].setStyle('width', td.getSize().x);
        }.bind(this));
    },

    /**
     * @method buildFilterIndicator
     * @description Adds an indicator object to the column
     * @param {object} col
     * @return {object} Column with indicator object
     */
    buildFilterIndicator: function (col) {
        col.indicator = new Element(this._theme.filterElem, {'class': this._theme.filter});
        col.indicator.inject(col.th, 'top');
        col.th.set('data-sort', '-' + col.id);
        col.th.addEvent('click', function() {
            this.setSort(col);
        }.bind(this));
    },

    /**
     * @method buildCols
     * @description Builds the columns
     * @param {array} cols An array of columns
     */
    buildCols: function(cols) {
        try {
            if (this.options.selectable) {
                this._display.checkall = new Element('input', {'type': 'checkbox'});
                this._display.checkall.addEvent('click', function() {
                    this.toggleSelect();
                }.bind(this));
                this.options.cols = [{
                    'label'     : this._display.checkall,
                    'filterable': false,
                    'className' : this._theme.colCheck
                }].append(this.options.cols);
            }

            this.options.cols.each(function(col) {
                col.th = new Element('th');
                switch (typeOf(col.label)) {
                    case 'object' :
                        col.th.adopt(__(col.label));
                        break;
                    case 'element':
                        col.th.adopt(col.label);
                        break;
                    default:
                        col.th.set('html', col.label);
                        break;
                }

                if ((col.filter != null || col.filterable != false) && this.options.sortable) {
                    this.buildFilterIndicator(col);
                }

                if (col['text-align'] != null)
                    col.th.setStyle('text-align', col['text-align']);

                if (col.width != null)
                    col.th.setStyle('width', col.width);
                if (col.className != null)
                    col.th.set('class', col.className);
                if (col.filter != null)
                    this.setSort(col, col.filter, 1);

                this._display.theadRow.adopt(col.th);
                this._cols.push(col);
            }.bind(this));
            this._colspan = this.options.cols.length;
            // Add one more col to header which automatically scale with of scroll bar width
            // Set default width 16px in case no data will be add at first
            // Erase when data will be add to get automatically scaled.
            //this._scrollBarCol = new Element('th', {'class': ''});
            this._display.theadRow.adopt(this._scrollBarCol);
        } catch(e) {
            e.message = 'gx.ui.Table->buildCols: ' + e.message;
            throw e;
        }

        return this;
    },

    /**
     * @method addData
     * @description Adds the specified data to the table
     * @param {array} data The data to add
     */
    addData: function(data) {
        var odd = false;
        try {
            if ( typeOf(data) != 'array' )
                return this;

            this.fireEvent('addData', data);
            data.each(function(row, index) {
                if ( typeOf(row) != 'object' )
                    return;

                var rowProperties = {};
                var cols = this.options.structure(row, index);

                if (gx.util.isObject(cols) && cols.row ) {
                    if (cols.properties)
                        rowProperties = cols.properties;
                    cols = cols.row;
                }

                if (!gx.util.isArray(cols))
                    return;

                // Add checkboxes
                if (this.options.selectable) {
                    row.checkbox = new Element('input', {
                        'type'   : 'checkbox',
                        'value'  : row.ID,
                        'checked': row.checked
                    });
                    cols = [{
                        'label': row.checkbox,
                        'className': this._theme.colCheck
                    }].append(cols);
                }

                row.tr = new Element('tr', rowProperties)
                    .addClass(this._theme.tbodyTr);

                this.fireEvent('beforeRowAdd', [row, index] );

                var clickable = (row.clickable == null || row.clickable != false || (this.options.cols[index] != null && this.options.cols[index].clickable != false));

                if (odd && this._theme.oddRow)
                    row.tr.addClass(this._theme.oddRow);
                odd = !odd;

                cols.each(function(col, index) {
                    clickable = clickable ? !(this.options.cols[index] != null && this.options.cols[index].clickable == false) : true;
                    var td = new Element('td');

                    if ( this.options.cols[index].width != null )
                        td.setStyle('max-width', this.options.cols[index].width);

                    switch ( typeOf(col) ) {
                        case 'object' :
                            col = Object.clone(col);

                            var labelType = typeOf(col.label);
                            if ( (labelType === 'element') || (labelType === 'textnode') )
                                td.adopt(col.label);
                            else
                                td.set('html', col.label);

                            clickable = ( (col.clickable == null) || (col.clickable != false) );
                            if ( col.className != null )
                                td.addClass(col.className);

                            delete col.label;
                            delete col.clickable;
                            delete col.className;

                            td.set(col);

                            break;

                        case 'element':
                        case 'textnode':
                            td.adopt(col);
                            break;
                        default:
                            td.set('html', col);
                            break;
                    }

                    if ( this._cols[index]['text-align'] != null )
                        td.setStyle('text-align', this._cols[index]['text-align']);

                    if (clickable) {
                        td.addEvent('click', function(event) {
                            this.fireEvent('click', [ row, event, index ] );
                        }.bind(this));
                        td.addEvent('dblclick', function(event) {
                            this.fireEvent('dblclick', [ row, event, index ] );
                        }.bind(this));
                    }
                    row.tr.adopt(td);
                }.bind(this));
                this._display.tbody.adopt(row.tr);
                this._rows.push(row);
                this.fireEvent('rowAdd', [row, index] );
                this.fireEvent('afterRowAdd', [row, index] );
            }.bind(this));
            //if( data.length > 0 ) this._scrollBarCol.erase('style');
            this.fireEvent('complete', data);
        } catch(e) {
            e.message = 'gx.ui.Table->addData: ' + e.message;
            throw e;
        }

        return this;
    },

    /**
     * @method setData
     * @description Sets the list data. Calls empty() and then addData(data)
     * @param {array} data The list data to set
     */
    setData: function(data) {
        this._rows = [];
        this.empty();
        this.fireEvent('setData', data)
        return this.addData(data);
    },

    /**
     * @method setSort
     * @description Sorts the table according to the specified column and mode
     * @param {object} col The column that is decisive for the sorting
     * @param {string} mode The sorting order: 'asc' or 'desc'
     * @param noEvent
     */
    setSort: function(col, mode, noEvent) {
        if ( !this._filter )
            this._filter = {};

        if ( mode == null ) {
            if ( col.th.get('data-sort').indexOf('-') > -1 ) {
                mode = 'asc';
                var prefix = '';
            } else {
                mode = 'desc';
                var prefix = '-';
            }
        }

        if (this._filter.indicator != null && this._theme.filterDesc && this._theme.filterAsc) {
            this._filter.indicator.removeClass(this._theme.filterDesc);
            this._filter.indicator.removeClass(this._theme.filterAsc);
        }

        if ( mode == 'asc' ) {
            this._filter.mode = 'desc';
            var opPrefix = '-';
            if (this._theme.filterDesc)
                col.indicator.addClass(this._theme.filterDesc);
        } else {
            this._filter.mode = 'asc';
            var opPrefix = '';
            if (this._theme.filterAsc)
                col.indicator.addClass(this._theme.filterAsc);
        }

        for ( var i = 0; i < this._cols.length; i++ ) {
            var currentCol = this._cols[i];
            currentCol.th.removeClass('act');
            currentCol.th.set('data-sort', opPrefix + currentCol.id);
        }

        col.th.set('data-sort', prefix + col.id);
        col.th.addClass('act');

        this._filter.indicator = col.indicator;
        this._filter.th = col.th;
        this._filter.id = col.id;

        if (noEvent == null)
            this.fireEvent('filter', [col, this._filter.mode]);

        return this;
    },

    /**
     * @method getFilter
     * @description Returns the filter object {mode: 'asc'|'desc', id: COLID}
     */
    getFilter: function() {
        return this._filter;
    },

    /**
     * @method empty
     * @description Clears the table body
     */
    empty: function() {
        this._display.tbody.empty();
        return this;
    },

    getSelection: function() {
        var selection = [];
        this._rows.each(function(row) {
            if (row.checkbox == null || !row.checkbox.checked)
                return;

            selection.push(row);
        }.bind(this))

        return selection;
    },

    toggleSelect: function() {
        if (!this.options.selectable)
            return;

        var deselect = true;
        this._rows.each(function(row, index) {
            if (!row.checkbox.checked)
                deselect = false;
        });
        this._rows.each(function(row) {
            row.checkbox.checked = !deselect;
        });
        this._display.checkall.checked = !deselect;
    },

    checkall: function(value) {
        if (value !== false)
            value = true;

        this._rows.each(function(row) {
            row.checkbox.checked = value;
        });
        this._display.checkall.checked = value;
    }
});/**
 * @class gx.ui.Timebox
 * @description Creates a box for times, separating hours, minutes and seconds
 * @extends gx.ui.Container
 * @implements gx.util.Console
 *
 * @param {element|string} display The display element
 *
 * @option {float} time The initial time of the element
 * @option {string} unit The default input unit (seconds, minutes, hours)
 * @option {bool} seconds Also display the seconds (default is hours:minutes)
 * @option {bool} prefix The box will support negative numbers
 * @option {bool} readonly
 *
 * @event change
 * @event disabled
 *
 * @sample Timebox Simple timebox example.
 */
gx.ui.Timebox = new Class({

	gx: 'gx.ui.Timebox',

	Extends: gx.ui.Container,

	options: {
		'time'    : 0,
		'unit'    : 'minutes',
		'seconds' : true,
		'prefix'  : false,
		'readonly': false,
		'disabled': false
	},

	_prefix: true,

	_styles: {
		'negative': {
			'background': '#FBE3E4',
			'color': '#8a1f11',
			'border-color': '#FBC2C4'
		},
		'positive': {
			'background': '#E6EFC2',
			'color': '#264409',
			'border-color': '#C6D880'
		}
	},

	initialize: function (display, options) {
		var root = this;
		try {
			this.parent(display, options);
			this.build();
		} catch(e) { gx.util.Console('gx.ui.Timebox->initialize', e.message); }
	},

	/**
	 * @method build
	 * @description Builds the timebox
	 */
	build: function () {
		var root = this;
		try {
			if ( this.options.prefix ) {
				this._display.prefix = new Element('div', {'html': '+', 'styles': Object.merge({}, this._styles.positive, {
					'height': '18px',
					'width': '18px',
					'text-align': 'center',
					'cursor': 'pointer',
					'font-weight': 'bold',
					'font-size': '12px',
					'padding': '1px',
					'margin-right': '3px',
					'border-width': '1px',
					'border-style': 'solid',
					'float': 'left'
				})});
				this._display.root.adopt(this._display.prefix);
				this._display.prefix.addEvent('click', function () {
					if ( !root.options.disabled && (!gx.ui.Timebox.legacyMode || !root.options.readonly) )
						root.setPrefix(!root._prefix);
				});
			}
			this._display.hours = new Element('input', {'type': 'text', 'styles': {'width': '25px', 'text-align': 'center'}});
			this._display.root.adopt(this._display.hours);
			this._display.hours.addEvent('change', function () {
				root.update();
			});
			this._display.minutes = new Element('input', {'type': 'text', 'styles': {'width': '25px', 'text-align': 'center'}});
			this._display.root.adopt(new Element('span', {'html': ':'}));
			this._display.root.adopt(this._display.minutes);
			this._display.minutes.addEvent('change', function () {
				root.update();
			});

			var readOnly = ( this.options.readonly && !gx.ui.Timebox.legacyMode );
			var disabled = ( this.options.disabled || (gx.ui.Timebox.legacyMode && this.options.readonly) );

			if ( this.options.seconds ) {
				this._display.seconds = new Element('input', {'type': 'text', 'styles': {'width': '25px', 'text-align': 'center'}});
				this._display.root.adopt(new Element('span', {'html': ':'}));
				this._display.root.adopt(this._display.seconds);
				this._display.seconds.addEvent('change', function () {
					root.update();
				});

				if ( readOnly )
					this._display.seconds.set('readonly', 'readonly');
			}

			if ( readOnly ) {
				this._display.hours.set('readonly', 'readonly');
				this._display.minutes.set('readonly', 'readonly');
			}

			if ( disabled )
				this.disable();
		} catch(e) {
			gx.util.Console('gx.ui.Timebox->build', e.message);
		}
	},

	/**
	 * @method setPrefix
	 * @description Sets the prefix
	 * @param {element} prefix The prefix
	 * @returns Returns this instance (for method chaining).
	 * @type gx.ui.Timebox
	 */
	setPrefix: function (prefix) {
		try {
			if ( this._display.prefix ) {
				this._prefix = prefix;
				if ( this._prefix ) {
					this._display.prefix.setStyles(this._styles.positive);
					this._display.prefix.set('html', '+');
				} else {
					this._display.prefix.setStyles(this._styles.negative);
					this._display.prefix.set('html', '-');
				}
			}
		} catch(e) {
			gx.util.Console('gx.ui.Timebox->setPrefix', e.message);
		}

		return this;
	},

	/**
	 * @method addZero
	 * @description Adds a zero in front of the number if it is smaller than 10
	 * @param {int} num The number in question
	 */
	addZero: function (num) {
		return (num < 10) ? '0' + num : num;
	},

	/**
	 * @method update
	 * @description Updates the time
	 * @returns Returns this instance (for method chaining).
	 * @type gx.ui.Timebox
	 */
	update: function () {
		return this.set(this.get());
	},

	/**
	 * @method splitTime
	 * @description Splits the time according to the given unit and returns an array of the time values and the prefix
	 * @param {int} time The time in seconds
	 * @param {string} unit The unit (seconds, minutes, hours)
	 * @returns Returns this instance (for method chaining).
	 * @type gx.ui.Timebox
	 */
	splitTime: function (time, unit) {
		try {
			if ( unit == null )
				unit = this.options.unit;

			var prefix = (time >= 0);
			if ( !prefix )
				time = -time;

			if ( unit == 'minutes' )
				time = time * 60;
			else if ( unit == 'hours' )
				time = time * 3600;

			time = Math.round(time);

			var seconds = 0;
			var minutes = Math.round(time / 60);
			if ( this.options.seconds ) {
				seconds = time % 60;
				minutes = Math.floor(time / 60);
			}
			var hours = Math.floor(minutes / 60);
			minutes = minutes % 60;
			return {'hours': hours, 'minutes': this.addZero(minutes), 'seconds': this.addZero(seconds), 'prefix': prefix};
		} catch(e) {
			gx.util.Console('gx.ui.Timebox->splitTime', e.message);
			throw e;
		}

		return this;
	},

	/**
	 * @method getNum
	 * @description Returns the value of the given element
	 * @param {element} elem The element
	 */
	getNum: function (elem) {
		var value = parseInt(elem.get('value'), 10);
		if ( isNaN(value) )
			return 0;
		if ( value < 0 ) {
			this.setPrefix(false);
			value = -value;
		}
		return value;
	},

	/**
	 * @method set
	 * @description Sets the time according to the given unit
	 * @param {int} time The time to set
	 * @param {string} unit The unit (seconds, minutes, hours)
	 * @returns Returns this instance (for method chaining).
	 * @type gx.ui.Timebox
	 */
	set: function (time, unit) {
		var root = this;
		try {
			if ( time == null )
				time = 0;
			if ( unit == null )
				unit = this.options.unit;
			time = this.splitTime(parseFloat(time), unit);
			if ( !time.prefix && !this.options.prefix ) {
				this._display.hours.set('value', 0);
				this._display.minutes.set('value', 0);
				if ( this._display.seconds )
					this._display.seconds.set('value', 0);
			} else {
				this.setPrefix(time.prefix);
				this._display.hours.set('value', time.hours);
				this._display.minutes.set('value', time.minutes);
				if ( this._display.seconds )
					this._display.seconds.set('value', time.seconds);
			}
		} catch(e) {
			gx.util.Console('gx.ui.Timebox->set', e.message);
		}

		return this;
	},

	/**
	 * @method get
	 * @description Gets the time according to the given unit and with the given precision
	 * @param {string} unit The unit (seconds, minutes, hours)
	 * @param {int} precision The precision to apply (default is 0)
	 */
	get: function (unit, precision) {
		try {
			if ( precision == null )
				precision = 0;
			if ( unit == null )
				unit = this.options.unit;

			var hours = this.getNum(this._display.hours);
			var minutes = this.getNum(this._display.minutes);
			var seconds = 0;
			if ( this._display.seconds )
				seconds = this.getNum(this._display.seconds);

			var time = (this._prefix ? 1 : -1) * (hours * 3600 + minutes * 60 + seconds);

			switch(unit) {
				case 'hours':
					return Math.round(((time / 3600) * Math.pow(10, precision))) / Math.pow(10, precision);
				case 'minutes':
					return Math.round(((time / 60) * Math.pow(10, precision))) / Math.pow(10, precision);
				default:
					return Math.round((time * Math.pow(10, precision))) / Math.pow(10, precision);
			}
		} catch(e) {
			gx.util.Console('gx.ui.Timebox->get', e.message);
			throw e;
		}
	},

	/**
	 * @method enable
	 * @description Enables the timebox
	 * @returns Returns this instance (for method chaining).
	 * @type gx.ui.Timebox
	 */
	enable: function () {
		this.options.disabled = false;
		this._display.hours.erase('disabled');
		this._display.minutes.erase('disabled');
		if ( this._display.seconds )
			this._display.seconds.erase('disabled');

		return this;
	},

	/**
	 * @method disable
	 * @description Disables the timebox
	 * @returns Returns this instance (for method chaining).
	 * @type gx.ui.Timebox
	 */
	disable: function () {
		this.options.disabled = true;
		this._display.hours.set('disabled', 'disabled');
		this._display.minutes.set('disabled', 'disabled');
		if ( this._display.seconds )
			this._display.seconds.set('disabled', 'disabled');

		return this;
	},

	disabled: function () {
		return this.options.disabled;
	}

});

/**
 * In legacy mode, the "readonly" option will be equivalent to the "disabled" option.
 * Otherwise, read-only and disabled map to their counterparts in the HTML standard.
 */
gx.ui.Timebox.legacyMode = true;
