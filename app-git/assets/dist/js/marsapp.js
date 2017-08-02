'use strict';var app = angular.module('app', ['720kb.tooltips', 'angucomplete-alt', 'ui.bootstrap', 'ngStorage']);

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
angular.module('app-git').run(['$templateCache', function ($templateCache) {$templateCache.put('templateCache/custom-datepicker.tmpl.html', '<div class="custom-datepicker custom-cal controls mars-form-control form-control width-full" ng-click="open($event)" tabindex="{{tabindex}}" ng-class="{\'disabled\': isDisabled}"><i class="glyphicon glyphicon-calendar fa fa-calendar"></i><input type="text" class="form-control" uib-datepicker-popup="{{format}}" readonly="readonly" ng-model="dt" is-open="status.opened" show-button-bar="{{!hideButtonBar}}" datepicker-append-to-body="true" datepicker-options="dateOptions"><b class="caret"></b></div>');
    $templateCache.put('templateCache/datagrid-view.tmpl.html', '<div class="datagrid-view"><div class="dataTables_wrapper"><table class="table nowrap inner-dataTable dataTable nofooter" id="{{tableId}}"><thead><th ng-repeat="col in tableColumns track by col.attrId" ng-click="sort(col)" id="{{tableId + \'__\' + col.attrId}}" ng-if="col.isFirstRow"><span>{{col.name}}</span>&nbsp;<i class="sort-icon fa" ng-class="{\n                            \'fa-sort-asc\': gridState.order.column && gridState.order.column.attrId == col.attrId && gridState.order.asc, \n                            \'fa-sort-desc\': gridState.order.column && gridState.order.column.attrId == col.attrId && !gridState.order.asc}" ng-if="col.attrId != $scope.controlChildRowId"></i></th></thead><tbody ng-hide="gridState.isFiltering || !gridState.records || gridState.records.length == 0"><tr ng-repeat-start="record in gridState.records track by record.id"><td ng-repeat="field in tableColumns track by field.attrId" ng-if="field.isFirstRow" ng-include="\'row_renderer.html\'"></td></tr><tr ng-repeat-end ng-if="rowState[record.id].showingChildRow" ng-class="{\'highlight-row\': record.statusCode == \'E\'}"><td colspan="{{firstRowLength + 2}}"><div style="margin-left: 25px"><table class="width-full"><thead><tr><th ng-repeat="col in secondRowCols track by col.attrId"><span>{{col.name}}</span></th></tr></thead><tbody><tr><td ng-repeat="field in secondRowCols track by field.attrId" ng-include="\'row_renderer.html\'"></td></tr></tbody></table></div></td></tr></tbody><tbody class="ng-hide" ng-show="!gridState.isFiltering && (!gridState.records || gridState.records.length == 0)"><tr class="odd"><td valign="top" colspan="{{tableColumns.length}}" class="dataTables_empty">No data available in table.</td></tr></tbody><tbody class="ng-hide" ng-show="gridState.isFiltering"><tr class="odd"><td valign="top" colspan="{{tableColumns.length}}" class="dataTables_empty"><b>LOADING...</b></td></tr></tbody></table><div class="dataTables_length"><label><select class="form-control input-sm" ng-model="gridState.pageSize" ng-change="refreshData()" ng-if="tableOptions.showPageSize"><option value="10">10</option><option value="25">20</option><option value="50">50</option><option value="100">100</option></select></label></div><div class="dataTables_paginate paging_full_numbers"><ul class="pagination" uib-pagination total-items="gridState.totalRecords" items-per-page="gridState.pageSize" ng-model="gridState.pageIndex" ng-if="tableOptions.paging" ng-change="refreshData()" boundary-link-numbers="true" rotate="true" max-size="5"></ul></div></div><script type="text/ng-template" id="row_renderer.html"><div ng-if="field.attrId != controlChildRowId">\n             {{record[field.attrId]}}\n        </div> \n        <div ng-if="field.attrId == controlChildRowId" class="mars-tooltip" title="Control">\n            <a ng-click="showChildRow(record)" style="color: #2a5c0b; font-size: 16px;">\n                <i class="fa" \n                    ng-class="{\'fa-plus-circle\' : !rowState[record.id].showingChildRow, \'fa-minus-circle\' : rowState[record.id].showingChildRow }"></i>\n            </a>\n        </div></script></div>');
    $templateCache.put('templateCache/loading.tmpl.html', '<div id="preloader"><div class="loader"><span></span><span></span><span></span><span></span></div></div>');
    $templateCache.put('templateCache/search-box.tmpl.html', '<div class="search-box-wrapper"><div class="angucomplete-wrapper"><angucomplete-alt id="ex1" placeholder="Search column" pause="100" selected-object="selectedAttribute" local-data="tableColumns" search-fields="name" title-field="name" minlength="2" input-class="form-control form-control-small mars-tooltip" clear-selected="true" focus-out="focusOut()" input-changed="inputChanged" ng-show="!selectedAttribute"></div><div ng-show="selectedAttribute" class="input-group"><div id="attrTab" class="attrTab input-group-addon">{{selectedAttribute.title}}<a ng-click="clearSearch();" style="cursor: pointer;color: #555">&nbsp;<i class="fa fa-remove"></i></a></div><input id="attrVal" type="text" ng-model="selectedValue" class="form-control attrVal" tabindex="0/"></div></div>');
    $templateCache.put('templateCache/section-filter.tmpl.html', '<div class="mars-accordion-section" id="section-filter"><div ng-click="toggleHeading($event)" data-target="#section-filter-content" class="row mars-accordion-header"><div class="col-sm-4 col-md-6"><h3><i ng-hide="collapse" class="fa fa-angle-down"></i><i ng-show="collapse" class="fa fa-angle-right"></i>Search for Commodities</h3></div></div><div id="section-filter-content" class="mars-accordion-content clearfix"><div class="col-sm-4"><b>Commodities</b><p>Type</p><select name="commodityType" chosen search-contains="true" placeholder-text-single="\'Select type\'" ng-model="filter.commodityType" class="form-control"><option ng-repeat="commodityType in commodityTypes track by $index" value="{{commodityType}}">{{commodityType}}</option></select><div ng-show="filter.commodityType == \'Commodity\'"><p>Commodity</p><select name="commodity" chosen search-contains="true" placeholder-text-single="\'Select commodity\'" ng-model="filter.commodity" class="form-control"><option ng-repeat="commodity in commodities track by $index" value="{{commodity.commodity}}">{{commodity.commodity}}</option></select></div><div ng-show="filter.commodityType == \'Office\'"><p>Office</p><select name="office" chosen search-contains="true" placeholder-text-single="\'Select office\'" ng-model="filter.office" class="form-control"><option ng-repeat="office in offices track by $index" value="{{office.office_name}}">{{office.office_name}}</option></select></div><div ng-show="filter.commodityType == \'Report\'"><p>Report</p><select name="report" chosen search-contains="true" placeholder-text-single="\'Select report\'" ng-model="filter.report" class="form-control"><option ng-repeat="report in reports track by $index" value="{{report.report_name}}">{{report.report_name}}</option></select></div><div ng-show="filter.commodityType == \'Market Location\'"><p>Market Location</p><select name="marketLocation" chosen search-contains="true" placeholder-text-single="\'Select market location\'" ng-model="filter.marketLocation" class="form-control"><option ng-repeat="marketLocation in marketLocations track by $index" value="{{marketLocation.market_name}}">{{marketLocation.market_name}}</option></select></div><div ng-show="filter.commodityType == \'Market Type\'"><p>Market Type</p><select name="marketType" chosen search-contains="true" placeholder-text-single="\'Select market type\'" ng-model="filter.marketType" class="form-control"><option ng-repeat="marketType in marketTypes track by $index" value="{{marketType.market_type}}">{{marketType.market_type}}</option></select></div></div><div class="col-sm-4"><b>Location</b><p>Select State</p><select name="state" chosen search-contains="true" placeholder-text-single="\'Select state\'" ng-model="filter.marketLocationState" class="form-control"><option value="">Select state</option><option ng-repeat="state in marketLocationStates track by $index" value="{{state}}">{{state}}</option></select></div><div class="col-sm-4"><b>Time</b><p>Select From Date</p><custom-datepicker date-model="filter.reportFromDate" date-object="true" max-date="reportMaxDate"></custom-datepicker><p>Select To Date</p><custom-datepicker date-model="filter.reportToDate" date-object="true" max-date="reportMaxDate"></custom-datepicker></div><div class="col-sm-12 action-bar"><div class="col-sm-8 pull-left" style="color: red"><p ng-repeat="errMsg in errMessages track by $index">{{errMsg}}</p></div><div class="col-sm-2 pull-right"><a class="btn mars-form-control form-control" ng-click="getData()">GET DATA</a></div><div class="col-sm-2 pull-right"><a class="btn mars-form-control form-control" ng-click="clearFilter()">CLEAR</a></div></div></div></div>');
    $templateCache.put('templateCache/section-result.tmpl.html', '<div class="mars-accordion-section" id="section-result"><div ng-click="toggleHeading($event)" data-target="#section-result-content" class="row mars-accordion-header"><div class="col-sm-4 col-md-6"><h3><i ng-hide="collapse" class="fa fa-angle-down"></i><i ng-show="collapse" class="fa fa-angle-right"></i>Result</h3></div></div><div id="section-result-content" class="mars-accordion-content clearfix"><div ng-if="filterFields && filterFields.length > 0" class="col-sm-12"><div class="mars-accordion-section"><div ng-click="toggleHeadingFilter($event)" data-target="#section-result-filter" class="row mars-accordion-header"><div class="col-sm-4 col-md-6"><h3><i ng-hide="filterCollapse" class="fa fa-angle-down"></i><i ng-show="filterCollapse" class="fa fa-angle-right"></i>Filter result</h3></div></div><div id="section-result-filter" class="mars-accordion-content clearfix result-filter" style="display: none"><div class="col-sm-12"><div class="col-sm-3" ng-repeat="field in filterFields"><span>{{field.name}}</span><input type="text" name="{{field.name}}" ng-model="resultFilter[field.attrId]" class="form-control"></div></div><div class="col-sm-12"><div class="col-sm-2 pull-right filter-btn"><a class="btn mars-form-control form-control" ng-click="filterData()">Filter</a></div><div class="col-sm-2 pull-right"><a class="btn mars-form-control form-control" ng-click="resetFilterData()">Reset Filter</a></div></div></div></div></div><div class="col-sm-12" ng-if="!filtering && (!groupRecords || !groupRecords.length)"><p class="no-data">No data available</p></div><div class="col-sm-12 table-result" ng-if="!filtering && groupRecords && groupRecords.length"><div class="control-bar clearfix"><div class="col-sm-2"><a ng-show="!collapsed" class="btn mars-form-control form-control" ng-click="toggleCollapseAll()"><i class="fa fa-minus-circle"></i>&nbsp;&nbsp;Collapse All</a><a ng-show="collapsed" class="btn mars-form-control form-control" ng-click="toggleCollapseAll()"><i class="fa fa-plus-circle"></i>&nbsp;&nbsp;Expand All</a></div></div><div ng-repeat="group in groupRecords track by $index" class="group-records"><p class="group-key" ng-click="toggleCollapseGroup(group)"><span style="margin-right: 5px"><i ng-show="group.collapsed" class="fa fa-plus-circle"></i><i ng-show="!group.collapsed" class="fa fa-minus-circle"></i></span>{{group.key}}</p><div ng-show="!group.collapsed"><datagrid-view table-columns="group.tableColumns" table-data="group.records" table-options="tableOptions"></datagrid-view></div></div></div></div></div>');}]);
