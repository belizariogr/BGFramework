'use strict';

var app = angular.module('mainApp');
app.directive("uiInputCombo", function(){
	return {
		restrict: "E",
		template: '<div class="edit-row default-focus"><div class="col-md-{{::labelSize}}"><label for="{{::fieldId}}" class="edit-row-label">{{::label}}</label></div><div class="edit-row-input col-md-{{::editSize}}"><select class="form-control" id="{{::fieldId}}" ng-model="value" ng-readonly="readOnly"><option ng-repeat="opt in options track by $index" value="{{::opt.value}}">{{::opt.text}}</option></select></div></div>',
		replace: true,
		scope: {
			fieldId: '@',
			field: '@',
			value: '=',
			size: '@',
			readOnly: '@'
		},
		link: function($scope, element, attrs){
			$scope.labelSize = $scope.labelSize || 3;
			$scope.editSize = $scope.size || 12 - $scope.labelSize;
			var f = $scope.$parent.config.findField($scope.field);
			try{
				$scope.label = app.lang.l["res_" + $scope.$parent.config.path].fields[f.name] || f.displayLabel || f.name;
			}catch(err){
				try{
					$scope.label = f.displayLabel || f.name;
				}catch(err){
					$scope.label = f.name;
				}
			}
			if (f.required)
				$scope.label += '*';

			if (f.fieldType == "bool"){
				$scope.options = [];
				if (!f.required)
					$scope.options.push({value: "", text: ""});
				try {$scope.trueText = app.lang.l.formats.trueText || 'True';} catch(e) {$scope.trueText = 'True';}
				try {$scope.falseText = app.lang.l.formats.falseText || 'False';} catch(e) {$scope.falseText = 'False';}
				$scope.options.push({value: "T", text: $scope.trueText});
				$scope.options.push({value: "F", text: $scope.falseText });
			} else {
				$scope.options = angular.copy(f.options);
				if (!f.required)
					$scope.options.unshift({value: "", text: ""})
				$scope.options.forEach(function(i){
					try {
						i.text = app.lang.l["res_" + $scope.$parent.$parent.config.path].options[f.name][i.value] || i.text;
					}catch(err){}
				});
			}
		}
	}
});