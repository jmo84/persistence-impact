ig.module( 
	'plugins.persistence' 
)
.requires(
	'impact.game'
)
.defines(function(){
	
	/**
	 * Contains functions to persist entity state
	 * @class
	 */
	Persistence = ig.Class.extend({
		
		/**
		 * Initializes a new Persistence system
		 * @constructs
		 */		
		init: function() {
			this.stateLoadFunctions = Persistence.globalLoadFunctions.slice(0);
			this.stateSaveFunctions = Persistence.globalSaveFunctions.slice(0);
		},

		/**
		 * Finds all persistable objects and returns an array with their state
		 * @returns {Array}
		 */
		getLevelState: function() {
			var i, entity, entityState, eid,
				levelState = false,
				entities = ig.game.entities.slice(0);
			
			if (this.killedEntities) {
				entities = entities.concat(this.killedEntities);
			}
			
			for (i = 0; i < entities.length; i++) {
				entity = entities[i];
				
				if (!entity.persist) {
					continue;
				}
				
				eid = this.getEntityIdentifier(entity);
				if (!eid) {
					continue;
				}
				
				entityState = {
					id: eid,
					x:  entity.pos.x,
					y: entity.pos.y
				};
				
				if (entity._killed || entity.isKilled) {
					entityState.killed = 1;
				}
				
				this.runStateHandlers('Save', entity, entityState);
				
				if (entity.persistenceSave) {
					entity.persistenceSave(entityState);
				}
				
				if (!levelState) {
					levelState = [];	
				}
				
				levelState.push(entityState);
			}
			
			return levelState;
		},
		
		/**
		 * Finds all persistable objects and returns an array with their state
		 * @param	{Array}	Array of states computed from getLevelState
		 * @returns {Number} Count of how many objects were restored using state passed in
		 */		
		loadLevelState: function(levelState) {
			var entities = ig.game.entities,
				loadCount = 0, i, entity;
			
			this.killedEntities = [];
			
			for (i = 0; i < entities.length; i++) {
				entity = entities[i];
				
				if (!entity.persist) {
					continue;
				}
				
				entity.originPersistId = {
					x: entity.pos.x,
					y: entity.pos.y
				};

				if (levelState) {

					if (this.loadEntityState(entity, levelState)) {
						loadCount++;
					} else {
						//console.log("state not found", this.getEntityIdentifier(entity));
					}
				}

			}
			
			return loadCount;
		},

		/**
		 * Restores a single object using a state array
		 * @param	{ig.Entity} entity		Single entity to restore
		 * @param	{Array}		levelState	Array of states computed from getLevelState
		 * @returns {Number}	Count of how many objects were restored using state passed in
		 */		
		loadEntityState: function(entity, levelState) {
			
			var eid = this.getEntityIdentifier(entity),
				levelStateItem, s, key, value;
			
			for (s = 0; s < levelState.length; s++) {
				levelStateItem = levelState[s];

				if (levelStateItem.id == eid) {

					this.runStateHandlers('Load', entity, levelStateItem);
					
					if (entity.persistenceLoad) {
						entity.persistenceLoad(levelStateItem);
					}
					
					for (key in levelStateItem) {
						
						if (levelStateItem.hasOwnProperty(key)) {
							value = levelStateItem[key];
							
							if (key == 'id') {
								entity.idPersisted = value; 
							} else if (key == 'x') {
								entity.pos.x = value;
							} else if (key == 'y') {
								entity.pos.y = value;
							} else if (key == 'killed') {
								ig.game.removeEntity(entity);
							} else {
								entity[key] = value;
							}
						}
					}
					
					return true;
				}
			}
			
			return false;
		},

		/**
		 * Computes a identifier used to restore an object
		 * @param	{ig.Entity} entity		An entity to get an identifier
		 * @returns {String}
		 */			
		getEntityIdentifier: function(entity) {
			var pos = entity.originPersistId || entity.pos;

			return 'x_' + pos.x + '_y_' + pos.y;
		},

		/**
		 * Calls all functions assigned to handle persistence 
		 * @param	{String}		name		Event name (Load, Save)
		 * @param	{ig.Entity} entity	Entity context
		 * @param	{Object}		state		State data (single object)
		 * @returns {undefined}	
		 */		
		runStateHandlers: function(name, entity, state) {
			var func, i,
				list = this['state' + name + 'Functions'];
				 
			if (!list) {
				return;
			}
			
			for (i = 0; i < list.length; i++) {
				func = list[i];
				func.call(entity, state);
			}			
		}

	});
	
	Persistence.globalLoadFunctions = [];
	Persistence.globalSaveFunctions = [];
	
	ig.Game.inject({
		
		staticInstantiate: function() {
			this.parent();
			ig.game.persistence = new Persistence();
		},
		
		removeEntity: function(entity) {
			
			if (entity.persist && !entity._killed) {

				if (!this.persistence.killedEntities) {
					this.persistence.killedEntities = [];
				}
				
				this.persistence.killedEntities.push(entity);
			}
			
			this.parent(entity);
		}
		
	});
});