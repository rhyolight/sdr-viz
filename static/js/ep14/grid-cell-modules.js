$(function () {
    let HexagonGridCellModule = window.HTM.gridCells.HexagonGridCellModule
    let GridCellModuleRenderer = window.HTM.gridCells.GridCellModuleRenderer

    const minScale = 20,
        maxScale = 80,
        minOrientation = 0,
        maxOrientation = 45

    let GlobalConfig = function() {
        this.lite = false
        this.sdr = false
        this.showFields = true
        this.screenLock = false
        this.showNumbers = false
        this.stroke = 3
    };
    let config = new GlobalConfig();

    //////////
    // UTILS

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }

    function toggleScreenLock() {
        config.screenLock = ! config.screenLock
    }

    function prepareDom() {
        $('body').html('');
    }

    function setupDatGui(modules, renderer) {
        let gui = new dat.GUI();
        let moduleFolders = [];

        gui.add(config, 'lite').onChange(function(value) {
            config.lite = value;
            renderer.render(config);
        });

        gui.add(config, 'sdr').onChange(function(value) {
            config.sdr = value;
            d3.select('#encoding svg').remove()
            renderer.render(config);
        });

        gui.add(config, 'showFields').onChange(function(value) {
            config.showFields = value;
            d3.select('#encoding svg').remove()
            renderer.render(config);
        });

        gui.add(config, 'showNumbers').onChange(function(value) {
            config.showNumbers = value;
            d3.select('#encoding svg').remove()
            renderer.render(config);
        });

        function updateAllControllerDisplays() {
            moduleFolders.forEach(function(folder) {
                for (let i in folder.__controllers) {
                    folder.__controllers[i].updateDisplay();
                }
            });
        }

        modules.forEach(function(module, i) {
            let folder = gui.addFolder('Module ' + module.id)
            folder.add(module, 'visible').onChange(function(value) {
                module.visible = value;
                renderer.render(config);
            });
            folder.add(module, 'weight', 1, 5).onChange(function(value) {
                module.weight = value;
                renderer.render(config);
            }).step(1);
            folder.add(module, 'scale', minScale, maxScale).onChange(function(value) {
                module.scale = value;
                renderer.render(config);
            });
            folder.add(module, 'activeCells', 1, 10).onChange(function(value) {
                module.activeCells = value;
                renderer.render(config);
            }).step(1);
            folder.add(module, 'orientation', minOrientation, maxOrientation).onChange(function(value) {
                module.orientation = value;
                renderer.render(config);
            });
            // folder.open();
            moduleFolders.push(folder);
        });
    }

    // END UTILS
    /////////////

    let gridCellModules = [];


    function run() {
        prepareDom();

        let numModules = 5
        let count = 0

        while (count < 5) {
            let orientation = getRandomInt(0, 30)
            let scale = getRandomInt(40, 50)
            let module = new HexagonGridCellModule(count, 4, 4, orientation, scale)
            module.setColor(getRandomInt(100, 255), getRandomInt(100, 255), getRandomInt(100, 255))
            module.activeCells = 1
            module.weight = 1
            if (count == 0) {
                module.visible = true
            } else {
                module.visible = false
            }
            gridCellModules.push(module)
            count++
        }

        let renderer = new GridCellModuleRenderer(gridCellModules)

        renderer.prepareRender();
        setupDatGui(gridCellModules, renderer)

        renderer.render(config)

        if (renderer.worldPoints) {

            renderer.onWorld('mousemove', function() {
                renderer.renderFromWorld(config, d3.event.pageX, d3.event.pageY)
            });

            renderer.onOverlay('mousemove', function(_, i) {
                renderer.renderFromOverlay(i, config, d3.event.offsetX, d3.event.offsetY)
            })
        }
    }

    $(document).keyup(function(e) {
        if (e.keyCode === 32) {
            toggleScreenLock();
        }
    });

    window.onload = run;
});
