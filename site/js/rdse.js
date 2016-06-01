$(function() {

    var n = 400;
    var w = 21;
    var resolution = 1.0;
    var lastEncoding = undefined;
    var encoding = undefined;
    var min = 0;
    var max = 1000;
    var minRange = [-100000, 0];
    var maxRange = [0, 100000];
    var value = 50;
    var lastValue = undefined;
    var compare = false;
    var rdse = undefined;
    var numBuckets = undefined;

    var $nSlider = $('#n-slider');
    var $wSlider = $('#w-slider');
    var $valueSlider = $('#value-slider');
    var $minSlider = $('#min-slider');
    var $maxSlider = $('#max-slider');
    var $resolutionSlider = $('#resolution-slider');
    var $bucketSlider = $('#bucket-slider');
    var $compareSwitch = $('#compare').bootstrapSwitch({state: false});

    var $nDisplay = $('#n-display');
    var $wDisplay = $('#w-display');
    var $valueDisplay = $('#value-display');
    var $minDisplay = $('#min-display');
    var $maxDisplay = $('#max-display');
    var $rangeDisplay = $('#range-display');
    var $lastValueDisplay = $('#last-value-display');
    var $resolutionDisplay = $('#resolution-display');
    var $bucketsDisplay = $('#buckets-display');

    function initParamsChanged(rdse) {
        return w !== rdse.w
            || n !== rdse.n
            || resolution !== rdse.resolution;
    }

    function createRdse(res, nBuckets, mn, mx) {
        if (! res) {
            res = (mx - mn) / nBuckets;
        }
        resolution = res;
        if (! rdse || initParamsChanged(rdse)) {
            rdse = new HTM.encoders.RDSE(res, n, w);
        }
    }

    function encodeScalar(input) {
        lastEncoding = encoding;
        lastValue = value;

        encoding = rdse.encode(input);

        if (lastEncoding && compare) {
            SDR.drawComparison(lastEncoding, encoding, 'encoding', {
                spartan: true,
                size: 60
            });
        } else {
            SDR.draw(encoding, 'encoding', {
                spartan: true,
                size: 60
            });
        }
    }

    function validate(testW, testN, testMin, testMax) {
        return testW < testN
            && testMin < testMax;
    }

    function drawSliders() {
        $nSlider.slider({
            min: 0,
            max: 2048,
            value: n,
            step: 1,
            slide: function(event, ui) {
                if (validate(w, ui.value, min, max)) {
                    n = ui.value;
                    updateUi();
                } else event.preventDefault();
            }
        });
        $wSlider.slider({
            min: 0,
            max: n,
            value: w,
            step: 1,
            slide: function(event, ui) {
                if (validate(ui.value, n, min, max)) {
                    w = ui.value;
                    updateUi();
                } else event.preventDefault();
            }
        });
        $resolutionSlider.slider({
            min: 0,
            max: 5,
            value: resolution,
            step: 0.01,
            slide: function(event, ui) {
                resolution = ui.value;
                createRdse(resolution);
                updateUi();
            }
        });
        $bucketSlider.slider({
            min: 0,
            max: 0,
            value: 0,
            step: 1,
            slide: function(event, ui) {
                numBuckets = ui.value;
                createRdse(null, numBuckets, min, max);
                updateUi();
            }
        });
        $minSlider.slider({
            min: minRange[0],
            max: minRange[1],
            value: min,
            step: 100,
            slide: function(event, ui) {
                min = ui.value;
                if (value < max) value = min;
                updateUi();
            }
        });
        $maxSlider.slider({
            min: maxRange[0],
            max: maxRange[1],
            value: max,
            step: 100,
            slide: function(event, ui) {
                max = ui.value;
                if (value > max) value = max;
                updateUi();
            }
        });
        $valueSlider.slider({
            min: min,
            max: max,
            value: value,
            step: 1,
            slide: function(event, ui) {
                value = ui.value;
                updateUi();
            }
        });
    }

    function addHandlers() {
        $compareSwitch.on('switchChange.bootstrapSwitch', function(evt, state) {
            compare = state;
        });
    }

    function updateUi() {
        encodeScalar(value);
        numBuckets = _.size(rdse.bucketMap);
        // Update display values.
        $wDisplay.html(w);
        $nDisplay.html(n);
        $valueDisplay.html(value);
        $minDisplay.html(min);
        $maxDisplay.html(max);
        $rangeDisplay.html(max - min);
        $resolutionDisplay.html(Math.round(resolution));
        $lastValueDisplay.html(lastValue);
        // Update slider bounds based on new values.
        $nSlider.slider('value', n);
        $wSlider.slider('option', 'max', n);
        $wSlider.slider('value', w);
        $valueSlider.slider('option', 'min', min - 100);
        $valueSlider.slider('option', 'max', max + 100);
        $bucketsDisplay.html(numBuckets);
        $bucketSlider.slider('value', numBuckets);
        $bucketSlider.slider('option', 'max', rdse._maxBuckets);
    }

    function initUi() {
        drawSliders();
        addHandlers();
        createRdse(resolution);
        updateUi();
    }

    initUi()
});