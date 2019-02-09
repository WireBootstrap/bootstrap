
(function () {

    $.fn._ebCsvExport = function (config) {

        var self = this;
        eb.ui.prependClass(self, "eb-csv-export eb-plugin");

        var cmp = new eb.ui.Component(this, config, _defaults());
        var cfg = cmp.config();
        var tmp = null;

        function _init() {
            _ensureComponent(function () {
                cmp.bindData(_bind);
            });
        }

        function _bind() {


            if (!tmp) {

                tmp = self.children().first();

                tmp.click(function () {

                    var ds = eb.data.DataSet.cast(eb.deepCopy(cfg.data));

                    if (ds.Query && ds.Query.Paging)
                        ds.Query.Paging = null;

                    var t = $("<div>");
                    $(document.body).append(t);

                    t.on("databind", function () {
                        t.tableExport({ type: 'csv', tableName: cmp.nameRef().Name || cfg.name, escape: 'false' });
                        t.remove();
                    });

                    t = t.ebTable({ data: ds });

                });

            }

            cmp.ready();

        }

        function _ensureComponent(cb) {

            //$base64
            //$tableExport
            if (typeof $.fn.base64 == 'undefined')
                eb.loadJs('//cdn.wirebootstrap.com/libs/tableExport/jquery.base64.js', function () { te(); });
            else te();

            function te() {
                if (typeof $.fn.tableExport == 'undefined')
                    eb.loadJs('//cdn.wirebootstrap.com/libs/tableExport/1.2.2/eb-tableExport.js', function () { cb(); });
                else cb();
            }

        }

        function _defaults() {
            return { autoInit: true };
        }

        function _template() {
            return null;
        }

        this.getData = function () {
            return cmp.data();
        }

        this.config = function () {
            return cfg;
        }

        this.databind = function (data) {
            if (data) cmp.data(data);
            _bind();
        }

        this.initialize = function () {
            _init();
            return this;
        }

        if (cfg.autoInit && cfg.data)
            _init();

        return this;
    }

    $.fn.ebCsvExport = function (config) {

        return this.each(function () {
            $(this)._ebCsvExport(config);
        });

    }

})();

