$(function() {

    var host = '/_proxy';

    function uncompressSdr(sdr) {
        var out = [];
        _.times(sdr.length, function() {
            out.push(0);
        });
        _.each(sdr.indices, function(index) {
            out[index] = 1;
        });
        return out;
    }

    function compressSdr(sdr) {
        var out = {
            indices: [],
            length: sdr.length
        };
        _.each(sdr, function(bit, index) {
            if (bit == 1) {
                out.indices.push(index);
            }
        });
        return out;
    }

    // TODO: Create an abstract base class for these two clients.

    ////////////////////////////////////////////////////////
    // Spatial Pooler Facade Client
    ////////////////////////////////////////////////////////

    var SpSnapshots = {
        INPUT: 'input',
        ACT_COL: 'activeColumns',
        POT_POOLS: 'potentialPools',
        INH_MASKS: 'inhibitionMasks',
        CON_SYN: 'connectedSynapses',
        PERMS: 'permanences',
        OVERLAPS: 'overlaps',
        ACT_DC: 'activeDutyCycles',
        OVP_DC: 'overlapDutyCycles',
        BST_FCTRS: 'boostFactors'
    };

    function SpatialPoolerClient(save) {
        this._id = undefined;
        this._save = save;
        if (this._save == undefined) {
            this._save = false;
        }
    }

    SpatialPoolerClient.prototype.initialize = function(params, callback) {
        var me = this;
        var url = host + '/_sp/';

        me.params = params;

        var payload = {
          params: params,
          states: [
            SpSnapshots.ACT_COL,
            SpSnapshots.POT_POOLS,
            SpSnapshots.CON_SYN,
            SpSnapshots.PERMS
          ],
          save: me._save
        };

        $.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(payload),
            success: function(response) {
                me._id = response.id;
                callback(null, response);
            },
            dataType: 'JSON'
        });

    };

    SpatialPoolerClient.prototype.compute =
    function(encoding, learn, states, callback) {
        var url = host + '/_sp/';
        if (learn) {
            learn = 'true';
        } else {
            learn = 'false';
        }
        var data = {
            id: this._id,
            encoding: encoding,
            learn: learn,
            states: states
        };
        $.ajax({
            type: 'PUT',
            url: url,
            data: JSON.stringify(data),
            success: function(response) {
                if (response.state.activeColumns) {
                    response.state.activeColumns = uncompressSdr(
                        response.state.activeColumns
                    );
                }
                callback(null, response);
            },
            dataType: 'JSON'
        });
    };

    SpatialPoolerClient.prototype.getColumnHistory = function(columnIndex, states, callback) {
        var url = host + '/_sp/' + this._id + '/history/' + columnIndex;
        url += '?states=' + states.join(',');
        $.ajax({
            type: 'GET',
            url: url,
            success: function(response) {
                callback(null, response);
            },
            dataType: 'JSON'
        });
    };


    ////////////////////////////////////////////////////////
    // Temporal Memory Facade Client
    ////////////////////////////////////////////////////////

    var TmSnapshots = {
        ACT_CELLS: 'activeCells'
    };

    function TemporalMemoryClient(save) {
        this._id = undefined;
        if (save != undefined) {
            this.save = save;
        } else {
            this.save = undefined;
        }
    }

    TemporalMemoryClient.prototype.initialize = function(params, opts, callback) {
        var me = this;
        var url = host + '/_tm/';

        if (typeof(opts) == 'function') {
            callback = opts;
            opts = {};
        }
        if (this.save) {
            opts.save = this.save.join(',');
        }
        url += '?' + $.param(opts);

        this.params = params;
        $.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(params),
            success: function(response) {
                me._id = response.meta.id;
                callback(null, response);
            },
            dataType: 'JSON'
        });
    };

    TemporalMemoryClient.prototype.compute = function(activeColumns, opts, callback) {
        var url = host + '/_tm/';
        var activeColumnIndices = compressSdr(activeColumns).indices;

        if (typeof(opts) == 'function') {
            callback = opts;
            opts = {};
        }
        opts = _.merge(opts, {id: this._id});
        url += '?' + $.param(opts);

        $.ajax({
            type: 'PUT',
            url: url,
            data: activeColumnIndices.join(','),
            success: function(response) {
                callback(null, response);
            },
            dataType: 'JSON'
        });
    };


    ////////////////////////////////////////////////////////
    // Compute Client
    ////////////////////////////////////////////////////////

    function ComputeClient(modelId, save) {
        if (modelId == undefined) {
            throw new Error(
                'Cannot create ComputeClient without an existing model id.');
        }
        this._id = modelId;
        if (save != undefined) {
            this.save = save;
        } else {
            this.save = undefined;
        }
    }

    ComputeClient.prototype.compute = function(encoding, opts, callback) {
        var url = host + '/_compute/';

        if (typeof(opts) == 'function') {
            callback = opts;
            opts = {};
        }
        opts = _.merge(opts, {id: this._id});
        url += '?' + $.param(opts);

        $.ajax({
            type: 'PUT',
            url: url,
            data: encoding.join(','),
            success: function(response) {
                response.activeColumns = uncompressSdr(response.activeColumns);
                callback(null, response);
            },
            dataType: 'JSON'
        });
    };


    window.HTM.SpatialPoolerClient = SpatialPoolerClient;
    window.HTM.SpSnapshots = SpSnapshots;
    window.HTM.TemporalMemoryClient = TemporalMemoryClient;
    window.HTM.TmSnapshots = TmSnapshots;
    window.HTM.ComputeClient = ComputeClient;


    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    function getRandomConnectionVariation() {
        let variation = .2
        return getRandomArbitrary(-variation, variation)
    }

    /**
     * @param receptiveFieldPerc
     * @param dimensions
     * @returns list of indices in input space
     */
    function getRandomReceptiveField(receptiveFieldPerc, dimensions, threshold) {
        let indices = []
        let cursor = 0
        while (cursor < dimensions) {
            if (Math.random() <= receptiveFieldPerc) {
                indices.push(cursor)
            }
            cursor++
        }
        return indices.map((i) => {
            return {
                index: i,
                permanence: threshold + getRandomConnectionVariation()
            }
        })
    }

    function LocalSpClient(save, cfg) {
        this._id = undefined;
        this._save = save;
        if (this._save == undefined) {
            this._save = false;
        }
        this._cfg = cfg
    }

    LocalSpClient.prototype.initialize = function(params, callback) {
        this._params = params
        // Create the Structure
        this.miniColumns = []
        let cursor = 0
        while (cursor < this._cfg.MiniColumnCount) {
            this.miniColumns.push({
                index: cursor,
                state: 0,
                receptiveField: getRandomReceptiveField(
                    this._cfg.ReceptiveFieldPerc,
                    this._cfg.InputSpaceDimensions,
                    this._cfg.ProximalConnectionThreshold
                )
            })
            cursor++
        }
        if (callback) callback(null, {state: this._createDisplayData()})
    };

    LocalSpClient.prototype._createDisplayData = function() {
        // Create the SP Data object for display
        let spData = {
            potentialPools: this.miniColumns.map((mc) => { return mc.receptiveField }),
            connectedSynapses: null,
            permanences: null,
        }
        let me = this
        this.miniColumns.forEach((mc) => {
            spData.potentialPools.push(mc.receptiveField)
            spData.connectedSynapses.push()
        })
    }

    // LocalSpClient.prototype.compute =
    //     function(encoding, learn, states, callback) {
    //         var url = host + '/_sp/';
    //         if (learn) {
    //             learn = 'true';
    //         } else {
    //             learn = 'false';
    //         }
    //         var data = {
    //             id: this._id,
    //             encoding: encoding,
    //             learn: learn,
    //             states: states
    //         };
    //         $.ajax({
    //             type: 'PUT',
    //             url: url,
    //             data: JSON.stringify(data),
    //             success: function(response) {
    //                 if (response.state.activeColumns) {
    //                     response.state.activeColumns = uncompressSdr(
    //                         response.state.activeColumns
    //                     );
    //                 }
    //                 callback(null, response);
    //             },
    //             dataType: 'JSON'
    //         });
    //     };

    // LocalSpClient.prototype.getColumnHistory = function(columnIndex, states, callback) {
    //     var url = host + '/_sp/' + this._id + '/history/' + columnIndex;
    //     url += '?states=' + states.join(',');
    //     $.ajax({
    //         type: 'GET',
    //         url: url,
    //         success: function(response) {
    //             callback(null, response);
    //         },
    //         dataType: 'JSON'
    //     });
    // };

    window.HTM.LocalSpClient = LocalSpClient;

});
