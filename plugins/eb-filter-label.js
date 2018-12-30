(function () {

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

})();