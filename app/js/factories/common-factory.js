app
  .factory('CommonFactory', function (BaseFactory, $q) {
    var exports = {};

    exports.generateUUID = function() {
        var d = new Date().getTime() + Math.floor((Math.random() * 1000) + 1);
        Math.seedrandom(d.toLocaleString());
        var uuid = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math['random']()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : r&0x3|0x8).toString(16);
        });
        return uuid;
    };

    String.prototype.replaceAll = function(strReplace, strWith) {
        var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        var reg = new RegExp(esc, 'ig');
        return this.replace(reg, strWith);
    };

    // use this compile function in order to use recursive directive
    //http://stackoverflow.com/questions/19125551/angularjs-understanding-a-recursive-directive
    exports.getRecursiveCompileFn = function getRecursiveCompileFn($compile) {
        return function(tElement, tAttr, transclude) {
            //We are removing the contents/innerHTML from the element we are going to be applying the
            //directive to and saving it to adding it below to the $compile call as the template
            var contents = tElement.contents().remove();
            var compiledContents;
            return function(scope, iElement, iAttr) {
                if(!compiledContents) {
                    //Get the link function with the contents frome top level template with
                    //the transclude
                    compiledContents = $compile(contents, transclude);
                }
                //Call the link function to link the given scope and
                //a Clone Attach Function, http://docs.angularjs.org/api/ng.$compile :
                // "Calling the linking function returns the element of the template.
                //    It is either the original element passed in,
                //    or the clone of the element if the cloneAttachFn is provided."
                compiledContents(scope, function(clone, scope) {
                        //Appending the cloned template to the instance element, "iElement",
                        //on which the directive is to used.
                         iElement.append(clone);
                });
            };
        };
    };

    // Destructively applies changes from newData to oldData.  Basically makes oldData the same as newData, but preserves the original object as much as possible.
    //   oldData/newData can be arrays or objects.
    //
    // Does not return anything as oldData is modified in-place.
    //
    // This is useful because if we preserve reference equality as much as possible for the
    // original object tree, AngularJS will not redraw any DOM elements that do not need redrawing.
    // This prevents screen flicker and losing DOM state.
    exports.applyDiff = function applyDiff(oldData, newData) {
        // Tried to use angular.merge first as maybe it has angular-specific optimizations that will be better for angular,
        // but maybe we can just use DeepDiff?
        angular.merge(oldData, newData);
        // angular.merge does not handle deletes, so we use this library to apply deletes
        // wrap in objects as a workaround for https://github.com/flitbit/diff/issues/35
        var a = {"data": oldData};
        var b = {"data": newData};
        DeepDiff.applyDiff(a, b);
    };

    //startWith function does not have in IE
    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str){
            return this.slice(0, str.length) == str;
        };
    }

	exports.showMessage = function(header, msg, $timeout ){
		var $message = $.messager.show({
			title: header,
			msg: msg,
			timeout: 6000,
		});
		// var $messageBody = $message.find('.messager-body');
  //       $messageBody.html($("<div/>").html(msg).html());
		$message.parent().addClass('panel-custom');
	}

    exports.showMessage4Ever = function(header, msg){
        var $message = $.messager.show({
            title: header,
            msg: msg,
            timeout: 0
        })

        $message.parent().addClass('panel-custom panel-4ever');
    }

    exports.hide4EverMessage = function(){
        $('.panel-4ever').find('a.panel-tool-close').click()
    }
	
	exports.showAlert = function(header, msg){
		var $alert = $.messager.alert(header, msg);
		$alert.parent().addClass('panel-custom');
	}
	
	exports.replaceAllByText = function(text, replaceText){
		if(!text || text == ''){
			return text;
		}
		
		return text.split(replaceText).join(' ');
	}

    return exports;
  });
