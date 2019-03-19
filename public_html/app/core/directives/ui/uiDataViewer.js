'use strict';

var app = angular.module('mainApp');
app.directive("uiDataViewer", ['$timeout', '$location', '$routeParams', '$compile', '$sce', 'screenSize', ($timeout, $location, $routeParams, $compile, $sce, screenSize) => {

	var linker = ($scope, element, attrs) => {
		if (!$scope.config.api)
			$scope.config.api = app.restAPI;
		$scope.lang = app.lang;
		$scope.firstLoad = true;
		$scope.element = element;
		$scope.config.listResource = $scope.config.listResource || $scope.config.path;
		$scope.config.editResource = $scope.config.editResource || $scope.config.listResource;
		$scope.fieldByName = (fieldName) => {
			var f = $scope.fields.filter(f => f.name.toLowerCase() == fieldName.toLowerCase());
			return f[0];
		}
		$scope.config.findField = fieldName => $scope.fields.filter(f => f.name.toLowerCase() == fieldName.toLowerCase())[0];
		$scope.getFieldLabel = f => {
			let fieldLabel = f.displayLabel || f.name;
			if (!!app.lang.l['res_' + $scope.config.path] && !!app.lang.l['res_' + $scope.config.path].fields && !!app.lang.l['res_' + $scope.config.path].fields[f.name] )
				fieldLabel = app.lang.l['res_' + $scope.config.path].fields[f.name] || f.displayLabel || f.name;
			return fieldLabel
		};

		$scope.fields.forEach(f => {
			if (!!f.options && Array.isArray(f.options) && (f.options.length > 0) && !!f.options[0].icon && !f.getHtmlValue)
				f.getHtmlValue = (value) => value;
		});

		$scope.errors = {};

		var readStates = () => {
			try {
				return JSON.parse(localStorage.getItem("states_" + $scope.config.path)) || {};
			} catch (err) {
				return {};
			}
		};

		var writeStates = states => localStorage.setItem("states_" + $scope.config.path, JSON.stringify(states));

		var saveState = result => {
			var states = readStates();
			var filters = [];
			if ($scope.filters) {
				$scope.filters.forEach(f => {
					if (f.used) {
						var filter = {
							name: f.name
						};
						if (f.value)
							filter.value = f.value;
						else if (f.startValue) {
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
			};
			writeStates(states);
		}

		var loadState = () => {
			var states = readStates();
			if (!!states) {
				var state = states[$scope.config.path];
				if (!!state) {
					$scope.firstLoad = false;
					$scope.sortField = state.sortField;
					$scope.page = state.page;

					if ($scope.sortField) {
						$scope.sortDirection = state.sortDirection;
						$scope.fields.forEach(f => f.name.toLowerCase() == $scope.sortField.toLowerCase() ? f.direction = $scope.sortDirection || 'asc' : '');
					};

					if (state.filters && state.filters.length > 0) {
						$scope.filters.forEach(f => {
							state.filters.forEach(s => {
								if (f.name.toLowerCase() == s.name.toLowerCase()) {
									if (s.value) {
										f.used = true;
										f.value = s.value;
									} else if (s.startValue) {
										f.used = true;
										f.startValue = s.startValue;
										if (s.endValue)
											f.endValue = s.endValue;
									}
								}
							})
						})
					};
					if (state.showFilters && $scope.filtered)
						$timeout(() => openFilters());
				}
			}
		};

		$scope.clearErrors = () => {
			Object.keys($scope.errors).forEach(key => delete $scope.errors[key]);
		}

		var getErrorMsg = (errorCode, error) => {
			var msg;
			try {
				if (!!app.lang.l["res_" + $scope.config.path].errors[errorCode])
					msg = app.lang.l["res_" + $scope.config.path].errors[errorCode]
				else
					msg = error.message || error || app.lang.l.msgSaveError;
			} catch (err) {
				if (!!error) {
					if (!!error.message)
						msg = error.message
					else
						msg.error
				} else
					msg = app.lang.l.msgSaveError;
			};
			return msg;
		};

		$scope.editId = false;
		if ($routeParams.id == 'new')
			$scope.editId = -1
		else {
			try {
				$scope.editId = Number(atob($routeParams.id));
			} catch (err) {
				$scope.editId = false;
			}
		};

		$scope.getTemplateUrl = () => {
			if (!!attrs.template)
				return attrs.template;
			else if (!$scope.editId)
				return "app/core/views/uiDataViewer.html"
			else
				return "app/core/views/uiDataEdit.html";
		};

		$scope.focusFirstInput = () => {
			if ($scope.errorLoading)
				return;
			if (!isMobileBrowser()) {
				let inputs = $($scope.element).find(".edit-content input");
				if (!!inputs && inputs.length > 0){
					$(inputs[0]).focus();
					if ($(inputs[0]).is('input:text'))
						$timeout(() => $(inputs[0]).select(), 0);
				}
			}
		};

		var prepareRecords = (dataset, $scope, operation) => {
			if ($scope.beforePrepareRecords)
				$scope.beforePrepareRecords(dataset, operation);
			dataset.rows.forEach(rec => {
				var originalRec = angular.copy(rec);
				var props = Object.keys(rec);
				props.forEach(p => {
					var f = $scope.config.findField(p);
					if (f && rec[p] !== null) {
						if (operation == 'browse' && !!f.options){
							rec[p] = $scope.getOptionText(rec[p], f)
						} else {
							switch (f.dataType) {
								case "date":
									rec[p] = formatDate(convertLocalDateToUTCDate(new Date(rec[p])), app.lang.l.formats.date);
									break;
								case "time":
									rec[p] = formatDate(convertLocalDateToUTCDate(new Date(rec[p])), app.lang.l.formats.time);
									break;
								case "datetime":
									rec[p] = formatDate(convertLocalDateToUTCDate(new Date(rec[p])), app.lang.l.formats.datetime);
									break;
								case "float":
									if (operation == 'browse')
										rec[p] = formatNumber(rec[p] + "", f.format, app.lang.l.formats)
									break;
								case "bool":
									if (operation == 'browse') {
										if (typeof rec[p] == "boolean")
											rec[p] = rec[p] ? (app.lang.l.formats.trueText || 'True') : (app.lang.l.formats.falseText || 'False');
										else if (typeof rec[p] == "number")
											rec[p] = rec[p] == 1 ? (app.lang.l.formats.trueText || 'True') : (app.lang.l.formats.falseText || 'False');
										else if (typeof rec[p] == "string")
											rec[p] = rec[p].charAt(0) == '1' ? (app.lang.l.formats.trueText || 'True') : (app.lang.l.formats.falseText || 'False');
									} else if (typeof rec[p] == "string" && rec[p] != "")
										rec[p] = rec[p].charAt(0) == '1';
									break;
							}
						}
					}
				});
				if ($scope.onPrepareRecord)
					$scope.onPrepareRecord(rec, originalRec, operation);
			});
		};

		$scope.editRecord = (r) => {
			if ($scope.onLoad) {
				$scope.rec = {};
				$scope.onLoad(r);
			} else {
				$scope.dataLoading = true;
				$timeout(() => {
					if ($scope.dataLoading)
						$scope.showEditDim = true;
				}, 200);
				$scope.errorLoading = false;
				if ($scope.onGetId)
					var Id = $scope.onGetId(r)
				else
					var Id = r.Id;
				$scope.rec = {};
				$scope.config.api.get($scope.config.editResource + '/' + Id, $scope.config.publicResource).then($scope.editSucess, $scope.editError);
			};
		}

		$scope.editSucess = res => {
			if (!!res.data && !!res.data.rows && !!res.data.rows[0]) {
				var dataset = {
					rows: []
				};
				dataset.rows.push(angular.copy(res.data.rows[0]));
				$scope.rec = dataset.rows[0];
				prepareRecords(dataset, $scope, 'edit');
				if ($scope.afterLoad)
					$scope.afterLoad(dataset, res.data.rows);
				$scope.dataLoading = false;
				$scope.showEditDim = false;
				$scope.focusFirstInput();
			} else {
				$scope.rec = {};
				$scope.showEditError = true;
				$scope.editErrorMsg = app.lang.l.msgLoadingErrorGrid || "Cannot load data.";
				$scope.errorLoading = true;
				$scope.dataLoading = false;
				$scope.showEditDim = false;
			}
		};

		$scope.editError = res => {
			$scope.rec = {};
			$scope.originalRec = $scope.rec;
			$scope.dataLoading = false;
			$scope.showEditDim = false;
			$scope.showEditError = true;
			$scope.errorLoading = true;
			$scope.editErrorMsg = app.lang.l.msgLoadingErrorGrid || "Cannot load data.";
		}

		if ($scope.editId) {
			$scope.editPath = 'resources/' + $scope.config.path + '/edit.html';
			if ($scope.editId === -1) {
				$scope.operation = 1;
				$scope.rec = {};
				if (!!$scope.onNewRecord)
					$scope.onNewRecord($scope.rec);
				$scope.editTitle = app.lang.l.insertTitle;
			} else {
				$scope.operation = 2;
				$scope.editTitle = app.lang.l.editTitle;
			};

			if ($scope.editId !== -1) {
				if ($scope.onEditLoad) {
					$scope.onEditLoad(null, $scope.editId);
					$scope.focusFirstInput();
				} else
					$scope.editRecord({Id: $scope.editId});
			};

			$scope.cancel = () => {
				var states = readStates();
				writeStates(states);
				$location.path($scope.config.path);
			}
		} else {
			$scope.visibleFields = $scope.fields.filter((e, i, a) => !e.hidden);

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

			$scope.itemCheckClick = () => {
				$scope.itemClicked = true;
				$scope.checkedAll = false;
				$timeout(() => $scope.itemClicked = false);
			}

			$scope.$watch('checkedAll', value => {
				if (!$scope.itemClicked && !$scope.clean)
					$scope.dataset.rows.forEach(i => {if (i.$options && i.$options.selectable === false) return; i.checked = value});
			});

			$scope.sort = field => {
				if (!field.sortable)
					return;
				$scope.fields.forEach(f => {
					if (f !== field && f.sortable)
						f.direction = 'both';
				});

				switch (field.direction) {
					case 'asc':
						field.direction = 'desc';
						$scope.sortField = field.name;
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
				};

				$scope.refresh($scope.page);
			};

			$scope.ErrorLoadingEdit = () => {
				$scope.rec = {};
				$scope.dataLoading = false;
				$scope.showEditDim = false;
				$scope.showEditError = true;
				$scope.errorLoading = true;
				$scope.editErrorMsg = '<i class="fa fa-times-circle"></i> ' + (app.lang.l.msgLoadingErrorGrid || "Cannot load data.");
			};

			$scope.search = q => {
				q = encodeURIComponent(q.trim());
				if (!q) {
					if (searchValues == "")
						return;
					searchValues = "";
				} else if (!!$scope.onGetSearch)
					searchValues = $scope.onGetSearch(q);
				else {
					searchValues = "";
					$scope.fields.forEach(f => {
						if (f.searchable)
							searchValues += (searchValues == "" ? "" : "|") + f.name;
					});
					searchValues += q;
				}
				$scope.page = 1;
				$scope.refresh($scope.page);
			};

			$scope.clearSearch = () => {
				$scope.search("");
				$scope.searchCriteria = '';
			}

			var load = (page, reload) => {
				if (!!$scope.beforeLoad)
					$scope.beforeLoad($scope);
				if ($scope.dataLoading)
					return;
				$scope.dataLoading = true;
				if (!reload)
					$scope.dataset.loading = true;
				$timeout(() => {
					if (!$scope.dataLoading)
						return;
					if (reload)
						$scope.dataset.showDim = true;
				}, 200);

				var filterValue = '';
				if ($scope.filters) {
					$scope.filters.forEach(f => {
						var filterStr = '';
						if (f.used) {
							//$scope.filtered = true;
							if (f.value)
								filterStr = f.field + '=' + f.value;
							else if (f.startValue) {
								filterStr = f.field + '=' + f.startValue;
								if (f.endValue)
									filterStr += '|' + f.endValue;
							};
							filterValue += (filterValue ? '&' : '') + filterStr;
						}
					});
				};

				var conditions = "";

				if (!!searchValues)
					conditions += searchValues;
				if (!!$scope.extraValues)
					conditions += (conditions && $scope.extraValues ? '&' : '') + $scope.extraValues;
				if (!!filterValue)
					conditions += (conditions && filterValue ? '&' : '') + filterValue;
				$scope.config.api.get($scope.config.listResource, $scope.config.publicResource, $scope.config.pagination ? page : false, $scope.sortField, $scope.sortDirection, conditions).then(
					res => {
						res.data.pagecount = res.data.pagecount || 1;
						res.data.page = res.data.page || 1;
						if (res.data.page > res.data.pagecount) {
							$scope.page = res.data.pagecount;
							$scope.dataLoading = false;
							$scope.refresh($scope.page);
							return;
						} else if (res.data.page < 1) {
							$scope.page = 1;
							$scope.dataLoading = false;
							$scope.refresh(1);
							return;
						};

						if (!!res.data && !!res.data.rows && res.data.rows.length > 0) {
							$scope.dataset = angular.copy(res.data);
							$scope.clean = false;
							$scope.page = $scope.dataset.page;
							$scope.gotoPage = page;
							$scope.dataLoading = false;
							$scope.dataset.error = false;
							$scope.dataset.loading = false;
							$scope.dataset.showDim = false;
							createPages();
							prepareRecords($scope.dataset, $scope, 'browse');
							if (!!$scope.setFiltersDisplay)
								$scope.setFiltersDisplay($scope.isBigScreen);
							if ($scope.afterLoad)
								$scope.afterLoad($scope.dataset, res.data);
						} else {
							$scope.clean = true;
							$scope.dataset.pagecount = 0;
							$scope.dataset.rows = [];
							$scope.dataLoading = false;
							$scope.dataset.error = false;
							$scope.dataset.loading = false;
							$scope.dataset.showDim = false;
							if (!!$scope.setFiltersDisplay)
								$scope.setFiltersDisplay($scope.isBigScreen);
						}
					},
					res => {
						$scope.dataset.rows = [];
						$scope.clean = true;
						$scope.dataLoading = false;
						$scope.dataset.error = true;
						$scope.dataset.loading = false;
						$scope.dataset.showDim = false;
						$scope.dataset.pagecount = 0;
						if (!!$scope.setFiltersDisplay)
							$scope.setFiltersDisplay($scope.isBigScreen);
					}
				);
			}

			$scope.refresh = page => {
				load(page, true);
				$scope.checkedAll = false;
			}

			$scope.isFiltered = () => {
				if (!$scope.filters || !Array.isArray($scope.filters))
					return false;
				return $scope.filters.filter(f => f.used).length > 0;
			}

			$scope.filter = a => {
				let hasFilterUsed = false;
				$scope.filters.forEach(f => {
					if (!a)
						f.execFilter();
					if (f.used)
						hasFilterUsed = true;
				});
				if (hasFilterUsed || (!hasFilterUsed && $scope.filtered)) {
					$scope.filtered = true;
					load(1, true);
					$scope.checkedAll = false;
					saveState();
				}
			};

			$scope.clearFilters = () => {
				$scope.filters.forEach(f => f.clearFilter());
				if (!!$scope.onClearFilters)
					$scope.onClearFilters();
				$scope.filtered = false;
				$scope.filter(true);
				$scope.filtered = false;
			};

			var selections = () => {
				var sel = [];
				if (!!$scope.dataset && !!$scope.dataset.rows) {
					$scope.dataset.rows.forEach(i => {
						if (i.checked) {
							var rec = {};
							$scope.fields.forEach(f => {
								if (f.primaryKey)
									rec[f.name] = i[f.name];
							});
							sel.push(rec);
						}
					});
				}
				return sel;
			};

			$scope.delete = () => {
				var sel = selections();
				var msg = {
					title: app.lang.l.msgDeleteTitle
				}
				if (sel.length == 0) {
					msg.text = app.lang.l.msgDeleteNoSelect;
					msg.buttons = 'ok';
				} else {
					msg.text = app.lang.l.msgDeleteText;
					msg.buttons = 'delete;cancel';
					msg.delete = () => {
						$scope.config.api.delete($scope.config.editResource, $scope.config.publicResource, sel).then(
							res => $scope.refresh($scope.page),
							res => {
								$timeout(() => {
									msg.text = app.lang.l.msgDeleteError || "Error deleting records.";
									msg.buttons = 'ok';
									app.messageBox(msg);
								}, 1000)
							}
						);
					}
				};
				app.messageBox(msg);
			};

			var createPages = (s) => {
				if (s === undefined)
					s = $scope.isSmallScreen;
				let first = 1;
				let max = !!s ? 5 : 9;
				let last = max;
				let med = Math.trunc(max / 2);
				if ($scope.dataset.pagecount > max) {
					if ($scope.page + med <= $scope.dataset.pagecount && $scope.page - med > 1) {
						last = $scope.page + med
						first = $scope.page - med;
					} else if ($scope.page + med >= $scope.dataset.pagecount) {
						last = $scope.dataset.pagecount;
						first = $scope.dataset.pagecount - max + 1;
					}
				} else
					last = $scope.dataset.pagecount;
				let showFirst = first > 1;
				let showLast = last < $scope.dataset.pagecount;
				$scope.showGoto = showFirst || showLast;
				$scope.pages = [];
				if (showFirst)
					$scope.pages.push({
						first: true,
						page: 1
					});
				let idx = 1;
				for (let i = first; i <= last; i++) {
					$scope.pages.push({
						id: idx,
						page: i,
						active: (i == $scope.page),
						hideSM: showFirst && showLast && (idx == 1 || idx == max)
					});
					idx++;
				};
				if (showLast)
					$scope.pages.push({last: true, page: $scope.dataset.pagecount});
			};

			$scope.goto = page => {
				if (page == $scope.page)
					return;
				$scope.refresh(page);
			};

			load($scope.page);
			$scope.insert = r => {
				$scope.clearErrors();
				if ($scope.config.editStyle == "modal") {
					$scope.operation = 1;
					$scope.rec = {};
					if (!!$scope.onNewRecord)
						$scope.onNewRecord($scope.rec);
					$scope.showEditError = false;
					$scope.editTitle = app.lang.l.insertTitle;
					$scope.showEditModal = "open";
				} else {
					saveState();
					$location.path($scope.config.path + '/new');
				}
			};

			$scope.edit = r => {
				$scope.clearErrors();
				if ($scope.config.editStyle == "modal") {
					$scope.editRecord(r);
					$scope.showEditError = false;
					$scope.showEditModal = "open";
					$scope.operation = 2;
					$scope.editTitle = app.lang.l.editTitle;
				} else {
					saveState(true);
					if ($scope.onGetId)
						var Id = $scope.onGetId($scope, r)
					else
						var Id = r.Id;
					$location.path($scope.config.path + '/' + btoa(Id));
				}
			}
		};

		$scope.internalValidateRecord = () => {
			let errors = [];
			$scope.fields.forEach(f => {
				if (!!f.required && !f.noValidation){
					if ($scope.rec[f.name] === null || $scope.rec[f.name] === undefined) {
						$scope.errors[f.name] = true;
						let msg = app.lang.l.msgFieldRequired || 'Field "%s" is required. Please, enter a valid value for the field.';
						let fieldName = $scope.getFieldLabel(f);
						msg = msg.replace('%s', fieldName);
						errors.push(msg);
						return
					}

					if ((f.dataType.toLowerCase() == "float" || f.dataType.toLowerCase() == "integer") && f.greaterThanZero && +($scope.rec[f.name]) <= 0){
						$scope.errors[f.name] = true;
						let msg = app.lang.l.msgFieldInvalid || 'The value of field "%s" is invalid. Please, enter a valid value for the field.';
						let fieldName = $scope.getFieldLabel(f);
						msg = msg.replace('%s', fieldName);
						errors.push(msg);
						return
					}
				}
			});
			return errors;
		}

		$scope.save = () => {
			$scope.clearErrors();
			if (!$scope.saveButton)
				$scope.saveButton = element.find('.btn-save');
			$($scope.saveButton.get(0)).focus();

			$timeout(() => {
				let internalMsg = $scope.internalValidateRecord();
				let msg;
				if (!!$scope.onValidateRecord)
					msg = $scope.onValidateRecord($scope.rec, internalMsg);
				if (typeof msg == "string")
					internalMsg.push(msg)
				else if (Array.isArray(msg))
					internalMsg = internalMsg.concat(msg);
				if (internalMsg.length > 0) {
					let code = '<ul>';
					internalMsg.forEach(m => code += '<li>' + m + '</li>');
					code += '</ul>';
					$scope.editErrorMsg = code;
					$scope.showEditError = true;
					return
				};

				var r = angular.copy($scope.rec);
				if (r.$options)
					delete(r.$options);
				for (var field in r) {
					var f = $scope.fieldByName(field);
					if (f) {
						if (f.readOnly)
							r[field] = undefined;
						else if (f.dataType && (f.dataType.toLowerCase() == 'date' || f.dataType.toLowerCase() == 'time' || f.dataType.toLowerCase() == 'datetime')) {
							if (!!r[field])
								r[field] = convertUTCDateToLocalDate(new Date(getDateFromFormat(r[field], app.lang.l.formats[f.dataType.toLowerCase()])));
							else
								r[field] = null;
						} else if (f.dataType && f.dataType.toLowerCase() == "bool") {
							if (typeof(r[field]) == "string") {
								if (r[field].toLowerCase() == 'true' || r[field].toLowerCase() == 'false')
									r[field] = r[field].toLowerCase() == 'true';
								else
									r[field] = null;
							}
						}
					}
				};
				$scope.dataLoading = true;
				$timeout(() => { if ($scope.dataLoading) $scope.showEditDim = true; });
				var res;
				if ($scope.operation == 1)
					res = $scope.config.api.post($scope.config.editResource, $scope.config.publicResource, r);
				else
					res = $scope.config.api.put($scope.config.editResource, $scope.config.publicResource, r);
				res.then(
					res => {
						if ($scope.config.editStyle === "modal") {
							$scope.dataLoading = false;
							$scope.showEditDim = false;
							$scope.showEditModal = "close";
							$scope.refresh($scope.page);
						} else {
							var states = readStates();
							states[$scope.config.path].result = true;
							writeStates(states);
							$location.path($scope.config.path);
						}
					},
					res => {
						let error;
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
			});
		};

		var openFilters = () => {
			if ($scope.isBigScreen)
				return
			$scope.showFilters = true;
			$(element).find('.filters-container').stop().css('display', 'block').hide().slideDown();
		};

		var closeFilters = () => {
			if ($scope.isBigScreen)
				return
			$scope.showFilters = false;
			$(element).find('.filters-container').stop().css('display', 'none').show().slideUp();
		};

		$scope.showFiltersBtnClick = () => {
			if (!$scope.filters)
				return;
			if (!$scope.showFilters)
				openFilters();
			else
				closeFilters();
			saveState();
		};

		$scope.trustAsHtml = string => {
			if (typeof string == "string")
				return $sce.trustAsHtml(string)
			else
			  	return string;
		};

		$scope.loadOptions = (field, ifEmpty, resource, isPublic,  orderField, sort, others, buildFunction) => {
			if (ifEmpty === true && (Array.isArray(field.options) && field.options.length > 0))
				return
			app.restAPI.get(resource, isPublic, false, orderField, sort, others).then(
				res => {
					if (!!res.data && !!res.data.rows && res.data.rows.length > 0) {
						field.options.length = 0;
						res.data.rows.forEach(r => {
							if (!!buildFunction)
								field.options.push(buildFunction(r))
							else
								field.options.push({
									value: r.Id,
									text: r.Name
								});
						});
					}
				},
				res => {
					$scope.errorLoading();
				}
			);
		};

		$scope.getOptionText = (value, field) => {
			var optText;
			if (app.lang.l['res_' + $scope.config.path] && app.lang.l['res_' + $scope.config.path].options && app.lang.l['res_' + $scope.config.path].options[field.name] && app.lang.l['res_' + $scope.config.path].options[field.name][value])
				optText = app.lang.l['res_' + $scope.config.path].options[field.name][value];
			let opt = field.options.filter(o => o.value == value);
			if (!!opt && opt.length > 0){
				if (!!opt[0].icon)
					return '<i class="' + opt[0].icon + '"></i>' + (optText || opt[0].text);
				return optText || opt[0].text || value;
			}
			return optText || value;
		}
		screenSize.rules = {bs: '(min-width: 1441px)', ms: '(min-width: 1000px)', ss: '(max-width: 499px)'};
		screenSize.on('ss', i => {
			if (i != $scope.isSmallScreen)
				createPages(i);
			$scope.isSmallScreen = i;
			if ($scope.isSmallScreen && !!$scope.onSmallScreen)
				$scope.onSmallScreen();
		});

		screenSize.on('ms', i => {
			$scope.isMedScreen = i;
			if ($scope.isMedScreen && !!$scope.onMedScreen)
				$scope.onMedScreen();
		});

		screenSize.on('bs', i => {
			if (!!$scope.config.filtersRight)
				$scope.setFiltersDisplay(i);
			$scope.isBigScreen = i;
			if ($scope.isBigScreen && !!$scope.onBigScreen)
				$scope.onBigScreen();
		});

		if ($scope.filters) {
			$scope.filters.forEach(f => f.filter = $scope.filter);
			$scope.filtersCol1 = $scope.filters.filter(f => f.column == 1);
			$scope.filtersCol2 = $scope.filters.filter(f => f.column == 2);
			$scope.filtersCol3 = $scope.filters.filter(f => f.column == 3);

			if (!!$scope.config.filtersRight) {
				$scope.setFiltersDisplay = i => {
					let cc = element.find('.content-container');
					let fc = cc.find('.filters-container');
					let tc = cc.find('.fixed-table-container');
					let pg = cc.find('.pagination');
					if (i) {
						let pgHeight = 0;
						if ($scope.dataset.pagecount > 1)
							pgHeight = pg.height() + 10;
						$scope.showFilters = true;
						$timeout(() => {
							fc.stop().css('display', 'block');
							cc.height(Math.max(tc.height() + pgHeight + 2, fc.height() + 26));
							tc.width('calc(100% - 312px)');
							pg.width('calc(100% - 312px)');
						});
					} else if ($scope.isBigScreen) {
						$scope.showFilters = false;
						fc.stop().css('display', 'none');
						cc.css('height', 'auto');
						tc.css('width', 'auto');
						pg.css('width', '100%');
					}
				};
			}
		};

		if ($scope.config.editStyle == "modal") {
			$timeout(() => {
				var code = '<ui-edit-modal></ui-edit-modal>';
				element.append($compile(code)($scope));
			}, 100);
		};

		var init = () => {
			$scope.isBigScreen = screenSize.is('bs');
			$scope.isMedScreen = screenSize.is('ms');
			$scope.isSmallScreen = screenSize.is('ss');
			$timeout(() => {
				if ($scope.config.filtersRight){
					let fc = element.find('.filter-col');
					if (fc.length == 0)
						return false
					fc.addClass('filter-col-big');
					element.find('.filters-container').addClass('filters-container-big');
					element.find('.content-container').addClass('content-container-big');
					$scope.setFiltersDisplay($scope.isBigScreen);
				}
				if (!!$scope.onInit)
					$scope.onInit();
			}, 100);
			return true;
		}
		var watch = $scope.$watch(() => element.children().length, () => {$scope.$evalAsync(() => {if (init()) watch()})});
	};

	return {
		restrict: "E",
		template: '<ng-include src="getTemplateUrl()"/>',
		scope: false,
		link: linker
	}
}]);