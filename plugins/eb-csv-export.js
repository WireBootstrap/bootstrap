
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

                    t = t.ebtable({ data: ds });

                });

            }

            cmp.ready();

        }

        function _ensureComponent(cb) {

            //$base64
            //$tableExport
            if (typeof $.fn.base64 == 'undefined')
                eb.loadJs('//cdn.wirebootstrap.com/tableExport/jquery.base64.js', function () { te(); });
            else te();

            function te() {
                if (typeof $.fn.tableExport == 'undefined')
                    eb.loadJs('//cdn.wirebootstrap.com/tableExport/1.2.1/eb-tableExport.js', function () { cb(); });
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

