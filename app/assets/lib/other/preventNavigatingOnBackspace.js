// this is a workaround for
// typing backspace in disabled/readonly text fields causes backwards navigation (e.g. read-only contact fields)
$(document).unbind('keydown').bind('keydown', function (event) {
    var doPrevent = false;
    if (event.keyCode === 8) {
        var d = event.srcElement || event.target;
        if ((d.tagName.toUpperCase() === 'INPUT' &&
            (
            d.type.toUpperCase() === 'TEXT' ||
            d.type.toUpperCase() === 'PASSWORD' ||
            d.type.toUpperCase() === 'FILE' ||
            d.type.toUpperCase() === 'EMAIL' ||
            d.type.toUpperCase() === 'SEARCH' ||
            d.type.toUpperCase() === 'DATE' ||
            // adding number as another input type
            d.type.toUpperCase() === 'NUMBER'
            )
            ) ||
            d.tagName.toUpperCase() === 'TEXTAREA') {
            doPrevent = d.readOnly || d.disabled;
        }
        else {
            doPrevent = true;
        }
    }

    if (doPrevent) {
        event.preventDefault();
    }
});