;(function () {

    $.fn._ebFilterLabel = function (config) {

        var self = this;
        eb.ui.prependClass(self, "eb-filter-label eb-plugin");

        var cmp = new eb.ui.Component(this, config, _defaults());
        //        var schema = cmp.updateFieldSchema({ id: "Id", name: "Name"});
        var cfg = cmp.config();

        function _init() {
            _ensureComponent(function () {
                cmp.bindData(_bind);
            });
        }

        function _bind() {

            // look for the dataset
            var ds = cfg.data;
            var q = null;
            
            if (typeof ds == "string")
                ds = cmp.data();

            if (!ds.Query && ds.__meta && ds.__meta.dataset)
                q = ds.__meta.dataset.Query;
            else
                q = ds.Query;

            var model = (ds.Source && ds.Source.Model) ? ds.Source.Model : null;

            if (!q)
                throw "Unable to find dataset for filter label"

            self.empty();

            var tmp = $(cfg.template);
            var title = [];

            self.append(tmp);

            if (q.__typeName == "StoredProcedure")
                title = ds.Query.getDescription();
            if (q.__typeName == "PivotQuery") {
                q.Dimensions.forEach(function (dim) {
                    if (dim.isOnPage())
                        title.push(dim.Filter.getDescription());
                })
            }
            else
                if (q.Filter) {                    
                    q.Filter.forEach(function (filter) {
                        if (!filter.getDescription)
                            filter = eb.data.FilterSelection.cast(filter);
                        var s = filter.getDescription({ model: model });
                        if (s.trim().length)
                            title.push(s);
                    });
                }


            if (!title.length)
                title.push("No Filters");

            var divs = "";
            var t = _template();
            title.forEach(function (row) {
                divs += t.format(row);
            });

            tmp.prop("title", divs);


            $('[data-toggle="tooltip"]').tooltip();


            cmp.ready();

        }

        function _ensureComponent(cb) {
            cb();
        }

        function _defaults() {
            return { autoInit: true };
        }

        function _template() {
            return "<div>{0}</div>";
        }

        this.getData = function () {
            return cmp.data();
        }

        this.config = function () {
            return cfg;
        }

        this.databind = function (data) {
            if (data) cmp.data(data);
            _bind();
        }

        this.initialize = function () {
            _init();
            return this;
        }

        if (cfg.autoInit && cfg.data)
            _init();

        return this;
    }

    $.fn.ebFilterLabel = function (config) {

        return this.each(function () {
            $(this)._ebFilterLabel(config);
        });

    }

})();;(function () {

$.fn.ebSearchList = function (config) {

    var self = this;
    eb.ui.prependClass(self, "eb-search-list eb-plugin");

    var defaults = {
        autoInit: true,
        events: { itemClick: { callback: null } },
        checkbox: { events: { itemClick: { callback: null, dataevent: null } } },
        paging: {}
    };
    var cmp = new eb.ui.Component(this, config, defaults, true);
    var cfg = cmp.config();

    function _init() {
        _ensureComponent(function () {
            // no data necessary
            _bind();
        });
    }

    function _bind() {

        var schema = cmp.updateFieldSchema({ id: "Id", name: "Name" });
        var d = cmp.data();
        var t = _template();
        var searchTimeout = 0;

        self.empty();

        // top row, search box
        var search = cfg.searchTemplate || t.search;

        search = $(search);

        self.append($(t.row).append($(t.col).append(search)));

        search.find("input").keydown(function (e) {
            clearTimeout(searchTimeout);
            var t = $(this);
            searchTimeout = setTimeout(function () {
                var q = cfg.data.Query.where().page(1);
                var v = t.val();
                if (v.length > 0)
                    q.contains(schema.name, v);
                cfg.data.refresh();
            }, 500);
        });

        self.find(".clear-search").click(function (e) {
            search.find("input").val("");
            cfg.data.Query.where().page(1);
            cfg.data.refresh();
        });

        search.find("input").prop("placeholder", "Search " + schema.name);

        self.append($(t.row).append($(t.col).append(t.hr)));

        // middle row, checkboxes
        cfg.checkbox.schema = cfg.schema;
        // pass ref to event

        cfg.checkbox.events.itemClick.callback = cfg.events.itemClick.callback;
        cfg.checkbox.data = cfg.data;

        var checkbox = $(t.div).ebCheckBox(cfg.checkbox);

        self.append($(t.row).append($(t.col).append(checkbox)));

        self.append($(t.row).append(t.hr));

        // bottom row, paging
        cfg.paging.data = cfg.data;
        var pager = $(t.div).ebDatasetPaging(cfg.paging);

        self.append($(t.row).append($(t.col).append(pager)));

        cmp.ready();

    }

    function _ensureComponent(cb) {
        cb();
    }

    function _template() {

        return {
            row: "<div class=\"row\"></div>",
            col: "<div class=\"col-md-12\"></div>",
            search: "<div class=\"input-group\"><input placeholder=\"\" class=\"form-control\" /><span class=\"input-group-addon clear-search\">" +
                "<i class=\"fa fa-times\"></i></span></div>",
            div: "<div></div>",
            hr: "<div class=\"eb-hr\"></div>"
        };
    }

    this.getData = function () {
        return cmp.data();
    }

    this.config = function () {
        return cfg;
    }

    this.databind = function (data) {
        if (data) cmp.data(data);
        _bind();
    }

    this.initialize = function () {
        _init();
        return this;
    }

    if (cfg.autoInit)
        _init();

    return this;
}

})();;(function () {

$.fn.ebDatasetPaging = function (config) {

    var self = this;
    eb.ui.prependClass(self, "eb-dataset-paging eb-plugin");

    var defaults = { autoInit: true };
    var cmp = new eb.ui.Component(this, config, defaults, true);
    var cfg = cmp.config();
    var pages = null;
    var rows = null;

    function _init() {
        _ensureComponent(function () {
            cmp.bindData(_bind);
        });
    }

    function _bind() {

        var d = cmp.data();
        var t = _template();
        var p = d.__meta.paging;

        self.empty();

        if (!p) {
            cmp.ready(); return;
        }

        if (!d.Rows.length) {
            pages = 1;
            rows = 0;
        }

        if (p.TotalRows) {
            pages = p.Rows == p.TotalRows ? 1 : eb.Format((p.TotalRows / p.Rows) + .5, "N").replace(",", "");
            rows = p.TotalRows;
        }

        var row = $(t.row);
        self.append(row);

        row.append(t.colLabel.format(p.Page, pages, rows));

        var colButtons = $(t.colButtons);
        row.append(colButtons);

        var divButtons = $(t.divButtons);
        colButtons.append(divButtons);

        divButtons.append($(t.first).click(function () {
            var ds = cfg.data;
            ds.Query.Paging.Page = 1;
            if (rows > 0)
                ds.refresh();
        }));

        divButtons.append($(t.prev).click(function () {
            var ds = cfg.data;
            if (ds.Query.Paging.Page > 1 && rows > 0) {
                ds.Query.Paging.Page -= 1;
                ds.refresh();
            }
        }));

        divButtons.append($(t.next).click(function () {
            var ds = cfg.data;
            if (ds.Query.Paging.Page < pages && rows > 0) {
                ds.Query.Paging.Page += 1;
                ds.refresh();
            }
        }));

        divButtons.append($(t.last).click(function () {
            var ds = cfg.data;
            if (rows > 0) {
                ds.Query.Paging.Page = pages;
                ds.refresh();
            }
        }));

        cmp.ready();

    }

    function _ensureComponent(cb) {
        cb();
    }

    function _template() {

        return {
            row: "<div class=\"row\"></div>",
            colLabel: "<div class=\"col-md-6\">" +
                    "<p>Page {0}/{1} : {2} Total Rows</p>" +
                "</div>",
            colButtons: "<div class=\"col-md-6\"></div>",
            divButtons: "<div class=\"btn-group pull-right\">",
            first: "<a title=\"First Page\" style=\"margin-right:3px\" href=\"javascript:void(0)\" class=\"btn btn-default btn-xs\"><i class=\"fa fa-chevron-left\"></i><i class=\"fa fa-chevron-left\"></i></a>",
            prev: "<a title=\"Previous Page\" style=\"margin-right:3px\" href=\"javascript:void(0)\" class=\"btn btn-default btn-xs\"><i class=\"fa fa-chevron-left\"></i></a>",
            next: "<a title=\"Next Page\" style=\"margin-right:3px\" href=\"javascript:void(0)\" class=\"btn btn-default btn-xs\"><i class=\"fa fa-chevron-right\"></i></a>",
            last: "<a title=\"Last Page\" href=\"javascript:void(0)\" class=\"btn btn-default btn-xs\"><i class=\"fa fa-chevron-right\"></i><i class=\"fa fa-chevron-right\"></i></a>",
        };
    }

    this.getData = function () {
        return cmp.data();
    }

    this.config = function () {
        return cfg;
    }

    this.databind = function (data) {
        if (data) cmp.data(data);
        _bind();
    }

    this.initialize = function () {
        _init();
        return this;
    }

    if (cfg.autoInit)
        _init();

    return this;
}

})();
;
(function () {

    $.fn.ebDropdownList = function (config) {

        var self = this;
        eb.ui.prependClass(self, "eb-dropdown-list eb-plugin");

        var root = $("<div class=\"btn-group\">");
        self.empty();
        self.append(root);

        var defaults = { panel: false };
        var cmp = new eb.ui.Component(this, config, defaults);
        var schema = cmp.updateFieldSchema({ id: "Id", name: "Name", label: "Label" });
        var cfg = cmp.config();

        this.init = function () {

            cmp.panel(root);

            cmp.bindData(_bind);

        }

        function _bind(e) {

            var d = cmp.data();
            var colid = cmp.colId(schema);
            var lbl = d.getColumn(schema.label);
            var c = d.getColumn(colid);
            var sel = {};
            
            if ((c && c.Selected) || cfg.selected) {
                var r = d.where().eq(colid, (c.Selected || cfg.selected)).first();
                if (r) {
                    sel.id = r[colid];
                    sel.name = r[schema.name];
                    sel.lbl = lbl ? r[schema.label] : r[schema.name];
                }
            }

            root.empty();

            var btn = $("<button class=\"btn btn-{0} dropdown-toggle\" type=\"button\" \"data-toggle=\"dropdown\"></button>".format(cfg.color || "default"));
            var btntext = $("<div style=\"float:left\">").text(sel.lbl || (c ? (c.Title || c.Name) : "Select..."));
            btn.append(btntext);
            btn.append("&nbsp;<span class=\"caret\"></span>");
            root.append(btn);

            var ul = $("<ul class=\"dropdown-menu\" role=\"menu\">");
            var li = "<li role=\"presentation\" _i=\"{0}\" _id=\"{1}\"><a role=\"menuitem\" tabindex=\"-1\" href=\"#\">{2}</a></li>";

            d.Rows.forEach(function (r, i) {
                var l = $(li.format(i, r[colid], lbl ? r[schema.label] : r[schema.name]));
                if (sel.id && r[colid] == sel.id) l.addClass("active");
                ul.append(l);
            });

            root.append(ul);

            ul.on('click', 'li', function (e) {
                e.preventDefault();
                root.toggleClass('open');
                var t = $(this);
                sel.id = t.attr("_id");
                sel.name = t.text();
                sel.lbl = t.text();
                btntext.text(sel.lbl);
                t.closest('.dropdown-menu').find('li').removeClass('active');
                t.closest('li').addClass('active');
                var _d = cmp.data();
                // cell(colid)
                var ev = new eb.data.DataEvent(self).dataselect().cell(cmp.nameId(), sel.id, sel.name).column(_d.getColumn(colid)).row(_d[t.attr("_i")]).table(_d);

                if (sel.id == cfg.all)
                    ev.action().clear();

                var ed = { base: e, data: ev.getData() };

                if (cfg.events && cfg.events.itemClick.callback) {
                    cfg.events.itemClick.callback(ed);
                }

                ev.raise();

                self.trigger('itemClick', ed);
            });

            root.find('.dropdown-toggle').dropdown();

            $(document).click(function () { root.removeClass('open'); });

            cmp.ready();

        }

        this.config = function () {
            return cmp.config();
        }

        this.databind = function () {
            _bind();
        }

        self.init();

        return this;
    }

})();;(function () {

$.fn.ebTable = function (config) {

    var self = this;
    eb.ui.prependClass(self, "eb-table eb-plugin");

    // to do, this should have a local event 'drilldown'
    // change to this format { events: { "drilldown": { callback: null, dataevent: "datadrilldown" } } };
    var defaults = {
        autoInit: true, filter: false, events: { datadrilldown: true }
    };
    // events: dataselect: fn or true or false, defaults to false
    var cmp = new eb.ui.Component(this, config, defaults, true);
    var cfg = cmp.config();
    var pager = null;
    var table = null;
    var searchRow = null;
    var div = null;

    function _init() {
        _ensureComponent(function () {
            cmp.bindData(_bind);
        });
    }

    function _bind() {

        var d = cmp.data();
        var sel = cmp.select();
        var r = [];
        var fmt = {};
        var tmpl = _template();

        table = $(tmpl.table);

        //self.empty();
        self.find("table").remove();
        self.prepend(table);
        //div.append(table);

        var t = $("<thead>");

        table.append(t);
        var tr = $("<tr>");
        t.append(tr);
        sel.forEach(function (c, i) {

            var cl = d.getColumn(c);
            var td = $("<th>", { "class": "eb-col-" + (i - -1) });
            tr.append(td);
            if (cl) {
                fmt[cl.Name] = cl.Format;
                td.append(cl.Title || cl.Name);
            }
        });

        t = $("<tbody style=\"height:{0}\">".format(cfg.fixedcols && cfg.fixedcols.height ? cfg.fixedcols.height : "auto"));
        table.append(t);

        if (cfg.filter) {

            // only allow filter on specific fields
            var fsel = Array.isArray(cfg.filter) ? cfg.filter : sel;

            if (!searchRow) {

                searchRow = $("<tr>")
                t.append(searchRow);

                sel.forEach(function (c) {

                    var col = d.getColumn(c);

                    td = $("<td>");
                    searchRow.append(td);

                    if (fsel.indexOf(c) > -1) {

                        var input = $("<input data-col=\"{0}\" type=\"text\" placeholder=\" Filter {1}\">".format(col.Name, col.Title || col.Name));

                        td.append(input);

                        input.keydown(function (e) {
                            var t = $(this);
                            var capsLock = 20;
                            if (e.keyCode != capsLock && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
                                setTimeout(function () {
                                    var q = cfg.data.Query; //.page(1);
                                    var v = t.val();
                                    applyFilter(q, col, v);
                                }, 500);
                            }
                        });

                    };

                });
            }
            else {
                t.append(searchRow);

                searchRow.find("input").each(function (e) {
                    var input = $(this);
                    var col = input.data("col");
                    if (input.val().length > 0) input.focus();
                    input.keydown(function (e) {
                        var capsLock = 20;
                        if (e.keyCode != capsLock && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
                            setTimeout(function () {
                                var q = cfg.data.Query; //.page(1);
                                var v = input.val();
                                applyFilter(q, col, v);
                            }, 500);
                        }
                    });
                });
            }
        }

        function applyFilter(q, col, v) {

            if (q.Paging && q.Paging.Page > 0) q.page(1);

            if (q.__typeName == "StoredProcedure") {
                var p = q.getParam(col.Name || col);
                if (p) p.Value = (v.length > 0) ? v : null;
            }
            else {

                var index = [];

                q.Filter.forEach(function (exp, i) {
                    if ((exp.Expression.Field && exp.Expression.Field == (col.Name || col)) && exp.Expression.__typeName == "ContainsExpression")
                        index.push(i);
                });

                index.forEach(function (i) {
                    q.Filter.splice(i, 1);
                });

                if (v.length > 0)
                    q.contains(col.Name || col, v);

            }

            cfg.data.refresh();

        }

        if (d.Rows.length == 0) {
            t.append("<tr><td>" + (cfg.noRowsMessage || "No rows returned.") + "</td></tr>");
        }


        d.Rows.forEach(function (r, i) {
            tr = $("<tr>");
            tr.attr("_r", i);
            tr.css("cursor", cfg.cursor || "auto");
            t.append(tr);
            //    tr.click(function (e) {
            //    var c = $(e.currentTarget);
            //var _r = c.attr("_r");
            //self.trigger("rowclick", d.Rows[_r]);
            //  });
            sel.forEach(function (c, i) {

                var td = $("<td>", { "class": "eb-col-" + (i - -1) });
                tr.append(td);

                var dv = $("<div>", { "class": "eb-cell-value" });
                td.append(dv);

                var rc = r[c];
                var cl = d.getColumn(c);

                td.click(function (e) {
                    var ev = getEvent(e, "dataselect");
                    var ed = ev.getData();

                    self.trigger('cellClick', { base: e, data: ed });
                    // data event defaults to false
                    if (cfg.events && cfg.events.dataselect) {
                        if (typeof cfg.events.dataselect == 'function')
                            cfg.events.dataselect(ed);
                        else
                            ev.raise();
                        self.trigger('dataselect', ed);
                    }
                });

                if (typeof rc == 'undefined' || typeof rc == 'function')
                    return;

                var v = (rc == null || typeof rc.Value == 'undefined') ? (rc == null ? "" : rc) : (rc.Value || "");

                // text or html or object data type
                var _v = fmt[c] ? eb.Format(v, fmt[c]) : v;

                if (typeof rc == "object")
                    dv.append(_v);
                else
                    if (cl.DataType && cl.DataType == "html")
                        dv.html(_v);
                    else
                        dv.text(_v);

                // format class
                if (rc && rc.Format && rc.Format.Class)
                    dv.addClass(rc.Format.Class);

                td.attr("_c", i);

                if (rc && typeof rc.HasChildren != 'undefined') {

                    var dd = $("<div style=\"float:left\">");
                    td.prepend(dd);

                    dv.css("margin-left", (rc.LevelDepth * 15) + "px");

                    if (rc.DrilledDown)
                        dd.addClass(eb.ui.config.styles["drillCollapse"]);
                    else
                        if (rc.HasChildren)
                            dd.addClass(eb.ui.config.styles["drillExpand"]);
                        else
                            dd.addClass(eb.ui.config.styles["drillNone"]);

                    dd.click(function (e) {

                        // default this data event to true if not specified in config
                        if (cfg.events && eb.toBoolean(cfg.events.datadrilldown, true)) {
                            var c = $(e.currentTarget);
                            var ev = getEvent(e, "datadrilldown");
                            if (c.hasClass(eb.ui.config.styles["drillExpand"]))
                                ev.action().add().raise();
                            else
                                ev.action().remove().raise();
                            self.trigger('datadrilldown', ev.getData());
                        }
                    });

                }

                function getEvent(e, event) {
                    var c = $(e.currentTarget);
                    var ci = c.closest("td").attr("_c");
                    var ri = c.closest("tr").attr("_r");
                    var d = cmp.data();
                    var r = d.Rows[ri];
                    var cl = d.Columns[ci];
                    // assumes typeName == 'DimensionMember'
                    return new eb.data.DataEvent(event).source(self).cell(cl.Id || cl.Name, r[cl.Name].Id || r[cl.Name]).column(cl).row(r).table(d);
                }

            });
        });

        // paging
        //(cfg.paging || cfg._paging) &&
        // && cfg.data.Query.Paging.Rows > 0
        if (!pager && cfg.data.__typeName && cfg.data.__typeName == "eb.data.DataSet" && cfg.data.Query.Paging && cfg.data.Query.Paging.Page > 0) {
            //if (cfg._paging)
            //  cfg.data.Query.Paging = eb.deepClone(cfg.data.Query.Paging, cfg._paging);
            pager = $(tmpl.paging).ebDatasetPaging({ data: cfg.data });
            self.find(".eb-dataset-paging").remove();
            self.append(pager);
        }

        cmp.ready();

    }

    function _template() {

        return {
            table: "<table class=\"table table-striped table-hover\" data-toggle=\"table\">",
            paging: "<div></div>"
        };

    }

    function _ensureComponent(cb) {

        if ($.fn.tableExport) {
            goExport();
        }
        else
            if (typeof require != 'undefined')
                require(['eb-table-export', 'base64'], function () { goExport(); });
            else cb();

        function goExport() {

            var tb = cmp.panel().getPanel();

            if (tb) {
                tb = tb.toolbar().show();
                var btnExport = $("<a href=\"#\" title=\"Export to CSV\"><span class=\"glyphicon glyphicon-export\"></span></a>");

                tb.append(btnExport);
                btnExport.click(function () {
                    root.tableExport({ type: 'csv', tableName: cmp.nameRef().Name, escape: 'false' });
                });
            }

            cb();

        }

    }

    this.getData = function () {
        return cmp.data();
    }

    this.config = function () {
        return cfg;
    }

    this.databind = function () {
        _bind();
    }

    this.initialize = function () {
        _init();
        return this;
    }

    if (cfg.autoInit)
        _init();

    return this;
}

})();;
(function () {

    $.fn.ebButtonList = function (config) {

        var self = this;
        eb.ui.prependClass(self, "eb-button-list eb-plugin");

        var cmp = new eb.ui.Component(this, config, { autoInit: true });
        var cfg = cmp.config();
        var schema = cmp.updateFieldSchema({ id: "Id", name: "Name" });
        var root = $("<div class=\"btn-group-{0}\" data-toggle=\"buttons\">".format(cfg.alignment || "vertical"));
        self.empty();
        self.append(root);

        cmp.panel(root);

        function _init() {
            cmp.bindData(_bind);
        }

        function _bind() {

            var list = cmp.data();
            var colid = cmp.colId(schema);
            var c = list.getColumn(colid);
            var sel = {};
            if ((c && c.Selected) || cfg.selected) {
                var r = list.where().eq(colid, (c.Selected || cfg.selected)).first();
                sel.id = r[colid];
                sel.name = r[schema.name];
                sel.lbl = lbl ? r[schema.label] : r[schema.name];
            }

            if (list.Rows.length == 0) { cmp.ready(); return; }

            if (!cfg.map && !list.Rows[0][schema.name] && !list.Rows[0][schema.id]) schema.name = cmp.nameRef().Name;

            var sid = list.Rows[0][schema.id] ? schema.id : schema.name
            var lbl = "<label class=\"btn btn-{0} eb-member\">".format(cfg.color || "default");
            var input = "<input name=\"eb_option\" type=\"{0}\" _in={1} _id=\"{2}\"/>{3}";

            root.empty();

            list.Rows.forEach(function (l, i) {
                var ip = input.format(eb.toBoolean(cfg.multiselect, true) ? "checkbox" : "radio", i, l[sid], l[schema.name]);
                var lb = $(lbl);
                if (sel.id && l[colid] == sel.id) lb.addClass("active");
                root.append(lb
                    .click(function () {
                        _click(this);
                    })
                    .append(ip));
            });
            function _click(lb) {
                lb = $(lb);
                var sel = lb.find("input");
                var r = list.Rows[sel.attr("_in")];
                var ev = new eb.data.DataEvent(self).dataselect()
                .cell(sid, sel.attr("_id"))
                .label(schema.label || schema.name, r[schema.label || schema.name])
                .column(list.getColumn(sid))
                .row(r)
                .table(list);
                if (!lb.hasClass("active")) ev.action().replace();
                else { setTimeout(function () { lb.removeAttr('checked').prop('checked', false).removeClass("active"); }, 300); ev.action().clear(); }
                ev.raise();
                self.trigger('itemClick', { base: null, data: ev.getData() });
            }

            root.button();

            cmp.ready();

        }

        this.config = function () {
            return cfg;
        }

        this.databind = function () {
            _bind();
        }

        this.initialize = function () {
            _init();
            return this;
        }

        if (cfg.autoInit)
            _init();

        return this;
    }

})();;
(function () {

    $.fn.ebCheckbox = function (config) {

        var self = this;
        eb.ui.prependClass(self, "checkbox eb-checkbox eb-plugin");

        var cmp = new eb.ui.Component(this, config, _defaults(), true);
        var schema = cmp.updateFieldSchema({ id: "Id", name: "Name", label: "Label", selected: "Selected", iconClass: "iconClass" });
        var cfg = cmp.config();

        function _init() {
            _ensureComponent(function () {
                cmp.bindData(_bind);
            });
        }

        function _defaults() {
            return {
                autoInit: true,
                events: { itemClick: { callback: null, dataevent: "dataselect" } }
            };
        }

        function _bind() {

            var d = cmp.data();
            var colId = cmp.colId(schema);

            self.empty();

            d.Rows.forEach(function (row) {

                var lbl = "<label class=\"{0}\">{1}<input type=\"checkbox\" value=\"{2}\" {3}><i></i>{4}</label>".format(
                cfg.class || "checkbox",
                typeof row[schema.iconClass] == "undefined" ? "" : "<span class=\"" + row[schema.iconClass] + "\"></span> ",
                row[colId],
                eb.toBoolean(row[schema.selected], false) ? "checked" : "",
                typeof row[schema.label] == "undefined" ? row[schema.name] : row[schema.label]);

                self.append(lbl);

            });

            self.find("input").change(function (e) {

                var row = d.where().eq(colId, $(this).val()).first();

                // data event               
                var ev = new eb.data.DataEvent().source(self)
                .cell(colId, $(this).val())
                .column(d.getColumn(colId))
                .row(row)
                .table(d);

                var sel = typeof row[schema.selected] != "undefined";

                if (this.checked) {
                    if (sel) row[schema.selected] = true;
                    ev.action().add();
                }
                else {
                    if (sel) row[schema.selected] = false;
                    ev.action().remove();
                }

                var ed = { base: e, data: ev.getData() };

                if (cfg.events.itemClick.callback) {
                    cfg.events.itemClick.callback(ed);
                }

                if (cfg.events.itemClick.dataevent) {
                    ev.event(cfg.events.itemClick.dataevent)
                        .element(cmp.ListenerId(cfg.events.itemClick.dataevent))
                        .raise();
                }

                // local event
                self.trigger('itemClick', ed);

                // write back
                if (d.__meta && d.__meta.dataset) {

                    try {

                        if (this.checked) {
                            if (d.__meta.dataset.Write) {
                                d.__meta.dataset.write(row);
                            }
                        }
                        else
                            if (d.__meta.dataset.Delete != false && d.__meta.dataset.Write) {

                                var del = eb.data.delete().from(d.__meta.dataset.Query.Entities[0].Name).where()
                                    .eq(colId, $(this).val());

                                d.__meta.dataset.delete(del);
                            }
                    }

                    catch (ex) {
                        eb.ui.ErrorDialog(ex);
                    }
                }

            });

            cmp.ready();

        }

        function _ensureComponent(cb) {
            cb();
        }

        this.getData = function () {
            return cmp.data();
        }

        this.config = function () {
            return cfg;
        }

        this.databind = function () {
            _bind();
        }

        this.initialize = function () {
            _init();
            return this;
        }

        if (cfg.autoInit)
            _init();

        return this;
    }

})();

