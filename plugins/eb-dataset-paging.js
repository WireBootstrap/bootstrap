(function () {

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
