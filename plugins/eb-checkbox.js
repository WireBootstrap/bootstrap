
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
            var t = _template();

            self.empty();

            d.Rows.forEach(function (row) {

                var lbl = t.format(
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

        function _template() {
            return cfg.template || "<label class=\"{0}\">{1}<input type=\"checkbox\" value=\"{2}\" {3}><i></i>{4}</label>";
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