;
//
// Overide eb.ui.MessageDialog from eb-ui.js
//

if(typeof eb == 'undefined')
    throw "eb namspace required";

if(typeof eb.ui == 'undefined')
    throw "eb.ui namspace required";

eb.ui.MessageDialog = function (config) {

    var el = $("#eb-dialog");
    if (!el.length) {
        el = $("<div id='eb-dialog' class='modal'></div>");
        $(document.body).append(el);
    }
    else { el.empty(); }

    if (typeof config == "string")
        config = { message: config };

    s = getHtml();
    s = s.format(config.color || "default", config.title || "Message", config.message);
    el.append(s);
    el.modal();
    el.css('margin-top', ($(window).height() - el.height()) / 2);
    el.css('margin-left', ($(window).width() - el.width()) / 2);
    if (config.confirm)
        el.find("#_x-confirm").click(function () {
            config.confirm(true);
        });

    function getHtml() {

        var s = config.confirm ? "<button type='button' class='btn btn-default' data-dismiss='modal'>Cancel</button>" : "";
        return "<div class='modal-dialog'>" +
            "<div class='modal-content panel-{0}'>" +
                "<div class='modal-header panel-heading'>" +
                    "<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>" +
                    "<h4 class='modal-title panel-title'>{1}</h4>" +
                "</div>" +
                "<div class='modal-body'>" +
                    "<p>{2}</p>" +
                "</div>" +
                "<div class='modal-footer'>" +
                    "<button id='_x-confirm' type='button' class='btn btn-default' data-dismiss='modal'>Ok</button>" + s
        "</div>" +
    "</div>" +
"</div>";
    }

};
;//
// Overide eb.ui.ErrorDialog from eb-ui.js
//

