/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// Highbrow
// MIT License (see LICENSE)
// Copyright © 2017 Numenta <http://numenta.com>

/** @ignore */
const CONFIG_DEFAULTS = {
    scale: 1,
    spacing: 0

    /**
     * Abstract base class for renderable objects. All renderable objects must
     * provide the following function implementations:
     * - {@link getChildren}
     *
     * NOTE: The size of {@link Renderable} objects is not controlled by this API.
     * Clients of this API are responsible for sizing.
     */
};class Renderable {
    /**
     * @param {Object} config - Contains all the details the Renderable needs to
     *        know to calculate origins for itself and its children.
     * @param {float} config.scale - Scale of this renderable object.
     * @param {Renderable} parent - The parent Renderable object (optional).
     * @param {number} scale - Default 1.0, used for UI clients to scale the
     *        drawings.
     */
    constructor(config, parent = undefined) {
        // Clone the config so we don't change it in case it is reused somewhere
        // else.
        this._config = Object.assign({}, config);
        this._parent = parent;
        this._scale = this._getConfigValueOrDefault("scale");
        this._origin = this._getConfigValueOrDefault("origin");
        this._spacing = this._getConfigValueOrDefault("spacing");
    }

    // Utility for overridding default values and throwing error if no value
    // exists.
    _getConfigValueOrDefault(name) {
        let out = CONFIG_DEFAULTS[name];
        if (this._config.hasOwnProperty(name)) {
            out = this._config[name];
        }
        if (out == undefined) {
            throw new Error("Cannot create Renderable without " + name);
        }
        return out;
    }

    // Utility for apply this object's scale to any xyz point.
    _applyScale(point) {
        let scale = this.getScale();
        return {
            x: point.x * scale,
            y: point.y * scale,
            z: point.z * scale
        };
    }

    /**
     * @return {Object} Configuration object used to create this.
     */
    getConfig() {
        return this._config;
    }

    getDimensions() {
        throw new Error("Renderable Highbrow objects must provide getDimensions()");
    }

    /**
     * Point of origin for this {@link Renderable} to be drawn in 3D.
     *
     * @return {Object} point with 3D coordinates
     * @property {number} x x coordinate
     * @property {number} y y coordinate
     * @property {number} z z coordinate
     */
    getOrigin() {
        // Returns a copy or else someone could inadvertantly change the origin.
        return Object.assign({}, this._origin);
    }

    /**
     * Changing the scale of of a {@link Renderable} will affect the origins of
     * children. Use {@link setOffset} with this function to reposition this
     * {@link Renderable}'s children.
     */
    setScale(scale) {
        this._scale = scale;
        if (this.getChildren().length) {
            this.getChildren().forEach(child => {
                child.setScale(scale);
            });
        }
    }

    /**
     * @return {number} scale See {@link setScale}.
     */
    getScale() {
        return this._scale;
    }

    getSpacing() {
        return this._spacing;
    }

    /**
     * @return {string} The name of this object.
     */
    getName() {
        return this._config.name;
    }

    getParent() {
        return this._parent;
    }

    /**
     * How subclasses provide access to their {@link Renderable} children.
     *
     * @abstract
     * @return {Renderable[]} children
     */
    getChildren() {
        throw new Error("Renderable Highbrow objects must provide getChildren()");
    }

    getChildByName(name) {
        return this.getChildren().find(child => child.getName() == name);
    }

    toString(verbose = false) {
        let out = `${this.constructor.name} ${this.getName()}`;
        let children = this.getChildren();
        if (children.length) {
            for (let child of children) {
                out += "\t" + child.toString(verbose).split("\n").map(s => "\n\t" + s).join("");
            }
        }
        return out;
    }

}

module.exports = Renderable;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

// Highbrow
// MIT License (see LICENSE)
// Copyright © 2017 Numenta <http://numenta.com>

