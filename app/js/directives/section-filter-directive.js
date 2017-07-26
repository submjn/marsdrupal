app.directive('sectionFilter',function($parse, DataFactory, $q, $timeout, $rootScope, CommonFactory){
	return {
        restrict : 'E',
        replace : true,
		templateUrl: 'templateCache/section-filter.tmpl.html',
        scope: {
        	dataModel: '='
        },
		link: function(scope, elem, attrs){

			function getInitFilterObj() {
				return {
			    	commodityType: 'Commodity',
			    	commodity: null,
			    	office: null,
			    	report: null,
			    	marketLocationState: null,
			    	marketLocation: null,
			        reportFromDate: new Date(),
			        reportToDate: new Date(),
			        period: null
			    };	
			}

		    scope.toggleHeading = function(event) {
		        scope.collapse = !scope.collapse;
		        var collapseTarget = $($(event.currentTarget).data('target'))
		        if(scope.collapse) {
		            collapseTarget.slideUp(300);
		        } else {
		            collapseTarget.slideDown(300);
		        }
		    }

		    scope.commodityTypes = ['Commodity', 'Office', 'Report'];
		    scope.states = [];
		    scope.periods = [
		        {
		            value: 0, name: "Annual"
		        }
		    ];
		    scope.filter = getInitFilterObj();
		    scope.reportMaxDate = new Date();

		    scope.getData = function() {
		    	console.log('filter:', scope.filter);
		    	if(isFilterValid()) {
		    		$rootScope.$broadcast('data.filter', scope.filter);
		    	}
		    }

		    scope.clearFilter = function() {
			    scope.filter = getInitFilterObj();
                $timeout(function(){
                	elem.find('select[chosen]').trigger('chosen:updated');
                });
		    }

		    function isFilterValid() {
		    	var errMessages = [];
		    	if(scope.filter.commodityType == 'Commodity' && !scope.filter.commodity) {
		    		errMessages.push('Commodity is required.');

		    	} else if(scope.filter.commodityType == 'Office' && !scope.filter.office) {
		    		errMessages.push('Office is required.');

		    	} else if(scope.filter.commodityType == 'Report' && !scope.filter.report) {
		    		errMessages.push('Report is required.');

		    	}

		    	if(scope.filter.reportFromDate > scope.filter.reportToDate) {
		    		errMessages.push('Report From Date must be before the Report To Date.');
		    	}
		    	scope.errMessages = errMessages;
		    	return !errMessages.length;
		    }

		    function prePopulateData() {
		    	var queryCommodity = CommonFactory.getParameterByName('sel-commodity');
		    	var queryState = CommonFactory.getParameterByName('sel-state');

		    	var state = _.find(scope.marketLocationStates, function(st) {
		    		return st == queryState;
		    	});
		    	if(state) {
		    		scope.filter.marketLocationState = state;
		    	}

		    	var commodity = _.find(scope.commodities, function(com) {
		    		return com.commodity == queryCommodity;
		    	});
		    	
		    	if(commodity) {
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
		        DataFactory.getMarketLocationsPromise()

		    ]).then(function(data){
		        console.log('Get all data success');
		        scope.commodities = DataFactory.commodities;
		        scope.offices = DataFactory.offices;
		        scope.reports = DataFactory.reports;
		        scope.marketLocationStates = DataFactory.marketLocationStates;
		        scope.marketLocations = DataFactory.marketLocations;

		        $timeout(function() {
		            elem.find('select[chosen]').chosen({ disable_search_threshold: 5, search_contains:true });
		        }, 500, false);

		        prePopulateData();

		    }).catch(function(err){
		        throw err;
		    })
		}
	};
});