if(typeof eb == 'undefined')
    throw "eb namspace required";

if(typeof eb.ui == 'undefined')
    throw "eb.ui namspace required";

eb.ui.ErrorDialog = function (d, m, e) {

    // responseText, status, statusText

    if (d.responseText && d.responseText.substring(0, 1) != "<")
        d = $.parseJSON(d.responseText);

    // custom error message passed in
    if (typeof d == "string") m = d;

    var er = {};
    er.msg = d.ExceptionMessage || d.Message || d.message || d.responseText || "";
    er.msg = m ? (m + "\n\n" + er.msg) : er.msg;
    er.title = d.Title || d.statusText || "Error";
    er.number = d.number || d.status || d.HResult || "";
    er.stack = d.StackTrace || d.stack || d.StackTraceString || "";
    er.instance = d.Instance || "";
    er.user = d.User || "";

    if (d.InnerException)
        er.inner = inner(d.InnerException);

    function inner(ed) {
        var m = null;
        if (ed.Message) {
            m = ed.Message + "<br><br>";
            if (ed.InnerException)
                m += inner(ed.InnerException);
        }
        return m;
    }

    var el = $("#eb-dialog");
    if (!el.length) {
        el = $("<div id='eb-dialog' class='modal'></div>");
        $(document.body).append(el);
    }
    else { el.empty(); }

    s = getHtml();
    s = s.format(er.title, er.msg, er.number, er.instance, er.user, er.inner, er.stack)
    el.append(s);
    el.modal();
    el.css('margin-top', ($(window).height() - el.height()) / 2);
    el.css('margin-left', ($(window).width() - el.width()) / 2);

    function getHtml() {
        return "<div class='modal-dialog'>" +
                "<div class='modal-content panel-danger'>" +
                    "<div class='modal-header panel-heading'>" +
                        "<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>" +
                        "<h4 class='modal-title panel-title'>{0}</h4>" +
                    "</div>" +
                    "<div class='modal-body'>" +
                        "<p>{1}</p>" +
                        "<p><br><a href='#' onclick=\"$('#eb-error-st').toggle();\">Details</a></p>" +
                        "<p id='eb-error-st' class='text-warning' style='display:none'>" +
                        "<small>Error Number: {2}<br>Instance: {3}<br>User: {4}<br><br>" +
                        "{5}" +
                        "{6}</small></p>" +
                    "</div>" +
                    "<div class='modal-footer'>" +
                        "<button type='button' class='btn btn-default' data-dismiss='modal'>Close</button>" +
                    "</div>" +
                "</div>" +
            "</div>";
    }
};
;if(typeof eb == 'undefined')
    throw "eb namspace required";

