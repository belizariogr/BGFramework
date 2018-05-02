'use strict';

var app = angular.module('mainApp');
app.directive("uiInputCombo", ['$timeout', function($timeout){
	return {
		restrict: "E",
		//template: '',
		templateUrl: "app/core/views/uiInputCombo.html",
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
			$scope.label = $scope.field;
			$scope.lang = app.lang;
			$scope.f = $scope.$parent.config.findField($scope.field);
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
				if (!$scope.f.required)
					$scope.options.push({value: "", text: ""});
				try {$scope.trueText = app.lang.l.formats.trueText || 'True';} catch(e) {$scope.trueText = 'True';};
				try {$scope.falseText = app.lang.l.formats.falseText || 'False';} catch(e) {$scope.falseText = 'False';};
				$scope.options.push({value: "true", text: $scope.trueText});
				$scope.options.push({value: "false", text: $scope.falseText});
			} else {
				$scope.options = angular.copy($scope.f.options);
				if (!$scope.f.required)
					$scope.options.unshift({value: "", text: ""});
				$scope.options.forEach(function(i){
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
			$scope.itemIndex = -1;
			$scope.items = $scope.options;

			$scope.setValue = function(option){
				$scope.value = option.value;
				$scope.text = option.text;
			}

			$scope.isMenuVisible = function(){
				return $scope.menu.is(':visible');
			};

			$scope.setCaret = function(){
				$scope.input.focus();
				$scope.input.select();
			};

			$scope.scrollToItem = function(moving){
				if (moving == 1) {
					var p = $scope.menu.find("#combo-item-" + $scope.selected.value);
					var offset = p.position() ? (p.position().top + $scope.menu.scrollTop()) : 0;
					if (p.position().top < 0)
						$scope.menu[0].scrollTop = offset;
					else if (p.position().top >= $scope.menu.height())
						$scope.menu[0].scrollTop = offset - $scope.menu.height() + p.outerHeight();
				} else if (moving == 2) {
					var p = $scope.menu.find("#combo-item-" + $scope.selected.value);
					var offset = p.position() ? (p.position().top + $scope.menu.scrollTop()) : 0;
					if (p.position().top >= $scope.menu.height())
						$scope.menu[0].scrollTop = offset - $scope.menu.height() + p.outerHeight();
					else if (p.position().top < 0)
						$scope.menu[0].scrollTop = offset;
				} else
					$scope.menu[0].scrollTop = $scope.itemOffset - 64;
			};

			$scope.setSelected = function(option, apply){
				if ($scope.selected)
					$scope.selected.sel = "";
				$scope.selected = option;
				if (apply)
					$scope.$apply(function(){ $scope.selected.sel = "selected";	});
				else
					$scope.selected.sel = "selected";
			};

			$scope.selectValue = function(){
				if (!$scope.value && $scope.selected)
					$scope.selected.sel = "";
				if (!$scope.selected)
					return;
				if (!$scope.selected.value == $scope.value)
					return;
				var s = $scope.items.filter(function(f){return f.value == ($scope.value || "")});
				if (s.length)
					$scope.setSelected(s[0], true);
			};

			$scope.openMenu = function(){
				if (!$scope.isMenuVisible()){
					element.find('.btn-toggle').click();
					$scope.selectValue();
					$scope.scrollToItem();
				}
			};

			$scope.closeMenu = function(){
				if ($scope.isMenuVisible())
					element.click();
				$scope.isButtonClick = false;
			};

			$scope.mouseMove = function(i){
				if (i == $scope.selected)
					return;
				$scope.setSelected(i);
			};

			$scope.select = function(i){
				if (!i)
					return;
				$scope.isItemClick = false;
				$scope.isSelectItem = true;
				$timeout(function(){
					$scope.setValue(i);
					$scope.setCaret();
					$scope.changeCount = 0;
					$scope.filterItems(0);
				})
			};

			$scope.mouseDownItem = function(){
				$scope.isItemClick = true;
			};

			$scope.mouseDownBtn = function(){
				$scope.isButtonClick = true;
			};

			$scope.onExit = function(){
				if (!$scope.isItemClick && !$scope.isButtonClick){
					var o = $scope.options.filter(function(f){return f.text.toLowerCase() == $scope.text.toLowerCase()});
					if (o.length > 0)
						$scope.setValue(o[0]);
					else {
						o = $scope.options.filter(function(f){return f.value == $scope.value});
						if (o.length > 0)
							$scope.setValue(o[0]);
					}
					$scope.closeMenu();
				}
			};

			$scope.btnClick = function(e){
				if (!$scope.isMenuVisible()){
					$timeout(function(){
						$scope.openMenu();
						$scope.setCaret();
						$scope.isButtonClick = false;
					});
				} else
					$timeout(function(){
						$scope.setCaret();
						$scope.isButtonClick = false;
					});
			};

			$scope.valueChange = function(){
				if ($scope.f.dataType == "bool"){
					if (($scope.value + "").toLowerCase() === "true")
						$scope.text = $scope.trueText;
					else if (($scope.value + "").toLowerCase() === "false" || $scope.f.required)
						$scope.text = $scope.falseText;
				} else {
					var o = $scope.items.filter(function(f){return f.value == $scope.value});
					if (o.length > 0){
						$scope.text = o[0].text || $scope.value;
						$scope.setSelected(o[0]);
						var p = $scope.menu.find("#combo-item-" + $scope.selected.value).position();
						$scope.itemOffset = p ? (p.top + $scope.menu.scrollTop()) : 0;
					}
				}
			};

			$scope.filterItems = function(c){
				if ($scope.text == "" && $scope.items != $scope.options)
					$timeout(function(){
						$scope.items = $scope.options;
						$scope.setSelected($scope.items[0]);
					}, 10);
				else
					$timeout(function(){
						if (c < $scope.changeCount)
							return;
						$scope.changeCount = 0;
						$scope.items = $scope.options.filter(function(i){ return i.text.toLowerCase().indexOf($scope.text.toLowerCase()) !== -1 });
						if ($scope.items.length > 0)
							$scope.setSelected($scope.items[0]);
					}, 250)
			};

			$scope.textChange = function(){
				if ($scope.isSelectItem) {
					$scope.isSelectItem = false;
					return;
				}
				$scope.isSelectItem = false;
				$scope.changeCount += 1;
				$scope.filterItems($scope.changeCount);

				var focused = $(':focus');
				if (focused.length && focused[0] == $scope.input[0] && !$scope.isButtonClick)
					$timeout(function(){ $scope.openMenu();	});
			};

			$scope.$watch('value', function(newValue, oldValue) { $scope.valueChange();	});
			$scope.$watch('text', function(newValue, oldValue) { $scope.textChange(); });

			$scope.selectPrior = function(){
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

			$scope.selectNext = function(){
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

			element.bind("keydown keypress", function(event) {
				if(event.which === 13){
					if (!$scope.isMenuVisible())
						return;
					if ($scope.selected && $scope.items.length > 0){
						$scope.isButtonClick = true;
						$scope.$apply(function(){ $scope.setValue($scope.selected); });
						$scope.setCaret();
						$scope.closeMenu();
					}
					event.preventDefault();
				} else if(event.which === 27){
					$scope.isButtonClick = true;
					if ($scope.value != null && $scope.value != undefined)
						$scope.selectValue();
					$scope.$apply(function(){ $scope.setValue($scope.selected); });
					$scope.setCaret();
					if (!$scope.isMenuVisible()){
						$scope.isButtonClick = false;
						return;
					}
					$scope.closeMenu();
					event.preventDefault();
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

			$scope.selectValue();
		}
	}
}]);