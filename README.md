# Persistence for ImpactJS

Using this plugin quickly enables ImpactJS to efficiently save and restore level states. This code works with the `entities` of `ig.Game` and exposes two key functions that a developer can use. The module defines a single instance of a `Persistence` class at `ig.game.persistence` although this is not required for the plugin to work properly.

## Methods
### getLevelState ()
Finds all persistable entities and returns an `Array` with their state objects. In order for an `ig.Entity` to be persistable, it must define a property called `persist` as true. This way you can choose which entities to save and restore later.
```javascript
//Call when the level ends, but before the next one is loaded
this.savedState = this.persistence.getLevelState();
```

### loadLevelState (`Array` levelState = `null`)
Loads an Array of state objects produced by getLevelState. Note that the parameter `levelState` is optional and for a good reason. If you call this method without a `levelState`, it simply prepares all persistable objects for later. It's a good idea to call this function right after the level is finished loading and your code does any post-loading initialization. You should check to see if a state is available, but call the function even if there isn't.

```javascript
loadLevel: function(data) {
    this.parent(data);
    // Any level loading code goes here
    
    // savedState may be undefined, but that's OK
    var currentLevelState = this.savedState;
    this.persistence.loadLevelState(currentLevelState);
}
```

Tip: Call the `loadLevelState` function before you move any entities with code, because it uses entity positions to identify entities.

### Properties That Are Persisted
Persistence doesn't save all properties of an Entity because that would be wasteful and slow. By default, it will only remember the position and whether or not it was killed. A typical state object will have these properties:

| Property | Description |
|----------|-------------|
| `x` | The X position from `pos.x` |
| `y` | The Y position from `pos.y` |
| `killed` | Whether or not the Entity was killed or in the process of dying |
| `id` | This is a persistence identifier. It's based on the entity's position defined in the level data. This is not related to the `id` of an entity that ImpactJS sets. |

Tip: If you want to persist the fact that an entity was killed before calling the entity's `kill` method, set an entity's `isKilled` property to `true` and the plugin will treat it as killed.

### Extending Persistence Behavior for an Entity
There's additional functionality that lets an `ig.Entity` define how it saves and loads instances of itself. If you need to add logic to the way a certain type of object is restored, this is the preferred way to do it. The functions you'll write will operate on a state object, which is a plain JavaScript object with the state properties defined on it. Just require the Persistence plugin from your entity module and define a save and load method after the entity. You should check if `this` is an instance of your desired entity, because your functions will be called against all entities in the state array.

```Javascript

// Inside a module that defines a door

EntityDoor = ig.Entity.extend({
    /* door code goes here */
});

Persistence.globalLoadFunctions.push(function(state) {
	if (!(this instanceof EntityDoor)) {
		return;
	}

	if (state.isOpen) {
		this.collides = ig.Entity.COLLIDES.NEVER;
		this.isOpen = 1;
	}
});

Persistence.globalSaveFunctions.push(function(state) {
	if (!(this instanceof EntityDoor)) {
		return;
	}
	
	if (this.isOpen) {
		state.isOpen = 1;
	}
});

```

Copyright (c) 2015 Jesse Oliveira

The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.










