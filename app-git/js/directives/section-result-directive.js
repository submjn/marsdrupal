(function ($) {
    app.directive('sectionResult',function($parse, DataFactory, $timeout, $rootScope){
        return {
            restrict : 'E',
            replace : true,
            templateUrl: 'templateCache/section-result.tmpl.html',
            scope: {
                dataModel: '='
            },
            link: function(scope, elem, attrs){
                function toggleAccordion(event, collapsed) {
                    var collapseTarget = $($(event.currentTarget).data('target'))
                    if(collapsed) {
                        collapseTarget.slideUp(300);
                    } else {
                        collapseTarget.slideDown(300);
                    }

                }

                scope.toggleHeading = function(event) {
                    scope.collapse = !scope.collapse;
                    toggleAccordion(event, scope.collapse);
                }

                scope.filterCollapse = true;
                scope.toggleHeadingFilter = function(event) {
                    scope.filterCollapse = !scope.filterCollapse;
                    toggleAccordion(event, scope.filterCollapse);
                }

                scope.tableOptions = {
                    pageSize: 10,
                    pageIndex: 0,
                    showPageSize: true,
                    searching: true,
                    info: true,
                    paging: true,
                    ordering: true,
                    isAddControlColumn: true
                };

                scope.resultFilter = {};

                scope.toggleCollapseGroup = function(group) {
                    group.collapsed = !group.collapsed;
                }

                scope.toggleCollapseAll = function() {
                    scope.collapsed = !scope.collapsed;
                    _.forEach(scope.groupRecords, function(group) {
                        group.collapsed = scope.collapsed;
                    });
                }

                scope.$on('data.filter', function(event, filter){
                    scope.filtering = true;

                    var queryParams = {};
                    if(filter.marketLocationState) {
                        queryParams.market_location_state = filter.marketLocationState;
                    }
                    if(filter.marketLocation) {
                        queryParams.market_location = filter.marketLocation;
                    }

                    if(filter.commodity) {
                        DataFactory.getCommodityDataPromise(filter.commodity, queryParams)
                            .then(function(commodityData) {
                                console.log("commodityData", commodityData);
                                showData(commodityData);
                            });

                    } else if(filter.office) {
                        DataFactory.getOfficeDataPromise(filter.office, queryParams)
                            .then(function(officeData) {
                                console.log("officeData", officeData);
                                showData(officeData);
                            });

                    } else if(filter.report) {
                        DataFactory.getReportDataPromise(filter.report, queryParams)
                            .then(function(reportData) {
                                console.log("reportData", reportData);
                                showData(reportData);
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
                    scope.filterFields = _.filter(scope.tableColumns, function(col) {
                        return col.name;
                    });

                    var group = _.groupBy(records, 'groupKey');
                    var groupRecords = [];
                    for(var key in group) {
                        groupRecords.push({
                            tableColumns: angular.copy(scope.tableColumns),
                            key: key,
                            records: group[key]
                        })
                    }
                    groupRecords = _.sortBy(groupRecords, 'key');
                    scope.groupRecords = groupRecords;

                    scope.filtering = false;
                }

                scope.filterData = function() {
                    //[{attrId: 1, searchValue: 2}]
                    var searchConditionList = [];
                    for(var prop in scope.resultFilter) {
                        if(scope.resultFilter[prop]) {
                            searchConditionList.push({
                                attrId: prop,
                                searchValue: scope.resultFilter[prop]
                            });
                        }
                    }
                    $rootScope.$broadcast('datagrid.search', searchConditionList);
                }

                scope.resetFilterData = function() {
                    scope.resultFilter = {};
                    $rootScope.$broadcast('datagrid.search', []);
                }

            }
        };
    });
})(jQuery);