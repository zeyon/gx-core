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

var gx = {
	properties: {
		version: '1.100'
	},
	core: {},
	ui:   {}
};

// Calculate Browser scroll bar width
window.addEvent('domready', function() {
	var div = new Element('div', {
		'style': 'width: 50px; position:absolute; left: -200px; top: -200px;'
	});
	div.inject(document.body, 'top');
	var d = new Element('div', {
		'html': '&nbsp;'
	});
	div.adopt(d);

	var w1 = d.getStyle('width').toInt();
	div.setStyle('overflow-y', 'scroll');
	gx.properties.scrollWidth = (w1 - d.getStyle('width').toInt());
	div.dispose();
});

/* ========================== Utility Functions ========================== */

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

	parseResult: function(json) {
		var res = JSON.decode(json);
		var t = $type(res);
		if ( t == 'object' ) {
			if ( res.error != null )
				msg.show('Server error: ' + String(res.error).htmlSpecialChars(), 'error');
			else if ( res.result == null )
				msg.show('Undefined result', 'error');
			else
				return res.result;
		} else {
			msg.show('parseResult: Invalid data type: ' + String(t).htmlSpecialChars(), 'error');
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
				return obj;
		}

		return false;
	}
};


/**
 * @function __
 * @description Shortcut function for gx.util.Parse
 * @param {object} obj The object to parse
 */
var __ = gx.util.Parse;


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