if(typeof eb.ui == 'undefined')
    throw "eb.ui namspace required";

eb.ui.config.styles.loadingSize1 = "fa fa-spinner fa-spin fa-2x";
eb.ui.config.styles.loadingSize3 = "fa fa-spinner fa-spin fa-3x";
;angular.module('eb.bootstrap', []);;
angular.module('eb.bootstrap')

 .directive('ebCsvExport', function () {

        return {
            restrict: 'AEC',
            replace: false,
            scope: {
                ebData: "=",
                plugin: "="
            },
            link: function ($scope, el, attrs) {

                var config = {};

                if ($scope.ebData) {
                    config.data = $scope.ebData;
                }

                if (attrs.ebCsvExport)
                    config = $.extend(config, $scope.$parent.$eval(attrs.ebCsvExport));

                var plugin = $(el).ebCsvExport(config);

                if (typeof $scope.plugin != 'undefined')
                    $scope.plugin = plugin;

            }
        }

});

;
angular.module('eb.bootstrap')

 .directive('ebFilterLabel', function () {

        return {
            restrict: 'AEC',
            replace: false,
            scope: {
                ebData: "=",
                plugin: "="
            },
            link: function ($scope, el, attrs) {

                var config = {};

                if ($scope.ebData) {
                    config.data = $scope.ebData;
                }

                if (attrs.ebFilterLabel)
                    config = $.extend(config, $scope.$parent.$eval(attrs.ebFilterLabel));

                var plugin = $(el).ebFilterLabel(config);

                if (typeof $scope.plugin != 'undefined')
                    $scope.plugin = plugin;

            }
        }
});
;
angular.module('eb.bootstrap')

