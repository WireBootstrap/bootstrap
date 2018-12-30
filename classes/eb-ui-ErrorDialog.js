//
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
