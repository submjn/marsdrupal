'use strict';var app = angular.module('app', ['ui.bootstrap']);

app.config(["$httpProvider", "$compileProvider", "$locationProvider", function ($httpProvider, $compileProvider, $locationProvider) {

    //---------- disable caching config -------------------
    //IE was caching the old AJAX request, so we decide to turn off the caching on $http
    //MARS-182 IE10: Default value is not saved
    //
    //http://stackoverflow.com/questions/16098430/angular-ie-caching-issue-for-http/19771501#19771501
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.Pragma = 'no-cache';
    //-------------end caching config -------------

    // Performance Tuning
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false });


    $locationProvider.html5Mode(true);
}]);
angular.module('app').run(['$templateCache', function ($templateCache) {$templateCache.put('templateCache/loading.tmpl.html', '<div id="preloader"><div class="loader"><span></span><span></span><span></span><span></span></div></div>');
    $templateCache.put('templateCache/report-form.tmpl.html', '<form class="ng-pristine ng-valid"><div class="by-categoty form-group"><label for="reportByState">Report By State</label><select id="reportByState" name="state" chosen search-contains="true" placeholder-text-single="\'Select state\'" class="form-control"><option value="">Select state</option><option ng-repeat="state in marketLocationStates track by $index" value="{{state}}">{{state}}</option></select></div><div class="by-categoty form-group"><label for="reportByCommodity">Report By Commodities</label><select id="reportByCommodity" name="commodity" chosen search-contains="true" placeholder-text-single="\'Select commodity\'" class="form-control"><option ng-repeat="commodity in commodities track by $index" value="{{commodity.commodity}}">{{commodity.commodity}}</option></select></div></form>');}]);
app.constant('COLLECTION_FREQUENCY', {
    DAILY: "daily",
    WEEKLY: "weekly",
    MONTHLY: "monthly",
    YEARLY: "yearly" }).


constant('DEFAULT_SORT_COL', 'report_date').
constant('DATE_FORMAT', 'MM/DD/YYYY');

app.controller('mainController', ["$scope", "$rootScope", "DataFactory", "$q", "$timeout", function ($scope, $rootScope, DataFactory, $q, $timeout) {


}]);
(function ($) {
    app.directive('loading', ['$http', function ($http)
    {
        return {
            restrict: 'E',
            templateUrl: 'templateCache/loading.tmpl.html',
            link: function link(scope, elm, attrs) {

                scope.isLoading = function () {
                    if (!$http.pendingRequests.length)
                        return false;
                    return !_.find($http.pendingRequests, { "hideLoading": true });
                };

                scope.$watch(scope.isLoading, function (v)
                {
                    if (v) {
                        elm.show();
                    } else {
                        elm.hide();
                    }
                });
            } };


    }]);

    app.directive('backTop', function () {
        return {
            restrict: 'E',
            replace: true,
            template: '<div class="back-to-top"><i class="fa fa-chevron-up"></i></div>',
            link: function link($scope, element, attrs) {

                $(window).scroll(function () {

                    if ($(window).scrollTop() <= 0) {
                        $(element).fadeOut();
                    } else
                    {
                        $(element).fadeIn();
                    }

                });

                $(element).on('click', function () {
                    $('html, body').animate({ scrollTop: 0 }, 'fast');
                });

            } };

    });
})(jQuery);
(function ($) {
    app.directive('reportForm', ["$parse", "DataFactory", "$q", "$timeout", "$rootScope", "CommonFactory", function ($parse, DataFactory, $q, $timeout, $rootScope, CommonFactory)
    {
        return {
            restrict: 'E',
            templateUrl: 'templateCache/report-form.tmpl.html',
            link: function link(scope, elem, attrs) {

                scope.commodities = [];
                scope.states = [];

                /*************************INIT CODE*****************************************/
                $q.all([
                    DataFactory.getCommoditiesPromise(),
                    DataFactory.getMarketLocationStatesPromise()]).
                then(function (data) {
                    console.log('Get all data success');
                    scope.commodities = DataFactory.commodities;
                    scope.marketLocationStates = DataFactory.marketLocationStates;

                    $timeout(function () {
                        elem.find('select[chosen]').chosen({ disable_search_threshold: 5, search_contains: true });
                    }, 500, false);

                }).catch(function (err) {
                    throw err;
                });
            } };


    }]);
})(jQuery);
app.
factory('BaseFactory', ["$http", function ($http) {
    return {

        /*******************************************************
         * GET request
         ******************************************************/
        getRequest: function getRequest(requestUrl, successCallback, errorCallback, headers, hideLoading) {
            return this.request("GET", requestUrl, null, successCallback, errorCallback, headers, hideLoading);
        },

        /*******************************************************
         * POST request
         ******************************************************/
        postRequest: function postRequest(requestUrl, requestData, successCallback, errorCallback, headers, hideLoading) {
            return this.request("POST", requestUrl, requestData, successCallback, errorCallback, headers, hideLoading);
        },

        /*******************************************************
         * http request
         ******************************************************/
        request: function request(method, url, data, successCallback,
                                  errorCallback, headers, hideLoading) {
            return $http({
                method: method,
                url: url,
                data: data,
                headers: headers,
                hideLoading: hideLoading }).

            success(
                function (data, status, headers, config) {
                    if (status == 403) {
                        alert('session expired');
                    } else {
                        if (successCallback) {
                            successCallback(data, status, headers);
                        }
                    }
                }).
            error(
                function (data, status, headers, config) {
                    if (errorCallback) {
                        errorCallback(data, status, headers);
                    }
                });
        },

        baseRequestUrl: function baseRequestUrl() {
            return 'api/';
        } };


}]);

