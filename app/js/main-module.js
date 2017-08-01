var app = angular.module('app', ['ui.bootstrap']);

app.config(function($httpProvider, $compileProvider, $locationProvider) {

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
      requireBase: false
    });

    $locationProvider.html5Mode(true);
});