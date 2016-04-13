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
