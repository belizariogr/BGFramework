'use strict';

var app = angular.module('mainApp');
app.directive("uiInputDateTime", ['$compile', '$timeout', 'TextMaskService', ($compile, $timeout, TextMaskService) => {
	return {
		restrict: "E",
		template: '<div class="edit-row {{errors[fieldName] ? \'has-error\': \'\'}}"><div ng-if="labelSize > 0" class="edit-row-label-{{::labelSize}}"><label for="{{::fieldId}}" class="edit-row-label">{{::label}}</label></div><div class="edit-row-input"><div class="input-group form_date date {{::fieldId}}" data-format="{{dataFormat}}">\
			<input inputmode="numeric" class="form-control" ng-blur="onInputExit()" type="text" id="{{::fieldId}}" placeholder="{{::placeholder}}" ng-readonly="readOnly"></input><a role="button" class="btn btn-default input-group-addon add-on"> <i class="fa fa-{{::type == \'time\' ? \'clock\' : \'calendar\'}}"></a></div></div></div>',
		replace: true,
		scope: {
			fieldId: '@',
			fieldName: '@',
			value: '=',
			labelSize: '@',
			readOnly: '@',
			placeholder: '@',
			type: '@',
		},
		link: ($scope, element, attrs) => {
			$scope.labelSize = $scope.labelSize || 3;
			$scope.label = $scope.fieldName;
			$scope.errors = $scope.$parent.errors;
			$scope.fieldId = $scope.fieldId || ("input_" + $scope.fieldName);
			$scope.type = $scope.type || 'datetime';
			if ($scope.fieldName){
				$scope.f = $scope.$parent.config.findField($scope.fieldName);
				if (!$scope.f)
					return;
				try{
					$scope.placeholder = $scope.placeholder || app.lang.l["res_" + $scope.$parent.config.path].fields[$scope.f.name] || $scope.f.displayLabel || $scope.f.name;
				}catch(err){
					$scope.placeholder = $scope.placeholder || $scope.f.displayLabel || $scope.f.name;
				};
				$scope.label = $scope.placeholder + ($scope.f.required ? '*' : '');
				var validTypes = new Set(['date', 'time', 'datetime']);
				if (validTypes.has($scope.f.dataType.toLowerCase()))
					$scope.type = $scope.f.dataType.toLowerCase();
			}
			$scope.input = element.find('input');

			$scope.dataFormat = app.lang.l.formats[$scope.type] || 'MM/dd/yyyy hh:mm:ss a';
			$scope.dataMask = app.lang.l.masks[$scope.type] || '99/99/9999 99:99:99 AA';

			var init = () => {
				if (!!app.lang.l.languageCode && app.lang.l.languageCode != 'en'){
					$.fn.datetimepicker.dates[app.lang.l.languageCode] = {
							days: app.lang.l.dates.days,
							daysShort: app.lang.l.dates.daysShort,
							daysMin: app.lang.l.dates.daysMin,
							months: app.lang.l.dates.months,
							monthsShort: app.lang.l.dates.monthsShort,
							today: app.lang.l.dates.today,
							meridiem: ''
					}
				};

				element.datetimepicker({
					language: app.lang.l["languageCode"] || 'en',
					pickTime: $scope.type == 'datetime' || $scope.type == 'time',
					pickDate: $scope.type == 'datetime' || $scope.type == 'date',
					pick12HourFormat: app.lang.l.formats["24Hour"] != 'true',
					format: $scope.dataFormat,
				});
				$scope.picker = element.data('datetimepicker');
				$scope.picker.onHide = (e) => {
					if (!e || $scope.picker.getBtn(e))
						$timeout(() => {$scope.input[0].focus();}, 50);
				};
				$scope.picker.setDate(null);
			}

			$scope.getNewStrValue = (v, c) => {
				if (!v)
					return;
				if (c < v.length)
					v = deleteStr(v, c, 1);
				return TextMaskService.formatText(v, $scope.dataMask);
			}

			$scope.cursorHelper = e => {
				let sel = getSelection($scope.input[0]);
				var len = 0;
				var newLen = 0;
				let changed = false;
				$($scope.input[0]).val((i, v) => {
					if (v == $scope.strValue)
						return v;
					changed = true;
					len = v ? v.length : 0;
					v = $scope.getNewStrValue(v, sel);
					newLen = v ? v.length : 0;
					$scope.$apply(() => $scope.strValue = v);
					return v;
				});
				if (!!changed){
					if (newLen > len)
						setCaret($scope.input[0], sel + 1);
					else
						setCaret($scope.input[0], sel);
				}
				$scope.moveCaret(1);
			};

			$scope.getInputVal = () => {
				let val;
				$($scope.input[0]).val((i, v) => val = v || "");
				return val;
			}

			$scope.moveCaret = (d, c) => {
				let sel = getSelection($scope.input[0]);
				let val = $scope.getInputVal();
				if (c == undefined)
				  c = 0;
				val = val.substring(sel + c, sel + 1 + c);
				if (hasSpecialChars(val))
					setCaret($scope.input[0], Math.max(sel + d + c, 0));
				else
					setCaret($scope.input[0],  Math.max(sel + c, 0));
			}

			$scope.eventHelper = e => {
				if (!!e && ("" + e.type).toLowerCase() == "keyup"){
					if (e.key.toLowerCase() == "arrowleft")
						$scope.moveCaret(-1);
					else if (e.key.toLowerCase() == "backspace"){
						let sel = getSelection($scope.input[0]);
						let val = ($scope.strValue || "").length;
						if (sel != val)
							$scope.moveCaret(-1, -1);
					}
				} else
					$scope.cursorHelper();
			}

			$($scope.input[0]).bind("click input paste keyup mouseup", e => {$scope.eventHelper(e);});
			$($scope.input[0]).on("keydown", e => {
				if (e.which === 8){
					let sel = getSelection($scope.input[0]);
					let val = ($scope.strValue || "").length;
					if (sel != val)
						e.preventDefault();
				} else if(e.which === 46)
					e.preventDefault();
			});
			$($scope.input[0]).on("focus", (evt) => {setCaret($scope.input[0], 0); $timeout(() => setCaret($scope.input[0], 0))});

			$scope.$watch(scope => scope.value, (newValue, oldValue) => {
				if (!$scope.picker)
					return;
				$scope.strValue = $scope.value;
				if (isDate(newValue, $scope.dataFormat))
					$scope.picker.setDate(getDateFromFormat(newValue, $scope.dataFormat))
				else
					$scope.picker.setDate(null)
			});

			$scope.$watch(scope => scope.strValue, (newValue, oldValue) => {
				if (!$scope.picker)
					return;
				if (isDate($scope.strValue, $scope.dataFormat)){
					$scope.picker.setDate(getDateFromFormat($scope.strValue, $scope.dataFormat));
					$scope.value = $scope.strValue;
				}
			});

			element.on('changeDate', ev => {
				if (!$scope.picker.isShowing)
					return;
				var oldValue;
				if (!!$scope.value && isDate($scope.value, $scope.dataFormat))
					oldValue = $scope.value;
				var newValue;
				if (ev.date)
					newValue = formatDate(convertLocalDateToUTCDate(ev.date), $scope.dataFormat);
				if ((!oldValue && !!newValue) || (!!oldValue && !newValue) || (oldValue && newValue && (newValue !== oldValue))){
					$scope.value = newValue;
					$timeout(() => {
						element.find('input').trigger('input');
						element.find('input').trigger('change');
					});
				}
				if ($scope.picker.viewMode == 0 && !$scope.picker.pickingTime())
					$scope.picker.hide();
			});

			$scope.onInputExit = () => {
				let v = $scope.getInputVal();
				if (v != $scope.strValue)
					$scope.strValue = v;
				let d = isDate(v, $scope.dataFormat);
				if (!$scope.value === null){
					$scope.value = undefined;
				} else if (!d){
					$scope.picker.setDate(new Date());
					$scope.picker.setDate(null);
					$scope.value = null;
				}
			}
			init();
		}
	}
}]);