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
