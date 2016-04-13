'use strict';

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