.directive('ebSearchList', function () {

    return {
        restrict: 'AEC',
        replace: false,
        scope: {
            ebData: "=",
            ebModel: "=",
            plugin: "="
        },
        link: function ($scope, el, attrs) {

            var config = {};

            if ($scope.ebModel) {
                config = {
                    events: {
                        itemClick: {
                            callback: function (e) {
                                if (Array.isArray($scope.ebModel)) {
                                    var ipos = $scope.ebModel.indexOf(e.data.cell.value);
                                    if (ipos > -1)
                                        $scope.ebModel.splice(ipos, 1);
                                    else
                                        $scope.ebModel.push(e.data.cell.value);
                                }
                                else {
                                    $scope.$parent.$eval("{0}='{1}'".format(attrs.ebModel, e.data.cell.value));
                                }
                            }
                        }
                    }
                };

            }

            if ($scope.ebData) {
                config.data = $scope.ebData;
            }

            if (attrs.ebSearchList)
                config = $.extend(config, $scope.$parent.$eval(attrs.ebSearchList));

            var plugin = $(el).ebSearchList(config);

            if (typeof $scope.plugin != 'undefined')
                $scope.plugin = plugin;

        }
    }
});
;
angular.module('eb.bootstrap')

 .directive('ebDatasetPaging', function () {

        return {
            restrict: 'AEC',
            replace: false,
            scope: {
                ebData: "=",
                plugin: "="
            },
            link: function ($scope, el, attrs) {

                var config = {};

                if ($scope.ebData) {
                    config.data = $scope.ebData;
                }

                if (attrs.ebDatasetPaging)
                    config = $.extend(config, $scope.$parent.$eval(attrs.ebDatasetPaging));

                var plugin = $(el).ebDatasetPaging(config);

                if (typeof $scope.plugin != 'undefined')
                    $scope.plugin = plugin;

            }
        }
});
;
angular.module('eb.bootstrap')

