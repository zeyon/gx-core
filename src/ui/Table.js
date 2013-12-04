'use strict';

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
			if ( !isArray(data) )
				return this;

			this.fireEvent('addData', data)
			data.each(function (row, index) {
				if ( !isObject(row) )
					return;

				var cols = root.options.structure(row, index, root);
				var rowProperties = {};

				if ( (typeof(cols) === 'object') && cols.row ) {
					Object.merge(rowProperties, cols.properties);
					cols = cols.row;
				}

				if ( !isArray(cols) )
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
