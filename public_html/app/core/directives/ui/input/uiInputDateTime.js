'use strict';

var app = angular.module('mainApp');
app.directive("uiInputDateTime", ['$compile', '$timeout', function($compile, $timeout){
	return {
		restrict: "E",
		template: '<div class="edit-row default-focus"><div class="col-md-{{::labelSize}}"><label for="input_{{::fieldId}}" class="edit-row-label">{{::label}}</label></div><div class="edit-row-input col-md-{{::editSize}}"><div id="{{::fieldId}}" class="input-group form_date date {{::fieldId}}" data-format="{{dataFormat}}"></div></div></div>',
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
				$scope.placeholder = app.lang.l["res_" + $scope.$parent.config.path].fields[f.name] || f.displayLabel || f.name;
			}catch(err){
				try{
					$scope.placeholder = f.displayLabel || f.name;
				}catch(err){
					$scope.placeholder = f.name;
				}
			}
			$scope.label = $scope.placeholder + (f.required ? '*' : '');
			var validTypes = new Set(['date', 'time', 'datetime']);
			$scope.type = 'datetime';
			if (validTypes.has(f.fieldType.toLowerCase()))
				$scope.type = f.fieldType.toLowerCase();
			$scope.dataFormat = app.lang.l.formats[$scope.type];
			$scope.dataMask = app.lang.l.masks[$scope.type] || '99/99/9999 99:99:99';


			var init = function(){
				var input = '<input class="form-control" ng-model="value" ng-blur="onInputExit()" type="text" id="input_' + $scope.fieldId + '" placeholder="' + $scope.placeholder + '" ng-readonly="readOnly" mask="' + $scope.dataMask + '"></input><a role="button" class="btn btn-default input-group-addon add-on"> <i class="fa fa-' + ($scope.type == 'time' ? 'clock-o' : 'calendar') + '"></a>';
				$(element).find('.input-group').append($compile(input)($scope));

				if (!!app.lang.l.languageCode && app.lang.l.languageCode != 'en'){
					$.fn.datetimepicker.dates[app.lang.l.languageCode] = {
					    days: app.lang.l.dates.days,
					    daysShort: app.lang.l.dates.daysShort,
					    daysMin: app.lang.l.dates.daysMin,
					    months: app.lang.l.dates.months,
					    monthsShort: app.lang.l.dates.monthsShort,
					    today: app.lang.l.dates.today,
					    meridiem: ''
					};
				}

				element.datetimepicker({
					language: app.lang.l["languageCode"] || 'en',
					pickTime: $scope.type == 'datetime' || $scope.type == 'time',
					pickDate: $scope.type == 'datetime' || $scope.type == 'date',
					pick12HourFormat: app.lang.l.formats["24Hour"] != 'true',
					format: $scope.dataFormat,
				});
				$scope.picker = element.data('datetimepicker');
				$scope.picker.setDate(null);

				var d = null;
				try {
					if (!!$scope.value)
						d = new Date(getDateFromFormat($scope.value, app.lang.l.formats[f.fieldType.toLowerCase()]));
				} catch(err){
					d = null;
				}
				if (!!d) {
					$scope.picker.setDate(convertUTCDateToLocalDate(d));
				}
				$scope.lastValidDate = d;
			}

			$scope.$watch('value', function(newValue, oldValue) {
				if (!$scope.picker)
					return
				if (isDate(newValue, app.lang.l.formats[f.fieldType.toLowerCase()])) {
					var d = new Date(getDateFromFormat(newValue, app.lang.l.formats[f.fieldType.toLowerCase()]));
					$scope.picker.setDate(convertUTCDateToLocalDate(d));
					$scope.lastValidDate = d;
				}
			});

			element.on('changeDate', function(ev){
				var oldValue;
				if (!!$scope.value && isDate($scope.value, app.lang.l.formats[f.fieldType.toLowerCase()]))
					oldValue = $scope.value;
				var newValue;
				if (ev.date)
					newValue = formatDate(convertLocalDateToUTCDate(ev.date), app.lang.l.formats[f.fieldType.toLowerCase()]);
				if ((!oldValue && !!newValue) || (!!oldValue && !newValue) || (oldValue && newValue && (newValue !== oldValue))){
					$scope.value = newValue;
					if ($scope.picker.viewMode == 0 && !$scope.picker.pickingTime())
						$scope.picker.hide();
					$timeout(function(){
					  element.find('input').trigger('input');
					  element.find('input').trigger('change');
					});
				}

			});

			$scope.onInputExit = function(){
				if (!$scope.value) {
					$scope.lastValidDate = null;
				} else if (!isDate($scope.value, app.lang.l.formats[f.fieldType.toLowerCase()])) {
					if (!!$scope.lastValidDate)
						$scope.value = formatDate($scope.lastValidDate, app.lang.l.formats[$scope.type]);
					else
						$scope.value = null;
				}
			}
			init();
		}
	}
}]);