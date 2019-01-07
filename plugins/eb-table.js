(function () {

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

})();