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
