/**
 * @class gx.ui.Toggling
 * @description Generic class to handle any css state toggling class component.
 * @extends gx.ui.Toggling
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

    this._display = this._ui = {};

    this._display.root = (
      typeOf(display) === 'element' ?
      display :
      new Element('div')
    );

    if (this.options.rootClass)
      this._display.root.addClass(this.options.rootClass);

    this._state = !this.options.initState;
    this.toggle();
  },

  toggle: function() {
    if (!this._state)
      this.activate();
    else
      this.deactivate();
  },

  deactivate: function() {
    this._state = false;
    this._ui.root.removeClass(this.options.stateClass);
    this.fireEvent('stateDeactivated', [this]);
    this.fireEvent('stateChanged', [this._state, this]);
  },

  activate: function() {
    this._state = true;
    this._ui.root.addClass(this.options.stateClass);
    this.fireEvent('stateActivated', [this]);
    this.fireEvent('stateChanged', [this._state, this]);
  },

  toElement: function() {
    return this._ui.root;
  }

});

