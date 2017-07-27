(function($){
    app.directive('dcSearchBox', function (CommonFactory, $timeout){
        return {
            replace: true,
            templateUrl: 'templateCache/search-box.tmpl.html',
            restrict: 'E',
            scope: {
                tableColumns: '=',
                searchSubmit: '&',
                clearSearchCallBack: '&'
            },
            link: function (scope, elem, attrs){
                scope.searchValue = null;

                scope.clearSearch = function () {
                    scope.selectedAttribute = undefined;
                    scope.selectedValue = undefined;
                    scope.clearSearchCallBack({});
                };

                scope.focusOut = function() {
                    elem.find("#attrVal").focus();
                }
                scope.inputChanged = function(value) {
                    scope.searchValue = value;
                }

                elem.find("#attrVal").bind("keydown keypress", function (event) {
                    if(event.which === 13) {
                        scope.searchSubmit({
                            "$attrId" : scope.selectedAttribute.originalObject.attrId,
                            "$searchValue" : scope.selectedValue
                        });
                        event.preventDefault();
                    }
                });
                elem.find(".angucomplete-wrapper").bind("keydown keypress", function (event) {
                    $timeout(function() {
                        if(event.which === 13 && !scope.selectedAttribute) {
                            scope.searchSubmit({
                                "$attrId" : null,
                                "$searchValue" : scope.searchValue
                            });
                            event.preventDefault();
                        }
                    }, 500);

                });
            }
        }
    });
})(jQuery);