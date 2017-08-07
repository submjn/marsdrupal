(function($){
    app.directive('reportForm', function ($parse, DataFactory, $q, $timeout, $rootScope, CommonFactory)
    {
        return {
            restrict: 'E',
            templateUrl : 'templateCache/report-form.tmpl.html',
            link: function (scope, elem, attrs) {

                scope.commodities = [];
                scope.states = [];

                /*************************INIT CODE*****************************************/
                $q.all([
                    DataFactory.getCommoditiesPromise(),
                    DataFactory.getMarketLocationStatesPromise()
                ]).then(function(data){
                    console.log('Get all data success');
                    scope.commodities = DataFactory.commodities;
                    scope.marketLocationStates = DataFactory.marketLocationStates;

                    $timeout(function() {
                        elem.find('select[chosen]').chosen({ disable_search_threshold: 5, search_contains:true })
                        elem.find('select[chosen]').change( function(e){
                            window.location = $(this).val();
                        });
                    }, 500, false);

                }).catch(function(err){
                    throw err;
                });
            }
        };

    });
})(jQuery);