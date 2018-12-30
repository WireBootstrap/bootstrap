
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

})();