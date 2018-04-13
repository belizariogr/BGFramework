'use strict';

var app = angular.module('mainApp');
app.directive("uiDataViewer", ['$timeout', '$location', '$routeParams', '$compile', function($timeout, $location, $routeParams, $compile){

	var fieldByName = function(fields, fieldName){
		var f = fields.filter(function(f){
			return f.name.toLowerCase() == fieldName.toLowerCase();
		});
		return f[0];
	}


	var linker = function($scope, element, attrs){
		if (!$scope.config.api)
			$scope.config.api = app.restAPI;
		$scope.lang = app.lang;
		$scope.firstLoad = true;

		$scope.config.findField = function(fieldName){
			var f = $scope.fields.filter(function(f){
				return f.name.toLowerCase() == fieldName.toLowerCase();
			});
			return f[0];
		};

		var readStates = function(){
			try{
				return JSON.parse(localStorage.getItem("states_" + $scope.config.path)) || {};
			} catch(err){
				return {};
			}
		}

		var writeStates = function(states){
			localStorage.setItem("states_" + $scope.config.path, JSON.stringify(states));
		}

		var saveState = function(result){
			var states = readStates();
			var filters = [];
			if ($scope.filters){
				$scope.filters.forEach(function(f){
					if (f.used){
						var filter = {name: f.name};
						if (f.value){
							filter.value = f.value;
						}
						else if (f.startValue){
							filter.startValue = f.startValue;
							if (f.endValue)
								filter.endValue = f.endValue;
						}
						filters.push(filter);
					}
				});
			}
			states[$scope.config.path] = {
				sortField: $scope.sortField,
				sortDirection: $scope.sortDirection,
				page: $scope.page,
				showFilters: $scope.showFilters,
				result: result || false,
				filters: filters
			}
			writeStates(states);
		}

		var loadState = function(){
			var states = readStates();
			if (!!states){
				var state = states[$scope.config.path];
				if (!!state){
					$scope.firstLoad = false;
					$scope.sortField = state.sortField;
					$scope.page = state.page;

					if ($scope.sortField) {
						$scope.sortDirection = state.sortDirection;
						$scope.fields.forEach(function(f){
							if (f.name.toLowerCase() == $scope.sortField.toLowerCase()){
								f.direction = $scope.sortDirection || 'asc';
							}
						});
					}

					if (state.filters && state.filters.length > 0){
						$scope.filtered = false;
						$scope.filters.forEach(function(f){
							state.filters.forEach(function(s){
								if (f.name.toLowerCase() == s.name.toLowerCase()){
									if (s.value){
										$scope.filtered = true;
										f.used = true;
										f.value = s.value;
									}
									else if (s.startValue){
										$scope.filtered = true;
										f.used = true;
										f.startValue = s.startValue;
										if (s.endValue)
											f.endValue = s.endValue;
									}
								}
							});
						});
					}
					if (state.showFilters && $scope.filtered)
						$timeout(function(){
							openFilters();
						});
				}
			}
		}

		var getErrorMsg = function(errorCode, error){
			var msg;
			try{
				if (!!app.lang.l["res_" + $scope.config.path].errors[errorCode])
					msg = app.lang.l["res_" + $scope.config.path].errors[errorCode]
				else
					msg = error.message || error || app.lang.l.msgSaveError;
			}catch(err){
				if (!!error){
					if (!!error.message)
						msg = error.message
					else
						msg.error
				}
				else
					msg = app.lang.l.msgSaveError;
			}
			return msg;
		}

		$scope.editId = false;
		if ($routeParams.id == 'new')
			$scope.editId = -1
		else {
			try{
				$scope.editId = Number(atob($routeParams.id));
			}
			catch(err){
				$scope.editId = false;
			}
		}

		$scope.getTemplateUrl = function(){
			if (!!attrs.template)
				return attrs.template;
			else if (!$scope.editId) {
				return "app/core/views/uiDataViewer.html"
			}
			else{
				return "app/core/views/uiDataEdit.html";
			}
		}

		var prepareRecords = function(dataset, $scope, operation){
			dataset.rows.forEach(function(rec){
				var props = Object.keys(rec);
				props.forEach(function(p){
					var f = $scope.config.findField(p);
					if (f){
						switch (f.fieldType){
							case "date":
								rec[p] = formatDate(new Date(rec[p]), app.lang.l.formats.date);
								break;
							case "time":
								rec[p] = formatDate(new Date(rec[p]), app.lang.l.formats.time);
								break;
							case "datetime":
								rec[p] = formatDate(new Date(rec[p]), app.lang.l.formats.datetime);
								break;
							case "float":
								if (operation == 'browse')
								rec[p] = formatNumber(rec[p] + "", f.format, app.lang.l.formats)
								break;
						}

					}
				});
				if ($scope.config.onPrepareRecord)
					$scope.config.onPrepareRecord(rec, $scope, operation);
			});
		}


		if ($scope.editId){
			$scope.editPath = 'resources/' + $scope.config.path + '/edit.html';
			if ($scope.editId === -1){
				$scope.operation = 1;
				$scope.rec = {};
				if (!!$scope.config.newRecord)
					$scope.config.newRecord($scope, $scope.rec);
				$scope.editTitle = app.lang.l.insertTitle;
			}
			else {
				$scope.operation = 2;
				$scope.editTitle = app.lang.l.editTitle;
			}

			var load = function(){
				$scope.dataLoading = true;
				$timeout(function(){if($scope.dataLoading)$scope.showEditDim = true;}, 200);
				$scope.config.api.get($scope.config.editResource + '/' + $scope.editId, $scope.config.publicResource).then(
					function(res){
						$scope.dataLoading = false;
						if (!!res.data) {
							$scope.rec = res.data;
							var dataset = {rows: []};
							dataset.rows.push($scope.rec);
							prepareRecords(dataset, $scope,'edit');
							if ($scope.config.afterLoad){
								$scope.config.afterLoad(dataset, $scope);
							}
						}
						else {
							$scope.rec = {};
							$scope.showEditError = true;
							$scope.editErrorMsg = app.lang.l.msgLoadingErrorGrid || "Cannot load data.";
							$scope.errorLoading = true;
						}
						$scope.showEditDim = false;
					},
					function(res){
						$scope.rec = {};
						dataLoading = false;
						$scope.showEditDim = false;
						$scope.showEditError = true;
						$scope.errorLoading = true;
						$scope.editErrorMsg = app.lang.l.msgLoadingErrorGrid || "Cannot load data.";
					}
				);
			}
			if ($scope.editId !== -1){
				if ($scope.config.onEditLoad){
					$scope.config.onEditLoad($scope, null, $scope.editId)
				}
				else
					load();
			}

			$scope.cancel = function(){
				var states = readStates();
				writeStates(states);
				$location.path($scope.config.path);
			}
		}
		else {
			$scope.visibleFields = $scope.fields.filter(function(e, i, a){
				return !e.hide;
			});

			$scope.editResource = $scope.editResource || $scope.listResource;
			$scope.gotoPage = 1;
			$scope.searchCriteria = "";
			var searchValues = "";
			$scope.page = 1;
			$scope.sortField = "";
			$scope.showGoto = false;
			$scope.checkedAll = false;
			$scope.itemClicked = false;
			$scope.showData = true;
			$scope.dataset = {};
			$scope.clean = true;
			if ($scope.config.editStyle !== "modal")
				loadState();


			$scope.itemCheckClick = function(){
				$scope.itemClicked = true;
				$scope.checkedAll = false;
				$timeout(function(){$scope.itemClicked = false;});
			}

			$scope.$watch('checkedAll', function(value){
				if (!$scope.itemClicked && !$scope.clean){
					$scope.dataset.rows.forEach(function(i){
						i.checked = value;
					});
				}
			});

			$scope.sort = function(field){
				if (!field.sortable)
					return;
				$scope.fields.forEach(function(f){
					if (f !== field && f.sortable){
						f.direction = 'both';
					}
				});

				switch (field.direction){
					case 'asc':
						field.direction = 'desc';
						$scope.sortField = field.name ;
						$scope.sortDirection = "desc";
						break;
					case 'desc':
						field.direction = 'both';
						$scope.sortField = "";
						$scope.sortDirection = "";
						break;
					default:
						field.direction = 'asc';
						$scope.sortDirection = "";
						$scope.sortField = field.name;
				}
				$scope.refresh($scope.page);
			}

			$scope.search = function(q){
				q = encodeURIComponent(q.trim());
				if (!q){
					if (searchValues == "")
						return
					searchValues = "";
				}
				else if (!!$scope.config.getSearch){
					searchValues = $scope.config.getSearch(q);
				}
				else {
					searchValues = "";
					$scope.fields.forEach(function(f){
						if (f.searchable){
							searchValues += (searchValues == "" ? "" : "|") + f.name;
						}
					});
					searchValues += q;
				}
				$scope.page = 1;
				$scope.refresh($scope.page);
			}

			var load = function(page, reload){
				if (!!$scope.config.beforeLoad)
					$scope.config.beforeLoad($scope)
				$scope.dataLoading = true;
				if (!reload)
					$scope.dataset.loading = true;
				$timeout(function(){
					if (!$scope.dataLoading)
						return;
					if (reload)
						$scope.dataset.showDim = true;
				}, 200);

				var filterValue = '';
				if ($scope.filters){
					$scope.filters.forEach(function(f){
						var filterStr = '';
						if (f.used){
							if (f.value)
								filterStr = f.field + '=' + f.value;
							else if (f.startValue){
								filterStr = f.field + '=' + f.startValue;
								if (f.endValue)
									filterStr += '|' + f.endValue;
							}
							filterValue += (filterValue ? '&' : '') + filterStr;
						}
					});
				}

				var conditions = "";

				if (!!searchValues)
					conditions += searchValues;
				if (!!$scope.extraValues)
					conditions += (conditions && $scope.extraValues ? '&' : '') + $scope.extraValues;
				if (!!filterValue)
					conditions += (conditions && filterValue ? '&' : '') + filterValue;
				$scope.config.api.get($scope.config.listResource, $scope.config.publicResource, $scope.config.pagination ? page : false, $scope.sortField, $scope.sortDirection, conditions).then(
					function(res){
						if (!!res.data && !!res.data.rows && res.data.rows.length > 0) {
							if (res.data.page > res.data.pagecount){
								$scope.page = res.data.pagecount;
								$scope.refresh($scope.page);
								return
							}
							else if (res.data.page < 1){
								$scope.page = 1;
								$scope.refresh(1);
								return
							}
							$scope.dataset = res.data;
							$scope.clean = false;
							$scope.page = $scope.dataset.page;
							$scope.gotoPage = page;
							$scope.dataLoading = false;
							$scope.dataset.error = false;
							$scope.dataset.loading = false;
							$scope.dataset.showDim = false;
							createPages();
							prepareRecords($scope.dataset, $scope, 'browse');
							if ($scope.config.afterLoad){
								$scope.config.afterLoad($scope.dataset, $scope);
							}
						}
						else {
							$scope.clean = true;
							$scope.dataset.pagecount = 0;
							$scope.dataset.rows = [];
							$scope.dataLoading = false;
							$scope.dataset.error = false;
							$scope.dataset.loading = false;
							$scope.dataset.showDim = false;
						}
					},
					function(res){
						$scope.dataset.rows = [];
						$scope.clean = true;
						$scope.dataLoading = false;
						$scope.dataset.error = true;
						$scope.dataset.loading = false;
						$scope.dataset.showDim = false;
						$scope.dataset.pagecount = 0;
					}
				);
			}

			$scope.refresh = function(page){
				load(page, true);
				$scope.checkedAll = false;
			}

			$scope.filter = function(aux){
				var hasFilterUsed = false;
				if (!aux){
					$scope.filters.forEach(function(f){
						f.execFilter();
						if (f.used)
							hasFilterUsed = true;
					});
				}
				if (hasFilterUsed || (!hasFilterUsed && $scope.filtered)){
					$scope.filtered = hasFilterUsed;
					load(1, true);
					$scope.checkedAll = false;
					saveState();
				}
			};

			$scope.clearFilters = function(){
				$scope.filters.forEach(function(f){
					f.clearFilter();
				});
				$scope.filter(true);
			}

			var selections = function(){
				var sel = [];
				if (!!$scope.dataset && !!$scope.dataset.rows){
					$scope.dataset.rows.forEach(function(i){
						if (i.checked){
							var rec = {};
							$scope.fields.forEach(function(f){
								if (f.primaryKey)
									rec[f.name] = i[f.name];
							});
							sel.push(rec);
						}
					});
				}
				return sel;
			}

			$scope.delete = function(){
				var sel = selections();
				var msg = {title: app.lang.l.msgDeleteTitle}
				if (sel.length == 0){
					msg.text = app.lang.l.msgDeleteNoSelect;
					msg.buttons = 'ok';
				}
				else {
					msg.text = app.lang.l.msgDeleteText;
					msg.buttons = 'delete;cancel';
					msg.delete = function(){
						$scope.config.api.delete($scope.config.editResource, $scope.config.publicResource, sel).then(
							function(res){
								$scope.refresh($scope.page);
							},
							function(res){
								$timeout(function(){
									msg.text = app.lang.l.msgDeleteError || "Error deleting records.";
									msg.buttons = 'ok';
									app.messageBox(msg);
								}, 1000)

							}
						);
					}
				}
				app.messageBox(msg);
			}

			var createPages = function(){
				var first = 1;
				var last = 5;
				if ($scope.dataset.pagecount > 5) {
					if ($scope.page + 2 <= $scope.dataset.pagecount && $scope.page - 2 > 1) {
						last = $scope.page + 2
						first = $scope.page - 2;
					}
					else if ($scope.page + 2 >= $scope.dataset.pagecount) {
						last = $scope.dataset.pagecount;
						first = $scope.dataset.pagecount - 4;
					}
				}
				else
					last = $scope.dataset.pagecount;
				var showFirst = first > 1;
				var showLast = last < $scope.dataset.pagecount;
				$scope.showGoto = showFirst || showLast;
				$scope.pages = [];
				if (showFirst)
					$scope.pages.push({first: true, page: 1});
				var idx = 1;
				for (var i = first; i <= last; i++){
					$scope.pages.push({id: idx, page: i, active: (i == $scope.page), hideSM: showFirst && showLast && (idx == 1 || idx == 5) });
					idx++;
				}
				if (showLast)
					$scope.pages.push({last: true, page: $scope.dataset.pagecount});
			}

			$scope.goto = function(page){
				if (page == $scope.page)
					return;
				$scope.refresh(page);
			}

			load($scope.page);

			$scope.insert = function(r){
				if ($scope.config.editStyle == "modal") {
					$scope.operation = 1;
					$scope.rec = {};
					if (!!$scope.config.newRecord)
						$scope.config.newRecord($scope, $scope.rec);
					$scope.showEditError = false;
					$scope.editTitle = app.lang.l.insertTitle;
					$scope.showEditModal = "open";
				}
				else {
					saveState();
					$location.path($scope.config.path + '/new');
				}
			}

			$scope.edit = function(r){

				if ($scope.config.editStyle == "modal") {
					if ($scope.config.onLoad){
						$scope.rec = {};
						$scope.config.onLoad($scope, r);
					}
					else {
						$scope.dataLoading = true;
						$timeout(function(){if($scope.dataLoading)$scope.showEditDim = true;}, 200);
						$scope.errorLoading = false;
						if($scope.config.onGetId)
							var Id = $scope.config.onGetId(r)
						else
							var Id = r.Id;
						$scope.config.api.get($scope.config.editResource + '/' + Id, $scope.config.publicResource).then(
							function(res){
								if (!!res.data) {
									$scope.rec = res.data;
									var dataset = {rows: []};
									dataset.rows.push($scope.rec);
									prepareRecords(dataset, $scope, 'edit');
									if ($scope.config.afterLoad)
										$scope.config.afterLoad(dataset, $scope);
								}
								else {
									$scope.rec = {};
									$scope.showEditError = true;
									$scope.editErrorMsg = app.lang.l.msgLoadingErrorGrid || "Cannot load data.";
									$scope.errorLoading = true;
								}
								$scope.dataLoading = false;
								$scope.showEditDim = false;
							},
							function(res){
								$scope.rec = {};
								$scope.dataLoading = false;
								$scope.showEditDim = false;
								$scope.showEditError = true;
								$scope.errorLoading = true;
								$scope.editErrorMsg = app.lang.l.msgLoadingErrorGrid || "Cannot load data.";
							}
						);
					}
					$scope.showEditError = false;
					$scope.showEditModal = "open";
					$scope.operation = 2;
					$scope.editTitle = app.lang.l.editTitle;
				}
				else {
					saveState(true);
					if($scope.config.onGetId)
						var Id = $scope.config.onGetId(r)
					else
						var Id = r.Id;

					$location.path($scope.config.path + '/' + btoa(Id));
				}
			}
		}

		$scope.save = function(){
			var msg = "";
			if (!!$scope.config.validateRecord)
				msg = $scope.config.validateRecord($scope.rec);
			if (!!msg){
				$scope.editErrorMsg = msg;
				$scope.showEditError = true;
				return
			}

			var r = angular.copy($scope.rec);
			if (r.$options)
				delete(r.$options);
			for (var field in r){
				var f = fieldByName($scope.fields, field);
				if (f){
					if (f.fieldType && (f.fieldType.toLowerCase() == 'date' || f.fieldType.toLowerCase() == 'time' ||f.fieldType.toLowerCase() == 'datetime')){
						if (!!r[field])
							r[field] = convertUTCDateToLocalDate(new Date(getDateFromFormat(r[field], app.lang.l.formats[f.fieldType.toLowerCase()])));
						else
							r[field] = null;
					}
				}
			}

			$scope.dataLoading = true;
			$timeout(function(){if($scope.dataLoading)$scope.showEditDim=true;});
			var res;
			if ($scope.operation == 1)
				res = $scope.config.api.post($scope.config.editResource, $scope.config.publicResource, r);
			else
				res = $scope.config.api.put($scope.config.editResource, $scope.config.publicResource, r);

			res.then(
				function(res){
					if ($scope.config.editStyle === "modal"){
						$scope.dataLoading = false;
						$scope.showEditDim = false;
						$scope.showEditModal = "close";
						$scope.refresh($scope.page);
					}
					else {
						var states = readStates();
						states[$scope.config.path].result = true;
						writeStates(states);
						$location.path($scope.config.path);
					}
				},
				function(res){
					var error;
					if (!!res.data)
						error = res.data.error;
					var msg = app.lang.l.msgSaveError;
					if (!!error && res.data.type == 1)
						msg = getErrorMsg(error.code, res.data.error);
					$scope.dataLoading = false;
					$scope.showEditDim = false;
					$scope.showEditError = true;
					$scope.editErrorMsg = msg;
				}
			);
		}

		var openFilters = function(){
			$scope.showFilters = true;
			$(element).find('.filters-container').stop().css('display','block').hide().slideDown();
		}

		var closeFilters = function(){
			$scope.showFilters = false;
			$(element).find('.filters-container').stop().css('display','none').show().slideUp();
			$timeout(function(){
				$scope.clearFilters();
			}, 400);
		}

		$scope.showFiltersBtnClick = function(){
			if (!$scope.filters)
				return;
			if (!$scope.showFilters)
				openFilters();
			else
				closeFilters();
			saveState();
		}

		if ($scope.filters){
			$scope.filters.forEach(function(f){
				f.filter = $scope.filter;
			});

			$scope.filtersCol1 = $scope.filters.filter(function(f){ return f.column == 1; });
			$scope.filtersCol2 = $scope.filters.filter(function(f){ return f.column == 2; });
			$scope.filtersCol3 = $scope.filters.filter(function(f){ return f.column == 3; });
		}

		if ($scope.config.editStyle == "modal"){
			$timeout(function(){
				var code = '<ui-edit-modal></ui-edit-modal>';
				element.append($compile(code)($scope));
			}, 100);
		}
	}

	return {
		restrict: "E",
		template: '<ng-include src="getTemplateUrl()"/>',
		scope: {
			fields: "=",
			dataset: "=",
			config: "=",
			template: "=",
			filters: "=",
		},
		link: linker
	}
}]);
