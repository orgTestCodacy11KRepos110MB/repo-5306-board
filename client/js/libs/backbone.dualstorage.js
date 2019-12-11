// Generated by CoffeeScript 1.7.1
/*
Backbone dualStorage Adapter v1.3.1

A simple module to replace `Backbone.sync` with *localStorage*-based
persistence. Models are given GUIDS, and saved into a JSON object. Simple
as that.
 */
 var global_uuid = {};
(function() {
    var S4, backboneSync, callbackTranslator, dualsync, getStoreName, localsync, modelUpdatedWithResponse, onlineSync, parseRemoteResponse, isTempId,
        __indexOf = [].indexOf || function(item) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (i in this && this[i] === item) return i;
            }
            return -1;
        };

    Backbone.DualStorage = {
        offlineStatusCodes: [408, 502]
    };

    Backbone.Model.prototype.hasTempId = function() {
		//todo: this.id (temp_id) change to UUID, so hasTempId return false, so quick fix for UUID == this.id return for true.
        return ((_.isString(this.id) && this.id.length === 36 && this.id.indexOf('t') === 0) || ((!_.isUndefined(this.get('uuid'))) && (this.get('uuid') === this.id) ) );
    };

    isTempId = function(id) {
        return _.isString(id) && id.length === 36 && id.indexOf('t') === 0;
    };
    getStoreName = function(collection, model) {
        model || (model = collection.model.prototype);
        return _.result(collection, 'storeName') || _.result(model, 'storeName') || _.result(collection, 'url') || _.result(model, 'urlRoot') || _.result(model, 'url');
    };
	var global_store = {};
	recursive_save = function(storage_name, model) {
		var storage = localStorage.getItem(storage_name);
		localStorage.removeItem(storage_name);
		if (!_.isUndefined(storage) && !_.isEmpty(storage)) { 
			ids = (storage && storage.split(',')) || [];
			var saved_store = {};
			var storage_length = ids.length;
			for (_i = 0, _len = storage_length; _i < _len; _i++) {
				id = ids[_i];
				var url = api_url;
				var store = JSON.parse(localStorage.getItem(storage_name + id));
				localStorage.removeItem(storage_name + id);
				if (Number(localStorage.syncDataCount) <= 1) {
					localStorage.setItem("syncDataCount", 0); 
				} else {
					localStorage.setItem("syncDataCount", Number(localStorage.syncDataCount) - 1);
				}
				if (store !== null && !_.isEmpty(store)) {
					var Model = new App[model]();
					if(!_.isUndefined(store.board_id)){
						if(isTempId(store.board_id)){
							store.board_id = global_store[store.board_id];
						}
						url += 'boards/'+store.board_id;
					}
					if(!_.isUndefined(store.list_id)){
						var check_list_id = global_uuid[store.list_id];
						if (!_.isUndefined(check_list_id)) {
							store.list_id = global_store[check_list_id];
						}
						if(isTempId(store.list_id)){
							store.list_id = global_store[store.list_id];
						}
						url += '/lists/'+store.list_id;
					}
					if(!_.isUndefined(store.card_id)){
						var check_card_id = global_uuid[store.card_id];
						if (!_.isUndefined(check_card_id)) {
							store.card_id = global_store[check_card_id];
						}
						if(isTempId(store.card_id)){
							store.card_id = global_store[store.card_id];
						}
						url += '/cards/'+store.card_id;
					}
					if(!_.isUndefined(store.checklist_id) && storage_name === 'item'){
						var check_checklist_id = global_uuid[store.checklist_id];
						if (!_.isUndefined(check_checklist_id)) {
							store.checklist_id = global_store[check_checklist_id];
						}
						if(isTempId(store.checklist_id)){
							store.checklist_id = global_store[store.checklist_id];
						}
						if(store.checklist_id !== 0 && store.checklist_id !== '0'){
							url += '/checklists/'+store.checklist_id;
						}
						
					}
					if(storage_name === 'card_user'){
						storage_name = 'user'
					}
					url += '/'+storage_name+'s';
					if(!_.isUndefined(store.user_id) && model === 'CardUser'){
						url += '/'+store.user_id;
					}
					
					if (!_.isUndefined(store.id) && !isTempId(store.id)) {
						if(isTempId(store.id)){
							store.id = global_store[store.id];
						}
						var check_id = global_uuid[store.id];
						if (!_.isUndefined(check_id) && isTempId(check_id)) {
							store.id = global_store[check_id];
						}
						if(!_.isUndefined(store.id)){
							url += '/' + store.id;
							Model.set('id', store.id);
						}else{
							delete store.id;	
						}
					}
					if(!_.isUndefined(store.id) && isTempId(store.id)){
						delete store.id;
					}
					Model.url = url+ '.json';
					Model.save(store, {
						async:false,	   
						success: function(model, response, options) {
							if (!_.isUndefined(store.temp_id)) {
								saved_store[store.temp_id] = response.id;
								global_store[store.temp_id] = response.id;
							}else if(!_.isUndefined(store.id)) {
								var id = store.id;
								if(!_.isUndefined(response.id)) {
									id = response.id;
								}
								saved_store[store.id] = id;
								global_store[store.id] = id;
							}
							if (!_.isUndefined(response.uuid)) {
								global_store[response.uuid] = response.id;
							}
							if(storage_length == Object.keys(saved_store).length){
								if(storage_name == 'board'){
									recursive_save('list', 'List');
								}else if(storage_name == 'list'){
									recursive_save('card', 'Card');
								}else if(storage_name == 'card'){
									recursive_save('checklist', 'CheckList');
									recursive_save('comment', 'Activity');
									recursive_save('card_user', 'CardUser');
								}else if(storage_name == 'checklist'){
									recursive_save('item', 'CheckListItem');
								}
							}
						}
					});
				}
			}
		}
	};
	destroy_store = function(storage_name, model){
		var storage = localStorage.getItem(storage_name);
		localStorage.removeItem(storage_name);
		if (!_.isUndefined(storage) && !_.isEmpty(storage)) { 
			ids = (storage && storage.split(',')) || [];
			var saved_store = [];
			for (_i = 0, _len = ids.length; _i < _len; _i++) {
				id = ids[_i];
				var store = localStorage.getItem(storage_name + id);
				localStorage.removeItem(storage_name + id);
				if (Number(localStorage.syncDataCount) <= 1) {
					localStorage.setItem("syncDataCount", 0);
				} else {
					localStorage.setItem("syncDataCount", Number(localStorage.syncDataCount) - 1);
				}
				if (store !== null && !_.isEmpty(store)) {
					var Model = new App[model]();
					Model.url = store;
					Model.set('id', id);
					Model.destroy();
				}
			}
		}
	};
    Backbone.Collection.prototype.syncDirty = function(options) {
        var id, ids, store, _i, _len, _ref, _results;
        store = localStorage.getItem('' + (getStoreName(this)) + '_dirty');
        var board_store = localStorage.getItem('board');
        var list_store = localStorage.getItem('list');
        var card_store = localStorage.getItem('card');
		var checklist_store = localStorage.getItem('checklist');
		var checklistitem_store = localStorage.getItem('item');
		var activity_store = localStorage.getItem('comment');
		var card_user_store = localStorage.getItem('card_user');
		var label_store = localStorage.getItem('label');
		var card_voter_store = localStorage.getItem('card_voter');
		var card_subscriber_store = localStorage.getItem('card_subscriber');
		if (!_.isUndefined(board_store) && !_.isEmpty(board_store)) {
			recursive_save('board', 'Board');
		} else if (!_.isUndefined(list_store) && !_.isEmpty(list_store)) {
			recursive_save('list', 'List');
		} else if (!_.isUndefined(card_store) && !_.isEmpty(card_store)) {
			recursive_save('card', 'Card');
		} else if (!_.isUndefined(checklist_store) && !_.isEmpty(checklist_store)) {
			recursive_save('checklist', 'CheckList');
		} else if (!_.isUndefined(checklistitem_store) && !_.isEmpty(checklistitem_store)) {
			recursive_save('item', 'CheckListItem');
		} else if (!_.isUndefined(activity_store) && !_.isEmpty(activity_store)) {
			recursive_save('comment', 'Activity');
		} else if (!_.isUndefined(card_user_store) && !_.isEmpty(card_user_store)) {
			recursive_save('card_user', 'CardUser');
		} else if (!_.isUndefined(label_store) && !_.isEmpty(label_store)) {
			recursive_save('label', 'Label');
		} else if (!_.isUndefined(card_voter_store) && !_.isEmpty(card_voter_store)) {
			recursive_save('card_voter', 'CardVoter');
		} else if (!_.isUndefined(card_subscriber_store) && !_.isEmpty(card_subscriber_store)) {
			recursive_save('card_subscriber', 'CardSubscriber');
		}
		var board_destroyed_store = localStorage.getItem('board_destroyed');
        var list_destroyed_store = localStorage.getItem('list_destroyed');
        var card_destroyed_store = localStorage.getItem('card_destroyed');
		var checklist_destroyed_store = localStorage.getItem('checklist_destroyed');
		var checklistitem_destroyed_store = localStorage.getItem('item_destroyed');
		var board_user_destroyed_store = localStorage.getItem('board_user_destroyed');
		var comment_destroyed_store = localStorage.getItem('comment_destroyed');
		var card_user_destroyed_store = localStorage.getItem('card_user_destroyed');
		var card_voter_destroyed_store = localStorage.getItem('card_voter_destroyed');
		var card_subscriber_destroyed_store = localStorage.getItem('card_voter_destroyed');
		if (!_.isUndefined(board_store) && !_.isEmpty(board_store)) {
			destroy_store('board_destroyed', 'Board');
		} else if (!_.isUndefined(list_destroyed_store) && !_.isEmpty(list_destroyed_store)) {
			destroy_store('list_destroyed', 'List');
			destroy_store('card_destroyed', 'Card');
			destroy_store('checklist_destroyed', 'CheckList');
			destroy_store('item_destroyed_store', 'CheckListItem');
		} else if (!_.isUndefined(card_destroyed_store) && !_.isEmpty(card_destroyed_store)) {
			destroy_store('card_destroyed', 'Card');
			destroy_store('checklist_destroyed', 'CheckList');
			destroy_store('item_destroyed_store', 'CheckListItem');
		} else if (!_.isUndefined(checklist_destroyed_store) && !_.isEmpty(checklist_destroyed_store)) {
			destroy_store('checklist_destroyed', 'CheckList');
			destroy_store('item_destroyed_store', 'CheckListItem');
		} else if (!_.isUndefined(checklistitem_destroyed_store) && !_.isEmpty(checklistitem_destroyed_store)) {
			destroy_store('item_destroyed_store', 'CheckListItem');
		} else if (!_.isUndefined(board_user_destroyed_store) && !_.isEmpty(board_user_destroyed_store)) {
			destroy_store('board_user_destroyed', 'BoardsUser');
		} else if (!_.isUndefined(comment_destroyed_store) && !_.isEmpty(comment_destroyed_store)) {
			destroy_store('comment_destroyed', 'Activity');
		} else if (!_.isUndefined(card_user_destroyed_store) && !_.isEmpty(card_user_destroyed_store)) {
			destroy_store('card_user_destroyed', 'CardUser');
		} else if (!_.isUndefined(card_voter_destroyed_store) && !_.isEmpty(card_voter_destroyed_store)) {
			destroy_store('card_voter_destroyed', 'CardVoter');
		} else if (!_.isUndefined(card_subscriber_destroyed_store) && !_.isEmpty(card_subscriber_destroyed_store)) {
			destroy_store('card_voter_destroyed', 'CardSubscriber');
		}
        ids = (store && store.split(',')) || [];
        _results = [];
        for (_i = 0, _len = ids.length; _i < _len; _i++) {
            id = ids[_i];
            _results.push((_ref = this.get(id)) != null ? _ref.save(null, options) : void 0);
        }
		setInterval(function () {
			if(localStorage.syncDataCount){
				if(Number(localStorage.syncDataCount) == 0){
					localStorage.removeItem("syncDataCount"); 
                    $('#js-footer-brand-img').attr('title', i18next.t(SITE_NAME)).attr('src', 'img/logo-icon-sync.gif').attr('data-original-title', i18next.t(SITE_NAME)).tooltip("show");
					$('#js-footer-brand-img').attr('src', 'img/logo-icon.png').tooltip("hide");
					location.reload(true);
				}			
			}else{
                $('#js-footer-brand-img').attr('title', i18next.t(SITE_NAME)).attr('src', 'img/logo-icon.png').attr('data-original-title', i18next.t(SITE_NAME)).tooltip("hide");
			}
		}, 10000); // Execute every 10 seconds.
        return _results;
    };

    Backbone.Collection.prototype.dirtyModels = function() {
        var id, ids, models, store;
        store = localStorage.getItem('' + (getStoreName(this)) + '_dirty');
        ids = (store && store.split(',')) || [];
        models = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = ids.length; _i < _len; _i++) {
                id = ids[_i];
                _results.push(this.get(id));
            }
            return _results;
        }).call(this);
        return _.compact(models);
    };

    Backbone.Collection.prototype.syncDestroyed = function(options) {
        var id, ids, model, store, _i, _len, _results;
        store = localStorage.getItem('' + (getStoreName(this)) + '_destroyed');
        ids = (store && store.split(',')) || [];
        _results = [];
        for (_i = 0, _len = ids.length; _i < _len; _i++) {
            id = ids[_i];
            model = new this.model;
            model.set(model.idAttribute, id);
            model.collection = this;
            _results.push(model.destroy(options));
        }
        return _results;
    };

    Backbone.Collection.prototype.destroyedModelIds = function() {
        var ids, store;
        store = localStorage.getItem('' + (getStoreName(this)) + '_destroyed');
        return ids = (store && store.split(',')) || [];
    };

    Backbone.Collection.prototype.syncDirtyAndDestroyed = function(options) {
        this.syncDirty(options);
        return this.syncDestroyed(options);
    };

    S4 = function() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };

    window.Store = (function() {
        Store.prototype.sep = '';

        function Store(name) {
            this.name = name;
            this.records = this.recordsOn(this.name);
        }

        Store.prototype.generateId = function() {
            return 't' + S4().substring(1) + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
        };

        Store.prototype.save = function() {
            return localStorage.setItem(this.name, this.records.join(','));
        };

        Store.prototype.recordsOn = function(key) {
            var store;
            store = localStorage.getItem(key);
            return (store && store.split(',')) || [];
        };

        Store.prototype.dirty = function(model) {
            var dirtyRecords;
            dirtyRecords = this.recordsOn(this.name + '_dirty');
            if (isNaN(model.id) || _.isUndefined(model.id)) {
                model.id = model.get('temp_id');
            }
            if (!_.include(dirtyRecords, model.id.toString())) {
                dirtyRecords.push(model.id);
            }
            return model;
        };
		
		Store.prototype.cleanDepended = function(from, uuid, find_id) {
            var id, _i, _len, _ref, _results, _records;
            _ref = this.recordsOn(from);
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                id = _ref[_i];
                var store = JSON.parse(localStorage.getItem(from + this.sep + id));
				if (!_.isUndefined(store) && !_.isEmpty(store)) {
					if(store[find_id].toString() === uuid.toString()){
						localStorage.removeItem(from + this.sep + id);
						localStorage.setItem(from, _.without(this.recordsOn(from), id).join(','));
						if (Number(localStorage.syncDataCount) <= 1) {
							localStorage.setItem("syncDataCount", 0);
						} else {
							localStorage.setItem("syncDataCount", Number(localStorage.syncDataCount) - 1);
						}						
						_results.push(store.uuid);
					}
				}
            }
            return _results;
        };

        Store.prototype.clean = function(model, from) {
            var dirtyRecords, store;
			var _i, _j, _k, _len, _len1, _len2, res, res1, res2;
            store = '' + this.name + '_' + from;
            dirtyRecords = this.recordsOn(store);
            if (_.include(dirtyRecords, model.id.toString())) {
                localStorage.setItem(store, _.without(dirtyRecords, model.id.toString()).join(','));
            }
			if (!_.isUndefined(model.get('uuid')) && !_.isEmpty(model.get('uuid'))) {
			switch (this.name) {
                case 'list':
					res2 = this.cleanDepended('list', model.get('uuid'), "uuid");
					if(res2.length > 0){
						for (_k = 0, _len2 = res2.length; _k < _len2; _k++) {
							res = this.cleanDepended('card', res2[_k], "list_id");
							if(res.length > 0){
								for (_i = 0, _len = res.length; _i < _len; _i++) {
									res1 = this.cleanDepended('checklist', res[_i], "card_id");
									this.cleanDepended('card_user', res[_i], "card_id");
									this.cleanDepended('comment', res[_i], "card_id");
									if(res1.length > 0){
										for (_j = 0, _len1 = res1.length; _j < _len1; _j++) {
											this.cleanDepended('item', res1[_j], "checklist_id");
										}
									}
								}
							}
						} 
					}
					break;
                case 'card':
					res = this.cleanDepended('card', model.get('uuid'), "uuid");
					if(res.length > 0){
						for (_i = 0, _len = res.length; _i < _len; _i++) {
							res1 = this.cleanDepended('checklist', res[_i], "card_id");
							this.cleanDepended('card_user', res[_i], "card_id");
							this.cleanDepended('comment', res[_i], "card_id");
							if(res1.length > 0){
								for (_j = 0, _len1 = res1.length; _j < _len1; _j++) {
									this.cleanDepended('item', res1[_j], "checklist_id");
								}
							}
						}
					}
					break;
                case 'checklist':
					res = this.cleanDepended('checklist', model.get('uuid'), "uuid");
					if(res.length > 0){
						for (_i = 0, _len = res.length; _i < _len; _i++) {
							this.cleanDepended('item', res[_i], "checklist_id");
						}
					}
					break;
			}
			}
            return model;
        };

        Store.prototype.destroyed = function(model) {
            var destroyedRecords, destroyedRecordURLs;
            destroyedRecords = this.recordsOn(this.name + '_destroyed');
			destroyedRecordURLs = this.recordsOn(this.name + '_destroyed_url');  
            if (!_.include(destroyedRecords, model.id.toString())) {
                destroyedRecords.push(model.id);
				destroyedRecordURLs.push(model.url.substring(0, model.url.indexOf('?')));
				localStorage.setItem(this.name + '_destroyed', destroyedRecords.join(','));
                localStorage.setItem(this.name + '_destroyed'+model.id, destroyedRecordURLs.join(','));
				if (localStorage.syncDataCount) {
					localStorage.setItem("syncDataCount", Number(localStorage.syncDataCount) + 1);
				} else {
					localStorage.setItem("syncDataCount", 1);
				}
			}
            return model;
        };

        Store.prototype.create = function(model) {
            if (!_.isObject(model)) {
                return model;
            }
            if (!model.id) {
                model.set(model.idAttribute, this.generateId());
            }
			if(isTempId(model.get(model.idAttribute))){
				model.set('temp_id', model.get(model.idAttribute));
			}
            localStorage.setItem(this.name + this.sep + model.id, JSON.stringify(model));
			if (localStorage.syncDataCount) {
				localStorage.setItem("syncDataCount", Number(localStorage.syncDataCount) + 1);
			} else {
				localStorage.setItem("syncDataCount", 1);
			} 
			this.records.push(model.id.toString());
            this.save();
            return model;
        };

        Store.prototype.update = function(model) {
            if (isNaN(model.id)) {
                model.id = model.get('temp_id');
            }
			var is_update = false;
			if(!_.isUndefined(model.attributes.temp_id) || !_.isUndefined(model.attributes.id)){
				var _storage_name = this.name + this.sep + model.attributes.temp_id;
				var _storage = localStorage.getItem(_storage_name);
				if(_storage === null){
					_storage_name = this.name + this.sep + model.attributes.id;
					_storage = localStorage.getItem(_storage_name);
				}
				if(!_.isUndefined(_storage) && !_.isEmpty(_storage) && _storage !== null){
					is_update = true;
					_storage = JSON.parse(_storage);
					var new_val = JSON.stringify(model.attributes)
					_storage = $.extend(_storage, JSON.parse(new_val));
					localStorage.setItem(_storage_name, JSON.stringify(_storage));
				}
			}
			if(!is_update){
				localStorage.setItem(this.name + this.sep + model.id, JSON.stringify(model));
				if (localStorage.syncDataCount) {
					localStorage.setItem("syncDataCount", Number(localStorage.syncDataCount) + 1);
				} else {
					localStorage.setItem("syncDataCount", 1);
				}
				if (!_.include(this.records, model.id.toString())) {
					this.records.push(model.id.toString());
				}
			}
            this.save();
            return model;
        };

        Store.prototype.clear = function() {
            var id, _i, _len, _ref;
            _ref = this.records;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                id = _ref[_i];
                localStorage.removeItem(this.name + this.sep + id);
            }
            this.records = [];
            return this.save();
        };

        Store.prototype.hasDirtyOrDestroyed = function() {
            return !_.isEmpty(localStorage.getItem(this.name + '_dirty')) || !_.isEmpty(localStorage.getItem(this.name + '_destroyed'));
        };

        Store.prototype.find = function(model) {
            var modelAsJson;
            modelAsJson = localStorage.getItem(this.name + this.sep + model.id);
            if (modelAsJson === null) {
                return null;
            }
            return JSON.parse(modelAsJson);
        };

        Store.prototype.findAll = function() {
            var id, _i, _len, _ref, _results;
            _ref = this.records;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                id = _ref[_i];
                _results.push(JSON.parse(localStorage.getItem(this.name + this.sep + id)));
            }
            return _results;
        };

        Store.prototype.destroy = function(model) {
            localStorage.removeItem(this.name + this.sep + model.id);
            this.records = _.reject(this.records, function(record_id) {
                return record_id === model.id.toString();
            });
            this.save();
            return model;
        };

        return Store;

    })();

    window.Store.exists = function(storeName) {
        if (!_.isUndefined(localStorage) && localStorage !== null) {
            return localStorage.getItem(storeName) !== null;
        }   
    };

    callbackTranslator = {
        needsTranslation: Backbone.VERSION === '0.9.10',
        forBackboneCaller: function(callback) {
            if (this.needsTranslation) {
                return function(model, resp, options) {
                    return callback.call(null, resp);
                };
            } else {
                return callback;
            }
        },
        forDualstorageCaller: function(callback, model, options) {
            if (this.needsTranslation) {
                return function(resp) {
                    return callback.call(null, model, resp, options);
                };
            } else {
                return callback;
            }
        }
    };

    localsync = function(method, model, options) {
        var isValidModel, preExisting, response, store;
        isValidModel = (method === 'clear') || (method === 'hasDirtyOrDestroyed');
        isValidModel || (isValidModel = model instanceof Backbone.Model);
        isValidModel || (isValidModel = model instanceof Backbone.Collection);
        if (!isValidModel) {
            throw new Error('model parameter is required to be a backbone model or collection.');
        }
        store = new Store(options.storeName);
        response = (function() {
            switch (method) {
                case 'read':
                    if (model instanceof Backbone.Model) {
                        return store.find(model);
                    } else {
                        return store.findAll();
                    }
                    break;
                case 'hasDirtyOrDestroyed':
                    return store.hasDirtyOrDestroyed();
                case 'clear':
                    return store.clear();
                case 'create':
                    if (options.add && !options.merge && (preExisting = store.find(model))) {
                        return preExisting;
                    } else {
                        model = store.create(model);
						options.temp_id = model.attributes.temp_id;
                        if (options.dirty) {
                            store.dirty(model);
                        }
                        return model;
                    }
                    break;
                case 'patch':
                case 'update':
                    if (isNaN(model.id)) {
                        model.set('id', model.get('temp_id'));
                    }
                    store.update(model);
                    if (options.dirty) {
                        return store.dirty(model);
                    } else {
                        return store.clean(model, 'dirty');
                    }
                    break;
                case 'delete':
                    store.destroy(model);
                    if (options.dirty && !model.hasTempId()) {
                        return store.destroyed(model);
                    } else {
                        if (model.hasTempId()) {
                            return store.clean(model, 'dirty');
                        } else {
                            return store.clean(model, 'destroyed');
                        }
                    }
            }
        })();
        if (response != null ? response.attributes : void 0) {
            response = response.attributes;
        }
        if (!options.ignoreCallbacks) {
            if (response) {
                options.success(response);
            } else {
                options.error('Record not found');
            }
        }
        return response;
    };

    parseRemoteResponse = function(object, response) {
        if (!(object && object.parseBeforeLocalSave)) {
            return response;
        }
        if (_.isFunction(object.parseBeforeLocalSave)) {
            return object.parseBeforeLocalSave(response);
        }
    };

    modelUpdatedWithResponse = function(model, response) {
        var modelClone;
        modelClone = new Backbone.Model;
        modelClone.idAttribute = model.idAttribute;
        modelClone.set(model.attributes);
        modelClone.set(model.parse(response));
        return modelClone;
    };

    backboneSync = Backbone.sync;

    onlineSync = function(method, model, options) {
        options.success = callbackTranslator.forBackboneCaller(options.success);
        options.error = callbackTranslator.forBackboneCaller(options.error);
        return backboneSync(method, model, options);
    };

    dualsync = function(method, model, options) {
        var error, hasOfflineStatusCode, local, relayErrorCallback, success, temporaryId, useOfflineStorage;
        options.storeName = getStoreName(model.collection, model);
        options.storeExists = Store.exists(options.storeName);
        options.success = callbackTranslator.forDualstorageCaller(options.success, model, options);
        options.error = callbackTranslator.forDualstorageCaller(options.error, model, options);
        if (_.result(model, 'remote') || _.result(model.collection, 'remote')) {
            return onlineSync(method, model, options);
        }
        local = _.result(model, 'local') || _.result(model.collection, 'local');
        options.dirty = true;
        if (options.remote === false || local) {
            return localsync(method, model, options);
        }
        options.ignoreCallbacks = true;
        success = options.success;
        error = options.error;
        useOfflineStorage = function() {
            options.dirty = true;
            return success(localsync(method, model, options));
        };
        hasOfflineStatusCode = function(xhr) {
            var offlineStatusCodes, _ref;
            offlineStatusCodes = Backbone.DualStorage.offlineStatusCodes;
            if (_.isFunction(offlineStatusCodes)) {
                offlineStatusCodes = offlineStatusCodes(xhr);
            }
            return xhr.status === 0 || (_ref = xhr.status, __indexOf.call(offlineStatusCodes, _ref) >= 0);
        };
        relayErrorCallback = function(xhr) {
            var online;
            online = !hasOfflineStatusCode(xhr);
            if (online || method === 'read' && !options.storeExists) {
                return error(xhr);
            } else {
                return useOfflineStorage();
            }
        };
        switch (method) {
            case 'read':
                if (localsync('hasDirtyOrDestroyed', model, options)) {
                    return useOfflineStorage();
                } else {
                    options.success = function(resp, _status, _xhr) {
                        var collection, idAttribute, modelAttributes, responseModel, _i, _len;
                        if (options.async && hasOfflineStatusCode(options.xhr)) {
                            return useOfflineStorage();
                        }
                        resp = parseRemoteResponse(model, resp);
                        if (model instanceof Backbone.Collection) {
                            collection = model;
                            idAttribute = collection.model.prototype.idAttribute;
                            if (!options.add) {
                                //localsync('clear', collection, options); // NOTE: Save response in localsotrage on GET
                            }
							if(resp!== null) {
								for (_i = 0, _len = resp.length; _i < _len; _i++) {
									modelAttributes = resp[_i];
									model = collection.get(modelAttributes[idAttribute]);
									if (model) {
										responseModel = modelUpdatedWithResponse(model, modelAttributes);
									} else {
										responseModel = new collection.model(modelAttributes);
									}
									//localsync('update', responseModel, options);
								}
							}
                        } else {
                            responseModel = modelUpdatedWithResponse(model, resp);
                            //localsync('update', responseModel, options);
                        }
                        return success(resp, _status, _xhr);
                    };
                    options.error = function(xhr) {
                        return relayErrorCallback(xhr);
                    };
                    return options.xhr = onlineSync(method, model, options);
                }
                break;
            case 'create':
                options.success = function(resp, _status, _xhr) {
                    var updatedModel;
                    if (options.async && hasOfflineStatusCode(options.xhr)) {
                        return useOfflineStorage();
                    }
                    updatedModel = modelUpdatedWithResponse(model, resp);
					if(_xhr.status != 200 || isTempId(options.temp_id)){
						localsync(method, updatedModel, options);
					}
                    return success(resp, _status, _xhr);
                };
                options.error = function(xhr) {
                    return relayErrorCallback(xhr);
                };
                return options.xhr = onlineSync(method, model, options);
            case 'patch':
            case 'update':
                if (model.hasTempId()) {
                    temporaryId = model.id;
                    options.success = function(resp, _status, _xhr) {
                        var updatedModel;
                        if (options.async && hasOfflineStatusCode(options.xhr)) {
                            return useOfflineStorage();
                        }
                        updatedModel = modelUpdatedWithResponse(model, resp);
                        model.set(model.idAttribute, temporaryId, {
                            silent: true
                        });
						//if(_xhr.status != 200){
							localsync('delete', model, options);
                        	localsync('create', updatedModel, options); 
						//}
                        return success(resp, _status, _xhr);
                    };
                    options.error = function(xhr) {
                        model.set(model.idAttribute, temporaryId, {
                            silent: true
                        });
                        return relayErrorCallback(xhr);
                    };
                    model.set(model.idAttribute, null, {
                        silent: true
                    });
                    return options.xhr = onlineSync('create', model, options);
                } else {
                    options.success = function(resp, _status, _xhr) {
                        var updatedModel;
                        if (options.async && hasOfflineStatusCode(options.xhr)) {
                            return useOfflineStorage();
                        }
                        updatedModel = modelUpdatedWithResponse(model, resp);
						if(_xhr.status != 200){
							localsync(method, updatedModel, options);
						}
                        return success(resp, _status, _xhr);
                    };
                    options.error = function(xhr) {
                        return relayErrorCallback(xhr);
                    };
                    return options.xhr = onlineSync(method, model, options);
                }
                break;
            case 'delete':
                if (model.hasTempId()) {
                    options.ignoreCallbacks = false;
                    return localsync(method, model, options);
                } else {
                    options.success = function(resp, _status, _xhr) {
                        if (options.async && hasOfflineStatusCode(options.xhr)) {
                            return useOfflineStorage();
                        }
						if(_xhr.status != 200){
							localsync(method, model, options);
						}
                        
                        return success(resp, _status, _xhr);
                    };
                    options.error = function(xhr) {
                        return relayErrorCallback(xhr);
                    };
                    return options.xhr = onlineSync(method, model, options);
                }
        }
    };

    Backbone.sync = dualsync;

}).call(this);