/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * Datepicker, currently used in commodity form (section 3) and home filter form (section 1).
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * Properties: 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       *  maxDate: expression return moment object
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       *  ngDisabled: expression return boolean
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       *  dateObject: expression return boolean, identify whether this control is used with ngModel is javascript date OR string with correct format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       *  hideButtonBar: expression return boolean, identify whether hide button bar (Clear and Done buttons)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       */
(function ($) {
    app.directive('customDatepicker', ["$parse", "COLLECTION_FREQUENCY", "DATE_FORMAT", function ($parse, COLLECTION_FREQUENCY, DATE_FORMAT) {
        return {
            templateUrl: 'templateCache/custom-datepicker.tmpl.html',
            scope: {
                dateModel: '=' },

            link: function link(scope, elem, attrs) {
                var minDate = moment().subtract(30, 'years').toDate();
                var maxDate = attrs.maxDate && attrs.maxDate != '' ? $parse(attrs.maxDate)(scope) : null;
                var collectFrequency = attrs.collectFrequency && attrs.collectFrequency != '' ? $parse(attrs.collectFrequency)(scope) : null;
                var isModelDateObj = attrs.dateObject && attrs.dateObject == 'true';

                scope.hideButtonBar = attrs.hideButtonBar && attrs.hideButtonBar == 'true';

                scope.tabindex = attrs.tab ? attrs.tab : 0;

                scope.$watch(function () {
                    return scope[attrs.maxDate];
                }, function (maxDate) {
                    init(maxDate);
                });

                function init(maxDate) {
                    var options = {
                        format: 'MM/dd/yyyy',
                        yearFormat: 'yy',
                        startingDay: 1,
                        minDate: minDate,
                        maxDate: maxDate,
                        appendToBody: true };


                    if (collectFrequency == COLLECTION_FREQUENCY.WEEKLY) {
                        options.dateDisabled = function (dateMode) {
                            return dateMode.mode === 'day' && dateMode.date.getDay() != 1;
                        };

                    } else if (collectFrequency == COLLECTION_FREQUENCY.MONTHLY) {
                        options = {
                            format: 'MMMM yyyy',
                            formatMonth: 'MMMM',
                            formatYear: 'yyyy',
                            minMode: 'month',
                            minDate: minDate,
                            maxDate: maxDate,
                            appendToBody: true };


                    } else if (collectFrequency == COLLECTION_FREQUENCY.YEARLY) {
                        options = {
                            format: 'yyyy',
                            formatYear: 'yyyy',
                            minMode: 'year',
                            minDate: minDate,
                            maxDate: maxDate,
                            appendToBody: true };

                    }

                    scope.dateOptions = options;
                    scope.format = scope.dateOptions.format;
                }

                scope.$watch(function () {
                    return scope.dateModel;

                }, function (value) {
                    if (!value) {
                        scope.dt = null;
                    } else {
                        if (isModelDateObj) {
                            scope.dt = value;
                        } else {
                            var tmpDate = moment(value, DATE_FORMAT);
                            if (tmpDate.isValid()) {
                                scope.dt = tmpDate.toDate();
                            } else {
                                scope.dt = null;
                            }
                        }
                    }

                });

                scope.$watch(function () {
                    return $parse(attrs.ngDisabled)(scope);
                }, function (isDisabled) {
                    scope.isDisabled = isDisabled;
                });

                var model = scope.dateModel;
                var dateObj = null;
                if (model && model != '') {
                    if (!isModelDateObj) {
                        dateObj = moment(model, DATE_FORMAT).toDate();
                    } else {
                        dateObj = model;
                    }
                }

                if (dateObj != null) {
                    if (isModelDateObj) {
                        scope.dateModel = dateObj;
                    } else {
                        scope.dateModel = model;
                    }
                    scope.dt = dateObj;
                } else {
                    scope.dt = null;
                }

                scope.$watch(function () {
                    return scope.dt;
                }, function (newDate) {
                    newDate = newDate || null;
                    var newDateStr = newDate ? moment(newDate).format(DATE_FORMAT) : null;
                    if (isModelDateObj) {
                        scope.dateModel = newDate;
                    } else {
                        scope.dateModel = newDateStr;
                    }
                });

                scope.status = {
                    opened: false };


                scope.open = function ($event) {
                    scope.status.opened = true;
                };
            } };

    }]);
})(jQuery);
/*
             * tableColumn sis an array of all table columns.
             * tableData is an array of all records.
             * tableOptions is object to configure grid view.
             * 	Sample data {
            		pageSize: 10,// default value for pageSize
            		pageIndex: 0, // default value for pageIndex
            		showPageSize: true,// should show page size or not
            		searching: true, // should show search on column or not
            		info: true, // should show the table info or not
            		paging: true, // should show the paging or not
            		isAddControlColumn: false, // is a flag to add the control column into tableColumns,
                    wrapperClass: 'section-fruit-and-vegetable' //css class of parent division, used to calculate repsonsive
             	}
            */
