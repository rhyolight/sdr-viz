$(function() {

    var SP_DETAILS = [
        'permanences',
        'connectedSynapses',
        'potentialPools',
        'activeDutyCycles',
        'overlapDutyCycles'
    ];

    function decompress(sdr) {
        var out = [];
        _.times(sdr.length, function() {
            out.push(0);
        });
        _.each(sdr.indices, function(index) {
            out[index] = 1;
        });
        return out;
    }

    function compress(sdr) {
        var out = {
            length: sdr.length,
            indices: []
        };
        _.each(sdr, function(bit, i) {
            if (bit == 1) out.indices.push(i);
        });
        return out;
    }

    function validateOptions(opts) {
        _.each(opts, function(v, k) {
            if (SP_DETAILS.indexOf(k) == -1) {
                throw new Error('Cannot process SP Param "' + k + '"!');
            }
        });
    }

    function SpatialPoolerClient(save) {
        if (save != undefined) {
            this.save = save;
        }
    }

    SpatialPoolerClient.prototype.initialize = function(params, opts, callback) {
        var me = this;
        var url = '/_sp/';

        if (typeof(opts) == 'function') {
            callback = opts;
            opts = {};
        }
        validateOptions(opts);
        if (this.save != undefined) {
            opts.save = this.save;
        }
        url += '?' + $.param(opts);
        this.params = params;
        $.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(params),
            success: function(response) {
                me._id = response.id;
                callback(response);
            },
            dataType: 'JSON'
        });
    };

    SpatialPoolerClient.prototype.compute = function(encoding, learn, opts, callback) {
        var url = '/_sp/';

        if (typeof(opts) == 'function') {
            callback = opts;
            opts = {};
        }
        validateOptions(opts);
        opts = _.merge(opts, {id: this._id, learn: learn});
        url += '?' + $.param(opts);

        $.ajax({
            type: 'PUT',
            url: url,
            data: JSON.stringify(compress(encoding)),
            success: function(response) {
                response.activeColumns = decompress(response.activeColumns);
                callback(response);
            },
            dataType: 'JSON'
        });
    };

    window.HTM.SpatialPoolerClient = SpatialPoolerClient;
});
