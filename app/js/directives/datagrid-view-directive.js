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
app.directive('datagridView', function dataGridView($timeout, $rootScope, CommonFactory, DEFAULT_SORT_COL){
	return {
		restrict: 'E',
		templateUrl: 'templateCache/datagrid-view.tmpl.html',
		scope: {
			tableColumns: '=',
			tableData: '=',
			tableOptions: '=',
            searchControlId: '='
		},
		link: function(scope, element){
            $timeout(function(){
                var $marsTooltip = element.find('.mars-tooltip:not(.tooltipstered)');
                $marsTooltip.tooltipster();
            }, 0, false);
		},
		controller: function($scope){
			$scope.tableOptions.pageSize += "";

            $scope.rowState = {}; //Object as dictionary, key is id, value is list of property

			$scope.gridState = {
				records: [],
				search: [],
				order: {
					column: {
                        attrId: DEFAULT_SORT_COL
                    },
					asc: false
				},
				pageSize: $scope.tableOptions.pageSize,
				pageIndex: $scope.tableOptions.pageIndex,
				totalRecords: !$scope.tableData ? 0 : $scope.tableData.length,
                isFiltering: true
			};

            $scope.tableId = CommonFactory.generateUUID();

			$scope.refreshData = refreshData;
			$scope.searchCallBack = searchCallBack;
			$scope.searchReset = searchReset;
			$scope.sort = sort;
            $scope.showChildRow = showChildRow;
            
            $scope.controlChildRowId = 'column-controlled-child-rows';

            var firstLoad = true;

			function refreshData(updateResponsive){
				$timeout(function(){
                    // console.log("Grid " + $scope.tableId + " refreshing");

                    var records = [];
                    var originalRecords = $scope.tableData || [];
                    var selectedIndexFrom = parseInt($scope.gridState.pageIndex == 0 ? 0 : $scope.gridState.pageIndex - 1) * parseInt($scope.gridState.pageSize);

                    selectedIndexFrom = selectedIndexFrom > 0 ? selectedIndexFrom : 0;

                    // order
                    if($scope.gridState.order && $scope.gridState.order.column) {
                        originalRecords = _.sortByOrder(originalRecords, function(record){
                            var property = !$scope.gridState.order.column.attrId ? $scope.gridState.order.column : $scope.gridState.order.column.attrId;
                            var fieldData = record[property];
                            return !fieldData ? null : (fieldData.label ? fieldData.label : fieldData);
                        }, $scope.gridState.order.asc);
                    }

                    // Search
                    if($scope.tableOptions.searching && $scope.gridState.search && $scope.gridState.search.length > 0) {
                        _.forEach($scope.gridState.search, function(searchCon){
                            if(searchCon.column){
                                originalRecords = _.filter(originalRecords, function(record){
                                    var recordValue = record[searchCon.column.attrId];
                                    recordValue = !recordValue ? null : (!recordValue.id ? recordValue : recordValue.label);

                                    return recordValue && (recordValue+"").toLowerCase().indexOf(searchCon.text.toLowerCase()) >= 0;
                                })
                            } else{
                                originalRecords = _.filter(originalRecords, function(record){
                                    for(var prop in record.customObject) {
                                        if(record.customObject.hasOwnProperty(prop)) {
                                            var recordValue = record.customObject[prop].label;
                                            if(recordValue && (recordValue+"").toLowerCase().indexOf(searchCon.text.toLowerCase()) >= 0) {
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
                    _.forEach(originalRecords, function(record, index) {
                        if(index >= selectedIndexFrom && index < selectedIndexTo) {
                            records.push(record);
                        }
                    });

                    $scope.gridState.totalRecords = !originalRecords ? 0 : originalRecords.length;
                    $scope.gridState.records = records;
                    
                    $scope.gridState.isFiltering = false;

                    if(updateResponsive) {
                        updateResponsiveView();
                    }
                });
			}

			function searchReset(){
				$scope.gridState.search = [];
				refreshData(true);
			}

            //[{attrId: 1, searchValue: 2}]
            function searchCallBack(searchConditionList){
                $scope.gridState.search = [];
                
                _.forEach(searchConditionList, function(searchCon) {
                    $scope.gridState.search.push({
                        column : _.find($scope.tableColumns, {'attrId': searchCon.attrId}),
                        text: searchCon.searchValue
                    });
                });

                refreshData(true);
            }

			function sort(column){
				if(!sortable(column)) return;
				if(!$scope.gridState.order.column) $scope.gridState.order.column = {};
				$scope.gridState.order.asc = $scope.gridState.order.column.attrId == column.attrId ? !$scope.gridState.order.asc : true;
				$scope.gridState.order.column = column;
				refreshData(true);
			}

            function sortable(column){
            	if(column.attrId == $scope.controlChildRowId)
            		return false;
            	return true;
            }

            function showChildRow(record){
                var recordId = record.id;
                if($scope.rowState[recordId] === undefined) {
                    $scope.rowState[recordId] = {
                        showingChildRow: true
                    };

                } else {
                    $scope.rowState[recordId].showingChildRow = !$scope.rowState[recordId].showingChildRow;
                }
            }

            function setAllColumnsShowinOneLine() {
                _.forEach($scope.tableColumns, function(col, index){
                	if(col.attrId != $scope.controlChildRowId) {
                    	col.isFirstRow = true;
                	} else {
                        col.isFirstRow = false;
                    }
                });
            }

            function updateResponsiveView() {
                setAllColumnsShowinOneLine();
                $timeout(function(){
                    var $table = $("#" + $scope.tableId);

                    var wrapperClass = $scope.tableOptions.wrapperClass ? $scope.tableOptions.wrapperClass : "dataTables_wrapper";
                    var expectedWidth = $table.closest("." + wrapperClass).width();
                    if(!expectedWidth) {
                        return;
                    }

                    var currentWidth = 0;
                    var controlChildCellWidth = 30;
                    var secondRowCols = [];

                    var lastColOfFirstRowIndex = -1;
                    _.forEach($scope.tableColumns, function(col, index){
                        var thId = $scope.tableId + '__' + col.attrId;
                        if(currentWidth <= expectedWidth) { 
                            currentWidth += $("#" + thId).outerWidth();
                            lastColOfFirstRowIndex = index;

                        } else {
                            secondRowCols.push(angular.copy(col));
                            col.isFirstRow = false;
                        }

                    });

                    if(currentWidth > expectedWidth && !secondRowCols.length) {
                        lastColOfFirstRowIndex = $scope.tableColumns.length - 1;
                    }

                    if(lastColOfFirstRowIndex >= 0 && currentWidth > expectedWidth) {
                        while(currentWidth + controlChildCellWidth > expectedWidth) {
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
                    $scope.firstRowLength = _.countBy($scope.tableColumns, function(col){
                        return col.isFirstRow;
                    })[true];

                    var controlCol = _.find($scope.tableColumns, {'attrId':  $scope.controlChildRowId});
                    if(controlCol) {
                        if($scope.secondRowCols.length > 0) {
                            controlCol.isFirstRow = true;
                        } else {
                            controlCol.isFirstRow = false;
                        }
                    }
                });
            }


            /******EVENT HANDLING BEGIN********/

            if($scope.tableOptions.searching) {
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
            $(window).resize(function() {
                var newWidth = $(window).width();
                if (existingWidth != newWidth) {
                    existingWidth = newWidth;
                    updateResponsiveView();
                };
            });
		}

	}
})