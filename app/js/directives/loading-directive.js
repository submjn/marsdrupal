app.directive('loading',   ['$http' ,function ($http)
    {
        return {
            restrict: 'E',
            templateUrl : 'templateCache/loading.tmpl.html',
            link: function (scope, elm, attrs) {

                scope.isLoading = function () {
                    if(!$http.pendingRequests.length)
                        return false;
                    return !_.find($http.pendingRequests, {"hideLoading": true});
                };

                scope.$watch(scope.isLoading, function (v)
                {
                    if(v){
                        elm.show();
                    }else{
                        elm.hide();
                    }
                });
            }
        };

    }]);

app.directive('backTop', function(){
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="back-to-top"><i class="fa fa-chevron-up"></i></div>',
        link: function($scope, element, attrs) {

            $(window).scroll(function(){

                if ($(window).scrollTop() <= 0) {
                    $(element).fadeOut();
                }
                else {
                    $(element).fadeIn();
                }

            });

            $(element).on('click', function(){
                $('html, body').animate({ scrollTop: 0 }, 'fast');
            });

        }
    };
});