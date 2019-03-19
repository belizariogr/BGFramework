'use strict';

var app = angular.module('mainApp');
app.directive('includeReplace', [() => {
    return {
        require: 'ngInclude',
        restrict: 'A',
        link: (scope, el, attrs) => el.replaceWith(el.children()),
    };
}]);