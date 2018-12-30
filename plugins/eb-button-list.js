
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

})();