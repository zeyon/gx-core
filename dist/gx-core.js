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

/**
 * Mootools extras.
 *
 */


/**
 * Escapes special (X)HTML characters "<", ">", "&" and the double quotation marks '"'.
 *
 * @return {String}
 */
if ( typeof String.prototype.htmlSpecialChars !== 'function' ) {
  String.prototype.htmlSpecialChars = function () {
    return this
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };
}

/**
 * Array.find(function).
 *
 * Find an item of an array by providing a function returning true if found.
 *
 * [{id:2}, {id:3}].findBy(function(item) {
 *   return item.id === 3;
 * }) === {id:3}
 *
 * Convenience arguments: If you provide string as first argument and a second
 * argument you can find an item of an array with the provided key:value
 *
 * Example: This will give the same result as above:
 *
 * [{id:2}, {id:3}].findBy('id', 3) === {id:3}
 *
 */
if ( typeof Array.prototype.findBy !== 'function' ) {
  Array.prototype.findBy = function(mixed, value) {
    var func = mixed;
    if ( typeof mixed === 'string' ) {
      func = function(item) {
        return item[mixed] === value;
      };
    }

    for ( var item, i = this.length - 1; i >= 0; i-- ) {
      item = this[i];
      if ( func(item) === true )
        return item;
    }

    return null;
  };
}
if ( window.console && typeof window.console.error !== 'function' )
	window.console.error = window.console.log;

