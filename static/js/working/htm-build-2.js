//(function() {
//
//    const cfg = {
//        InputSpaceDimensions: 1000,
//        MiniColumnCount: 500,
//        ReceptiveFieldPerc: .8,
//        ProximalConnectionThreshold: .2,
//        ProximalActivityThreshold: .5,
//        InitialProximalConnectionVariation: .3,
//        MiniColumnInhibitionPerc: .2,
//    }
//
//    let miniColumns = []
//
//    let left = []
//    for (let i=0; i<500; i++) {
//        left.push(1)
//    }
//    for (let i=0; i<500; i++) {
//        left.push(0)
//    }
//    let right = []
//    for (let i=0; i<500; i++) {
//        right.push(0)
//    }
//    for (let i=0; i<500; i++) {
//        right.push(1)
//    }
//
//
//    function getRandomArbitrary(min, max) {
//        return Math.random() * (max - min) + min;
//    }
//
//    function getRandomConnectionVariation() {
//        return getRandomArbitrary(-cfg.InitialProximalConnectionVariation,
//            cfg.InitialProximalConnectionVariation)
//    }
//
//
//    /**
//     * @param receptiveFieldPerc
//     * @param dimensions
//     * @returns list of indices in input space
//     */
//    function getRandomReceptiveField(receptiveFieldPerc, dimensions) {
//        let indices = []
//        let cursor = 0
//        while (cursor < dimensions) {
//            if (Math.random() <= receptiveFieldPerc) {
//                indices.push(cursor)
//            }
//            cursor++
//        }
//        return indices.map((i) => {
//            return {
//                index: i,
//                permanence: cfg.ProximalConnectionThreshold + getRandomConnectionVariation()
//            }
//        })
//    }
//
//
//    function processInput(miniColumns, input) {
//        miniColumns.forEach((mc) => {
//            let activeBits = []
//            mc.receptiveField.forEach((rf) => {
//                if (rf.permanence >= cfg.ProximalConnectionThreshold) {
//                    activeBits.push({
//                        miniColumnIndex: mc.index,
//                        inputSpaceIndex: rf.index
//                    })
//                }
//            })
//            if (activeBits.length > cfg.ProximalActivityThreshold * mc.receptiveField.length) {
//                mc.state = 1
//            } else {
//                mc.state = 0
//            }
//        })
//    }
//
//    function getInputNow() {
//        if (Date.now() % 2 === 0) {
//            return left
//        }
//        return right
//    }
//
//    function step() {
//        let input = getInputNow()
//        processInput(miniColumns, input)
//
//    }
//
//    function setupDatGui() {
//        let gui = new dat.GUI();
//        let initialization = gui.addFolder('Initialization')
//        initialization.add(cfg, 'ReceptiveFieldPerc', 0, 1).onChange((value) => {
//            cfg.ReceptiveFieldPerc = value
//            step()
//        })
//        initialization.open()
//        let connections = gui.addFolder('Connections')
//        connections.add(cfg, 'ProximalConnectionThreshold', 0, 1).onChange((value) => {
//            cfg.ProximalConnectionThreshold = value
//            step()
//        })
//        connections.add(cfg, 'ProximalActivityThreshold', 0, 1).onChange((value) => {
//            cfg.ProximalActivityThreshold = value
//            step()
//        })
//        connections.open()
//        let inhibition = gui.addFolder('Inhibition')
//        inhibition.add(cfg, 'MiniColumnInhibitionPerc', 0, 1).onChange((value) => {
//            cfg.MiniColumnInhibitionPerc = value
//            step()
//        })
//        inhibition.open()
//    }
//
//
//    let cursor = 0
//    while (cursor < cfg.MiniColumnCount) {
//        miniColumns.push({
//            index: cursor,
//            state: 0,
//            receptiveField: getRandomReceptiveField(cfg.ReceptiveFieldPerc, cfg.InputSpaceDimensions)
//        })
//        cursor++
//    }
//
//
//    setupDatGui()
//
//    $(document).ready(() => {
//        setInterval(() => {
//            step()
//        }, 1000)
//    })
//
//
//}())

$(function() {
    // The scale is same as "cube size". This makes the cubes 100
    // pixels.
    const scale = 100
    const oneColTwoLayers = {
        name: "one column, two layers",
        origin: {x: 0, y: 0, z: 0},
        scale: scale,
        corticalColumns: [{
            // Puts one cell between layers
            spacing: scale,
            name: "column 1",
            layers: [
                {
                    name: "layer 4",
                    miniColumns: false,
                    neuronCount: 4*3*4,
                    dimensions: {
                        x: 4, y: 3, z: 4
                    }
                },
                {
                    name: "layer 2/3",
                    miniColumns: false,
                    neuronCount: 5*3*5,
                    dimensions: {
                        x: 5, y: 3, z: 5
                    }
                },
                {
                    name: "input space",
                    miniColumns: false,
                    neuronCount: 10*1*10,
                    dimensions: {
                        x: 10, y: 1, z: 10
                    }
                }
            ]
        }]
    }
    var network = Highbrow.createHtmNetwork(oneColTwoLayers)
    var column = network.getCorticalColumns()[0]

    var cellviz = new HighbrowColumnVisualization(column, {cubeSize: scale});

    animateCells(column);

    // Renders the canvas with empty cells into the DOM and canvas.
    cellviz.render();

    setInterval(function() {
        animateCells(column);
        cellviz.redraw();
    }, 500);

    function animateCells(column) {
        // We're going straight to the Highbrow objects to
        // update neuron states. We can access all the highbrow
        // state from the layer directly and change it as we like.
        column.getLayers().forEach(function(layer) {
            layer.getNeurons().forEach(function(neuron) {
                if (Math.random() >= 0.98) {
                    neuron.activate()
                } else {
                    neuron.deactivate()
                }
            });
        });
    }
});
