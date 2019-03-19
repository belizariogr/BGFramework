'use strict';

var app = angular.module('mainApp');
app.directive("uiInputCombo", ['$timeout', '$sce', 'screenSize', ($timeout, $sce, screenSize) => {
	return {
		restrict: "E",
		templateUrl: '/app/core/views/uiInputCombo.html',
		replace: true,
		scope: {
			fieldId: '@',
			fieldName: '@',
			value: '=',
			labelSize: '@',
			readOnly: '@',
			useIcons: '@'
		},

		link: ($scope, element, attrs) => {
			$scope.labelSize = $scope.labelSize || 3;
			$scope.label = $scope.fieldName;
			$scope.fieldId = $scope.fieldId || ("input_" + $scope.fieldName);
			$scope.lang = app.lang;
			$scope.f = $scope.$parent.config.findField($scope.fieldName);
			$scope.errors = $scope.$parent.errors;
			if (!$scope.f) return;
			try{
				$scope.label = app.lang.l["res_" + $scope.$parent.config.path].fields[$scope.f.name] || $scope.f.displayLabel || $scope.f.name;
			}catch(err){
				$scope.label = $scope.f.displayLabel || $scope.f.name;
			};
			if ($scope.f.required)
				$scope.label += '*';

			if ($scope.f.dataType == "bool"){
				$scope.options = [];
				try {$scope.trueText = app.lang.l.formats.trueText || 'True';} catch(e) {$scope.trueText = 'True'};
				try {$scope.falseText = app.lang.l.formats.falseText || 'False';} catch(e) {$scope.falseText = 'False'};
				$scope.options.push({value: 1, text: $scope.trueText});
				$scope.options.push({value: 0, text: $scope.falseText});
			} else {
				if ($scope.f.options === undefined)
					$scope.f.options = [];
				$scope.options = $scope.f.options;
				$scope.options.forEach(i => {
					try {
						i.text = app.lang.l["res_" + $scope.$parent.$parent.config.path].options[$scope.f.name][i.value] || i.text;
					}catch(err){};
				});
			};

			$scope.btnIcon = "down";
			$scope.isExiting = false;
			$scope.input = element.find("input");
			$scope.button = element.find(".input-group-addon");
			$scope.menu = element.find(".combo-menu");
			$scope.combo = element.find("select");
			$scope.mobile = element.find(".mobile");
			$scope.itemIndex = -1;
			$scope.items = $scope.options;
			$scope.filtering = false;

			$scope.setValue = (option, onExit) => {
				if ($scope.options.length == 0)
					return;
				$scope.value = option.value;
				$scope.optionSelected = option;
				if (onExit)
					$scope.valueHelper1 = true;
				$scope.text = option.text;
			}

			$scope.isMenuVisible = () => $scope.menu.is(':visible');
			$scope.isMobile = screenSize.is('xs, sm');
			screenSize.on('xs, sm', isMatch => {
				$scope.isMobile = isMatch;
				$scope.items = $scope.options;
				var o = $scope.items.filter(f => f.value == $scope.value);
				if (o.length > 0){
					$scope.text = o[0].text || $scope.value;
					$scope.strValue = $scope.value + "";
					$scope.setSelected(o[0]);
				}
			});

			$scope.setCaret = () => {
				$scope.input[0].focus();
				$scope.input[0].select();
			};

			$scope.getItemPosition = () => {
				if (!!$scope.selected && !!$scope.selected.value){
					var p = $scope.menu.find("#combo-item-" + $scope.selected.value);
					if (p)
						return {position: p.position(), offset: p ? (p.position().top + $scope.menu.scrollTop()) : 0, outerHeight: p.outerHeight()};
				}
				return {position: 0, offset: 0, outerHeight: 0};
			}

			$scope.scrollToItem = moving => {
				let itemPosition = $scope.getItemPosition();
				var position = itemPosition.position ? (itemPosition.position.top + $scope.menu.scrollTop()) : 0;
				if (moving == 1) {
					if (itemPosition.position.top < 0)
						$scope.menu[0].scrollTop = itemPosition.offset;
					else if (itemPosition.position.top >= $scope.menu.height())
						$scope.menu[0].scrollTop = itemPosition.offset - $scope.menu.height() + itemPosition.outerHeight;
				} else if (moving == 2) {
					if (itemPosition.position.top >= $scope.menu.height())
						$scope.menu[0].scrollTop = itemPosition.offset - $scope.menu.height() + itemPosition.outerHeight;
					else if (itemPosition.position.top < 0)
						$scope.menu[0].scrollTop = itemPosition.offset;
				} else
					$scope.menu[0].scrollTop = position - 64;
			};

			$scope.setSelected = (option, apply) => {
				if ($scope.selected)
					$scope.selected.sel = "";
				$scope.selected = option;
				if (apply)
					$scope.$apply(() => $scope.selected.sel = "selected");
				else
					$scope.selected.sel = "selected";
			};

			$scope.selectValue = (starting) => {
				if (!!$scope.selected) {
					if (($scope.value === undefined || $scope.value === null))
						$scope.selected.sel = "";
					if ($scope.selected.value === $scope.value)
						return;
				}
				var s = $scope.items.filter(f => f.value == ($scope.value || ""));
				if (s.length)
					$scope.setSelected(s[0], !starting);
			};

			$scope.openMenu = () => {
				if (!$scope.isMenuVisible()){
					$scope.items = $scope.options;
					element.find('.btn-toggle').click();
					$scope.selectValue();
					$scope.scrollToItem();
				}
			};

			$scope.closeMenu = () => {
				if ($scope.isMenuVisible())
					element.click();
				$scope.isButtonClick = false;
			};

			$scope.mouseMove = i => {
				if (i == $scope.selected)
					return;
				$scope.setSelected(i);
			};

			$scope.select = i =>{
				if (!i)
					return;
				$scope.isItemClick = false;
				$scope.isSelectItem = true;
				$timeout(() => {
					$scope.setValue(i);
					$scope.setCaret();
					$scope.changeCount = 0;
					$scope.items = $scope.options;
				})
			};

			$scope.mouseDownItem = () => $scope.isItemClick = true;
			$scope.mouseDownBtn = () => $scope.isButtonClick = true;

			$scope.btnClick = e => {
				if (!$scope.isMenuVisible()){
					$timeout(() =>{
						$scope.openMenu();
						$scope.setCaret();
						$scope.isButtonClick = false;
					});
				} else
					$timeout(() => {
						$scope.setCaret();
						$scope.isButtonClick = false;
					});
			};

			$scope.filterItems = c => {
				if (!$scope.filtering)
					return;
				$scope.filtering = false;
				if ($scope.text == "" && $scope.items != $scope.options)
					$timeout(() => {
						$scope.items = $scope.options;
						$scope.setSelected($scope.items[0]);
					}, 10);
				else
					$timeout(() => {
						if (c < $scope.changeCount)
							return;
						$scope.changeCount = 0;
						if (!!$scope.text && !$scope.isMobile){
							let txt = $scope.text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
							$scope.items = $scope.options.filter(i => i.text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").indexOf(txt) !== -1);
						} else
							$scope.items = $scope.options;
						if ($scope.items.length > 0)
							$scope.setSelected($scope.items[0]);
					}, $scope.f.dataType == "bool" ? 0 : 100);
			};

			$scope.onExit = () => {
				if (!$scope.isItemClick && !$scope.isButtonClick){
					if (!!$scope.text){
						var o = $scope.options.filter(f => f.text.toLowerCase() == $scope.text.toLowerCase());
						if (o.length > 0)
							$scope.setValue(o[0], true);
						else {
							o = $scope.options.filter(f => {
								if (typeof f.value == "string")
									return f.value.toLowerCase() == $scope.value.toLowerCase()
								else
									return f.value == $scope.value
							});
							if (o.length > 0)
								$scope.setValue(o[0], true);
						}
					} else {
						if ($scope.f.blankValue !== undefined)
							$scope.value = $scope.f.blankValue
						else
							$scope.value = null;
					}
					$scope.closeMenu();
				}
			};

			$scope.valueChange = () => {
				$scope.valueHelper1 = true;
				$scope.valueHelper2 = true;
				$scope.strValue = $scope.value + '';
				if ($scope.textHelper)
					$scope.valueHelper1 = false;
				if ($scope.strValueHelper)
					$scope.valueHelper2 = false;
				if ($scope.f.dataType == "bool"){
					if ($scope.value === 1){
						$scope.text = $scope.trueText;
						$scope.optionSelected = $scope.options[0];
					} else if ($scope.value === 0 || $scope.f.required){
						$scope.optionSelected = $scope.options[1];
						$scope.text = $scope.falseText;
					}
				} else {
					var o = $scope.items.filter(f => f.value == $scope.value);
					if (o.length > 0){
						$scope.error = undefined;
						$scope.text = o[0].text || $scope.value;
						$scope.optionSelected = o[0];
						$scope.setSelected(o[0]);

					} else {
						$scope.text = '';
						$scope.optionSelected = undefined;
					}
				}
				if ($scope.items != $scope.options)
					$scope.items = $scope.options;
			};

			$scope.strValueChange = () => {
				if (!$scope.isMobile)
					return;
				if ($scope.valueHelper2){
					$scope.valueHelper2 = false;
					return;
				}
				$scope.strValueHelper = true;
				if ($scope.f.dataType == "bool")
					$scope.value = +($scope.strValue);
				else
					$scope.value = $scope.strValue;
			}

			$scope.textChange = () => {
				if ($scope.isMobile)
					return;
				if ($scope.valueHelper1)			{
					$scope.valueHelper1 = false;
					return
				}
				if ($scope.isSelectItem) {
					$scope.isSelectItem = false;
					return;
				}
				$scope.textHelper = true;
				$scope.filtering = true;
				$scope.isSelectItem = false;
				$scope.changeCount += 1;
				$scope.filterItems($scope.changeCount);
				var focused = $(':focus');
				if (focused.length && focused[0] == $scope.input[0] && !$scope.isButtonClick)
					$timeout(() => $scope.openMenu());
			};

			$scope.optionsChange = (newValue, oldValue) => {
				$scope.items = $scope.options;
				$scope.valueChange();
			}

			$scope.$watch(scope => scope.value, (newValue, oldValue) => $scope.valueChange());
			$scope.$watch(scope => scope.text, (newValue, oldValue) => $scope.textChange());
			$scope.$watch(scope => scope.strValue, (newValue, oldValue) => {
				if ($scope.isMobile)
					$scope.strValueChange()
			});
			$scope.$watchCollection(scope => scope.options, (newCol, oldCol, scope) => {
				$scope.optionsChange();
			});

			$scope.selectPrior = () => {
				if ($scope.items.length == 0)
					return;
				var i = $scope.items.indexOf($scope.selected) - 1;
				if (i < 0)
					i = 0;
				if ($scope.selected == $scope.items[i])
					return;
				$scope.setSelected($scope.items[i], true);
				$scope.scrollToItem(1);
			};

			$scope.selectNext = () => {
				if ($scope.items.length == 0)
					return;
				var i = $scope.items.indexOf($scope.selected) + 1;
				if (i > $scope.items.length - 1)
					i = $scope.items.length - 1;
				if ($scope.selected == $scope.items[i])
					return;
				$scope.setSelected($scope.items[i], true);
				$scope.scrollToItem(2);
			};

			$scope.trustAsHtml = string => {
				return $sce.trustAsHtml(string);
			};

			element.bind("keydown keypress", event => {
				if(event.which === 13){
					if (!$scope.isMenuVisible())
						return;
					if ($scope.selected && $scope.items.length > 0){
						$scope.isButtonClick = true;
						$scope.$apply(() => $scope.setValue($scope.selected));
						$scope.setCaret();
						$scope.closeMenu();
					}
					event.preventDefault();
				} else if(event.which === 27){
					$scope.isButtonClick = true;
					if ($scope.value != null && $scope.value != undefined)
						$scope.selectValue();
					$scope.$apply(() => $scope.setValue($scope.selected));
					$scope.setCaret();
					if (!$scope.isMenuVisible())
						$scope.isButtonClick = false;
					else {
						$scope.closeMenu();
						return false;
					}
				} else if (event.which === 38){
					if (!$scope.isMenuVisible())
						$scope.openMenu();
					$scope.selectPrior();
					event.preventDefault();
				} else if (event.which === 40){
					if (!$scope.isMenuVisible())
						$scope.openMenu()
					$scope.selectNext();
					event.preventDefault();
				}
			});
			$scope.selectValue(true);
		}
	}
}]);