.directive('ebButtonList', function () {

    return {
        restrict: 'AEC',
        replace: false,
        scope: {
            onItemClick: '=',
            onReady: '=',
            ebData: "=",
            plugin: "="
        },
        link: function ($scope, el, attrs) {

            $(document).on("ready", '.eb-button-list', function (e, d) {
                if ($scope.onReady)
                    $scope.onReady(el);
            }).on("itemClick", '.eb-button-list', function (e, d) {
                if ($scope.onItemClick)
                    $scope.onItemClick(e, d, el);
            });

            var config = {
                data: $scope.ebData
            }

            if (attrs.ebButtonList)
                config = $.extend(config, $scope.$parent.$eval(attrs.ebButtonList));

            var plugin = $(el).ebButtonList(config);

            if (typeof $scope.plugin != 'undefined')
                $scope.plugin = plugin;


        }
    }
});

;
angular.module('eb.bootstrap')

.directive('ebCheckbox', function () {

    return {
        restrict: 'AEC',
        replace: false,
        scope: {
            onReady: '=',
            ebData: "=",
            ebModel: "=",
            plugin: "="
        },
        link: function ($scope, el, attrs, ngModelCtrl) {

            $(document).on("ready", '.eb-checkbox', function (e, d) {
                if ($scope.onReady)
                    $scope.onReady(el);
            });

            var config = {};

            if ($scope.ebModel) {

                config = {
                    events: {
                        itemClick: {
                            callback: function (e) {                                
                                if (Array.isArray($scope.ebModel))
                                    if(e.data.action == "remove"){
                                        var i = $scope.ebModel.indexOf(e.data.cell.value);
                                        if (i > -1) $scope.ebModel.splice(i, 1);
                                    }
                                    else
                                        $scope.ebModel.push(e.data.cell.value);
                                else {
                                    $scope.$parent.$eval("{0}='{1}'".format(attrs.ebModel, e.data.cell.value));
                                    //new eb.PrimitiveReference($scope.$parent.$eval(attrs.ebModel)).set(e.data.cell.value);
                                }
                            }
                        }
                    }
                };
            }

            if ($scope.ebModel && $scope.ebData) {

                var sel = $scope.ebData.getColumn("Selected");

                if (!sel) {

                    // only works with Id, Name, no schema reference
                    var id = $scope.ebData.getColumn("d") ? "Id" : "Name";

                    if (Array.isArray($scope.ebModel)) {
                        $scope.ebData.addColumn("Selected");
                        $scope.ebData.Rows.forEach(function (r) {
                            r.Selected = ($scope.ebModel.indexOf(r[id]) > -1);
                        });
                    }
                    else
                        $scope.ebData.addColumn("Selected").calc(function (r) {
                            return $scope.ebModel == r[id];
                        });
                }

            }

            if ($scope.ebData)
                config.data = $scope.ebData;

            if (attrs.ebCheckbox)
                config = $.extend(config, $scope.$parent.$eval(attrs.ebCheckbox));

            var plugin = $(el).ebCheckbox(config);

            if (typeof $scope.plugin != 'undefined')
                $scope.plugin = plugin;

        }
    }
});
;angular.module('eb.bootstrap')