gx.util = {
	/**
	 * @method gx.util.Console
	 * @description Default console function - overwrite this, if you don't want Gx log messages in your browser console
	 * @param {string} source The source of the message
	 * @param {string} message The message text
	 */
	Console: function (source, message) {
		if ( message instanceof Error )
			console.error(source, message.stack);
		else
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

	attemptConvertionWith: function(obj, key) {
		if ( typeof obj !== 'object')
			return obj;

		var f = obj[key];
		if ( typeof f === 'function' )
			return f.call(obj);

		return obj;
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

	adoptByType: function(ele, content) {
		switch (typeOf(content)) {
			case 'string':
				ele.appendText(content);
				break;
			case 'object':
				ele.adopt(__(content));
				break;
			case 'array':
				for ( var i = 0, l = content.length; i < l; i++)
					this.adoptByType(ele, content[i]);
				break;
			// case 'element':
			default:
				ele.adopt(content);
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
				var elem = new Element(obj.tag), children, childrenTemp;
				for (var prop in obj) {
					switch (prop) {
						case '_adopt':
							this.adoptByType(elem, obj._adopt);
							break;
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
							children = obj.children;
							if ( typeOf(children) === 'array' ) {
								childrenTemp = [];
								for ( var iCh = 0, lCh = children.length; iCh < lCh; iCh++) {
									childrenTemp.push(gx.util.Parse(children[iCh]));
								}
								elem.adopt(childrenTemp);
								break;
							}

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
 * This is version 2 of the gx.ui.Table class. It simplifies the class
 * by removing the hidden thead element and do not calculate the thead sizes
 * with javascript.
 *
 * It contains massive rework by splitting .addData() into
 * createRow, updateRow, removeRow.
 *
 * Fixing HUGE performance issues (do not bind "click" event handler to EVERY CELL by default).
 *
 * Therefore the API to gx.ui.SimpleTable is broken.
 *
 *
 * @class gx.ui.Table
 * @description Creates a dynamic select box, which dynamically loads the contents from a remote URL.
 * @extends gx.ui.Container
 * @implements gx.util.Console
 *
 * @event click Fired when click a row.
 *
 */
gx.ui.SimpleTable = new Class({
  Implements: [Options, Events],

  options: {
    'cols': [],
		'structure'      : function (row, index) {
			return [
				row.col1,
				{ 'label': row.col2, 'className': row.col2class }
			];
		},
    'tableCss': 'table table-striped table-hover',
    'fireRowClick': false
		// data: []
  },

  initialize: function (display, options) {
    this.setOptions(options);
    this.build(display);

    this.buildCols(this.options.cols);
  },

  /**
   * @method build
   * @description Builds the core components
   */
  build: function (display) {
    this._display = {};

    var rootElmt = this._display.root = typeOf(display) === 'element' ?
      display :
      new Element('table');

    if ( rootElmt.get('tag') === 'table' ) {
      this._display.table = rootElmt;
    } else {
      this._display.table = new Element('table');
      rootElmt.adopt(this._display.table);
    }

    this._display.table.addClass(this.options.tableCss);

    this._display.tbody = new Element('tbody');
    this._display.thead = new Element('thead');

    this._display.table.adopt(
        this._display.thead,
        this._display.tbody
    );
  },

  /**
   * @method buildCols
   * @description Builds the columns
   * @param {array} cols An array of columns
   */
  buildCols: function (cols) {
    var tr = new Element('tr');
    this._display.thead.empty();
    this._display.thead.adopt(tr);

    cols.each(function (col) {
      var th = new Element('th', { 'class': '' });

      if ( col.properties )
        th.set(col.properties);

      switch ( typeOf(col.label) ) {
        case 'object' :
          th.adopt(__(col.label));
          break;
        case 'element':
          th.adopt(col.label);
          break;
        default:
          th.set('html', col.label);
          break;
      }

      tr.adopt(th);
    });
  },


  /**
   * @method setData
   * @description Sets the list data. Calls empty() and then addData(data)
   * @param {array} data The list data to set
   * @returns Returns this instance (for method chaining).
   * @type gx.ui.Table
   */
  setData: function (data) {
    this.empty();
    return this.addData(data);
  },

  /**
   * @method addData
   * @description Adds the specified data to the table
   * @param {array} data The data to add
   * @returns Returns this instance (for method chaining).
   * @type gx.ui.Table
   */
  addData: function (data) {
    data.each(function (row, index) {
      this.addRow(row, index);
    }.bind(this));
  },

  createRow: function(row, index) {
    var root = this;
    var cols = root.options.structure(row, index, root);
    var rowProperties = {};

    if ( cols.row && cols.properties ) {
      Object.merge(rowProperties, cols.properties);
      cols = cols.row;
    }

    var tr = new Element('tr', rowProperties);
    for ( var i = 0, l = cols.length; i < l; i++ ) {
      var col = cols[i];
      var td = new Element('td');

      switch (typeOf(col)) {
        case 'object' :
          var label = col.label;
          if ( label instanceof Element )
            td.adopt(label);
          else
            td.set('html', label);

          col = Object.clone(col);

          if ( col.className )
            td.addClass(col.className);

          delete col.label;
          delete col.className;

          td.set(col);

          break;

        case 'element':
          td.adopt(col);
          break;

        default:
          td.set('html', col);
          break;
      }

      tr.adopt(td);
    }

    // BAD, this event should be added to "table" tag handled with
    // event propagation, however. This requires index management of the
    // data rows. Therefore stay with this for now.
    if ( this.options.fireRowClick === true ) {
      tr.addEvent('click', function() {
        root.fireEvent('click', [row, index]);
      });
    }

    return tr;
  },

  addRow: function(obj, index) {
    var tr = this.createRow(obj, index);
    this._display.tbody.adopt(tr);

    return tr;
  },

  updateRow: function(obj, index) {
    var replaceTr;
    var tbody = this._display.tbody;
    if ( typeof tbody.childNodes !== 'undefined' )
      replaceTr = tbody.childNodes[index];
    else
     replaceTr = tbody.getChildren()[index];

    var tr = this.createRow(obj, index);
    tr.replaces(replaceTr);

    return tr;
  },

  removeRow: function(index) {
    var row;
    var tbody = this._display.tbody;
    if ( typeof tbody.childNodes !== 'undefined' )
      row = tbody.childNodes[index];
    else
     row = tbody.getChildren()[index];

    if ( row )
      $(row).destroy();
  },

  getRows: function() {
    return this._display.tbody.childNodes;
  },

  /**
   * @method empty
   * @description Clears the table body
   * @returns Returns this instance (for method chaining).
   * @type gx.ui.Table
   */
  empty: function () {
    this._display.tbody.empty();
  },

  toElement: function() {
    return this._display.root;
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
			if ( frames instanceof Array ) {
				for (var i = 0; i < frames.length; i++) {
					var item = frames[i];
					root.addTab(item.name, item.title, item.content, item.properties);
				}
			}

			if ( typeof(this.options.onChange) === 'function' )
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

	isNode: function (obj) {
		return ( (typeof(obj) === 'object') && (obj.nodeType == 1) );
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

		var link = new Element('a', {'html': String(title).replace(/ /g, '&nbsp;')});
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
	 * @param {object} tabElementProperties Optional. Properties to apply to
	 *     the DOM element using {@link Element.prototype.set()}.
	 */
	addTab: function (name, title, content, tabElementProperties) {
		var root = this;
		try {
			switch ( typeOf(content) ) {
				case 'string':
					content = new Element('div', { 'html': content });
					break;

				case 'element':
					break;

				default:
					content = $(content);
					break;
			}

			if ( typeOf(name) == 'string' && typeOf(title) == 'string' && typeOf(content) == 'element' ) {
				if ( typeOf(this._tabs[name]) != 'element' ) {
					var tab = root.buildTab(name, title);

					if ( tabElementProperties )
						tab.set(tabElementProperties);

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
	 * Sets a tab's title.
	 *
	 * @param {String} name The tab's name.
	 * @param {String} title The title to set.
	 * @returns {gx.ui.Tabbox}
	 * @see this.setTabObjectTitle()
	 */
	setTabTitle: function (name, title) {
		if ( this.isNode(this._tabs[name]) )
			this.setTabObjectTitle(this._tabs[name], title);

		return this;
	},

	/**
	 * Sets the title of a tab object. Override this if you implement a custom {@link this.buildTab()}.
	 *
	 * @todo !!! Maybe it is better to create a custom class for tabs that is supplied on instantiation of this class.
	 * @param {object} tabObject
	 * @param {String} title The title to set.
	 * @returns {gx.ui.Tabbox}
	 */
	setTabObjectTitle: function (tabObject, title) {
		var a = tabObject.getElement('>a:first-child');
		if ( a )
			a.set('html', String(title).replace(/ /g, '&nbsp;'));

		return this;
	},

	/**
	 * @method closeTab
	 * @description Closes the tab with the given name
	 * @param {string} name The name of the tab
	 */
	closeTab: function (name) {
		try {
			if ( this.isNode(this._tabs[name]) ) {
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
			if ( !this.isNode(this._tabs[name]) )
				return this;

			if ( this._active )
				this.closeTab(this._active);

			this._active = name;
			this._tabs[name].addClass(this.class_active);
			this._frames[name].setStyle('display', 'block');
			this.fireEvent('change', [ name, options, this ]);

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
		if ( this.isNode(this._tabs[name]) )
			this._tabs[name].hide();

		return this;
	},

	/**
	 * @method revealTab
	 * @description Reveals (unhides) a tab
	 * @param {String} name The name of the tab to unhide.
	 */
	revealTab: function (name) {
		if ( this.isNode(this._tabs[name]) )
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
 * @option {bool} onStart when the table is being rendered
 * @option {bool} onComplete when the table is rendered completely
 */
gx.ui.Table = new Class({
	gx: 'gx.ui.Table',
	Extends: gx.ui.Container,
	options: {
		'cols'           : [
			{ 'label': 'Column 1', 'id': 'col1', 'width': '20px', 'filter': 'asc' },
			{ 'label': 'Column 2', 'id': 'col2' }
		],
		'structure'      : function (row, index) {
			return [
				row.col1,
				{ 'label': row.col2, 'className': row.col2class }
			]
		},
		'stopPropagation': false,
		'height'         : false,
		'data'           : []
	},
	_theme: {
		'asc': 'asc',
		'desc': 'desc',
		'unfiltered': '',
		'th': 'th',
		'filter': 'filter',
		'table_body': 'view fixed',
		'table_head': 'view',
		'filter_elem': 'div'
	},
	_cols: [],
	_filter: false,
	_colspan: 0,
	_scrollBarCol: false,

	initialize: function (display, options) {
		var root = this;
		try {
			this.parent(display, options);

			// backward compatibility
			this.theme = this._theme;

			this.addEvent('complete', this.adoptSizeToHead.bind(this));

			this.build();

			if ( this.options.height )
				this.setHeight(this.options.height);

			this.buildCols(this.options.cols);
			this.setData(this.options.data);

			window.addEvent('resize', this.adoptSizeToHead.bind(this));
		} catch(e) {
			gx.util.Console('gx.ui.Table->initialize', e.message);
		}
	},

	/**
	 * @method build
	 * @description Builds the core components
	 */
	build: function () {
		var root = this;

		try {
			this._display.root.addClass('gxComTable');
			this._display.hiddenTableHead = new Element('thead', { 'class': this.theme.table_head });
			this._display.tbody = new Element('tbody');

			this._display.thead = new Element('thead');

			this._display.table = new Element('table', { 'class': this.theme.table_body })
				.adopt(
					this._display.hiddenTableHead,
					this._display.tbody
				);

			if ( this.options.simpleTable ) {
				this._display.root.adopt(this._display.table);
			} else {
				this._display.hiddenTableHead.hide();
				this._display.tableDiv = new Element('div', {'style': 'overflow-y:scroll;'})
					.adopt(this._display.table);
				this._display.root.adopt(
					new Element('table', { 'class': this.theme.table_head })
						.adopt(this._display.thead),
					this._display.tableDiv
				);
			}
		} catch(e) {
			gx.util.Console('gx.ui.Table->build', e.message);
		}
	},

	/**
	 * @method buildFilterIndicator
	 * @description Adds an indicator object to the column
	 * @param {object} col
	 * @return {object} Column with indicator object
	 */
	buildFilterIndicator: function (col) {
		var root = this;
		col.indicator = new Element(this.theme.filter_elem, {'class': this.theme.filter});
		col.indicator.inject(col.th, 'top');
		col.th.addEvent('click', function () {
			root.setSort(col);
		});
		return col;
	},

	/**
	 * @method buildCols
	 * @description Builds the columns
	 * @param {array} cols An array of columns
	 */
	buildCols: function (cols) {
		this.options.cols = cols;

		var root = this;
		try {
			var tr = new Element('tr');
			root._display.thead.empty();
			root._display.thead.adopt(tr);

			cols.each(function (col) {
				col.th = new Element('th', { 'class': root.theme.th });

				if ( col.properties )
					col.th.set(col.properties);

				switch ( typeOf(col.label) ) {
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
				if ( col.filter != null || col.filterable != false ) {
					col = root.buildFilterIndicator(col);
				}
				if ( col.width != null )
					col.th.setStyle('width', col.width);
				if ( col.filter != null )
					root.setSort(col, col.filter, 1);

				tr.adopt(col.th);
				root._cols.push(col);
			});

			this._display.hiddenTableHead
				.empty()
				.adopt(this._display.thead.clone().getChildren());

			if ( !this.options.simpleTable )
				this._display.table.setStyle('margin-top', -1 * this._display.hiddenTableHead.getStyle('height').toInt());

			// this._cols[0].th.removeClass('b_l');
			this._colspan = cols.length;
			// Add one more col to header which automatically scale with of scroll bar width
			this._scrollBarCol = new Element('th', {'class': 'b_l', 'style': 'width: ' + gx.Browser.scrollBar.width + 'px; padding: 0px;'});
			tr.adopt(this._scrollBarCol);

		} catch(e) {
			gx.util.Console('gx.ui.Table->buildCols', e.message);
		}

		return this;
	},

	/**
	 * @method setHeight
	 * @description Sets the table height
	 * @param {int} height
	 * @returns Returns this instance (for method chaining).
	 * @type gx.ui.Table
	 */
	setHeight: function (height) {
		( this._display.tableDiv || this._display.table ).setStyle('height', height);
		return this;
	},

	/**
	 * @method setSort
	 * @description Sorts the table according to the specified column and mode
	 * @param {object} col The column that is decisive for the sorting
	 * @param {string} mode The sorting order: 'asc' or 'desc'
	 * @param noEvent
	 * @returns Returns this instance (for method chaining).
	 * @type gx.ui.Table
	 */
	setSort: function (col, mode, noEvent) {
		var root = this;
		try {
			if ( this._filter ) {
				if ( this._filter.id == col.id ) {
					if ( (this._filter.mode == 'asc' && mode == null) || (mode != null && mode == 'desc') ) {
						this._filter.indicator.removeClass(this.theme.asc);
						this._filter.indicator.addClass(this.theme.desc);
						this._filter.mode = 'desc';
					} else {
						this._filter.indicator.removeClass(this.theme.desc);
						this._filter.indicator.addClass(this.theme.asc);
						this._filter.mode = 'asc';
					}
					if ( noEvent == null )
						this.fireEvent('filter', col);

					return this;

				} else {
					this._filter.indicator.removeClass(this.theme.asc);
					this._filter.indicator.removeClass(this.theme.desc);

				}
			}

			if ( mode == null || mode != 'desc' )
				mode = 'asc';

			this._filter = col;
			this._filter.indicator.addClass(this.theme[mode]);
			this._filter.mode = mode;
			if ( noEvent == null )
				this.fireEvent('filter', col);

		} catch(e) {
			gx.util.Console('gx.ui.Table->setSort', e.message);
		}

		return this;
	},

	/**
	 * @method getFilter
	 * @description Returns the filter object {mode: 'asc'|'desc', id: COLID}
	 */
	getFilter: function () {
		return this._filter;
	},

	/**
	 * @method setData
	 * @description Sets the list data. Calls empty() and then addData(data)
	 * @param {array} data The list data to set
	 * @returns Returns this instance (for method chaining).
	 * @type gx.ui.Table
	 */
	setData: function (data) {
		this.empty();
		this.fireEvent('setData', data)
		return this.addData(data);
	},

	/**
	 * @method addData
	 * @description Adds the specified data to the table
	 * @param {array} data The data to add
	 * @returns Returns this instance (for method chaining).
	 * @type gx.ui.Table
	 */
	addData: function (data) {
		var root = this;
		var odd = false;

		try {
			if ( typeOf(data) != 'array' )
				return this;

			this.fireEvent('addData', data)
			data.each(function (row, index) {
				if ( typeOf(row) != 'object' )
					return;

				var cols = root.options.structure(row, index, root);
				var rowProperties = {};

				if ( (typeof(cols) === 'object') && cols.row ) {
					Object.merge(rowProperties, cols.properties);
					cols = cols.row;
				}

				if ( typeOf(cols) != 'array' )
					return;

				root.fireEvent('beforeRowAdd', row);
				row.tr = new Element('tr', rowProperties)
					.addClass('em');
				var clickable = (row.clickable == null || row.clickable != false);

				if ( odd )
					row.tr.addClass('bg');
				odd = !odd;

				cols.each(function (col, index) {
					clickable = clickable ? !(root.options.cols[index] != null && root.options.cols[index].clickable == false) : true;
					var td = new Element('td');
					var width = false;

					if ( (width = root.options.cols[index].width) )
						td.setStyle('width', width);

					switch (typeOf(col)) {
						case 'object' :
							var label = col.label;
							if ( label instanceof Element )
								td.adopt(label);
							else
								td.set('html', label);

							col = Object.clone(col);

							clickable = (col.clickable == null || col.clickable != false);
							if ( col.className != null )
								td.addClass(col.className);

							delete col.label;
							delete col.clickable;
							delete col.className;

							td.set(col);

							break;

						case 'element':
							td.adopt(col);
							break;

						default:
							td.set('html', col);
							break;
					}

					if ( clickable ) {
						td.addEvent('click', function (event) {
							if ( root.options.stopPropagation )
								event.stopPropagation();

							root.fireEvent('click', [ row, event ]);
						});
						td.addEvent('dblclick', function (event) {
							if ( root.options.stopPropagation )
								event.stopPropagation();

							root.fireEvent('dblclick', [ row, event ]);
						});
					}
					row.tr.adopt(td);
				});

				root._display.tbody.adopt(row.tr);
				root.fireEvent('rowAdd', row);
				root.fireEvent('afterRowAdd', row);
			});
			this.fireEvent('complete', data);

		} catch(e) {
			gx.util.Console('gx.ui.Table->addData', e.message);
		}

		return this;
	},

	/**
	 * @method empty
	 * @description Clears the table body
	 * @returns Returns this instance (for method chaining).
	 * @type gx.ui.Table
	 */
	empty: function () {
		this._display.tbody.empty();
		return this;
	},

	/**
	 * @method adoptSizeToHead
	 * @description Sets the cell widths of the header with the width of the cell in the first row
	 * @returns Returns this instance (for method chaining).
	 * @type gx.ui.Table
	 */
	adoptSizeToHead: function () {
		var row = this._display.tbody.getElement('tr');
		if ( row == null )
			return this;

		row.getElements('td').each( function (ele) {
			// Firefox and possibly other browsers yield the CSS dimensions in
			// percent if these were specified as such using inline styles.
			// See also for a demo of this behavior: http://jsfiddle.net/2jwBQ/
			var w = (
				(document.defaultView && document.defaultView.getComputedStyle)
				? document.defaultView.getComputedStyle(ele, null).getPropertyValue('width')
				: ele.getComputedSize({ 'styles': [], 'mode': 'horizontal' }).width.toInt()
			);
			if ( this._cols[ele.cellIndex] )
				this._cols[ele.cellIndex].th.setStyle('width', w);
		}.bind(this));

		return this;
	}
});
gx.ui.TemplatesClass = new Class({

  Binds: [
    'createElement'
  ],

  /**
   * Used to recognize inline render calls.
   * @type {Boolean}
   */
  isInline: 0,

  /**
   * This var is used to bind elements to the optional storage argument.
   * @type {object}
   */
  storageReference: null,

  /**
   * This var is used to apply the data parameter to inline templates.
   * @type {*}
   */
  dataReference: null,

  templates: {},

  initialize: function() {
    this.boundRenderInline = this.renderInline.bind(this);
  },

  /**
   * Creating an element with the given name, properties and children.
   *
   * First argument is the node name. E.g. div, textarea etc.
   *
   * Rest arguments (independent order):
   *   ByFirstChar:
   *   '#=myId'           - Element get this id
   *   ':=myName'         - Element will be bind to key 'myName'
   *   '.=class1 and two' - Element.className will be 'class1 and two'
   *
   *   'AnyOtherString'  - Will be appended as TextNode
   *   {}                - Set all object keys as property (class, id, any)
   */
  createElement: function(/*nodeName*/) {
    var _node, element = arguments[0], type = typeOf(element);
    if ( type === 'element' ) {
      _node = element;
    } else if ( type === 'string' ) {
      if ( element.substr(0, 2) === '~=' ) {
        return this.boundRenderInline.apply(this, [element.substr(2)].append(Array.prototype.slice.call(arguments, 1)));
      }

      _node = new Element(element);
    } else if ( type === 'function') {
      return this.boundRenderInline.apply(this, [element].append(Array.prototype.slice.call(arguments, 1)));
    } else {
      throw new Error('InvalidArgumentsException: Invalid tag name argument type: ' + type);
    }

    var i = 0;
    var argLength = arguments.length;
    var arg, firstChar, tmp;

    while (++i < argLength) {
      // iterate over all arguments

      arg = arguments[i];
      if ( !arg )
        continue;

      type = typeOf(arg);
      if (type === 'string') {
        // Process special first chars
        firstChar = arg.substring(0, 2);
        if (firstChar === '.=') {
          // set class of the node

          _node.addClass(arg.substring(2));

        } else if (firstChar === ':=') {
          // Bind this node to storage argument

          // Already checked for typeof StorageReference === 'object'
          if (this.references === undefined)
            continue;

          this.references[arg.substring(2)] = _node;

        } else {
          // Append string as TEXT_NODE

          _node.appendText(arg);
        }

      } else if (type === 'element') {
        // If argument is ELEMENT_NODE || TEXT_NODE append it

        _node.adopt(arg);

      } else if (type === 'function') {
        // Execute function and add result to arguments array for processing

        tmp = arg.call(this, this.createElement, this.dataReference, this);

        if (tmp === undefined)
          continue;

        if (!Array.isArray(tmp))
          tmp = [tmp];

        Array.prototype.splice.apply(arguments, [i + 1, 0].concat(tmp));
        argLength = arguments.length;

      } else if (type === 'array') {
        // Just add the content of the array to the arguments array to get
        // processed
        Array.prototype.splice.apply(arguments, [i + 1, 0].concat(arg));
        argLength = arguments.length;

      } else if (type === 'object') {
        // Set keys as attributes
        _node.set(arg);

      }

    }

    return _node;
  },

  register: function(name, fnc) {
    this.templates[name] = fnc;
    return this;
  },

  /**
   *
   * @param {object} ref (Optional)
   * @param {object} data (Optional)
   * @param {function|string} tpl
   * @return {Element}
   */
  render: function render(/*ref, data, mixedTpl*/) {
    var res, data = {}, ref, tpl;
    if ( arguments.length === 1 ) {
      tpl = arguments[0];
    } else if ( arguments.length === 2 ) {
      ref = arguments[0];
      tpl = arguments[1];
    } else { // if ( arguments.length > 2 ) {
      ref = arguments[0];
      data = arguments[1];
      tpl = arguments[2];
    }

    if (typeof tpl === 'string')
      tpl = this.templates[tpl];

    if ( typeof tpl !== 'function' )
      throw new Error('InvalidArgumentsException: Invalid template function: ' + tpl);

    if ( ref && typeOf(ref) !== 'object' )
      throw new Error('InvalidArgumentsException: Invalid "ref" parameter');

    if ( this.isInline === 0 ) {
      this.dataReference = data;
      this.references = ref;
    } else if ( !data ) {
      data = this.dataReference;
    }

    if ( arguments.length > 3 ) {
      res = tpl.apply(this, [this.createElement, data].append(
        // Delegate all arguments
        Array.prototype.slice.call(arguments, 3)
      ));
    } else {
      res = tpl.call(this, this.createElement, data);
    }

    return res;
    // if (Array.isArray(nodes)) {
    //   var docFrag = this.doc.createDocumentFragment();
    //   for (var i = 0, l = nodes.length; i < l; i++)
    //     docFrag.appendChild(nodes[i]);

    //   return docFrag;
    // }

    // return nodes;
  },

  renderInline: function(tplName, data) {
    this.isInline++;
    var res = this.render.apply(this, [this.references, data, tplName].append(
      // Delegate all arguments
      Array.prototype.slice.call(arguments, 2)
    ));
    this.isInline--;

    return res;
  },

  storeReference: function(name, pointer) {
    if (this.references === undefined)
      return;

    this.references[name] = pointer;
  }
});






/*abstract*/ gx.ui.TemplateContainer = new Class({
  Implements: Events,
  _elmt: null,
  _ui: {
  },

  rendered: false,

  /**
   * By default, conveniently immediately render this container.
   * You probably want to override this method.
   */
  initialize: function(data) {
    this.runRenderer(data);
  },

  runRenderer: function(data) {
    if ( !data )
      data = this.data || {};

    if ( typeof this.preRender === 'function' )
      this.preRender(data);

    if ( this.rendered )
      this._elmt = this.renderUpdate(data);
    else {
      this._elmt = this.render(data);
      this.rendered = true;
    }

    if ( typeof this.postRender === 'function' )
      this.postRender();

    return this._elmt;
  },

  // /*abstract*/ postRender: function() {},
  // /*abstract*/ preRender: function() {},

  render: function(data) {
    var elmt = gx.ui.Templates
      .render(this._ui, data, this.template.bind(this));
      // .store('_uiElmtObject', this);

    var connectEvents = this.connectEvents;
    if ( connectEvents && connectEvents.length > 0 )
      this.bindThisEvents(connectEvents, this._ui);

    return elmt;
  },

  /**
   * Handle multiple rendering calls.
   * You may want to override this mehtod.
   *
   */
  renderUpdate: function(data) {
    // TODO a good question here, do we need to unbind all the attached events
    // now? Sure for elements which remains with references, but all these
    // get replaced with new instances and should hold no more references.

    // By default replace the current element on renderUpdate calls if
    // it is attached to the DOM.
    if ( this._elmt.getParent() )
      return this.render(data).replaces(this._elmt);

    return this.render(data);
  },

  bindThisEvents: function(events, from, that, to) {
    from || (from = this);
    that || (that = this);
    to || (to = this);

    var d, i, l, elmt, name, func;
    for ( i = 0, l = events.length; i < l; i++ ) {
      d = events[i].split(':');
      elmt = from[d[0]];
      if ( !elmt )
        continue;

      name = d[1];
      func = that[d[2]];
      if ( typeof func !== 'function' )
        // (Convenience) Currying fireEvent to fire an event with the given
        // function name if no function with that name exists.
        elmt.addEvent(name, this.fireEvent.bind(to, d[2]));
      else
        elmt.addEvent(name, func.bind(to));
    }
  },

  /*abstract*/ template: function(e, d) {
  },

  elmt: function(name) {
    return this._ui[name];
  },

  toElement: function() {
    if ( !this._elmt )
      throw new Error('TemplateContainer not (properly) rendered!');

    return this._elmt;
  },

  destroy: function() {
    if ( this._elmt )
      this._elmt.destroy();
  }

});

gx.ui.Templates = new gx.ui.TemplatesClass();
/**
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
/**
 * @class gx.ui.Toggling
 * @description Generic class to handle any css state toggling class component.
 *
 * @param {element|string} display The root display element
 * @param {object} options The root display element
 *
 * @option {string} rootClass The class name of the root element.
 * @option {string} stateClass The class name of the state switcher.
 * @option {bool} initState The state to initialize the component to.
 *
 * @event stateActivated   Open the app menu.
 * @event stateDeactivated Closed the app menu.
 * @event stateChanged     Fired additionally to the above.
 *
 * @author Sebastian Glonner <sebastian.glonner@zeyon.net>
 * @version 1.00
 * @package Gx
 * @copyright Copyright (c) 2010, Peter Haider
 * @license http://opensource.org/licenses/gpl-license.php GNU Public License
 */
gx.ui.Toggling = new Class({
	gx: 'gx.ui.Toggling',

  Implements: [Options, Events],

  options: {
    'rootClass' : 'toggling',
    'stateClass': 'active',
    'initState' : true
  },

  _state: true,

  initialize: function(display, options) {
    this.setOptions(options);

    this._ui = {};

    this._ui.root = (
      typeOf(display) === 'element' ?
      display :
      new Element('div')
    );

    if (this.options.rootClass)
      this._ui.root.addClass(this.options.rootClass);

    this._state = !this.options.initState;
    this.toggle();
  },

  toggle: function() {
    if (!this._state)
      this.activate.apply(this, arguments);
    else
      this.deactivate.apply(this, arguments);
  },

  deactivate: function(dontFireEvents) {
    this._state = false;
    this._ui.root.removeClass(this.options.stateClass);

    if ( dontFireEvents !== true ) {
      this.fireEvent('stateDeactivated', [this]);
      this.fireEvent('stateChanged', [this._state, this]);
    }
  },

  activate: function(dontFireEvents) {
    this._state = true;
    this._ui.root.addClass(this.options.stateClass);
    if ( dontFireEvents !== true ) {
      this.fireEvent('stateActivated', [this]);
      this.fireEvent('stateChanged', [this._state, this]);
    }
  },

  getState: function() {
    return this._state;
  },

  toElement: function() {
    return this._ui.root;
  }

});