/**
 * All the states a neuron might be in.
 *
 * @todo Sometimes a neuron will be in more than one state at once. This either
 * needs to define mixed states or Neuron's should be allowed to be in multiple
 * states.
 */
const NeuronState = {
  inactive: "inactive",
  active: "active",
  depolarized: "depolarized"

  /**
   * All the states a mini-column might be in.
   */
};const MiniColumnState = {
  inactive: "inactive",
  active: "active"

  /**
   * The types of links layers can have between them.
   */
};const HtmLinkType = {
  apical: "apical",
  distal: "distal",
  proximal: "proximal"
};

module.exports = { NeuronState, MiniColumnState, HtmLinkType };

/***/ }),
/* 2 */
/***/ (function(module, exports) {

// Highbrow
// MIT License (see LICENSE)
// Copyright © 2017 Numenta <http://numenta.com>

/**
 * @ignore Just a counter loop, including iterator.
 */
const times = n => f => {
    let iter = i => {
        if (i === n) return;
        f(i);
        iter(i + 1);
    };
    return iter(0);
};

module.exports = { times };

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

// Highbrow
// MIT License (see LICENSE)
// Copyright © 2017 Numenta <http://numenta.com>

/** @ignore */
const Renderable = __webpack_require__(0);
/** @ignore */
const Neuron = __webpack_require__(8);
/** @ignore */
const NeuronState = __webpack_require__(1).NeuronState;

/** @ignore */
const times = __webpack_require__(2).times;

/*
 * Active cell indices returned from HTM systems generally are ordered with
 * mini-columns grouped together. Since we want to render mini-columns from top
 * to bottom, they need to be in the Y dimension, and that's why we translate
 * the cell indices into the Y dimension first.
 *
 * @param {integer} idx - global HTM cell index for neuron within layer
 * @param {integer} rx - range of the x dimension
 * @param {integer} ry - range of the y dimension
 * @param {integer} rz - range of the z dimension
 * @return {Object} The position (not coordinate)
 * @property {integer} x x position
 * @property {integer} y y position
 * @property {integer} z z position
 */
/** @ignore */
function getXyzPositionFromIndex(idx, xsize, ysize) {
    var zcapacity = xsize * ysize;
    var x = 0,
        y = 0,
        z = 0;
    if (idx >= zcapacity) {
        z = Math.floor(idx / zcapacity);
    }
    var idx2d = idx - zcapacity * z;
    if (idx2d > ysize - 1) {
        x = Math.floor(idx2d / ysize);
    }
    var y = idx2d - ysize * x;
    return { x: x, y: y, z: z };
}

/**
 * Represents a cortical layer within a {@link CorticalColumn}.
 */
class Layer extends Renderable {
    constructor(config, parent) {
        super(config, parent);
        if (config.dimensions == undefined) {
            throw Error("Cannot create Layer without dimensions");
        }
        this._dimensions = config.dimensions;
        this._buildLayer();
    }

    /**
     * Builds out the layer from scratch using the config object. Creates an
     * array of {@link Neuron}s that will be used for the lifespan of the Layer.
     */
    _buildLayer() {
        this._neurons = [];
        let count = this._config.neuronCount;
        let layerOrigin = this.getOrigin();
        let spacing = this.getSpacing();
        for (let i = 0; i < count; i++) {
            let position = getXyzPositionFromIndex(i, this._dimensions.x, this._dimensions.y);
            // When creating children, we must apply the scale to the origin
            // points to render them in the right perspective.
            let scaledPosition = this._applyScale(position);
            // Start from the layer origin and add the scaled position.
            let origin = {
                x: layerOrigin.x + scaledPosition.x + position.x * spacing,
                y: layerOrigin.y + scaledPosition.y + position.y * spacing,
                z: layerOrigin.z + scaledPosition.z + position.z * spacing
            };
            let neuron = new Neuron({
                name: `Neuron ${i}`,
                state: NeuronState.inactive,
                index: i,
                position: position,
                origin: origin
            }, this);
            this._neurons.push(neuron);
        }
        if (this._config.miniColumns) {
            // TODO: implement minicolumns.
        }
    }

    getDimensions() {
        return this._dimensions;
    }

    /**
     * This function accepts HTM state data and updates the positions and states
     * of all {@link Renderable} HTM components.
     *
     * @param {list} activeCellIndexes - integers for indexes of active cells.
     * @param {list} activeColumnIndexes - integers for indexes of active
     *        mini-columns.
     */
    update(activeCellIndexes, activeColumnIndexes) {
        let index = 0;
        for (let neuron of this.getNeurons()) {
            if (activeCellIndexes.includes(index)) {
                neuron.setState(NeuronState.active);
            } else {
                neuron.setState(NeuronState.inactive);
            }
            index++;
        }
    }

    /**
     * Will return a list of {@link Neuron}s in global cell order.
     * @override
     * @returns {Neuron[]} all the neurons in global cell order
     */
    getChildren() {
        return this.getNeurons();
    }

    /**
     * Will return a list of {@link Neuron}s in global cell order.
     * @override
     * @returns {Neuron[]} all the neurons in global cell order
     */
    getNeurons() {
        return this._neurons;
    }

    /**
     * Get {@link Neuron} by global cell index.
     * @param {int} index - index of neuron to get
     * @returns {Neuron} the neuron at specified index
     * @throws {KeyError} if invalid index
     */
    getNeuronByIndex(index) {
        return this.getNeurons()[index];
    }

    /**
     * @override
     */
    toString(verbose = false) {
        let out = `${this.constructor.name} ${this.getName()}`;
        if (verbose) {
            let children = this.getChildren();
            if (children.length) {
                for (let child of children) {
                    out += "\t" + child.toString().split("\n").map(s => "\n\t" + s).join("");
                }
            }
        } else {
            out += ` contains ${this._neurons.length} neurons scaled by ${this.getScale()}`;
        }
        return out;
    }

}

/**
 * Represents a mini-column within a {@link Layer}.
 */
class MiniColumn extends Renderable {
    constructor(config, parent) {
        super(config, parent);
    }
}

module.exports = Layer;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

// Highbrow
// MIT License (see LICENSE)
// Copyright © 2017 Numenta <http://numenta.com>

/** @ignore */
const Renderable = __webpack_require__(0);

/**
 * Represents data flow between {@link Layer}s.
 */
class HtmNetworkLink extends Renderable {
    /**
     * @param {Layer} to - Where link data originates.
     * @param {Layer} from - Where link data terminates.
     * @param {HtmLinkType} type - Type of link.
     */
    constructor(config, parent, from, to, type) {
        super(config, parent);
        this._from = from;
        this._to = to;
        this._type = type;
    }

    getOrigin() {
        throw new Error("Not implemented");
    }

    /**
     * @override noop, has no children.
     */
    getChildren() {
        return [];
    }

    /**
     * @return {Layer} Where the link data originates.
     */
    getFrom() {
        return this.getParent();
    }

    /**
     * @return {Layer} Where the link data terminates.
     */
    getTo() {
        return this.getChildren()[0];
    }

}

module.exports = HtmNetworkLink;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

// Highbrow
// MIT License (see LICENSE)
// Copyright © 2017 Numenta <http://numenta.com>

/** @ignore */
const Renderable = __webpack_require__(0);
/** @ignore */
const Layer = __webpack_require__(3);

/**
 * Represents a cortical column.
 */
class CorticalColumn extends Renderable {
    constructor(config, parent) {
        super(config, parent);
        this._buildColumn();
    }

    _buildColumn() {
        let columnOrigin = this.getOrigin();
        let scale = this.getScale();
        let processedLayers = [];

        // Reverse the layer configuration so that they render from bottom to
        // top. slice() copies the array first so the config is not altered.
        let reversedLayers = this._config.layers.slice().reverse();
        reversedLayers.map((layerConfigOriginal, layerIndex) => {
            let layerConfig = Object.assign({}, layerConfigOriginal);
            // Only pass along the column's scale if there is no user-defined
            // scale present.
            if (layerConfig.scale == undefined) {
                layerConfig.scale = scale;
            }
            layerConfig.origin = this.getOrigin();

            // Default cell spacing for layers will be 10% of scale, or 0
            if (layerConfig.spacing == undefined) {
                layerConfig.spacing = scale / 10;
                if (layerConfig.spacing < 1) layerConfig.spacing = 0;
            }

            // Get the total height of previously processed layers so we know
            // where to put the origin for this layer.
            let layerY = processedLayers.map(processedLayer => {
                let ydim = processedLayer.getDimensions().y;
                let cellHeight = ydim * processedLayer.getScale();
                let spacingHeight = (ydim - 1) * processedLayer.getSpacing();
                let columnSpacing = this.getSpacing();
                return cellHeight + spacingHeight + columnSpacing;
            }).reduce((sum, value) => {
                return sum + value;
            }, 0);

            layerConfig.origin.y = layerConfig.origin.y + layerY;

            let layer = new Layer(layerConfig, this);
            processedLayers.push(layer);
            return layer;
        });
        // The layers were processed in reverse order, reverse them again.
        this._layers = processedLayers.reverse();
    }

    /**
     * This function accepts HTM state data and updates the
     * positions and states of all {@link Renderable} HTM components.
     *
     * @param {Object} data - I don't know what this is going to look like yet.
     */
    update(data) {
        for (let layerConfig of this.getConfig()['layers']) {
            // console.log(layerConfig)
            let layer = this.getChildByName(layerConfig.name);
            // console.log(layer.toString())
            let layerData = data[layerConfig.name];
            let activeCellIndexes = undefined;
            let activeColumnIndexes = undefined;
            // Handles if only cell data is sent
            if (Array.isArray(layerData)) {
                activeCellIndexes = layerData;
            } else {
                activeCellIndexes = layerData.activeCells;
                activeColumnIndexes = layerData.activeColumns;
            }
            layer.update(activeCellIndexes, activeColumnIndexes);
        }
    }

    /**
     * @override
     */
    getChildren() {
        return this.getLayers();
    }

    getLayers() {
        return this._layers;
    }

    /**
     * @return {HtmNetworkLink[]} All the links within this column. Does not
     *         return inter-column links. You must get those from the parent.
     */
    getHtmNetworkLinks() {
        let columnLinks = this.getCorticalColumns().map(c => {
            c.getHtmNetworkLinks();
        });
        return [].concat(...columnLinks);
    }
}

module.exports = CorticalColumn;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

// Highbrow
// MIT License (see LICENSE)
// Copyright © 2017 Numenta <http://numenta.com>

/** @ignore */
const Renderable = __webpack_require__(0);
/** @ignore */
const CorticalColumn = __webpack_require__(5);

/**
 * Encapsulates all {@link Renderable} HTM components in the network.
 */
class HtmNetwork extends Renderable {
    constructor(config, parent) {
        super(config, parent);
        this._corticalColumns = this._config.corticalColumns.map(config => {
            // Attach the same origin as the parent, but a clone.
            config.origin = Object.assign({}, this.getOrigin());
            // use the same scale as well
            config.scale = this.getScale();
            return new CorticalColumn(config, this);
        });
    }

    /**
     * This function accepts HTM state data and updates the positions and states
     * of all {@link Renderable} HTM components.
     * @param {Object} data - I don't know what this is going to look like yet.
     */
    update(data) {
        for (let columnConfig of this.getConfig()['corticalColumns']) {
            // console.log(columnConfig)
            let column = this.getChildByName(columnConfig.name);
            // console.log(column.toString())
            let columnData = data[columnConfig.name];
            column.update(columnData);
        }
    }

    /**
     * Provides access to all {@link CorticalColumn} children.
     * @override
     * @return {CorticalColumn[]} Cortical columns.
     */
    getChildren() {
        return this.getCorticalColumns();
    }

    /**
     * @return {CorticalColumn[]} Cortical columns.
     */
    getCorticalColumns() {
        return this._corticalColumns;
    }

    /**
     * @return {HtmNetworkLink[]} All the links in the whole network.
     */
    getHtmNetworkLinks() {
        let columnLinks = this.getCorticalColumns().map(c => {
            c.getHtmNetworkLinks();
        });
        return [].concat(...columnLinks);
    }

}

module.exports = HtmNetwork;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(1);
__webpack_require__(2);
__webpack_require__(0);
__webpack_require__(3);
__webpack_require__(4);
__webpack_require__(5);
__webpack_require__(6);
module.exports = __webpack_require__(9);


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

// Highbrow
// MIT License (see LICENSE)
// Copyright © 2017 Numenta <http://numenta.com>

/** @ignore */
const Renderable = __webpack_require__(0);
/** @ignore */
const NeuronState = __webpack_require__(1).NeuronState;

/**
 * Represents a pyramidal neuron. The atomic unit of HTM computation.
 */
class Neuron extends Renderable {
    constructor(config, parent) {
        super(config, parent);
        this._state = NeuronState.inactive;
        if (config.position == undefined) {
            throw Error("Cannot create Neuron without position");
        }
        this._position = config.position;
    }

    activate() {
        this.setState(NeuronState.active);
    }

    deactivate() {
        this.setState(NeuronState.inactive);
    }

    /**
     * The Neuron is the atomic unit of this visualization. It will always
     * return dimensions of 1,1,1.
     */
    getDimensions() {
        return { x: 1, y: 1, z: 1 };
    }

    /**
     * @override NOOP
     * @returns [] empty list
     */
    getChildren() {
        return [];
    }

    /**
     * @override
     */
    getName() {
        return `${this.index} (${this.state})`;
    }

    /**
     * @override
     */
    toString() {
        let n = this.getName();
        let p = this.getPosition();
        let o = this.getOrigin();
        return `${n} at position [${p.x}, ${p.y}, ${p.z}], coordinate [${o.x}, ${o.y}, ${o.z}]`;
    }

    setState(state) {
        this._state = state;
    }

    getState() {
        return this._state;
    }

    getPosition() {
        return this._position;
    }

    // This index only changes if the config changes (unlikely).
    getIndex() {
        return this.getConfig()["index"];
    }

}

module.exports = Neuron;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

// Highbrow
// MIT License (see LICENSE)
// Copyright © 2017 Numenta <http://numenta.com>

/** @ignore */
const NeuronState = __webpack_require__(1).NeuronState;
/** @ignore */
const MiniColumnState = __webpack_require__(1).MiniColumnState;
/** @ignore */
const HtmLinkType = __webpack_require__(1).HtmLinkType;
/** @ignore */
const Renderable = __webpack_require__(0);
/** @ignore */
const HtmNetwork = __webpack_require__(6);
/** @ignore */
const HtmNetworkLink = __webpack_require__(4).HtmNetworkLink;

/**
 * This is the top-level static entry class for Highbrow.
 */
class Highbrow {

    /**
     * Creates a new {@link HtmNetwork} with the given configuration.
     * @param {Object} config
     */
    static createHtmNetwork(config) {
        return new HtmNetwork(config);
    }

    /**
     * @return {@link NeuronState}
     */
    static getNeuronStates() {
        return NeuronState;
    }

    /**
     * @return {@link MiniColumnState}
     */
    static getMiniColumnStates() {
        return MiniColumnState;
    }

    /**
     * @return {@link HtmLinkType}
     */
    static getHtmLinkTypes() {
        return HtmLinkType;
    }
}
if (typeof window === 'undefined') {
    module.exports = Highbrow;
} else {
    window.Highbrow = Highbrow;
}

/***/ })
/******/ ]);