app.
factory('CommonFactory', ["BaseFactory", "$q", function (BaseFactory, $q) {
    var exports = {};

    exports.generateUUID = function () {
        var d = new Date().getTime() + Math.floor(Math.random() * 1000 + 1);
        Math.seedrandom(d.toLocaleString());
        var uuid = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math['random']() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
        });
        return uuid;
    };

    String.prototype.replaceAll = function (strReplace, strWith) {
        var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        var reg = new RegExp(esc, 'ig');
        return this.replace(reg, strWith);
    };

    // use this compile function in order to use recursive directive
    //http://stackoverflow.com/questions/19125551/angularjs-understanding-a-recursive-directive
    exports.getRecursiveCompileFn = function getRecursiveCompileFn($compile) {
        return function (tElement, tAttr, transclude) {
            //We are removing the contents/innerHTML from the element we are going to be applying the
            //directive to and saving it to adding it below to the $compile call as the template
            var contents = tElement.contents().remove();
            var compiledContents;
            return function (scope, iElement, iAttr) {
                if (!compiledContents) {
                    //Get the link function with the contents frome top level template with
                    //the transclude
                    compiledContents = $compile(contents, transclude);
                }
                //Call the link function to link the given scope and
                //a Clone Attach Function, http://docs.angularjs.org/api/ng.$compile :
                // "Calling the linking function returns the element of the template.
                //    It is either the original element passed in,
                //    or the clone of the element if the cloneAttachFn is provided."
                compiledContents(scope, function (clone, scope) {
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
        var a = { "data": oldData };
        var b = { "data": newData };
        DeepDiff.applyDiff(a, b);
    };

    //startWith function does not have in IE
    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str) {
            return this.slice(0, str.length) == str;
        };
    }

    exports.showMessage = function (header, msg, $timeout) {
        var $message = $.messager.show({
            title: header,
            msg: msg,
            timeout: 6000 });

        // var $messageBody = $message.find('.messager-body');
        //       $messageBody.html($("<div/>").html(msg).html());
        $message.parent().addClass('panel-custom');
    };

    exports.showMessage4Ever = function (header, msg) {
        var $message = $.messager.show({
            title: header,
            msg: msg,
            timeout: 0 });


        $message.parent().addClass('panel-custom panel-4ever');
    };

    exports.hide4EverMessage = function () {
        $('.panel-4ever').find('a.panel-tool-close').click();
    };

    exports.showAlert = function (header, msg) {
        var $alert = $.messager.alert(header, msg);
        $alert.parent().addClass('panel-custom');
    };

    exports.replaceAllByText = function (text, replaceText) {
        if (!text || text == '') {
            return text;
        }

        return text.split(replaceText).join(' ');
    };

    exports.getParameterByName = function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    return exports;
}]);

