
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
