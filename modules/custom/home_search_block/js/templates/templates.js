angular.module('app').run(['$templateCache', function($templateCache) {$templateCache.put('templateCache/loading.tmpl.html','<div id="preloader"><div class="loader"><span></span><span></span><span></span><span></span></div></div>');}]);