'use strict';

var app = angular.module('mainApp');
app.directive("uiDateFilter", ['$compile', '$timeout', function($compile, $timeout){
	return {
		restrict: "E",
		templateUrl: "app/core/views/uiDateFilter.html",
		replace: true,
		scope: {
			filter: '='
		},
		link: function($scope, element, attrs){

			$scope.Year = (new Date()).getFullYear();
			$scope.months = [,,,,,,,,,,,];
			var selectMonth = function(){
				if (!$scope.filter.showMonth)
					return
				$scope.months = [,,,,,,,,,,,];
				if (!$scope.startValue || !$scope.endValue)
					return
				var f = decodeDate($scope.startValue, app.lang.l.formats.date);
				var l = decodeDate($scope.endValue, app.lang.l.formats.date);
				var lastDay = lastDayOfMonth($scope.endValue, app.lang.l.formats.date).getDate();
				if (!!f && !!l && f.day == 1 && l.day == lastDay && f.month == l.month && f.year == l.year && f.year == $scope.Year)
					$scope.months[f.month] = 'active';
			}

			$scope.lang = app.lang;



			var f = $scope.$parent.$parent.config.findField($scope.filter.field);
			try{
				$scope.displayLabel = app.lang.l["res_" + $scope.$parent.$parent.config.path]["fields"][f.name] || f.displayLabel || f.name;
			}catch(err){
				try{
					$scope.displayLabel = f.displayLabel || f.name;
				}catch(err){
					$scope.displayLabel = f.name;
				}
			}

			if (!!app.lang.l["languageCode"] && app.lang.l["languageCode"] != 'en'){
				$.fn.datetimepicker.dates[app.lang.l["languageCode"]] = {
				    days: app.lang.l["dates"]["days"],
				    daysShort: app.lang.l["dates"]["daysShort"],
				    daysMin: app.lang.l["dates"]["daysMin"],
				    months: app.lang.l["dates"]["months"],
				    monthsShort: app.lang.l["dates"]["monthsShort"],
				    today: app.lang.l["dates"]["today"],
				    meridiem: ''
				};
			}


			$scope.dataFormat = app.lang.l.formats.date;
			$scope.dataMask = app.lang.l.masks.date || '99/99/9999';
			$scope.lastValidStartDate = null;
			$scope.startValueError = '';
			$scope.endValueError = '';

			var init = function(){
				$scope.startGroup = $(element).find('.start-date');
				var input = '<input class="form-control" ng-model="startValue" ng-blur="onStartExit()" type="text" id="input_start_' + $scope.filter.name + '" placeholder="' + app.lang.l.edtStartDateFilter + '" ng-readonly="readOnly" mask="' + $scope.dataMask + '"></input><a role="button" class="btn btn-default input-group-addon add-on"> <i class="fa fa-calendar"></a>';
				$scope.startGroup.append($compile(input)($scope));
				$scope.startGroup.datetimepicker({
					language: app.lang.l.languageCode || 'en',
					pickTime: false,
					pickDate: true,
					format: $scope.dataFormat,
				});
				$scope.startPicker = $scope.startGroup.data('datetimepicker');
				$scope.startPicker.setDate(null);
				$scope.startGroup.on('changeDate', function(ev){
					var oldValue;
					if (!!$scope.startValue && isDate($scope.startValue, app.lang.l.formats.date))
						oldValue = $scope.startValue;
					var newValue;
					if (ev.date)
						newValue = formatDate(convertLocalDateToUTCDate(ev.date), app.lang.l.formats.date);
					if ((!oldValue && !!newValue) || (!!oldValue && !newValue) || (oldValue && newValue && (newValue !== oldValue))){
						if ($scope.startPicker.viewMode == 0 && !$scope.startPicker.pickingTime())
							$scope.startPicker.hide();
						$timeout(function(){
							$scope.startGroup.find('input').trigger('input');
							$scope.startGroup.find('input').trigger('change');
						});
					}
				});

				$scope.endGroup = $(element).find('.end-date');
				var input = '<input class="form-control" ng-model="endValue" ng-blur="onEndExit()" type="text" id="input_start_' + $scope.filter.name + '" placeholder="' + app.lang.l.edtEndDateFilter + '" ng-readonly="readOnly" mask="' + $scope.dataMask + '"></input><a role="button" class="btn btn-default input-group-addon add-on"> <i class="fa fa-calendar"></a>';
				$scope.endGroup.append($compile(input)($scope));
				$scope.endGroup.datetimepicker({
					language: app.lang.l["languageCode"] || 'en',
					pickTime: false,
					pickDate: true,
					format: $scope.dataFormat,
				});
				$scope.endPicker = $scope.endGroup.data('datetimepicker');
				$scope.endPicker.setDate(null);
				$scope.endGroup.on('changeDate', function(ev){
					var oldValue;
					if (!!$scope.startValue && isDate($scope.endValue, app.lang.l.formats.date))
						oldValue = $scope.endValue;
					var newValue;
					if (ev.date)
						newValue = formatDate(convertLocalDateToUTCDate(ev.date), app.lang.l.formats.date);
					if ((!oldValue && !!newValue) || (!!oldValue && !newValue) || (oldValue && newValue && (newValue !== oldValue))){
						if ($scope.endPicker.viewMode == 0 && !$scope.endPicker.pickingTime())
							$scope.endPicker.hide();
						$timeout(function(){
							$scope.endGroup.find('input').trigger('input');
							$scope.endGroup.find('input').trigger('change');
						});
					}
				});
			}

			$scope.$watch('startValue', function(newValue, oldValue){
				if (!$scope.startPicker)
					return
				if (isDate(newValue, app.lang.l.formats.date)) {
					var d = new Date(getDateFromFormat(newValue, app.lang.l.formats.date));
					$scope.startPicker.setDate(convertUTCDateToLocalDate(d));
					$scope.lastValidStartDate = d;
					selectMonth();
				} else if (!newValue)
					selectMonth();
			});



			$scope.onStartExit = function(){
				if (!$scope.startValue) {
					$scope.lastValidStartDate = null;
				} else if (!isDate($scope.startValue, app.lang.l.formats.date)) {
					if (!!$scope.lastValidStartDate)
						$scope.startValue = formatDate($scope.lastValidStartDate, app.lang.l.formats.date);
					else
						$scope.startValue = null;
				}
			}


			$scope.$watch('endValue', function(newValue, oldValue){
				if (!$scope.endPicker)
					return
				if (isDate(newValue, app.lang.l.formats.date)) {
					var d = new Date(getDateFromFormat(newValue, app.lang.l.formats.date));
					$scope.endPicker.setDate(convertUTCDateToLocalDate(d));
					$scope.lastValidEndDate = d;
					selectMonth();
				} else if (!newValue)
					selectMonth();
			});

			$scope.onEndExit = function(){
				if (!$scope.endValue) {
					$scope.lastValidEndDate = null;
				} else if (!isDate($scope.endValue, app.lang.l.formats.date)) {
					if (!!$scope.lastValidEndDate)
						$scope.endValue = formatDate($scope.lastValidEndDate, app.lang.l.formats.date);
					else
						$scope.endValue = null;
				}
			}

			$scope.monthClick = function(m){
				var d = new Date($scope.Year, m - 1, 1);
				$scope.startValue = encodeDate($scope.Year, m, 1, app.lang.l.formats.date);
				$scope.endValue = formatDate(lastDayOfMonth(d), app.lang.l.formats.date);
				$scope.$parent.$parent.filter();
			}

			$scope.yearClick = function(){
				$scope.startValue = encodeDate($scope.Year, 1, 1, app.lang.l.formats.date);
				$scope.endValue = encodeDate($scope.Year, 12, 31, app.lang.l.formats.date);
				$scope.$parent.$parent.filter();
			}

			$scope.decYear = function(){
				$scope.Year--;
				selectMonth();
			}

			$scope.incYear = function(){
				$scope.Year++;
				selectMonth();
			}

			$scope.filter.clearFilter = function(){
				$scope.filter.used = false;
				$scope.startValue = '';
				$scope.endValue = '';
				$scope.startValueError = '';
				$scope.endValueError = '';
			}

			$scope.filter.execFilter = function(){
				$scope.filter.used = false;
				$scope.startValueError = '';
				$scope.endValueError = '';
				if (!$scope.startValue && !$scope.endValue)
					return
				if (!$scope.startValue && !!$scope.endValue){
					$scope.startValueError = "has-error";
					return
				}
				if (!!$scope.startValue && !$scope.endValue){
					$scope.endValueError = "has-error";
					return
				}
				if (!isDate($scope.startValue, $scope.dataFormat))
					$scope.startValueError = "has-error";
				if (!isDate($scope.endValue, $scope.dataFormat))
					$scope.endValueError = "has-error";
				if ($scope.startValueError || $scope.endValueError)
					return

				$scope.filter.startValue = new Date(getDateFromFormat($scope.startValue, app.lang.l.formats.date));
				$scope.filter.endValue = new Date(getDateFromFormat($scope.endValue, app.lang.l.formats.date));

				if ($scope.filter.startValue > $scope.filter.endValue)
					$scope.endValueError = "has-error";
				if (!!$scope.startValueError || !!$scope.endValueError)
					return;
				$scope.filter.startValue = formatDate($scope.filter.startValue, 'yyyy-MM-dd');
				$scope.filter.endValue = formatDate($scope.filter.endValue, 'yyyy-MM-dd');
				$scope.filter.used = true;
			}

			var initialize = function(){
				if (isDate($scope.filter.startValue, 'yyyy-MM-dd'))
					$scope.startValue = formatDate(new Date(getDateFromFormat($scope.filter.startValue, 'yyyy-MM-dd')), app.lang.l.formats.date);
				if (isDate($scope.filter.endValue, 'yyyy-MM-dd'))
					$scope.endValue = formatDate(new Date(getDateFromFormat($scope.filter.endValue, 'yyyy-MM-dd')), app.lang.l.formats.date);

				if (!($scope.startValue && $scope.endValue))
					$scope.filter.clearFilter();
				else
					selectMonth();
			}
			$timeout(init);
			if ($scope.filter.used)
				initialize();
			else
				$scope.filter.clearFilter();
		}
	}
}]);