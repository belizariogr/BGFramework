'use strict';

var app = angular.module('mainApp');
app.directive("uiDateFilter", ['$compile', '$timeout', ($compile, $timeout) => {
	return {
		restrict: "E",
		template: '\
	<div class="filter date-filter"><div class="row"><div class="caption col-md-12">{{::displayLabel}}</div></div><div class="row month-container" ng-show="filter.showMonth"><div class=year>\
	<div class="btn-year minus"><a ng-click=decYear() href><i class="fa fa-chevron-left"></i> </a> </div><div class=year-number> <a ng-click=yearClick() href>{{Year}}</a> </div>\
	<div class="btn-year plus"> <a ng-click=incYear() href> <i class="fa fa-chevron-right"></i> </a> </div></div></div><div class=row><div class="months col-md-12" ng-show="filter.showMonth">\
	<div class={{months[1]}}><a ng-click=monthClick(1) href>{{::lang.l.dates.months[0]}}</a></div><div class="{{months[2]}} mid"><a ng-click=monthClick(2) href>{{::lang.l.dates.months[1]}}</a></div>\
	<div class={{months[3]}}><a ng-click=monthClick(3) href>{{::lang.l.dates.months[2]}}</a></div><div class={{months[4]}}><a ng-click=monthClick(4) href>{{::lang.l.dates.months[3]}}</a></div>\
	<div class="{{months[5]}} mid"><a ng-click=monthClick(5) href>{{::lang.l.dates.months[4]}}</a></div><div class={{months[6]}}><a ng-click=monthClick(6) href>{{::lang.l.dates.months[5]}}</a></div>\
	<div class={{months[7]}}><a ng-click=monthClick(7) href>{{::lang.l.dates.months[6]}}</a></div><div class="{{months[8]}} mid"><a ng-click=monthClick(8) href>{{::lang.l.dates.months[7]}}</a></div>\
	<div class={{months[9]}}><a ng-click=monthClick(9) href>{{::lang.l.dates.months[8]}}</a></div><div class={{months[10]}}><a ng-click=monthClick(10) href>{{::lang.l.dates.months[9]}}</a></div>\
	<div class="{{months[11]}} mid"><a ng-click=monthClick(11) href>{{::lang.l.dates.months[10]}}</a></div><div class={{months[12]}}><a ng-click=monthClick(12) href>{{::lang.l.dates.months[11]}}</a></div>\
	</div></div><form><div class=row><div class="col-md-12 filter-dates"><div class="start-date input-group {{startValueError}} row"><ui-input-date-time label-size="0" field-id="filter_{{id}}_start" value="startValue" placeholder="{{::startPlaceholder}}" type="date"></ui-input-date-time>\
	</div><div class="end-date input-group {{endValueError}} row"><ui-input-date-time label-size="0" field-id="filter_{{id}}_end" value="endValue" placeholder="{{::endPlaceholder}}" type="date"></ui-input-date-time>\
	</div></div></div><div class=row ng-show="startValueError || endValueError"><div class="col-md-6 filter-alert alert alert-danger">{{::lang.l.msgInvalidPeriod}}</div></div></form></div>',
		replace: true,
		scope: {
			filter: '='
		},
		link: ($scope, element, attrs) => {
			$scope.Year = (new Date()).getFullYear();
			$scope.months = [,,,,,,,,,,,];

			$scope.selectMonth = () => {
				if (!$scope.filter.showMonth)
					return
				$scope.months = [,,,,,,,,,,,];
				if (!$scope.startValue || !$scope.endValue)
					return
				let f = decodeDate($scope.startValue, app.lang.l.formats.date);
				let l = decodeDate($scope.endValue, app.lang.l.formats.date);
				let lastDay = lastDayOfMonth($scope.endValue, app.lang.l.formats.date).getDate();
				if (!!f && !!l && f.day == 1 && l.day == lastDay && f.month == l.month && f.year == l.year && f.year == $scope.Year)
					$scope.months[f.month] = 'active';
			}

			$scope.lang = app.lang;
			$scope.id = $scope.filter.name ||  $scope.filter.field || "";
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

			element.find('input').on("keyup", e => {
				if (e.which === 13)
					$scope.$parent.$parent.filter();
			});

			$scope.startPlaceholder = app.lang.l.edtStartDateFilter;
			$scope.endPlaceholder = app.lang.l.edtStartDateFilter;

			$scope.dataFormat = app.lang.l.formats["date"] || 'MM/dd/yyyy'
			$scope.monthClick = m => {
				var d = new Date($scope.Year, m - 1, 1);
				$scope.startValue = encodeDate($scope.Year, m, 1, app.lang.l.formats.date);
				$scope.endValue = formatDate(lastDayOfMonth(d), app.lang.l.formats.date);
				$scope.$parent.$parent.filter();
			}

			$scope.yearClick = () => {
				$scope.startValue = encodeDate($scope.Year, 1, 1, app.lang.l.formats.date);
				$scope.endValue = encodeDate($scope.Year, 12, 31, app.lang.l.formats.date);
				$scope.$parent.$parent.filter();
			}

			$scope.decYear = () => {
				$scope.Year--;
				$scope.selectMonth();
			}

			$scope.incYear = () => {
				$scope.Year++;
				$scope.selectMonth();
			}

			$scope.filter.clearFilter = () => {
				$scope.Year = (new Date()).getFullYear();
				$scope.filter.used = false;
				$scope.startValue = '';
				$scope.endValue = '';
				$scope.startValueError = '';
				$scope.endValueError = '';
			}

			$scope.filter.setStartValue = (v) => {
				$scope.startValue = formatDate(v, app.lang.l.formats.date);
				$scope.filter.startValue = formatDate(v, 'yyyy-MM-dd');
			}

			$scope.filter.setEndValue = (v) => {
				$scope.endValue = formatDate(v, app.lang.l.formats.date);
				$scope.filter.endValue = formatDate(v, 'yyyy-MM-dd');
			}

			$scope.$watch('startValue', (n, o) => {$scope.selectMonth();});
			$scope.$watch('endValue', (n, o) => {$scope.selectMonth();});

			$scope.filter.execFilter = () => {
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

				$scope.filter.startValue = parseDate($scope.startValue, app.lang.l.formats.date);
				$scope.filter.endValue = parseDate($scope.endValue, app.lang.l.formats.date);
				if ($scope.filter.startValue > $scope.filter.endValue)
					$scope.endValueError = "has-error";
				if (!!$scope.startValueError || !!$scope.endValueError)
					return;
				$scope.filter.startValue = formatDate($scope.filter.startValue, 'yyyy-MM-dd');
				$scope.filter.endValue = formatDate($scope.filter.endValue, 'yyyy-MM-dd');
				$scope.filter.used = true;
				$scope.selectMonth();
			}

			var initialize = () => {
				if (isDate($scope.filter.startValue, 'yyyy-MM-dd'))
					$scope.startValue = formatDate(parseDate($scope.filter.startValue, 'yyyy-MM-dd'), app.lang.l.formats.date);
				if (isDate($scope.filter.endValue, 'yyyy-MM-dd'))
					$scope.endValue = formatDate(parseDate($scope.filter.endValue, 'yyyy-MM-dd'), app.lang.l.formats.date);
				if (!($scope.startValue && $scope.endValue))
					$scope.filter.clearFilter();
				else
					$scope.selectMonth();
			}

			if ($scope.filter.used)
				initialize();
			else
				$scope.filter.clearFilter();
		}
	}
}]);