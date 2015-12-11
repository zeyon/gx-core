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

