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