.directive('ebTabs', function () {

    return {
        restrict: 'AEC',
        replace: false,
        scope: {
            onItemClick: "=",
            currentTab: "=",
            control: "="
        },
        link: function ($scope, el, attrs) {
            
            if (typeof $scope.control != 'undefined') {
                $scope.control = $scope.control || {};
                $scope.control.setTab = function (tab) {
                    _setTab(tab);
                }
            }

            el.bind('click', function (event) {
                _setTab(event.target);
            });

            function _setTab(tab) {

                var li = angular.element(tab);
                li = angular.element(li[0].closest("li"));

                if (li.hasClass("disabled")) return;

                el.find("li").removeClass("active");
                li.addClass("active");

                var config = attrs.ebTabs;
                if (config) config = $scope.$parent.$eval(config);
                else throw "Missing config property";

                var panes = angular.element(document.querySelector(config.tabs));

                panes.find(".tab-pane").hide();

                var tab = panes.find(li.context.dataset.tab);
                tab.css("display", "inline").css("visibility", "visible");

                if (typeof $scope.currentTab != 'undefined')
                    $scope.currentTab = li.context.dataset.tab;

                if ($scope.onItemClick)
                    $scope.onItemClick(li.context.dataset.tab);

                if (config.onItemClick)
                    config.onItemClick(li.context.dataset.tab);

            }

        }
    }
});
