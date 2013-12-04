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