app.factory('DataFactory', ["CommonFactory", "BaseFactory", "$http", "$q", function DataFactory(CommonFactory, BaseFactory, $http, $q) {
    var exports = {},queryParams = {};

    var baseUrl = "/services/v1/";

    var excludeColumns = [
        "Office Name",
        "Office Code",
        "Office City",
        "Office State",
        "Market Location Name",
        "Market Location City",
        "Market Location State",
        "Market Type",
        "Market Type Category"];


    var groupColumns = ["Group", "Category", "Commodity"];

    exports.getCommoditiesPromise = function () {
        var defered = $q.defer();
        var requestUrl = baseUrl + "commodities";
        if (exports[requestUrl]) {
            exports.commodities = angular.copy(exports[commodities]);

            defered.resolve([exports.commodities]);
        } else {
            BaseFactory.getRequest(requestUrl, function (data, status, headers, config) {
                exports.commodities = data;
                exports[requestUrl] = angular.copy(data);

                defered.resolve([data, status, headers, config]);

            }, function (data, status, headers, config) {
                defered.reject([data, status, headers, config]);
            });
        }
        return defered.promise;
    };

    exports.getOfficesPromise = function () {
        var defered = $q.defer();
        var requestUrl = baseUrl + "offices";
        if (exports[requestUrl]) {
            exports.offices = angular.copy(exports[offices]);

            defered.resolve([exports.offices]);
        } else {
            BaseFactory.getRequest(requestUrl, function (data, status, headers, config) {
                exports.offices = data;
                exports[requestUrl] = angular.copy(data);

                defered.resolve([data, status, headers, config]);

            }, function (data, status, headers, config) {
                defered.reject([data, status, headers, config]);
            });
        }
        return defered.promise;
    };

    exports.getReportsPromise = function () {
        var defered = $q.defer();
        var requestUrl = baseUrl + "reports";
        if (exports[requestUrl]) {
            exports.reports = angular.copy(exports[reports]);

            defered.resolve([exports.reports]);
        } else {
            BaseFactory.getRequest(requestUrl, function (data, status, headers, config) {
                exports.reports = data;
                exports[requestUrl] = angular.copy(data);

                defered.resolve([data, status, headers, config]);

            }, function (data, status, headers, config) {
                defered.reject([data, status, headers, config]);
            });
        }
        return defered.promise;
    };

    exports.getMarketLocationStatesPromise = function () {
        var defered = $q.defer();
        var requestUrl = baseUrl + "states";
        if (exports[requestUrl]) {
            exports.marketLocationStates = angular.copy(exports[marketLocationStates]);

            defered.resolve([exports.marketLocationStates]);
        } else {
            BaseFactory.getRequest(requestUrl, function (data, status, headers, config) {
                exports.marketLocationStates = data;
                exports[requestUrl] = angular.copy(data);

                defered.resolve([data, status, headers, config]);

            }, function (data, status, headers, config) {
                defered.reject([data, status, headers, config]);
            });
        }
        return defered.promise;
    };

    exports.getMarketLocationsPromise = function () {
        var defered = $q.defer();
        var requestUrl = baseUrl + "markets";
        if (exports[requestUrl]) {
            exports.marketLocations = angular.copy(exports[marketLocations]);

            defered.resolve([exports.marketLocations]);
        } else {
            BaseFactory.getRequest(requestUrl, function (data, status, headers, config) {
                exports.marketLocations = data;
                exports[requestUrl] = angular.copy(data);

                defered.resolve([data, status, headers, config]);

            }, function (data, status, headers, config) {
                defered.reject([data, status, headers, config]);
            });
        }
        return defered.promise;
    };

    /*********************************/
    /*****GET DATA API*********/
    /*********************************/

    function getDataPromise(entity, searchKey, queryParams) {
        var defered = $q.defer();

        var queryStr = "";
        if (queryParams) {
            for (var param in queryParams) {
                if (queryStr) {
                    queryStr += "&";
                }
                queryStr += param + "=" + queryParams[param];
            }
        }

        var requestUrl = baseUrl + entity + "/" + searchKey + "?" + queryStr;

        BaseFactory.getRequest(requestUrl, function (data, status, headers, config) {
            var records = data.results;
            createTableColumns(records);
            assignIdToRecord(records);
            defered.resolve(records);

        }, function (data, status, headers, config) {
            defered.reject([data, status, headers, config]);
        });
        return defered.promise;
    }

    function assignIdToRecord(records) {
        var ids = [];
        var id = CommonFactory.generateUUID();
        if (records && records.length) {
            _.forEach(records, function (record) {
                while (ids.indexOf(id) >= 0) {
                    id = CommonFactory.generateUUID();
                }
                record.id = id;
                ids.push(id);

                record.groupKey = record.group + " / " + record.category + " / " + record.commodity;
            });
        }
    }

    function createTableColumns(records) {
        var tableColumns = [{
            attrId: "column-controlled-child-rows",
            name: '' }];

        if (records && records.length) {
            for (var prop in records[0]) {
                var colName = formatTableName(prop);
                if (excludeColumns.indexOf(colName) < 0 && groupColumns.indexOf(colName) < 0) {
                    tableColumns.push({
                        attrId: prop,
                        name: colName });

                }
            }
        }
        exports.tableColumns = tableColumns;
    }

    function formatTableName(colAttrId) {
        return colAttrId.replaceAll("_", " ")
        //.replaceAll("Office ", "OF ").replaceAll("Market Location ", "ML ")
        //.replaceAll("Market Type  ", "MT ")
            .split(' ').map(_.capitalize).join(' ');
    }

    exports.getCommodityDataPromise = function (commodityName, queryParams) {
        return getDataPromise("commodities", commodityName, queryParams);
    };

    exports.getOfficeDataPromise = function (officeName, queryParams) {
        return getDataPromise("offices", officeName, queryParams);
    };

    exports.getReportDataPromise = function (reportName) {
        return getDataPromise("reports", reportName, queryParams);
    };

    return exports;
}]);