app.directive('sectionFilter',function($parse, DataFactory, $q, $timeout, $rootScope){
	return {
        restrict : 'E',
        replace : true,
		templateUrl: 'templateCache/section-filter.tmpl.html',
        scope: {
        	dataModel: '='
        },
		link: function(scope, elem, attrs){
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
		    scope.filter = {
		    	commodityType: 'Commodity',
		    	commodity: null,
		    	office: null,
		    	report: null,
		        reportFromDate: new Date(),
		        reportToDate: new Date(),
		        period: null
		    };
		    scope.reportMaxDate = new Date();

		    scope.getData = function() {
		    	console.log('filter:', scope.filter);
		    	if(isFilterValid()) {
		    		$rootScope.$broadcast('data.filter', scope.filter);
		    	}
		    }

		    scope.clearFilter = function() {
			    scope.filter = {
			    	commodity: null,
			    	office: null,
			    	report: null,
			        reportFromDate: new Date(),
			        reportToDate: new Date(),
			        period: null
			    };
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

		    /*************************INIT CODE*****************************************/
		    $q.all([
		        DataFactory.getCommoditiesPromise(),
		        DataFactory.getOfficesPromise(),
		        DataFactory.getReportsPromise()

		    ]).then(function(data){
		        console.log('Get all data success');
		        scope.commodities = DataFactory.commodities;
		        scope.offices = DataFactory.offices;
		        scope.reports = DataFactory.reports;

		        $timeout(function() {
		            elem.find('select[chosen]').chosen({ disable_search_threshold: 5, search_contains:true });
		        }, 500, false);

		    }).catch(function(err){
		        throw err;
		    })
		}
	};
});