(function ($) {
    app.directive('datagridView', ["$timeout", "$rootScope", "CommonFactory", "DEFAULT_SORT_COL", function dataGridView($timeout, $rootScope, CommonFactory, DEFAULT_SORT_COL) {
        return {
            restrict: 'E',
            templateUrl: 'templateCache/datagrid-view.tmpl.html',
            scope: {
                tableColumns: '=',
                tableData: '=',
                tableOptions: '=',
                searchControlId: '=' },

            link: function link(scope, element) {
                $timeout(function () {
                    var $marsTooltip = element.find('.mars-tooltip:not(.tooltipstered)');
                    $marsTooltip.tooltipster();
                }, 0, false);
            },
            controller: ["$scope", function controller($scope) {
                $scope.tableOptions.pageSize += "";

                $scope.rowState = {}; //Object as dictionary, key is id, value is list of property

                $scope.gridState = {
                    records: [],
                    search: [],
                    order: {
                        column: {
                            attrId: DEFAULT_SORT_COL },

                        asc: false },

                    pageSize: $scope.tableOptions.pageSize,
                    pageIndex: $scope.tableOptions.pageIndex,
                    totalRecords: !$scope.tableData ? 0 : $scope.tableData.length,
                    isFiltering: true };


                $scope.tableId = CommonFactory.generateUUID();

                $scope.refreshData = refreshData;
                $scope.searchCallBack = searchCallBack;
                $scope.searchReset = searchReset;
                $scope.sort = sort;
                $scope.showChildRow = showChildRow;

                $scope.controlChildRowId = 'column-controlled-child-rows';

                var firstLoad = true;

                function refreshData(updateResponsive) {
                    $timeout(function () {
                        // console.log("Grid " + $scope.tableId + " refreshing");

                        var records = [];
                        var originalRecords = $scope.tableData || [];
                        var selectedIndexFrom = parseInt($scope.gridState.pageIndex == 0 ? 0 : $scope.gridState.pageIndex - 1) * parseInt($scope.gridState.pageSize);

                        selectedIndexFrom = selectedIndexFrom > 0 ? selectedIndexFrom : 0;

                        // order
                        if ($scope.gridState.order && $scope.gridState.order.column) {
                            originalRecords = _.sortByOrder(originalRecords, function (record) {
                                var property = !$scope.gridState.order.column.attrId ? $scope.gridState.order.column : $scope.gridState.order.column.attrId;
                                var fieldData = record[property];
                                return !fieldData ? null : fieldData.label ? fieldData.label : fieldData;
                            }, $scope.gridState.order.asc);
                        }

                        // Search
                        if ($scope.tableOptions.searching && $scope.gridState.search && $scope.gridState.search.length > 0) {
                            _.forEach($scope.gridState.search, function (searchCon) {
                                if (searchCon.column) {
                                    originalRecords = _.filter(originalRecords, function (record) {
                                        var recordValue = record[searchCon.column.attrId];
                                        recordValue = !recordValue ? null : !recordValue.id ? recordValue : recordValue.label;

                                        return recordValue && (recordValue + "").toLowerCase().indexOf(searchCon.text.toLowerCase()) >= 0;
                                    });
                                } else {
                                    originalRecords = _.filter(originalRecords, function (record) {
                                        for (var prop in record.customObject) {
                                            if (record.customObject.hasOwnProperty(prop)) {
                                                var recordValue = record.customObject[prop].label;
                                                if (recordValue && (recordValue + "").toLowerCase().indexOf(searchCon.text.toLowerCase()) >= 0) {
                                                    return true;
                                                }
                                            }
                                        }
                                        return false;
                                    });
                                }
                            });

                        }

                        // Take records
                        var selectedIndexTo = selectedIndexFrom + parseInt($scope.gridState.pageSize);
                        _.forEach(originalRecords, function (record, index) {
                            if (index >= selectedIndexFrom && index < selectedIndexTo) {
                                records.push(record);
                            }
                        });

                        $scope.gridState.totalRecords = !originalRecords ? 0 : originalRecords.length;
                        $scope.gridState.records = records;

                        $scope.gridState.isFiltering = false;

                        if (updateResponsive) {
                            updateResponsiveView();
                        }
                    });
                }

                function searchReset() {
                    $scope.gridState.search = [];
                    refreshData(true);
                }

                //[{attrId: 1, searchValue: 2}]
                function searchCallBack(searchConditionList) {
                    $scope.gridState.search = [];

                    _.forEach(searchConditionList, function (searchCon) {
                        $scope.gridState.search.push({
                            column: _.find($scope.tableColumns, { 'attrId': searchCon.attrId }),
                            text: searchCon.searchValue });

                    });

                    refreshData(true);
                }

                function sort(column) {
                    if (!sortable(column)) return;
                    if (!$scope.gridState.order.column) $scope.gridState.order.column = {};
                    $scope.gridState.order.asc = $scope.gridState.order.column.attrId == column.attrId ? !$scope.gridState.order.asc : true;
                    $scope.gridState.order.column = column;
                    refreshData(true);
                }

                function sortable(column) {
                    if (column.attrId == $scope.controlChildRowId)
                    return false;
                    return true;
                }

                function showChildRow(record) {
                    var recordId = record.id;
                    if ($scope.rowState[recordId] === undefined) {
                        $scope.rowState[recordId] = {
                            showingChildRow: true };


                    } else {
                        $scope.rowState[recordId].showingChildRow = !$scope.rowState[recordId].showingChildRow;
                    }
                }

                function setAllColumnsShowinOneLine() {
                    _.forEach($scope.tableColumns, function (col, index) {
                        if (col.attrId != $scope.controlChildRowId) {
                            col.isFirstRow = true;
                        } else {
                            col.isFirstRow = false;
                        }
                    });
                }

                function updateResponsiveView() {
                    setAllColumnsShowinOneLine();
                    $timeout(function () {
                        var $table = $("#" + $scope.tableId);

                        var wrapperClass = $scope.tableOptions.wrapperClass ? $scope.tableOptions.wrapperClass : "dataTables_wrapper";
                        var expectedWidth = $table.closest("." + wrapperClass).width();
                        if (!expectedWidth) {
                            return;
                        }

                        var currentWidth = 0;
                        var controlChildCellWidth = 30;
                        var secondRowCols = [];

                        var lastColOfFirstRowIndex = -1;
                        _.forEach($scope.tableColumns, function (col, index) {
                            var thId = $scope.tableId + '__' + col.attrId;
                            if (currentWidth <= expectedWidth) {
                                currentWidth += $("#" + thId).outerWidth();
                                lastColOfFirstRowIndex = index;

                            } else {
                                secondRowCols.push(angular.copy(col));
                                col.isFirstRow = false;
                            }

                        });

                        if (currentWidth > expectedWidth && !secondRowCols.length) {
                            lastColOfFirstRowIndex = $scope.tableColumns.length - 1;
                        }

                        if (lastColOfFirstRowIndex >= 0 && currentWidth > expectedWidth) {
                            while (currentWidth + controlChildCellWidth > expectedWidth) {
                                var col = $scope.tableColumns[lastColOfFirstRowIndex];
                                var thId = $scope.tableId + '__' + col.attrId;
                                currentWidth = currentWidth - $("#" + thId).outerWidth();

                                col.isFirstRow = false;
                                secondRowCols.unshift(angular.copy(col));

                                lastColOfFirstRowIndex--;
                            }
                        }

                        $scope.secondRowCols = secondRowCols;
                        console.log("secondRowCols", $scope.tableId, secondRowCols);
                        $scope.firstRowLength = _.countBy($scope.tableColumns, function (col) {
                            return col.isFirstRow;
                        })[true];

                        var controlCol = _.find($scope.tableColumns, { 'attrId': $scope.controlChildRowId });
                        if (controlCol) {
                            if ($scope.secondRowCols.length > 0) {
                                controlCol.isFirstRow = true;
                            } else {
                                controlCol.isFirstRow = false;
                            }
                        }
                    });
                }


                /******EVENT HANDLING BEGIN********/

                if ($scope.tableOptions.searching) {
                    $scope.$on('datagrid.search', function (event, searchConditionList) {
                        searchCallBack(searchConditionList);
                    });
                }

                // $scope.$watchCollection(function() {
                //     return $scope.tableData;
                // }, function(newVal, oldVal) {
                //     refreshData();
                // });

                /******INITIALIZE DIRECTIVE********/
                setAllColumnsShowinOneLine();
                refreshData(true);

                var existingWidth = $(window).width();
                $(window).resize(function () {
                    var newWidth = $(window).width();
                    if (existingWidth != newWidth) {
                        existingWidth = newWidth;
                        updateResponsiveView();
                    };
                });
            }] };


    }]);
})(jQuery);
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
    app.directive('dcSearchBox', ["CommonFactory", "$timeout", function (CommonFactory, $timeout) {
        return {
            replace: true,
            templateUrl: 'templateCache/search-box.tmpl.html',
            restrict: 'E',
            scope: {
                tableColumns: '=',
                searchSubmit: '&',
                clearSearchCallBack: '&' },

            link: function link(scope, elem, attrs) {
                scope.searchValue = null;

                scope.clearSearch = function () {
                    scope.selectedAttribute = undefined;
                    scope.selectedValue = undefined;
                    scope.clearSearchCallBack({});
                };

                scope.focusOut = function () {
                    elem.find("#attrVal").focus();
                };
                scope.inputChanged = function (value) {
                    scope.searchValue = value;
                };

                elem.find("#attrVal").bind("keydown keypress", function (event) {
                    if (event.which === 13) {
                        scope.searchSubmit({
                            "$attrId": scope.selectedAttribute.originalObject.attrId,
                            "$searchValue": scope.selectedValue });

                        event.preventDefault();
                    }
                });
                elem.find(".angucomplete-wrapper").bind("keydown keypress", function (event) {
                    $timeout(function () {
                        if (event.which === 13 && !scope.selectedAttribute) {
                            scope.searchSubmit({
                                "$attrId": null,
                                "$searchValue": scope.searchValue });

                            event.preventDefault();
                        }
                    }, 500);

                });
            } };

    }]);
})(jQuery);
app.directive('sectionFilter', ["$parse", "DataFactory", "$q", "$timeout", "$rootScope", "CommonFactory", function ($parse, DataFactory, $q, $timeout, $rootScope, CommonFactory) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'templateCache/section-filter.tmpl.html',
        scope: {
            dataModel: '=' },

        link: function link(scope, elem, attrs) {

            function getInitFilterObj() {
                return {
                    commodityType: 'Commodity',
                    commodity: null,
                    office: null,
                    report: null,
                    marketLocation: null,
                    marketType: null,
                    marketLocationState: null,
                    reportFromDate: new Date(),
                    reportToDate: new Date() };

            }

            scope.toggleHeading = function (event) {
                scope.collapse = !scope.collapse;
                var collapseTarget = $($(event.currentTarget).data('target'));
                if (scope.collapse) {
                    collapseTarget.slideUp(300);
                } else {
                    collapseTarget.slideDown(300);
                }
            };

            scope.commodityTypes = ['Commodity', 'Office', 'Report', 'Market Location', 'Market Type'];
            scope.states = [];
            scope.filter = getInitFilterObj();
            scope.reportMaxDate = new Date();

            scope.getData = function () {
                console.log('filter:', scope.filter);
                if (isFilterValid()) {
                    $rootScope.$broadcast('data.filter', scope.filter);
                }
            };

            scope.clearFilter = function () {
                scope.filter = getInitFilterObj();
                $timeout(function () {
                    elem.find('select[chosen]').trigger('chosen:updated');
                });
            };

            function isFilterValid() {
                var errMessages = [];
                if (scope.filter.commodityType == 'Commodity' && !scope.filter.commodity) {
                    errMessages.push('Commodity is required.');

                } else if (scope.filter.commodityType == 'Office' && !scope.filter.office) {
                    errMessages.push('Office is required.');

                } else if (scope.filter.commodityType == 'Report' && !scope.filter.report) {
                    errMessages.push('Report is required.');

                } else if (scope.filter.commodityType == 'Market Location' && !scope.filter.marketLocation) {
                    errMessages.push('Market Location is required.');

                } else if (scope.filter.commodityType == 'Market Type' && !scope.filter.marketType) {
                    errMessages.push('Market Type is required.');

                }

                if (scope.filter.reportFromDate > scope.filter.reportToDate) {
                    errMessages.push('Report From Date must be before the Report To Date.');
                }
                scope.errMessages = errMessages;
                return !errMessages.length;
            }

            function prePopulateData() {
                var queryCommodity = CommonFactory.getParameterByName('sel-commodity');
                var queryState = CommonFactory.getParameterByName('sel-state');

                var state = _.find(scope.marketLocationStates, function (st) {
                    return st == queryState;
                });
                if (state) {
                    scope.filter.marketLocationState = state;
                }

                var commodity = _.find(scope.commodities, function (com) {
                    return com.commodity == queryCommodity;
                });

                if (commodity) {
                    scope.filter.commodity = commodity.commodity;
                    scope.getData();
                }
            }

            /*************************INIT CODE*****************************************/
            $q.all([
            DataFactory.getCommoditiesPromise(),
            DataFactory.getOfficesPromise(),
            DataFactory.getReportsPromise(),
            DataFactory.getMarketLocationStatesPromise(),
            DataFactory.getMarketLocationsPromise(),
            DataFactory.getMarketTypesPromise()]).

            then(function (data) {
                console.log('Get all data success');
                scope.commodities = DataFactory.commodities;
                scope.offices = DataFactory.offices;
                scope.reports = DataFactory.reports;
                scope.marketLocationStates = DataFactory.marketLocationStates;
                scope.marketLocations = DataFactory.marketLocations;
                scope.marketTypes = DataFactory.marketTypes;

                $timeout(function () {
                    elem.find('select[chosen]').chosen({ disable_search_threshold: 5, search_contains: true });
                }, 500, false);

                prePopulateData();

            }).catch(function (err) {
                throw err;
            });
        } };

}]);
app.directive('sectionResult', ["$parse", "DataFactory", "$timeout", "$rootScope", function ($parse, DataFactory, $timeout, $rootScope) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'templateCache/section-result.tmpl.html',
        scope: {
            dataModel: '=' },

        link: function link(scope, elem, attrs) {
            function toggleAccordion(event, collapsed) {
                var collapseTarget = $($(event.currentTarget).data('target'));
                if (collapsed) {
                    collapseTarget.slideUp(300);
                } else {
                    collapseTarget.slideDown(300);
                }

            }

            scope.toggleHeading = function (event) {
                scope.collapse = !scope.collapse;
                toggleAccordion(event, scope.collapse);
            };

            scope.filterCollapse = true;
            scope.toggleHeadingFilter = function (event) {
                scope.filterCollapse = !scope.filterCollapse;
                toggleAccordion(event, scope.filterCollapse);
            };

            scope.tableOptions = {
                pageSize: 10,
                pageIndex: 0,
                showPageSize: true,
                searching: true,
                info: true,
                paging: true,
                ordering: true,
                isAddControlColumn: true };


            scope.resultFilter = {};

            scope.toggleCollapseGroup = function (group) {
                group.collapsed = !group.collapsed;
            };

            scope.toggleCollapseAll = function () {
                scope.collapsed = !scope.collapsed;
                _.forEach(scope.groupRecords, function (group) {
                    group.collapsed = scope.collapsed;
                });
            };

            scope.$on('data.filter', function (event, filter) {
                scope.filtering = true;

                var queryParams = {};
                if (filter.marketLocationState) {
                    queryParams.market_location_state = filter.marketLocationState;
                }

                if (filter.commodityType == 'Commodity') {
                    DataFactory.getCommodityDataPromise(filter.commodity, queryParams).
                    then(function (commodityData) {
                        console.log("commodityData", commodityData);
                        showData(commodityData);
                    });

                } else if (filter.commodityType == 'Office') {
                    DataFactory.getOfficeDataPromise(filter.office, queryParams).
                    then(function (officeData) {
                        console.log("officeData", officeData);
                        showData(officeData);
                    });

                } else if (filter.commodityType == 'Report') {
                    DataFactory.getReportDataPromise(filter.report, queryParams).
                    then(function (reportData) {
                        console.log("reportData", reportData);
                        showData(reportData);
                    });

                } else if (filter.commodityType == 'Market Location') {
                    DataFactory.getMarketLocationDataPromise(filter.marketLocation, queryParams).
                    then(function (marketLocationData) {
                        console.log("marketLocationData", marketLocationData);
                        showData(marketLocationData);
                    });

                } else if (filter.commodityType == 'Market Type') {
                    DataFactory.getMarketTypeDataPromise(filter.marketType, queryParams).
                    then(function (marketTypeData) {
                        console.log("marketTypeData", marketTypeData);
                        showData(marketTypeData);
                    });

                } else {
                    scope.filtering = false;
                    scope.tableColumns = [];
                    scope.groupRecords = [];
                }
            });

            // function searching(attrId, searchValue) {
            // 	$rootScope.$broadcast('datagrid.search', {
            // 		attrId: attrId,
            // 		searchValue: searchValue
            // 	});
            // }

            //          scope.searchOnColumn = function(attrId, searchValue) {
            //              searching(attrId, searchValue);
            //          }

            //          scope.searchReset = function() {
            //              searching(null, '');
            //          }

            function showData(records) {
                scope.tableColumns = DataFactory.tableColumns;
                scope.filterFields = _.filter(scope.tableColumns, function (col) {
                    return col.name;
                });

                var group = _.groupBy(records, 'groupKey');
                var groupRecords = [];
                for (var key in group) {
                    groupRecords.push({
                        tableColumns: angular.copy(scope.tableColumns),
                        key: key,
                        records: group[key] });

                }
                groupRecords = _.sortBy(groupRecords, 'key');
                scope.groupRecords = groupRecords;

                scope.filtering = false;
            }

            scope.filterData = function () {
                //[{attrId: 1, searchValue: 2}]
                var searchConditionList = [];
                for (var prop in scope.resultFilter) {
                    if (scope.resultFilter[prop]) {
                        searchConditionList.push({
                            attrId: prop,
                            searchValue: scope.resultFilter[prop] });

                    }
                }
                $rootScope.$broadcast('datagrid.search', searchConditionList);
            };

            scope.resetFilterData = function () {
                scope.resultFilter = {};
                $rootScope.$broadcast('datagrid.search', []);
            };

        } };

}]);
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
    var exports = {};

    var baseUrl = "http://10.80.9.9/services/v1/";

    var excludeColumns = [
    "Office Name",
    "Office Code",
    "Office City",
    "Office State",
    "Market Location City",
    "Market Location State",
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
        var requestUrl = baseUrl + "marketLocations";
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

    exports.getMarketTypesPromise = function () {
        var defered = $q.defer();
        var requestUrl = baseUrl + "marketTypes";
        if (exports[requestUrl]) {
            exports.marketTypes = angular.copy(exports[marketTypes]);

            defered.resolve([exports.marketTypes]);
        } else {
            BaseFactory.getRequest(requestUrl, function (data, status, headers, config) {
                exports.marketTypes = data;
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
                } else {
                    queryStr = "q=";
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

    exports.getReportDataPromise = function (reportName, queryParams) {
        return getDataPromise("reports", reportName, queryParams);
    };

    exports.getMarketLocationDataPromise = function (marketLocation, queryParams) {
        return getDataPromise("marketLocations", marketLocation, queryParams);
    };

    exports.getMarketTypeDataPromise = function (marketType, queryParams) {
        return getDataPromise("marketTypes", marketType, queryParams);
    };

    return exports;
}]);
app.controller('mainController', ["$scope", "$rootScope", "DataFactory", "$q", "$timeout", function ($scope, $rootScope, DataFactory, $q, $timeout) {


}]);
app.constant('COLLECTION_FREQUENCY', {
    DAILY: "daily",
    WEEKLY: "weekly",
    MONTHLY: "monthly",
    YEARLY: "yearly" }).


constant('DEFAULT_SORT_COL', 'report_date').
constant('DATE_FORMAT', 'MM/DD/YYYY');