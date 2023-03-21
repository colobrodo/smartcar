/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/car.ts":
/*!********************!*\
  !*** ./src/car.ts ***!
  \********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.__esModule = true;
exports.randomGene = void 0;
var core_1 = __webpack_require__(/*! ./core */ "./src/core.ts");
var environment_1 = __webpack_require__(/*! ./environment */ "./src/environment.ts");
var graphics_1 = __webpack_require__(/*! ./graphics */ "./src/graphics.ts");
function randomGene() {
    var magnitude = environment_1.environment.car.maxMagnitude;
    return core_1.Vec2.random(magnitude);
}
exports.randomGene = randomGene;
function randomGenes(size) {
    return new Array(size)
        .fill(0)
        .map(function () { return randomGene(); });
}
var deadState = { kind: 'dead' };
var aliveState = { kind: 'alive' };
var Car = /** @class */ (function () {
    function Car(genes) {
        this.genes = genes;
        this.position = new core_1.Vec2(0, 0);
        this.velocity = new core_1.Vec2(0, 0);
        this.state = aliveState;
        this.hittedCheckpoints = new Set();
        this.width = 20;
        this.height = 40;
        this.sensors = environment_1.environment.car.sensors;
    }
    Car.random = function () {
        return new Car(randomGenes(environment_1.environment.car.genes));
    };
    Car.prototype.reference = function () {
        return new core_1.Reference2D(this.position, this.velocity.angle());
    };
    Car.prototype.update = function (circuit, time) {
        var _this = this;
        if (this.state.kind != 'alive')
            return;
        if (this.position.x < 0 || this.position.x > window.innerWidth)
            this.state = deadState;
        if (this.position.y < 0 || this.position.y > window.innerHeight)
            this.state = deadState;
        for (var _i = 0, _a = circuit.walls; _i < _a.length; _i++) {
            var wall = _a[_i];
            if (this.collide(wall)) {
                this.state = deadState;
                break;
            }
        }
        for (var _b = 0, _c = circuit.checkpoints; _b < _c.length; _b++) {
            var checkpoint = _c[_b];
            if (this.collide(checkpoint)) {
                this.hittedCheckpoints.add(checkpoint);
            }
        }
        if (this.collide(circuit.goal)) {
            this.state = {
                kind: 'completed',
                completitionTime: time
            };
        }
        if (this.state.kind != 'alive')
            return;
        // TODO: refactor this!
        var checkWalls = function (sensor) {
            var endSensor = _this.reference().getGlobal(sensor);
            return circuit.walls.some(function (wall) {
                return (0, core_1.lineIntersect)({
                    start: _this.position,
                    end: endSensor
                }, wall);
            });
        };
        var acceleration = new core_1.Vec2(0, 0);
        for (var i = 0; i < this.sensors.length; i += 1) {
            var sensor = this.sensors[i], gene = this.genes[i];
            if (checkWalls(sensor)) {
                acceleration.add(gene);
            }
        }
        this.position.add(this.velocity);
        this.velocity.add(acceleration.rotate(this.velocity.angle()));
    };
    Car.prototype.stillRunning = function () {
        return this.state == aliveState;
    };
    Car.prototype.draw = function (context) {
        var colors = environment_1.environment.colors;
        context.save();
        context.translate(this.position.x, this.position.y);
        context.rotate(this.velocity.angle());
        // draw sensors
        if (this.stillRunning()) {
            context.strokeStyle = colors.sensor;
            for (var _i = 0, _a = this.sensors; _i < _a.length; _i++) {
                var sensor = _a[_i];
                (0, graphics_1.drawLine)(context, {
                    start: new core_1.Vec2(0, 0),
                    end: sensor
                });
            }
        }
        // draw car
        context.fillStyle = context.strokeStyle = this.state == deadState ? colors.deadCar : colors.car;
        context.beginPath();
        context.rect(-this.height / 2, -this.width / 2, this.height, this.width);
        context.closePath();
        context.fill();
        context.stroke();
        context.restore();
    };
    Car.prototype.reset = function (position, velocity) {
        this.position = position.copy();
        this.velocity = velocity.copy();
        this.state = aliveState;
    };
    Car.prototype.collide = function (other) {
        var reference = this.reference(), ll = reference.getGlobal(new core_1.Vec2(-this.height / 2, -this.width / 2)), lr = reference.getGlobal(new core_1.Vec2(-this.height / 2, this.width / 2)), hl = reference.getGlobal(new core_1.Vec2(this.height / 2, -this.width / 2)), hr = reference.getGlobal(new core_1.Vec2(this.height / 2, this.width / 2));
        var collide = (0, core_1.lineIntersect)(other, { start: ll, end: lr })
            || (0, core_1.lineIntersect)(other, { start: ll, end: hl })
            || (0, core_1.lineIntersect)(other, { start: hl, end: hr })
            || (0, core_1.lineIntersect)(other, { start: hr, end: lr });
        return collide;
    };
    return Car;
}());
exports["default"] = Car;


/***/ }),

/***/ "./src/circuit.ts":
/*!************************!*\
  !*** ./src/circuit.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.__esModule = true;
var core_1 = __webpack_require__(/*! ./core */ "./src/core.ts");
var environment_1 = __webpack_require__(/*! ./environment */ "./src/environment.ts");
var graphics_1 = __webpack_require__(/*! ./graphics */ "./src/graphics.ts");
var Circuit = /** @class */ (function () {
    function Circuit(walls) {
        this.walls = walls;
        this.checkpoints = [];
        this.startVelocity = new core_1.Vec2(2, 1.6);
    }
    Circuit.prototype.draw = function (context) {
        var colors = environment_1.environment.colors;
        context.strokeStyle = colors.wall;
        for (var _i = 0, _a = this.walls; _i < _a.length; _i++) {
            var wall = _a[_i];
            (0, graphics_1.drawLine)(context, wall);
        }
        context.strokeStyle = colors.goal;
        if (this.goal)
            (0, graphics_1.drawLine)(context, this.goal);
        context.strokeStyle = colors.checkpoint;
        for (var _b = 0, _c = this.checkpoints; _b < _c.length; _b++) {
            var checkpoint = _c[_b];
            (0, graphics_1.drawLine)(context, checkpoint);
        }
        context.closePath();
        context.fillStyle = colors.spawnPoint;
        context.arc(this.spawnPoint.x, this.spawnPoint.y, 5, 0, 2 * Math.PI);
        context.fill();
        context.beginPath();
        context.strokeStyle = colors.spawnPoint;
        context.moveTo(this.spawnPoint.x, this.spawnPoint.y);
        var zoomFactor = 10, velocityArrow = this.spawnPoint.sum(this.startVelocity.mul(zoomFactor));
        context.lineTo(velocityArrow.x, velocityArrow.y);
        context.stroke();
        context.closePath();
    };
    Circuit.from = function (data) {
        function lineFrom(object) {
            var start = Object.assign(new core_1.Vec2(0, 0), object['start']), end = Object.assign(new core_1.Vec2(0, 0), object['end']);
            return { start: start, end: end };
        }
        var walls = data['walls'].map(lineFrom), goal = lineFrom(data['goal']), checkpoints = data['checkpoints'].map(lineFrom), spawnPoint = Object.assign(new core_1.Vec2(0, 0), data['spawnPoint']), startVelocity = Object.assign(new core_1.Vec2(0, 0), data['startVelocity']);
        return Object.assign(new Circuit([]), {
            walls: walls,
            goal: goal,
            checkpoints: checkpoints,
            spawnPoint: spawnPoint,
            startVelocity: startVelocity
        });
    };
    return Circuit;
}());
exports["default"] = Circuit;


/***/ }),

/***/ "./src/core.ts":
/*!*********************!*\
  !*** ./src/core.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports) => {


exports.__esModule = true;
exports.lineIntersect = exports.Reference2D = exports.Vec2 = void 0;
var Vec2 = /** @class */ (function () {
    function Vec2(x, y) {
        this.x = x;
        this.y = y;
    }
    Vec2.prototype.sum = function (other) {
        return new Vec2(this.x + other.x, this.y + other.y);
    };
    Vec2.prototype.minus = function (other) {
        return new Vec2(this.x - other.x, this.y - other.y);
    };
    Vec2.prototype.mul = function (k) {
        return new Vec2(this.x * k, this.y * k);
    };
    Vec2.prototype.div = function (k) {
        return new Vec2(this.x / k, this.y / k);
    };
    Vec2.prototype.add = function (other) {
        this.x += other.x;
        this.y += other.y;
    };
    Vec2.prototype.angle = function () {
        return Math.atan2(this.y, this.x);
    };
    Vec2.prototype.length = function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    };
    Vec2.prototype.distance = function (other) {
        return Math.sqrt(Math.pow((this.x - other.x), 2) + Math.pow((this.y - other.y), 2));
    };
    Vec2.prototype.angleBetween = function (other) {
        return Math.atan2(this.y - other.y, this.x - other.x);
    };
    Vec2.prototype.copy = function () {
        return new Vec2(this.x, this.y);
    };
    Vec2.prototype.rotate = function (angle) {
        var newAngle = this.angle() + angle, x = this.length() * Math.cos(newAngle), y = this.length() * Math.sin(newAngle);
        return new Vec2(x, y);
    };
    Vec2.random = function (magnitude) {
        if (magnitude === void 0) { magnitude = 1; }
        var factor = magnitude * 2;
        return new Vec2(Math.random() - .5, Math.random() - .5).mul(factor);
    };
    return Vec2;
}());
exports.Vec2 = Vec2;
var Reference2D = /** @class */ (function () {
    function Reference2D(origin, orientation) {
        this.origin = origin;
        this.orientation = orientation;
    }
    Reference2D.prototype.getGlobal = function (vector) {
        return vector.rotate(this.orientation).sum(this.origin);
    };
    return Reference2D;
}());
exports.Reference2D = Reference2D;
function lineIntersect(lineA, lineB) {
    var A1 = lineA.end.y - lineA.start.y, B1 = lineA.start.x - lineA.end.x, C1 = A1 * lineA.start.x + B1 * lineA.start.y, A2 = lineB.end.y - lineB.start.y, B2 = lineB.start.x - lineB.end.x, C2 = A2 * lineB.start.x + B2 * lineB.start.y, denominator = A1 * B2 - A2 * B1;
    if (denominator == 0) {
        return false;
    }
    var intersectX = (B2 * C1 - B1 * C2) / denominator, intersectY = (A1 * C2 - A2 * C1) / denominator, rx0 = (intersectX - lineA.start.x) / (lineA.end.x - lineA.start.x), ry0 = (intersectY - lineA.start.y) / (lineA.end.y - lineA.start.y), rx1 = (intersectX - lineB.start.x) / (lineB.end.x - lineB.start.x), ry1 = (intersectY - lineB.start.y) / (lineB.end.y - lineB.start.y);
    if (((rx0 >= 0 && rx0 <= 1) || (ry0 >= 0 && ry0 <= 1)) &&
        ((rx1 >= 0 && rx1 <= 1) || (ry1 >= 0 && ry1 <= 1))) {
        return true;
    }
    else {
        return false;
    }
}
exports.lineIntersect = lineIntersect;


/***/ }),

/***/ "./src/db.ts":
/*!*******************!*\
  !*** ./src/db.ts ***!
  \*******************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.__esModule = true;
exports.contains = exports.load = exports.save = exports.currentEntry = void 0;
var circuit_1 = __webpack_require__(/*! ./circuit */ "./src/circuit.ts");
function currentEntry() {
    var hash = window.location.hash.substring(1) || 'default';
    return hash;
}
exports.currentEntry = currentEntry;
function save(name, circuit) {
    var json = JSON.stringify(circuit);
    window.localStorage.setItem(name, json);
}
exports.save = save;
function load(name) {
    if (name === void 0) { name = null; }
    name !== null && name !== void 0 ? name : (name = currentEntry());
    var json = window.localStorage.getItem(name);
    if (!json)
        return null;
    var data = JSON.parse(json);
    return circuit_1["default"].from(data);
}
exports.load = load;
function contains(name) {
    return window.localStorage.getItem(name) != null;
}
exports.contains = contains;


/***/ }),

/***/ "./src/environment.ts":
/*!****************************!*\
  !*** ./src/environment.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.__esModule = true;
exports.environment = void 0;
var core_1 = __webpack_require__(/*! ./core */ "./src/core.ts");
var sensors = [new core_1.Vec2(30, 30), new core_1.Vec2(30, -30), new core_1.Vec2(45, 30), new core_1.Vec2(45, -30), new core_1.Vec2(50, 15), new core_1.Vec2(50, -15), new core_1.Vec2(50, 0)];
exports.environment = {
    colors: {
        sensor: '#ff000088',
        car: '#00ffff88',
        deadCar: '#aaaaaa44',
        checkpoint: 'green',
        wall: 'black',
        goal: 'red',
        spawnPoint: 'blue',
        lifespanBar: 'red'
    },
    crossover: 'uniform',
    mutation: 'discrete',
    mutationRate: 0.03,
    score: {
        base: 10,
        onGoal: 50,
        deadPenality: 0
    },
    lifespan: 800,
    population: {
        size: 30
    },
    car: {
        sensors: sensors,
        genes: sensors.length,
        maxMagnitude: 0.2
    }
};


/***/ }),

/***/ "./src/graphics.ts":
/*!*************************!*\
  !*** ./src/graphics.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {


exports.__esModule = true;
exports.isInsideCircle = exports.pointInLine = exports.drawLine = void 0;
function drawLine(context, line) {
    context.beginPath();
    context.moveTo(line.start.x, line.start.y);
    context.lineTo(line.end.x, line.end.y);
    context.stroke();
}
exports.drawLine = drawLine;
function pointInLine(point, line, nearThreshold) {
    if (nearThreshold === void 0) { nearThreshold = 0; }
    var ds = point.distance(line.start), de = point.distance(line.end);
    length = line.start.distance(line.end);
    return de + ds <= length + nearThreshold;
}
exports.pointInLine = pointInLine;
function isInsideCircle(point, center, radius) {
    return point.distance(center) <= radius;
}
exports.isInsideCircle = isInsideCircle;


/***/ }),

/***/ "./src/keyboard.ts":
/*!*************************!*\
  !*** ./src/keyboard.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {


exports.__esModule = true;
exports.keyboard = exports.Keyboard = exports.KeyboardModifiers = void 0;
var KeyboardModifiers;
(function (KeyboardModifiers) {
    KeyboardModifiers[KeyboardModifiers["NONE"] = 0] = "NONE";
    KeyboardModifiers[KeyboardModifiers["CTRL"] = 1] = "CTRL";
    KeyboardModifiers[KeyboardModifiers["SHIFT"] = 2] = "SHIFT";
})(KeyboardModifiers = exports.KeyboardModifiers || (exports.KeyboardModifiers = {}));
var Keyboard = /** @class */ (function () {
    function Keyboard(window) {
        var _this = this;
        this.handlers = new Map();
        window.addEventListener('keypress', function (event) { return _this.handleEvent(event); });
    }
    Keyboard.prototype.handleEvent = function (event) {
        var modifiers = KeyboardModifiers.NONE;
        if (event.shiftKey)
            modifiers |= KeyboardModifiers.SHIFT;
        if (event.ctrlKey)
            modifiers |= KeyboardModifiers.CTRL;
        var keyPress = { key: event.key, modifiers: modifiers }, handler = this.handlers.get(event.key);
        if (!handler)
            return;
        event.preventDefault();
        handler(event);
    };
    Keyboard.prototype.listen = function (key, handler, modifiers) {
        if (modifiers === void 0) { modifiers = KeyboardModifiers.NONE; }
        this.handlers.set(key, handler);
    };
    return Keyboard;
}());
exports.Keyboard = Keyboard;
exports.keyboard = new Keyboard(window);


/***/ }),

/***/ "./src/population.ts":
/*!***************************!*\
  !*** ./src/population.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.__esModule = true;
var car_1 = __webpack_require__(/*! ./car */ "./src/car.ts");
var core_1 = __webpack_require__(/*! ./core */ "./src/core.ts");
var environment_1 = __webpack_require__(/*! ./environment */ "./src/environment.ts");
var ui_1 = __webpack_require__(/*! ./ui */ "./src/ui/index.ts");
var Population = /** @class */ (function () {
    function Population(items) {
        this.items = items;
        this.size = this.items.length;
    }
    Population.prototype.splitPointCrossover = function (parentA, parentB) {
        var aGenes = parentA.genes, bGenes = parentB.genes, dnaLength = aGenes.length;
        var splitPoint = Math.floor(Math.random() * dnaLength);
        return aGenes.slice(0, splitPoint)
            .concat(bGenes.slice(splitPoint));
    };
    Population.prototype.uniformCrossover = function (parentA, parentB) {
        var aGenes = parentA.genes, bGenes = parentB.genes, dnaLength = aGenes.length, newDNA = [];
        for (var i = 0; i < dnaLength; i += 1) {
            // choose the gene randomly from first or second parent 
            var chooseFirst = Math.random() > .5, geneA = aGenes[i], geneB = bGenes[i], newGene = chooseFirst ? geneA : geneB;
            newDNA.push(newGene);
        }
        return newDNA;
    };
    Population.prototype.intermediateCrossover = function (parentA, parentB) {
        var aGenes = parentA.genes, bGenes = parentB.genes, dnaLength = aGenes.length, newDNA = [];
        for (var i = 0; i < dnaLength; i += 1) {
            // interpolate each gene of the parent by a random factor
            var alpha = Math.random(), geneA = aGenes[i], geneB = bGenes[i], newGene = geneA.sum(geneB.minus(geneA).mul(alpha));
            newDNA.push(newGene);
        }
        return newDNA;
    };
    Population.prototype.discreteMutation = function (dna) {
        for (var i = 0; i < dna.length; i += 1) {
            if (Math.random() < environment_1.environment.mutationRate)
                dna[i] = (0, car_1.randomGene)();
        }
    };
    Population.prototype.explicitMutation = function (dna) {
        for (var i = 0; i < dna.length; i += 1) {
            var gene = dna[i];
            if (Math.random() < environment_1.environment.mutationRate) {
                var perturbation = core_1.Vec2.random(.05);
                // TODO: clamp magnitude
                gene.add(perturbation);
            }
        }
    };
    Population.prototype.evaluate = function (circuit) {
        var lifespan = environment_1.environment.lifespan, matingPool = this.items;
        var crossover = {
            'split-point': this.splitPointCrossover,
            'intermediate': this.intermediateCrossover,
            'uniform': this.uniformCrossover
        }[environment_1.environment.crossover];
        var mutate = {
            'discrete': this.discreteMutation,
            'explicit': this.explicitMutation
        }[environment_1.environment.mutation];
        function fitness(car) {
            if (car.state.kind == 'completed') {
                return environment_1.environment.score.base + (1 - car.state.completitionTime / lifespan) * environment_1.environment.score.onGoal;
            }
            var totalCheckpoints = circuit.checkpoints.length || 1, hitted = car.hittedCheckpoints.size;
            var score = hitted / (totalCheckpoints + 1) * environment_1.environment.score.base;
            if (car.state.kind == 'dead')
                score -= environment_1.environment.score.deadPenality;
            return Math.max(0, score);
        }
        var fitnesses = matingPool.map(fitness), totalFitness = fitnesses.reduce(function (a, b) { return a + b; }), probabilities = fitnesses.map(function (fit) { return fit / totalFitness; });
        function select() {
            var p = Math.random();
            for (var i = 0; i < matingPool.length; i += 1) {
                var probability = probabilities[i], element = matingPool[i];
                if (p > probability)
                    p -= probability;
                else
                    return element;
            }
        }
        // elithism: include the best element in the next population
        var bestFit = 0, elite = null;
        for (var i = 0; i < this.size; i += 1) {
            var fit = fitnesses[i];
            if (fit > bestFit) {
                bestFit = fit;
                elite = matingPool[i];
            }
        }
        var averageFit = totalFitness / matingPool.length;
        ui_1.tooltip.update({
            maxFitness: bestFit,
            averageFitness: averageFit
        });
        var nextGeneration = [elite];
        for (var i = 0; i < this.size - 1; i += 1) {
            var firstParent = select(), secondParent = select(), newDNA = crossover(firstParent, secondParent);
            mutate(newDNA);
            nextGeneration.push(new car_1["default"](newDNA));
        }
        this.items = nextGeneration;
    };
    Population.random = function (size) {
        return new Population(new Array(size)
            .fill(0)
            .map(function () { return car_1["default"].random(); }));
    };
    return Population;
}());
exports["default"] = Population;


/***/ }),

/***/ "./src/ui/index.ts":
/*!*************************!*\
  !*** ./src/ui/index.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.__esModule = true;
exports.initialize = exports.tooltip = exports.tabs = exports.simulation = exports.editor = exports.panels = void 0;
var panel_manager_1 = __webpack_require__(/*! ./panel-manager */ "./src/ui/panel-manager.ts");
var simulation_1 = __webpack_require__(/*! ./panels/simulation */ "./src/ui/panels/simulation.ts");
var editor_1 = __webpack_require__(/*! ./panels/editor */ "./src/ui/panels/editor.ts");
var tabs_1 = __webpack_require__(/*! ./tabs */ "./src/ui/tabs.ts");
var population_tooltip_1 = __webpack_require__(/*! ./population-tooltip */ "./src/ui/population-tooltip.ts");
exports.panels = new panel_manager_1["default"]();
function createPanelTab(panels, name) {
    return {
        name: name,
        open: function () {
            panels.run(name);
        }
    };
}
function initialize(circuit) {
    var tooltipContainer = document.getElementById('tooltip');
    exports.tooltip = new population_tooltip_1["default"](tooltipContainer);
    exports.editor = new editor_1["default"](circuit);
    exports.simulation = new simulation_1["default"](circuit);
    exports.panels.add('editor', exports.editor);
    exports.panels.add('simulation', exports.simulation);
    var simulationBar = document.getElementById('simulation-bar');
    var editorBar = document.getElementById('editor-bar');
    var editorBtn = document.getElementById('editor-btn');
    var simulationBtn = document.getElementById('simulation-btn');
    var pauseBtn = document.getElementById('simulation-pause');
    var toggle = function (_) { return exports.simulation.paused = !exports.simulation.paused; };
    exports.simulation.addShortcut(' ', toggle);
    pauseBtn.onclick = toggle;
    exports.tabs = new tabs_1.TabGroup();
    exports.tabs.attach(editorBtn, createPanelTab(exports.panels, 'editor'));
    exports.tabs.bind('editor', editorBar);
    var editorModeTabs = new tabs_1.TabGroup();
    editorModeTabs.attach(document.getElementById('editor-draw'), {
        name: 'draw',
        open: function () {
            exports.editor.setMode(editor_1.EditorMode.DRAW);
        }
    });
    editorModeTabs.attach(document.getElementById('editor-cancel'), {
        name: 'cancel',
        open: function () {
            exports.editor.setMode(editor_1.EditorMode.CANCEL);
        }
    });
    var subjectBar = document.getElementById('draw-subject');
    editorModeTabs.bind('draw', subjectBar);
    editorModeTabs.open('draw');
    var editorDrawSubject = new tabs_1.TabGroup();
    editorDrawSubject.attach(document.getElementById('draw-wall'), {
        name: 'wall',
        open: function () {
            exports.editor.setDrawSubject(editor_1.EntityType.WALL);
        }
    });
    editorDrawSubject.attach(document.getElementById('draw-checkpoint'), {
        name: 'checkpoint',
        open: function () {
            exports.editor.setDrawSubject(editor_1.EntityType.CHECKPOINT);
        }
    });
    editorDrawSubject.attach(document.getElementById('draw-goal'), {
        name: 'goal',
        open: function () {
            exports.editor.setDrawSubject(editor_1.EntityType.GOAL);
        }
    });
    editorDrawSubject.open('wall');
    // editor shortcuts
    exports.editor.addShortcut('d', function (_) { return editorModeTabs.open('draw'); });
    exports.editor.addShortcut('c', function (_) { return editorModeTabs.open('cancel'); });
    exports.editor.addShortcut('1', function (_) { return editorDrawSubject.open('wall'); });
    exports.editor.addShortcut('2', function (_) { return editorDrawSubject.open('checkpoint'); });
    exports.editor.addShortcut('3', function (_) { return editorDrawSubject.open('goal'); });
    exports.tabs.attach(simulationBtn, createPanelTab(exports.panels, 'simulation'));
    exports.tabs.bind('simulation', simulationBar);
    exports.tabs.open('simulation');
}
exports.initialize = initialize;


/***/ }),

/***/ "./src/ui/panel-manager.ts":
/*!*********************************!*\
  !*** ./src/ui/panel-manager.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports) => {


exports.__esModule = true;
var PanelManager = /** @class */ (function () {
    function PanelManager() {
        this.panels = new Map();
        this.activePanel = null;
    }
    PanelManager.prototype.add = function (name, panel) {
        panel.initialize();
        this.panels.set(name, panel);
    };
    PanelManager.prototype.run = function (name) {
        var _a;
        if (!this.panels.has(name))
            throw new Error('no panel of name ' + name + ' available');
        var panel = this.panels.get(name);
        (_a = this.activePanel) === null || _a === void 0 ? void 0 : _a.close();
        panel.run();
        this.activePanel = panel;
    };
    PanelManager.prototype.render = function (context, dt) {
        var _a;
        (_a = this.activePanel) === null || _a === void 0 ? void 0 : _a.render(context, dt);
    };
    return PanelManager;
}());
exports["default"] = PanelManager;


/***/ }),

/***/ "./src/ui/panels/editor.ts":
/*!*********************************!*\
  !*** ./src/ui/panels/editor.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.EditorMode = exports.EntityType = void 0;
var core_1 = __webpack_require__(/*! ../../core */ "./src/core.ts");
var circuit_1 = __webpack_require__(/*! ../../circuit */ "./src/circuit.ts");
var graphics_1 = __webpack_require__(/*! ../../graphics */ "./src/graphics.ts");
var db = __webpack_require__(/*! ../../db */ "./src/db.ts");
var panel_1 = __webpack_require__(/*! ./panel */ "./src/ui/panels/panel.ts");
var environment_1 = __webpack_require__(/*! ../../environment */ "./src/environment.ts");
var EntityType;
(function (EntityType) {
    EntityType[EntityType["WALL"] = 0] = "WALL";
    EntityType[EntityType["GOAL"] = 1] = "GOAL";
    EntityType[EntityType["CHECKPOINT"] = 2] = "CHECKPOINT";
})(EntityType = exports.EntityType || (exports.EntityType = {}));
var EditorMode;
(function (EditorMode) {
    EditorMode[EditorMode["DRAW"] = 0] = "DRAW";
    EditorMode[EditorMode["CANCEL"] = 1] = "CANCEL";
})(EditorMode = exports.EditorMode || (exports.EditorMode = {}));
var Editor = /** @class */ (function (_super) {
    __extends(Editor, _super);
    function Editor(circuit) {
        if (circuit === void 0) { circuit = null; }
        var _this = _super.call(this) || this;
        _this.circuit = circuit;
        _this.lastPoint = null;
        _this.currentPoint = null;
        _this.mousePressed = false;
        _this.movingVelocity = false;
        _this.drawSubject = EntityType.WALL;
        _this.mode = EditorMode.DRAW;
        _this.circuit = circuit !== null && circuit !== void 0 ? circuit : new circuit_1["default"]([]);
        return _this;
    }
    Editor.prototype.initialize = function () {
        this.attachHandlers();
    };
    Editor.prototype.run = function () {
        _super.prototype.run.call(this);
        this.resetDraw();
    };
    Editor.prototype.close = function () {
        _super.prototype.close.call(this);
        var loadedCircuit = db.currentEntry();
        db.save(loadedCircuit, this.circuit);
    };
    Editor.prototype.setMode = function (mode) {
        this.mode = mode;
    };
    Editor.prototype.setDrawSubject = function (subject) {
        this.drawSubject = subject;
    };
    Editor.prototype.findEntity = function (point) {
        var threshold = 2;
        // returns an object with the entity touching the point and his type
        for (var _i = 0, _a = this.circuit.walls; _i < _a.length; _i++) {
            var wall = _a[_i];
            if ((0, graphics_1.pointInLine)(point, wall, threshold))
                return { entity: wall, type: EntityType.WALL };
        }
        for (var _b = 0, _c = this.circuit.checkpoints; _b < _c.length; _b++) {
            var checkpoint = _c[_b];
            if ((0, graphics_1.pointInLine)(point, checkpoint, threshold))
                return { entity: checkpoint, type: EntityType.CHECKPOINT };
        }
        if (this.circuit.goal && (0, graphics_1.pointInLine)(point, this.circuit.goal, threshold))
            return { entity: this.circuit.goal, type: EntityType.GOAL };
        return null;
    };
    Editor.prototype.deleteEntity = function (toErase) {
        var entity = toErase.entity, type = toErase.type;
        if (type == EntityType.GOAL) {
            this.circuit.goal = null;
        }
        else if (type == EntityType.WALL) {
            var i = this.circuit.walls.indexOf(entity);
            this.circuit.walls.splice(i, 1);
        }
        else if (type == EntityType.CHECKPOINT) {
            var i = this.circuit.checkpoints.indexOf(entity);
            this.circuit.checkpoints.splice(i, 1);
        }
    };
    Editor.prototype.attachHandlers = function () {
        var _this = this;
        function getMousePosition(event) {
            var target = event.target;
            if (target.nodeName !== 'CANVAS')
                return null;
            var rect = target.getBoundingClientRect();
            return new core_1.Vec2(event.clientX - rect.left, event.clientY - rect.top);
        }
        window.onmouseup = function (event) {
            if (!_this.active)
                return;
            if (!_this.mousePressed)
                return;
            if (_this.movingVelocity) {
                _this.movingVelocity = false;
            }
            else if (_this.mode == EditorMode.DRAW) {
                var line = { start: _this.lastPoint, end: _this.currentPoint };
                switch (_this.drawSubject) {
                    case EntityType.WALL: {
                        _this.circuit.walls.push(line);
                        break;
                    }
                    case EntityType.GOAL: {
                        _this.circuit.goal = structuredClone(line);
                        break;
                    }
                    case EntityType.CHECKPOINT: {
                        _this.circuit.checkpoints.push(line);
                        break;
                    }
                }
                _this.resetDraw();
            }
            _this.mousePressed = false;
        };
        window.onmousemove = function (event) {
            if (!_this.active)
                return;
            var mousePosition = getMousePosition(event);
            // mouse outside permitted region
            if (mousePosition == null)
                return;
            if (_this.mode == EditorMode.DRAW) {
                if (_this.movingVelocity) {
                    // setting starting velocity
                    var velocity = new core_1.Vec2(1, 0), angle = mousePosition.angleBetween(_this.circuit.spawnPoint);
                    _this.circuit.startVelocity = velocity.rotate(angle).mul(2);
                }
                else {
                    _this.currentPoint = mousePosition;
                }
            }
            else if (_this.mode == EditorMode.CANCEL) {
                if (!_this.mousePressed) {
                    return;
                }
                var toErase = _this.findEntity(mousePosition);
                if (toErase == null)
                    return;
                _this.deleteEntity(toErase);
            }
        };
        window.onmousedown = function (event) {
            if (!_this.active)
                return;
            var mousePosition = getMousePosition(event);
            // mouse outside permitted region
            if (mousePosition == null)
                return;
            if (event.ctrlKey) {
                // setting the spawn point
                _this.circuit.spawnPoint = mousePosition;
                return;
            }
            _this.mousePressed = true;
            if (_this.mode == EditorMode.DRAW) {
                if ((0, graphics_1.isInsideCircle)(mousePosition, _this.circuit.spawnPoint, 5)) {
                    // moving start velocity
                    _this.movingVelocity = true;
                }
                else if (_this.lastPoint == null) {
                    _this.lastPoint = mousePosition;
                    return;
                }
            }
        };
    };
    Editor.prototype.drawing = function () {
        return this.mousePressed && !this.movingVelocity && this.mode == EditorMode.DRAW;
    };
    Editor.prototype.render = function (context, dt) {
        var colors = environment_1.environment.colors;
        if (this.drawing()) {
            context.strokeStyle = colors.wall;
            ;
            switch (this.drawSubject) {
                case EntityType.GOAL: {
                    context.strokeStyle = colors.goal;
                    break;
                }
                case EntityType.CHECKPOINT: {
                    context.strokeStyle = colors.checkpoint;
                    break;
                }
            }
            (0, graphics_1.drawLine)(context, { start: this.currentPoint, end: this.lastPoint });
        }
        this.circuit.draw(context);
    };
    Editor.prototype.resetDraw = function () {
        this.lastPoint = null;
        this.currentPoint = null;
    };
    return Editor;
}(panel_1["default"]));
exports["default"] = Editor;


/***/ }),

/***/ "./src/ui/panels/panel.ts":
/*!********************************!*\
  !*** ./src/ui/panels/panel.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


exports.__esModule = true;
var keyboard_1 = __webpack_require__(/*! ../../keyboard */ "./src/keyboard.ts");
var Panel = /** @class */ (function () {
    function Panel() {
        this.active = false;
    }
    Panel.prototype.run = function () {
        this.active = true;
    };
    Panel.prototype.close = function () {
        this.active = false;
    };
    Panel.prototype.addShortcut = function (key, handler, modifiers) {
        var _this = this;
        if (modifiers === void 0) { modifiers = keyboard_1.KeyboardModifiers.NONE; }
        var wrapper = function (event) {
            if (!_this.active)
                return;
            handler(event);
        };
        keyboard_1.keyboard.listen(key, wrapper, modifiers);
    };
    return Panel;
}());
exports["default"] = Panel;


/***/ }),

/***/ "./src/ui/panels/simulation.ts":
/*!*************************************!*\
  !*** ./src/ui/panels/simulation.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var panel_1 = __webpack_require__(/*! ./panel */ "./src/ui/panels/panel.ts");
var population_1 = __webpack_require__(/*! ../../population */ "./src/population.ts");
var environment_1 = __webpack_require__(/*! ../../environment */ "./src/environment.ts");
var __1 = __webpack_require__(/*! .. */ "./src/ui/index.ts");
var SimulationPanel = /** @class */ (function (_super) {
    __extends(SimulationPanel, _super);
    function SimulationPanel(circuit) {
        var _this = _super.call(this) || this;
        _this.circuit = circuit;
        _this.population = null;
        _this.lifespan = environment_1.environment.lifespan;
        _this.time = 0;
        _this.generation = 0;
        _this.paused = false;
        _this.populationSize = environment_1.environment.population.size;
        return _this;
    }
    SimulationPanel.prototype.reset = function () {
        this.time = 0;
        for (var _i = 0, _a = this.population.items; _i < _a.length; _i++) {
            var car = _a[_i];
            car.reset(this.circuit.spawnPoint, this.circuit.startVelocity);
        }
        this.generation += 1;
        __1.tooltip.update({ generation: this.generation });
    };
    SimulationPanel.prototype.initialize = function () {
        // initialize population
        __1.tooltip.reset();
        this.generation = 0;
        this.population = population_1["default"].random(this.populationSize);
        this.reset();
    };
    SimulationPanel.prototype.run = function () {
        _super.prototype.run.call(this);
        __1.tooltip.show();
        this.initialize();
    };
    SimulationPanel.prototype.close = function () {
        _super.prototype.close.call(this);
        __1.tooltip.hide();
    };
    SimulationPanel.prototype.update = function (dt) {
        var timeExpired = this.time >= this.lifespan, endedGeneration = !this.population.items.some(function (car) { return car.stillRunning(); });
        if (timeExpired || endedGeneration) {
            // no car alive evaluate next generation of cars
            this.population.evaluate(this.circuit);
            // reset car positions
            this.reset();
        }
        for (var _i = 0, _a = this.population.items; _i < _a.length; _i++) {
            var car = _a[_i];
            car.update(this.circuit, this.time);
        }
        this.time += 1;
    };
    SimulationPanel.prototype.render = function (context, dt) {
        if (!this.paused) {
            this.update(dt);
        }
        this.circuit.draw(context);
        for (var _i = 0, _a = this.population.items; _i < _a.length; _i++) {
            var car = _a[_i];
            car.draw(context);
        }
        // draw time line
        context.fillStyle = environment_1.environment.colors.lifespanBar;
        var w = context.canvas.width, h = context.canvas.height, bar = w * (1 - this.time / this.lifespan), barHeight = 5;
        context.fillRect(0, h - barHeight, bar, barHeight);
    };
    return SimulationPanel;
}(panel_1["default"]));
exports["default"] = SimulationPanel;


/***/ }),

/***/ "./src/ui/population-tooltip.ts":
/*!**************************************!*\
  !*** ./src/ui/population-tooltip.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var tooltip_1 = __webpack_require__(/*! ./tooltip */ "./src/ui/tooltip.ts");
var PopulationTooltip = /** @class */ (function (_super) {
    __extends(PopulationTooltip, _super);
    function PopulationTooltip(element) {
        var _this = _super.call(this, element) || this;
        _this.info = {
            maxFitness: 0,
            averageFitness: 0,
            generation: 0
        };
        _this.maxLabel = element.querySelector('.max-fit');
        _this.averageLabel = element.querySelector('.avg-fit');
        _this.generationLabel = element.querySelector('.generation');
        return _this;
    }
    PopulationTooltip.prototype.write = function () {
        var _a = this.info, maxFitness = _a.maxFitness, averageFitness = _a.averageFitness, generation = _a.generation;
        this.maxLabel.innerHTML = maxFitness.toString();
        this.averageLabel.innerHTML = averageFitness.toString();
        this.generationLabel.innerHTML = generation.toString();
    };
    PopulationTooltip.prototype.update = function (newInfo) {
        this.info = __assign(__assign({}, this.info), newInfo);
        this.write();
    };
    PopulationTooltip.prototype.reset = function () {
        this.update({
            maxFitness: 0,
            averageFitness: 0,
            generation: 0
        });
    };
    return PopulationTooltip;
}(tooltip_1["default"]));
exports["default"] = PopulationTooltip;


/***/ }),

/***/ "./src/ui/tabs.ts":
/*!************************!*\
  !*** ./src/ui/tabs.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports) => {


exports.__esModule = true;
exports.TabGroup = void 0;
var TabGroup = /** @class */ (function () {
    function TabGroup() {
        this.activeTab = null;
        this.buttons = new Map();
        this.tabs = new Map();
        this.bindedElements = new Map();
    }
    TabGroup.prototype.open = function (name) {
        var tab = this.tabs.get(name);
        if (!tab) {
            throw new Error('Error: cannot find a tab named \'' + name + '\'');
        }
        if (this.activeTab) {
            var tabButton = this.buttons.get(this.activeTab.name);
            tabButton === null || tabButton === void 0 ? void 0 : tabButton.classList.remove('active');
            var elements_3 = this.bindedElements.get(this.activeTab.name) || [];
            for (var _i = 0, elements_1 = elements_3; _i < elements_1.length; _i++) {
                var bindedElement = elements_1[_i];
                bindedElement.classList.remove('active');
            }
        }
        var newButton = this.buttons.get(tab.name);
        newButton === null || newButton === void 0 ? void 0 : newButton.classList.add('active');
        this.activeTab = tab;
        var elements = this.bindedElements.get(name) || [];
        for (var _a = 0, elements_2 = elements; _a < elements_2.length; _a++) {
            var bindedElement = elements_2[_a];
            bindedElement.classList.add('active');
        }
        tab.open();
    };
    TabGroup.prototype.attach = function (button, tab) {
        var _this = this;
        this.buttons.set(tab.name, button);
        this.tabs.set(tab.name, tab);
        button.onclick = function () { return _this.open(tab.name); };
    };
    TabGroup.prototype.bind = function (name) {
        var elements = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            elements[_i - 1] = arguments[_i];
        }
        var tab = this.tabs.get(name);
        if (!tab) {
            throw new Error('Error: cannot find a tab named \'' + name + '\'');
        }
        this.bindedElements.set(name, elements);
    };
    return TabGroup;
}());
exports.TabGroup = TabGroup;


/***/ }),

/***/ "./src/ui/tooltip.ts":
/*!***************************!*\
  !*** ./src/ui/tooltip.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports) => {


exports.__esModule = true;
var Tooltip = /** @class */ (function () {
    function Tooltip(element) {
        this.element = element;
    }
    Tooltip.prototype.show = function () {
        this.element.style.display = 'block';
    };
    Tooltip.prototype.hide = function () {
        this.element.style.display = 'none';
    };
    return Tooltip;
}());
exports["default"] = Tooltip;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/

var _a;
exports.__esModule = true;
var core_1 = __webpack_require__(/*! ./core */ "./src/core.ts");
var circuit_1 = __webpack_require__(/*! ./circuit */ "./src/circuit.ts");
var ui = __webpack_require__(/*! ./ui */ "./src/ui/index.ts");
var ui_1 = __webpack_require__(/*! ./ui */ "./src/ui/index.ts");
var db = __webpack_require__(/*! ./db */ "./src/db.ts");
function createCircuit(points) {
    var walls = [];
    for (var i = 0; i < points.length; i += 1) {
        var p1 = points[i], p2 = points[(i + 1) % points.length];
        walls.push({ start: p1, end: p2 });
    }
    return new circuit_1["default"](walls);
}
function getDefaultCircuit() {
    var walls = [
        { start: new core_1.Vec2(81, 257), end: new core_1.Vec2(245, 410) },
        { start: new core_1.Vec2(231, 194), end: new core_1.Vec2(340, 283) },
        { start: new core_1.Vec2(342, 283), end: new core_1.Vec2(425, 252) },
        { start: new core_1.Vec2(427, 252), end: new core_1.Vec2(451, 166) },
        { start: new core_1.Vec2(245, 408), end: new core_1.Vec2(336, 430) },
        { start: new core_1.Vec2(339, 430), end: new core_1.Vec2(478, 378) },
        { start: new core_1.Vec2(479, 378), end: new core_1.Vec2(527, 323) },
        { start: new core_1.Vec2(527, 323), end: new core_1.Vec2(559, 202) },
        { start: new core_1.Vec2(559, 202), end: new core_1.Vec2(618, 192) },
        { start: new core_1.Vec2(452, 165), end: new core_1.Vec2(515, 113) },
        { start: new core_1.Vec2(549, 96), end: new core_1.Vec2(691, 67) },
        { start: new core_1.Vec2(516, 109), end: new core_1.Vec2(546, 95) },
        { start: new core_1.Vec2(624, 191), end: new core_1.Vec2(699, 169) },
        { start: new core_1.Vec2(699, 171), end: new core_1.Vec2(818, 250) },
        { start: new core_1.Vec2(691, 63), end: new core_1.Vec2(760, 73) },
        { start: new core_1.Vec2(760, 76), end: new core_1.Vec2(875, 141) },
        { start: new core_1.Vec2(822, 253), end: new core_1.Vec2(840, 308) },
        { start: new core_1.Vec2(840, 308), end: new core_1.Vec2(899, 413) },
        { start: new core_1.Vec2(899, 414), end: new core_1.Vec2(1011, 478) },
        { start: new core_1.Vec2(877, 142), end: new core_1.Vec2(931, 210) },
        { start: new core_1.Vec2(931, 210), end: new core_1.Vec2(969, 308) },
        { start: new core_1.Vec2(970, 311), end: new core_1.Vec2(1035, 360) },
        { start: new core_1.Vec2(1035, 360), end: new core_1.Vec2(1178, 326) },
        { start: new core_1.Vec2(1217, 427), end: new core_1.Vec2(1227, 308) },
        { start: new core_1.Vec2(1011, 477), end: new core_1.Vec2(1211, 426) },
        { start: new core_1.Vec2(1177, 325), end: new core_1.Vec2(1225, 309) },
        { start: new core_1.Vec2(74, 255), end: new core_1.Vec2(234, 194) }
    ];
    var circuit = new circuit_1["default"](walls);
    circuit.spawnPoint = new core_1.Vec2(200, 250);
    circuit.goal = {
        start: new core_1.Vec2(1150, 320),
        end: new core_1.Vec2(1150, 450)
    };
    circuit.checkpoints = [
        { start: new core_1.Vec2(418, 252), end: new core_1.Vec2(536, 326) },
        { start: new core_1.Vec2(544, 97), end: new core_1.Vec2(560, 205) },
        { start: new core_1.Vec2(755, 73), end: new core_1.Vec2(697, 173) },
        { start: new core_1.Vec2(813, 249), end: new core_1.Vec2(931, 208) },
        { start: new core_1.Vec2(967, 314), end: new core_1.Vec2(893, 432) },
        { start: new core_1.Vec2(1037, 355), end: new core_1.Vec2(1012, 481) },
    ];
    return circuit;
}
var circuit = (_a = db.load()) !== null && _a !== void 0 ? _a : getDefaultCircuit();
function update(dt) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    ui_1.panels.render(context, dt);
    window.requestAnimationFrame(update);
}
window.onload = function () {
    ui.initialize(circuit);
    var canvas = document.getElementById('canvas');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    window.requestAnimationFrame(update);
};

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL3NyYy9jYXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NpcmN1aXQudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvcmUudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2RiLnRzIiwid2VicGFjazovLy8uL3NyYy9lbnZpcm9ubWVudC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZ3JhcGhpY3MudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2tleWJvYXJkLnRzIiwid2VicGFjazovLy8uL3NyYy9wb3B1bGF0aW9uLnRzIiwid2VicGFjazovLy8uL3NyYy91aS9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdWkvcGFuZWwtbWFuYWdlci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdWkvcGFuZWxzL2VkaXRvci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdWkvcGFuZWxzL3BhbmVsLnRzIiwid2VicGFjazovLy8uL3NyYy91aS9wYW5lbHMvc2ltdWxhdGlvbi50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdWkvcG9wdWxhdGlvbi10b29sdGlwLnRzIiwid2VicGFjazovLy8uL3NyYy91aS90YWJzLnRzIiwid2VicGFjazovLy8uL3NyYy91aS90b29sdGlwLnRzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vLi9zcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcclxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcclxuZXhwb3J0cy5yYW5kb21HZW5lID0gdm9pZCAwO1xyXG52YXIgY29yZV8xID0gcmVxdWlyZShcIi4vY29yZVwiKTtcclxudmFyIGVudmlyb25tZW50XzEgPSByZXF1aXJlKFwiLi9lbnZpcm9ubWVudFwiKTtcclxudmFyIGdyYXBoaWNzXzEgPSByZXF1aXJlKFwiLi9ncmFwaGljc1wiKTtcclxuZnVuY3Rpb24gcmFuZG9tR2VuZSgpIHtcclxuICAgIHZhciBtYWduaXR1ZGUgPSBlbnZpcm9ubWVudF8xLmVudmlyb25tZW50LmNhci5tYXhNYWduaXR1ZGU7XHJcbiAgICByZXR1cm4gY29yZV8xLlZlYzIucmFuZG9tKG1hZ25pdHVkZSk7XHJcbn1cclxuZXhwb3J0cy5yYW5kb21HZW5lID0gcmFuZG9tR2VuZTtcclxuZnVuY3Rpb24gcmFuZG9tR2VuZXMoc2l6ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBBcnJheShzaXplKVxyXG4gICAgICAgIC5maWxsKDApXHJcbiAgICAgICAgLm1hcChmdW5jdGlvbiAoKSB7IHJldHVybiByYW5kb21HZW5lKCk7IH0pO1xyXG59XHJcbnZhciBkZWFkU3RhdGUgPSB7IGtpbmQ6ICdkZWFkJyB9O1xyXG52YXIgYWxpdmVTdGF0ZSA9IHsga2luZDogJ2FsaXZlJyB9O1xyXG52YXIgQ2FyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQ2FyKGdlbmVzKSB7XHJcbiAgICAgICAgdGhpcy5nZW5lcyA9IGdlbmVzO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXcgY29yZV8xLlZlYzIoMCwgMCk7XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IG5ldyBjb3JlXzEuVmVjMigwLCAwKTtcclxuICAgICAgICB0aGlzLnN0YXRlID0gYWxpdmVTdGF0ZTtcclxuICAgICAgICB0aGlzLmhpdHRlZENoZWNrcG9pbnRzID0gbmV3IFNldCgpO1xyXG4gICAgICAgIHRoaXMud2lkdGggPSAyMDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IDQwO1xyXG4gICAgICAgIHRoaXMuc2Vuc29ycyA9IGVudmlyb25tZW50XzEuZW52aXJvbm1lbnQuY2FyLnNlbnNvcnM7XHJcbiAgICB9XHJcbiAgICBDYXIucmFuZG9tID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgQ2FyKHJhbmRvbUdlbmVzKGVudmlyb25tZW50XzEuZW52aXJvbm1lbnQuY2FyLmdlbmVzKSk7XHJcbiAgICB9O1xyXG4gICAgQ2FyLnByb3RvdHlwZS5yZWZlcmVuY2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBjb3JlXzEuUmVmZXJlbmNlMkQodGhpcy5wb3NpdGlvbiwgdGhpcy52ZWxvY2l0eS5hbmdsZSgpKTtcclxuICAgIH07XHJcbiAgICBDYXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChjaXJjdWl0LCB0aW1lKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5raW5kICE9ICdhbGl2ZScpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAodGhpcy5wb3NpdGlvbi54IDwgMCB8fCB0aGlzLnBvc2l0aW9uLnggPiB3aW5kb3cuaW5uZXJXaWR0aClcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IGRlYWRTdGF0ZTtcclxuICAgICAgICBpZiAodGhpcy5wb3NpdGlvbi55IDwgMCB8fCB0aGlzLnBvc2l0aW9uLnkgPiB3aW5kb3cuaW5uZXJIZWlnaHQpXHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBkZWFkU3RhdGU7XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IGNpcmN1aXQud2FsbHM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB3YWxsID0gX2FbX2ldO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jb2xsaWRlKHdhbGwpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gZGVhZFN0YXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIgX2IgPSAwLCBfYyA9IGNpcmN1aXQuY2hlY2twb2ludHM7IF9iIDwgX2MubGVuZ3RoOyBfYisrKSB7XHJcbiAgICAgICAgICAgIHZhciBjaGVja3BvaW50ID0gX2NbX2JdO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jb2xsaWRlKGNoZWNrcG9pbnQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpdHRlZENoZWNrcG9pbnRzLmFkZChjaGVja3BvaW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5jb2xsaWRlKGNpcmN1aXQuZ29hbCkpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHtcclxuICAgICAgICAgICAgICAgIGtpbmQ6ICdjb21wbGV0ZWQnLFxyXG4gICAgICAgICAgICAgICAgY29tcGxldGl0aW9uVGltZTogdGltZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5raW5kICE9ICdhbGl2ZScpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAvLyBUT0RPOiByZWZhY3RvciB0aGlzIVxyXG4gICAgICAgIHZhciBjaGVja1dhbGxzID0gZnVuY3Rpb24gKHNlbnNvcikge1xyXG4gICAgICAgICAgICB2YXIgZW5kU2Vuc29yID0gX3RoaXMucmVmZXJlbmNlKCkuZ2V0R2xvYmFsKHNlbnNvcik7XHJcbiAgICAgICAgICAgIHJldHVybiBjaXJjdWl0LndhbGxzLnNvbWUoZnVuY3Rpb24gKHdhbGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAoMCwgY29yZV8xLmxpbmVJbnRlcnNlY3QpKHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydDogX3RoaXMucG9zaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgZW5kOiBlbmRTZW5zb3JcclxuICAgICAgICAgICAgICAgIH0sIHdhbGwpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBhY2NlbGVyYXRpb24gPSBuZXcgY29yZV8xLlZlYzIoMCwgMCk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNlbnNvcnMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgdmFyIHNlbnNvciA9IHRoaXMuc2Vuc29yc1tpXSwgZ2VuZSA9IHRoaXMuZ2VuZXNbaV07XHJcbiAgICAgICAgICAgIGlmIChjaGVja1dhbGxzKHNlbnNvcikpIHtcclxuICAgICAgICAgICAgICAgIGFjY2VsZXJhdGlvbi5hZGQoZ2VuZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQodGhpcy52ZWxvY2l0eSk7XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eS5hZGQoYWNjZWxlcmF0aW9uLnJvdGF0ZSh0aGlzLnZlbG9jaXR5LmFuZ2xlKCkpKTtcclxuICAgIH07XHJcbiAgICBDYXIucHJvdG90eXBlLnN0aWxsUnVubmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZSA9PSBhbGl2ZVN0YXRlO1xyXG4gICAgfTtcclxuICAgIENhci5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XHJcbiAgICAgICAgdmFyIGNvbG9ycyA9IGVudmlyb25tZW50XzEuZW52aXJvbm1lbnQuY29sb3JzO1xyXG4gICAgICAgIGNvbnRleHQuc2F2ZSgpO1xyXG4gICAgICAgIGNvbnRleHQudHJhbnNsYXRlKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcclxuICAgICAgICBjb250ZXh0LnJvdGF0ZSh0aGlzLnZlbG9jaXR5LmFuZ2xlKCkpO1xyXG4gICAgICAgIC8vIGRyYXcgc2Vuc29yc1xyXG4gICAgICAgIGlmICh0aGlzLnN0aWxsUnVubmluZygpKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBjb2xvcnMuc2Vuc29yO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5zZW5zb3JzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNlbnNvciA9IF9hW19pXTtcclxuICAgICAgICAgICAgICAgICgwLCBncmFwaGljc18xLmRyYXdMaW5lKShjb250ZXh0LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IG5ldyBjb3JlXzEuVmVjMigwLCAwKSxcclxuICAgICAgICAgICAgICAgICAgICBlbmQ6IHNlbnNvclxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZHJhdyBjYXJcclxuICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGNvbnRleHQuc3Ryb2tlU3R5bGUgPSB0aGlzLnN0YXRlID09IGRlYWRTdGF0ZSA/IGNvbG9ycy5kZWFkQ2FyIDogY29sb3JzLmNhcjtcclxuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGNvbnRleHQucmVjdCgtdGhpcy5oZWlnaHQgLyAyLCAtdGhpcy53aWR0aCAvIDIsIHRoaXMuaGVpZ2h0LCB0aGlzLndpZHRoKTtcclxuICAgICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xyXG4gICAgICAgIGNvbnRleHQuZmlsbCgpO1xyXG4gICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XHJcbiAgICAgICAgY29udGV4dC5yZXN0b3JlKCk7XHJcbiAgICB9O1xyXG4gICAgQ2FyLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uIChwb3NpdGlvbiwgdmVsb2NpdHkpIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb24uY29weSgpO1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSB2ZWxvY2l0eS5jb3B5KCk7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IGFsaXZlU3RhdGU7XHJcbiAgICB9O1xyXG4gICAgQ2FyLnByb3RvdHlwZS5jb2xsaWRlID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgdmFyIHJlZmVyZW5jZSA9IHRoaXMucmVmZXJlbmNlKCksIGxsID0gcmVmZXJlbmNlLmdldEdsb2JhbChuZXcgY29yZV8xLlZlYzIoLXRoaXMuaGVpZ2h0IC8gMiwgLXRoaXMud2lkdGggLyAyKSksIGxyID0gcmVmZXJlbmNlLmdldEdsb2JhbChuZXcgY29yZV8xLlZlYzIoLXRoaXMuaGVpZ2h0IC8gMiwgdGhpcy53aWR0aCAvIDIpKSwgaGwgPSByZWZlcmVuY2UuZ2V0R2xvYmFsKG5ldyBjb3JlXzEuVmVjMih0aGlzLmhlaWdodCAvIDIsIC10aGlzLndpZHRoIC8gMikpLCBociA9IHJlZmVyZW5jZS5nZXRHbG9iYWwobmV3IGNvcmVfMS5WZWMyKHRoaXMuaGVpZ2h0IC8gMiwgdGhpcy53aWR0aCAvIDIpKTtcclxuICAgICAgICB2YXIgY29sbGlkZSA9ICgwLCBjb3JlXzEubGluZUludGVyc2VjdCkob3RoZXIsIHsgc3RhcnQ6IGxsLCBlbmQ6IGxyIH0pXHJcbiAgICAgICAgICAgIHx8ICgwLCBjb3JlXzEubGluZUludGVyc2VjdCkob3RoZXIsIHsgc3RhcnQ6IGxsLCBlbmQ6IGhsIH0pXHJcbiAgICAgICAgICAgIHx8ICgwLCBjb3JlXzEubGluZUludGVyc2VjdCkob3RoZXIsIHsgc3RhcnQ6IGhsLCBlbmQ6IGhyIH0pXHJcbiAgICAgICAgICAgIHx8ICgwLCBjb3JlXzEubGluZUludGVyc2VjdCkob3RoZXIsIHsgc3RhcnQ6IGhyLCBlbmQ6IGxyIH0pO1xyXG4gICAgICAgIHJldHVybiBjb2xsaWRlO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBDYXI7XHJcbn0oKSk7XHJcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gQ2FyO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcclxudmFyIGNvcmVfMSA9IHJlcXVpcmUoXCIuL2NvcmVcIik7XHJcbnZhciBlbnZpcm9ubWVudF8xID0gcmVxdWlyZShcIi4vZW52aXJvbm1lbnRcIik7XHJcbnZhciBncmFwaGljc18xID0gcmVxdWlyZShcIi4vZ3JhcGhpY3NcIik7XHJcbnZhciBDaXJjdWl0ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQ2lyY3VpdCh3YWxscykge1xyXG4gICAgICAgIHRoaXMud2FsbHMgPSB3YWxscztcclxuICAgICAgICB0aGlzLmNoZWNrcG9pbnRzID0gW107XHJcbiAgICAgICAgdGhpcy5zdGFydFZlbG9jaXR5ID0gbmV3IGNvcmVfMS5WZWMyKDIsIDEuNik7XHJcbiAgICB9XHJcbiAgICBDaXJjdWl0LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcclxuICAgICAgICB2YXIgY29sb3JzID0gZW52aXJvbm1lbnRfMS5lbnZpcm9ubWVudC5jb2xvcnM7XHJcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IGNvbG9ycy53YWxsO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLndhbGxzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICB2YXIgd2FsbCA9IF9hW19pXTtcclxuICAgICAgICAgICAgKDAsIGdyYXBoaWNzXzEuZHJhd0xpbmUpKGNvbnRleHQsIHdhbGwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gY29sb3JzLmdvYWw7XHJcbiAgICAgICAgaWYgKHRoaXMuZ29hbClcclxuICAgICAgICAgICAgKDAsIGdyYXBoaWNzXzEuZHJhd0xpbmUpKGNvbnRleHQsIHRoaXMuZ29hbCk7XHJcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IGNvbG9ycy5jaGVja3BvaW50O1xyXG4gICAgICAgIGZvciAodmFyIF9iID0gMCwgX2MgPSB0aGlzLmNoZWNrcG9pbnRzOyBfYiA8IF9jLmxlbmd0aDsgX2IrKykge1xyXG4gICAgICAgICAgICB2YXIgY2hlY2twb2ludCA9IF9jW19iXTtcclxuICAgICAgICAgICAgKDAsIGdyYXBoaWNzXzEuZHJhd0xpbmUpKGNvbnRleHQsIGNoZWNrcG9pbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xyXG4gICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gY29sb3JzLnNwYXduUG9pbnQ7XHJcbiAgICAgICAgY29udGV4dC5hcmModGhpcy5zcGF3blBvaW50LngsIHRoaXMuc3Bhd25Qb2ludC55LCA1LCAwLCAyICogTWF0aC5QSSk7XHJcbiAgICAgICAgY29udGV4dC5maWxsKCk7XHJcbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gY29sb3JzLnNwYXduUG9pbnQ7XHJcbiAgICAgICAgY29udGV4dC5tb3ZlVG8odGhpcy5zcGF3blBvaW50LngsIHRoaXMuc3Bhd25Qb2ludC55KTtcclxuICAgICAgICB2YXIgem9vbUZhY3RvciA9IDEwLCB2ZWxvY2l0eUFycm93ID0gdGhpcy5zcGF3blBvaW50LnN1bSh0aGlzLnN0YXJ0VmVsb2NpdHkubXVsKHpvb21GYWN0b3IpKTtcclxuICAgICAgICBjb250ZXh0LmxpbmVUbyh2ZWxvY2l0eUFycm93LngsIHZlbG9jaXR5QXJyb3cueSk7XHJcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcclxuICAgICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xyXG4gICAgfTtcclxuICAgIENpcmN1aXQuZnJvbSA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gbGluZUZyb20ob2JqZWN0KSB7XHJcbiAgICAgICAgICAgIHZhciBzdGFydCA9IE9iamVjdC5hc3NpZ24obmV3IGNvcmVfMS5WZWMyKDAsIDApLCBvYmplY3RbJ3N0YXJ0J10pLCBlbmQgPSBPYmplY3QuYXNzaWduKG5ldyBjb3JlXzEuVmVjMigwLCAwKSwgb2JqZWN0WydlbmQnXSk7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHN0YXJ0OiBzdGFydCwgZW5kOiBlbmQgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHdhbGxzID0gZGF0YVsnd2FsbHMnXS5tYXAobGluZUZyb20pLCBnb2FsID0gbGluZUZyb20oZGF0YVsnZ29hbCddKSwgY2hlY2twb2ludHMgPSBkYXRhWydjaGVja3BvaW50cyddLm1hcChsaW5lRnJvbSksIHNwYXduUG9pbnQgPSBPYmplY3QuYXNzaWduKG5ldyBjb3JlXzEuVmVjMigwLCAwKSwgZGF0YVsnc3Bhd25Qb2ludCddKSwgc3RhcnRWZWxvY2l0eSA9IE9iamVjdC5hc3NpZ24obmV3IGNvcmVfMS5WZWMyKDAsIDApLCBkYXRhWydzdGFydFZlbG9jaXR5J10pO1xyXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5ldyBDaXJjdWl0KFtdKSwge1xyXG4gICAgICAgICAgICB3YWxsczogd2FsbHMsXHJcbiAgICAgICAgICAgIGdvYWw6IGdvYWwsXHJcbiAgICAgICAgICAgIGNoZWNrcG9pbnRzOiBjaGVja3BvaW50cyxcclxuICAgICAgICAgICAgc3Bhd25Qb2ludDogc3Bhd25Qb2ludCxcclxuICAgICAgICAgICAgc3RhcnRWZWxvY2l0eTogc3RhcnRWZWxvY2l0eVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBDaXJjdWl0O1xyXG59KCkpO1xyXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IENpcmN1aXQ7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xyXG5leHBvcnRzLmxpbmVJbnRlcnNlY3QgPSBleHBvcnRzLlJlZmVyZW5jZTJEID0gZXhwb3J0cy5WZWMyID0gdm9pZCAwO1xyXG52YXIgVmVjMiA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFZlYzIoeCwgeSkge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxuICAgIFZlYzIucHJvdG90eXBlLnN1bSA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMih0aGlzLnggKyBvdGhlci54LCB0aGlzLnkgKyBvdGhlci55KTtcclxuICAgIH07XHJcbiAgICBWZWMyLnByb3RvdHlwZS5taW51cyA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMih0aGlzLnggLSBvdGhlci54LCB0aGlzLnkgLSBvdGhlci55KTtcclxuICAgIH07XHJcbiAgICBWZWMyLnByb3RvdHlwZS5tdWwgPSBmdW5jdGlvbiAoaykge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMih0aGlzLnggKiBrLCB0aGlzLnkgKiBrKTtcclxuICAgIH07XHJcbiAgICBWZWMyLnByb3RvdHlwZS5kaXYgPSBmdW5jdGlvbiAoaykge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjMih0aGlzLnggLyBrLCB0aGlzLnkgLyBrKTtcclxuICAgIH07XHJcbiAgICBWZWMyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICB0aGlzLnggKz0gb3RoZXIueDtcclxuICAgICAgICB0aGlzLnkgKz0gb3RoZXIueTtcclxuICAgIH07XHJcbiAgICBWZWMyLnByb3RvdHlwZS5hbmdsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5hdGFuMih0aGlzLnksIHRoaXMueCk7XHJcbiAgICB9O1xyXG4gICAgVmVjMi5wcm90b3R5cGUubGVuZ3RoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3codGhpcy54LCAyKSArIE1hdGgucG93KHRoaXMueSwgMikpO1xyXG4gICAgfTtcclxuICAgIFZlYzIucHJvdG90eXBlLmRpc3RhbmNlID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdygodGhpcy54IC0gb3RoZXIueCksIDIpICsgTWF0aC5wb3coKHRoaXMueSAtIG90aGVyLnkpLCAyKSk7XHJcbiAgICB9O1xyXG4gICAgVmVjMi5wcm90b3R5cGUuYW5nbGVCZXR3ZWVuID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguYXRhbjIodGhpcy55IC0gb3RoZXIueSwgdGhpcy54IC0gb3RoZXIueCk7XHJcbiAgICB9O1xyXG4gICAgVmVjMi5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzIodGhpcy54LCB0aGlzLnkpO1xyXG4gICAgfTtcclxuICAgIFZlYzIucHJvdG90eXBlLnJvdGF0ZSA9IGZ1bmN0aW9uIChhbmdsZSkge1xyXG4gICAgICAgIHZhciBuZXdBbmdsZSA9IHRoaXMuYW5nbGUoKSArIGFuZ2xlLCB4ID0gdGhpcy5sZW5ndGgoKSAqIE1hdGguY29zKG5ld0FuZ2xlKSwgeSA9IHRoaXMubGVuZ3RoKCkgKiBNYXRoLnNpbihuZXdBbmdsZSk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKHgsIHkpO1xyXG4gICAgfTtcclxuICAgIFZlYzIucmFuZG9tID0gZnVuY3Rpb24gKG1hZ25pdHVkZSkge1xyXG4gICAgICAgIGlmIChtYWduaXR1ZGUgPT09IHZvaWQgMCkgeyBtYWduaXR1ZGUgPSAxOyB9XHJcbiAgICAgICAgdmFyIGZhY3RvciA9IG1hZ25pdHVkZSAqIDI7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKE1hdGgucmFuZG9tKCkgLSAuNSwgTWF0aC5yYW5kb20oKSAtIC41KS5tdWwoZmFjdG9yKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gVmVjMjtcclxufSgpKTtcclxuZXhwb3J0cy5WZWMyID0gVmVjMjtcclxudmFyIFJlZmVyZW5jZTJEID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gUmVmZXJlbmNlMkQob3JpZ2luLCBvcmllbnRhdGlvbikge1xyXG4gICAgICAgIHRoaXMub3JpZ2luID0gb3JpZ2luO1xyXG4gICAgICAgIHRoaXMub3JpZW50YXRpb24gPSBvcmllbnRhdGlvbjtcclxuICAgIH1cclxuICAgIFJlZmVyZW5jZTJELnByb3RvdHlwZS5nZXRHbG9iYWwgPSBmdW5jdGlvbiAodmVjdG9yKSB7XHJcbiAgICAgICAgcmV0dXJuIHZlY3Rvci5yb3RhdGUodGhpcy5vcmllbnRhdGlvbikuc3VtKHRoaXMub3JpZ2luKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gUmVmZXJlbmNlMkQ7XHJcbn0oKSk7XHJcbmV4cG9ydHMuUmVmZXJlbmNlMkQgPSBSZWZlcmVuY2UyRDtcclxuZnVuY3Rpb24gbGluZUludGVyc2VjdChsaW5lQSwgbGluZUIpIHtcclxuICAgIHZhciBBMSA9IGxpbmVBLmVuZC55IC0gbGluZUEuc3RhcnQueSwgQjEgPSBsaW5lQS5zdGFydC54IC0gbGluZUEuZW5kLngsIEMxID0gQTEgKiBsaW5lQS5zdGFydC54ICsgQjEgKiBsaW5lQS5zdGFydC55LCBBMiA9IGxpbmVCLmVuZC55IC0gbGluZUIuc3RhcnQueSwgQjIgPSBsaW5lQi5zdGFydC54IC0gbGluZUIuZW5kLngsIEMyID0gQTIgKiBsaW5lQi5zdGFydC54ICsgQjIgKiBsaW5lQi5zdGFydC55LCBkZW5vbWluYXRvciA9IEExICogQjIgLSBBMiAqIEIxO1xyXG4gICAgaWYgKGRlbm9taW5hdG9yID09IDApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB2YXIgaW50ZXJzZWN0WCA9IChCMiAqIEMxIC0gQjEgKiBDMikgLyBkZW5vbWluYXRvciwgaW50ZXJzZWN0WSA9IChBMSAqIEMyIC0gQTIgKiBDMSkgLyBkZW5vbWluYXRvciwgcngwID0gKGludGVyc2VjdFggLSBsaW5lQS5zdGFydC54KSAvIChsaW5lQS5lbmQueCAtIGxpbmVBLnN0YXJ0LngpLCByeTAgPSAoaW50ZXJzZWN0WSAtIGxpbmVBLnN0YXJ0LnkpIC8gKGxpbmVBLmVuZC55IC0gbGluZUEuc3RhcnQueSksIHJ4MSA9IChpbnRlcnNlY3RYIC0gbGluZUIuc3RhcnQueCkgLyAobGluZUIuZW5kLnggLSBsaW5lQi5zdGFydC54KSwgcnkxID0gKGludGVyc2VjdFkgLSBsaW5lQi5zdGFydC55KSAvIChsaW5lQi5lbmQueSAtIGxpbmVCLnN0YXJ0LnkpO1xyXG4gICAgaWYgKCgocngwID49IDAgJiYgcngwIDw9IDEpIHx8IChyeTAgPj0gMCAmJiByeTAgPD0gMSkpICYmXHJcbiAgICAgICAgKChyeDEgPj0gMCAmJiByeDEgPD0gMSkgfHwgKHJ5MSA+PSAwICYmIHJ5MSA8PSAxKSkpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLmxpbmVJbnRlcnNlY3QgPSBsaW5lSW50ZXJzZWN0O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcclxuZXhwb3J0cy5jb250YWlucyA9IGV4cG9ydHMubG9hZCA9IGV4cG9ydHMuc2F2ZSA9IGV4cG9ydHMuY3VycmVudEVudHJ5ID0gdm9pZCAwO1xyXG52YXIgY2lyY3VpdF8xID0gcmVxdWlyZShcIi4vY2lyY3VpdFwiKTtcclxuZnVuY3Rpb24gY3VycmVudEVudHJ5KCkge1xyXG4gICAgdmFyIGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkgfHwgJ2RlZmF1bHQnO1xyXG4gICAgcmV0dXJuIGhhc2g7XHJcbn1cclxuZXhwb3J0cy5jdXJyZW50RW50cnkgPSBjdXJyZW50RW50cnk7XHJcbmZ1bmN0aW9uIHNhdmUobmFtZSwgY2lyY3VpdCkge1xyXG4gICAgdmFyIGpzb24gPSBKU09OLnN0cmluZ2lmeShjaXJjdWl0KTtcclxuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShuYW1lLCBqc29uKTtcclxufVxyXG5leHBvcnRzLnNhdmUgPSBzYXZlO1xyXG5mdW5jdGlvbiBsb2FkKG5hbWUpIHtcclxuICAgIGlmIChuYW1lID09PSB2b2lkIDApIHsgbmFtZSA9IG51bGw7IH1cclxuICAgIG5hbWUgIT09IG51bGwgJiYgbmFtZSAhPT0gdm9pZCAwID8gbmFtZSA6IChuYW1lID0gY3VycmVudEVudHJ5KCkpO1xyXG4gICAgdmFyIGpzb24gPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0obmFtZSk7XHJcbiAgICBpZiAoIWpzb24pXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2UoanNvbik7XHJcbiAgICByZXR1cm4gY2lyY3VpdF8xW1wiZGVmYXVsdFwiXS5mcm9tKGRhdGEpO1xyXG59XHJcbmV4cG9ydHMubG9hZCA9IGxvYWQ7XHJcbmZ1bmN0aW9uIGNvbnRhaW5zKG5hbWUpIHtcclxuICAgIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0obmFtZSkgIT0gbnVsbDtcclxufVxyXG5leHBvcnRzLmNvbnRhaW5zID0gY29udGFpbnM7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xyXG5leHBvcnRzLmVudmlyb25tZW50ID0gdm9pZCAwO1xyXG52YXIgY29yZV8xID0gcmVxdWlyZShcIi4vY29yZVwiKTtcclxudmFyIHNlbnNvcnMgPSBbbmV3IGNvcmVfMS5WZWMyKDMwLCAzMCksIG5ldyBjb3JlXzEuVmVjMigzMCwgLTMwKSwgbmV3IGNvcmVfMS5WZWMyKDQ1LCAzMCksIG5ldyBjb3JlXzEuVmVjMig0NSwgLTMwKSwgbmV3IGNvcmVfMS5WZWMyKDUwLCAxNSksIG5ldyBjb3JlXzEuVmVjMig1MCwgLTE1KSwgbmV3IGNvcmVfMS5WZWMyKDUwLCAwKV07XHJcbmV4cG9ydHMuZW52aXJvbm1lbnQgPSB7XHJcbiAgICBjb2xvcnM6IHtcclxuICAgICAgICBzZW5zb3I6ICcjZmYwMDAwODgnLFxyXG4gICAgICAgIGNhcjogJyMwMGZmZmY4OCcsXHJcbiAgICAgICAgZGVhZENhcjogJyNhYWFhYWE0NCcsXHJcbiAgICAgICAgY2hlY2twb2ludDogJ2dyZWVuJyxcclxuICAgICAgICB3YWxsOiAnYmxhY2snLFxyXG4gICAgICAgIGdvYWw6ICdyZWQnLFxyXG4gICAgICAgIHNwYXduUG9pbnQ6ICdibHVlJyxcclxuICAgICAgICBsaWZlc3BhbkJhcjogJ3JlZCdcclxuICAgIH0sXHJcbiAgICBjcm9zc292ZXI6ICd1bmlmb3JtJyxcclxuICAgIG11dGF0aW9uOiAnZGlzY3JldGUnLFxyXG4gICAgbXV0YXRpb25SYXRlOiAwLjAzLFxyXG4gICAgc2NvcmU6IHtcclxuICAgICAgICBiYXNlOiAxMCxcclxuICAgICAgICBvbkdvYWw6IDUwLFxyXG4gICAgICAgIGRlYWRQZW5hbGl0eTogMFxyXG4gICAgfSxcclxuICAgIGxpZmVzcGFuOiA4MDAsXHJcbiAgICBwb3B1bGF0aW9uOiB7XHJcbiAgICAgICAgc2l6ZTogMzBcclxuICAgIH0sXHJcbiAgICBjYXI6IHtcclxuICAgICAgICBzZW5zb3JzOiBzZW5zb3JzLFxyXG4gICAgICAgIGdlbmVzOiBzZW5zb3JzLmxlbmd0aCxcclxuICAgICAgICBtYXhNYWduaXR1ZGU6IDAuMlxyXG4gICAgfVxyXG59O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcclxuZXhwb3J0cy5pc0luc2lkZUNpcmNsZSA9IGV4cG9ydHMucG9pbnRJbkxpbmUgPSBleHBvcnRzLmRyYXdMaW5lID0gdm9pZCAwO1xyXG5mdW5jdGlvbiBkcmF3TGluZShjb250ZXh0LCBsaW5lKSB7XHJcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgY29udGV4dC5tb3ZlVG8obGluZS5zdGFydC54LCBsaW5lLnN0YXJ0LnkpO1xyXG4gICAgY29udGV4dC5saW5lVG8obGluZS5lbmQueCwgbGluZS5lbmQueSk7XHJcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xyXG59XHJcbmV4cG9ydHMuZHJhd0xpbmUgPSBkcmF3TGluZTtcclxuZnVuY3Rpb24gcG9pbnRJbkxpbmUocG9pbnQsIGxpbmUsIG5lYXJUaHJlc2hvbGQpIHtcclxuICAgIGlmIChuZWFyVGhyZXNob2xkID09PSB2b2lkIDApIHsgbmVhclRocmVzaG9sZCA9IDA7IH1cclxuICAgIHZhciBkcyA9IHBvaW50LmRpc3RhbmNlKGxpbmUuc3RhcnQpLCBkZSA9IHBvaW50LmRpc3RhbmNlKGxpbmUuZW5kKTtcclxuICAgIGxlbmd0aCA9IGxpbmUuc3RhcnQuZGlzdGFuY2UobGluZS5lbmQpO1xyXG4gICAgcmV0dXJuIGRlICsgZHMgPD0gbGVuZ3RoICsgbmVhclRocmVzaG9sZDtcclxufVxyXG5leHBvcnRzLnBvaW50SW5MaW5lID0gcG9pbnRJbkxpbmU7XHJcbmZ1bmN0aW9uIGlzSW5zaWRlQ2lyY2xlKHBvaW50LCBjZW50ZXIsIHJhZGl1cykge1xyXG4gICAgcmV0dXJuIHBvaW50LmRpc3RhbmNlKGNlbnRlcikgPD0gcmFkaXVzO1xyXG59XHJcbmV4cG9ydHMuaXNJbnNpZGVDaXJjbGUgPSBpc0luc2lkZUNpcmNsZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XHJcbmV4cG9ydHMua2V5Ym9hcmQgPSBleHBvcnRzLktleWJvYXJkID0gZXhwb3J0cy5LZXlib2FyZE1vZGlmaWVycyA9IHZvaWQgMDtcclxudmFyIEtleWJvYXJkTW9kaWZpZXJzO1xyXG4oZnVuY3Rpb24gKEtleWJvYXJkTW9kaWZpZXJzKSB7XHJcbiAgICBLZXlib2FyZE1vZGlmaWVyc1tLZXlib2FyZE1vZGlmaWVyc1tcIk5PTkVcIl0gPSAwXSA9IFwiTk9ORVwiO1xyXG4gICAgS2V5Ym9hcmRNb2RpZmllcnNbS2V5Ym9hcmRNb2RpZmllcnNbXCJDVFJMXCJdID0gMV0gPSBcIkNUUkxcIjtcclxuICAgIEtleWJvYXJkTW9kaWZpZXJzW0tleWJvYXJkTW9kaWZpZXJzW1wiU0hJRlRcIl0gPSAyXSA9IFwiU0hJRlRcIjtcclxufSkoS2V5Ym9hcmRNb2RpZmllcnMgPSBleHBvcnRzLktleWJvYXJkTW9kaWZpZXJzIHx8IChleHBvcnRzLktleWJvYXJkTW9kaWZpZXJzID0ge30pKTtcclxudmFyIEtleWJvYXJkID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gS2V5Ym9hcmQod2luZG93KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB0aGlzLmhhbmRsZXJzID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIGZ1bmN0aW9uIChldmVudCkgeyByZXR1cm4gX3RoaXMuaGFuZGxlRXZlbnQoZXZlbnQpOyB9KTtcclxuICAgIH1cclxuICAgIEtleWJvYXJkLnByb3RvdHlwZS5oYW5kbGVFdmVudCA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBtb2RpZmllcnMgPSBLZXlib2FyZE1vZGlmaWVycy5OT05FO1xyXG4gICAgICAgIGlmIChldmVudC5zaGlmdEtleSlcclxuICAgICAgICAgICAgbW9kaWZpZXJzIHw9IEtleWJvYXJkTW9kaWZpZXJzLlNISUZUO1xyXG4gICAgICAgIGlmIChldmVudC5jdHJsS2V5KVxyXG4gICAgICAgICAgICBtb2RpZmllcnMgfD0gS2V5Ym9hcmRNb2RpZmllcnMuQ1RSTDtcclxuICAgICAgICB2YXIga2V5UHJlc3MgPSB7IGtleTogZXZlbnQua2V5LCBtb2RpZmllcnM6IG1vZGlmaWVycyB9LCBoYW5kbGVyID0gdGhpcy5oYW5kbGVycy5nZXQoZXZlbnQua2V5KTtcclxuICAgICAgICBpZiAoIWhhbmRsZXIpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGhhbmRsZXIoZXZlbnQpO1xyXG4gICAgfTtcclxuICAgIEtleWJvYXJkLnByb3RvdHlwZS5saXN0ZW4gPSBmdW5jdGlvbiAoa2V5LCBoYW5kbGVyLCBtb2RpZmllcnMpIHtcclxuICAgICAgICBpZiAobW9kaWZpZXJzID09PSB2b2lkIDApIHsgbW9kaWZpZXJzID0gS2V5Ym9hcmRNb2RpZmllcnMuTk9ORTsgfVxyXG4gICAgICAgIHRoaXMuaGFuZGxlcnMuc2V0KGtleSwgaGFuZGxlcik7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIEtleWJvYXJkO1xyXG59KCkpO1xyXG5leHBvcnRzLktleWJvYXJkID0gS2V5Ym9hcmQ7XHJcbmV4cG9ydHMua2V5Ym9hcmQgPSBuZXcgS2V5Ym9hcmQod2luZG93KTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XHJcbnZhciBjYXJfMSA9IHJlcXVpcmUoXCIuL2NhclwiKTtcclxudmFyIGNvcmVfMSA9IHJlcXVpcmUoXCIuL2NvcmVcIik7XHJcbnZhciBlbnZpcm9ubWVudF8xID0gcmVxdWlyZShcIi4vZW52aXJvbm1lbnRcIik7XHJcbnZhciB1aV8xID0gcmVxdWlyZShcIi4vdWlcIik7XHJcbnZhciBQb3B1bGF0aW9uID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gUG9wdWxhdGlvbihpdGVtcykge1xyXG4gICAgICAgIHRoaXMuaXRlbXMgPSBpdGVtcztcclxuICAgICAgICB0aGlzLnNpemUgPSB0aGlzLml0ZW1zLmxlbmd0aDtcclxuICAgIH1cclxuICAgIFBvcHVsYXRpb24ucHJvdG90eXBlLnNwbGl0UG9pbnRDcm9zc292ZXIgPSBmdW5jdGlvbiAocGFyZW50QSwgcGFyZW50Qikge1xyXG4gICAgICAgIHZhciBhR2VuZXMgPSBwYXJlbnRBLmdlbmVzLCBiR2VuZXMgPSBwYXJlbnRCLmdlbmVzLCBkbmFMZW5ndGggPSBhR2VuZXMubGVuZ3RoO1xyXG4gICAgICAgIHZhciBzcGxpdFBvaW50ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogZG5hTGVuZ3RoKTtcclxuICAgICAgICByZXR1cm4gYUdlbmVzLnNsaWNlKDAsIHNwbGl0UG9pbnQpXHJcbiAgICAgICAgICAgIC5jb25jYXQoYkdlbmVzLnNsaWNlKHNwbGl0UG9pbnQpKTtcclxuICAgIH07XHJcbiAgICBQb3B1bGF0aW9uLnByb3RvdHlwZS51bmlmb3JtQ3Jvc3NvdmVyID0gZnVuY3Rpb24gKHBhcmVudEEsIHBhcmVudEIpIHtcclxuICAgICAgICB2YXIgYUdlbmVzID0gcGFyZW50QS5nZW5lcywgYkdlbmVzID0gcGFyZW50Qi5nZW5lcywgZG5hTGVuZ3RoID0gYUdlbmVzLmxlbmd0aCwgbmV3RE5BID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkbmFMZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAvLyBjaG9vc2UgdGhlIGdlbmUgcmFuZG9tbHkgZnJvbSBmaXJzdCBvciBzZWNvbmQgcGFyZW50IFxyXG4gICAgICAgICAgICB2YXIgY2hvb3NlRmlyc3QgPSBNYXRoLnJhbmRvbSgpID4gLjUsIGdlbmVBID0gYUdlbmVzW2ldLCBnZW5lQiA9IGJHZW5lc1tpXSwgbmV3R2VuZSA9IGNob29zZUZpcnN0ID8gZ2VuZUEgOiBnZW5lQjtcclxuICAgICAgICAgICAgbmV3RE5BLnB1c2gobmV3R2VuZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXdETkE7XHJcbiAgICB9O1xyXG4gICAgUG9wdWxhdGlvbi5wcm90b3R5cGUuaW50ZXJtZWRpYXRlQ3Jvc3NvdmVyID0gZnVuY3Rpb24gKHBhcmVudEEsIHBhcmVudEIpIHtcclxuICAgICAgICB2YXIgYUdlbmVzID0gcGFyZW50QS5nZW5lcywgYkdlbmVzID0gcGFyZW50Qi5nZW5lcywgZG5hTGVuZ3RoID0gYUdlbmVzLmxlbmd0aCwgbmV3RE5BID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkbmFMZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAvLyBpbnRlcnBvbGF0ZSBlYWNoIGdlbmUgb2YgdGhlIHBhcmVudCBieSBhIHJhbmRvbSBmYWN0b3JcclxuICAgICAgICAgICAgdmFyIGFscGhhID0gTWF0aC5yYW5kb20oKSwgZ2VuZUEgPSBhR2VuZXNbaV0sIGdlbmVCID0gYkdlbmVzW2ldLCBuZXdHZW5lID0gZ2VuZUEuc3VtKGdlbmVCLm1pbnVzKGdlbmVBKS5tdWwoYWxwaGEpKTtcclxuICAgICAgICAgICAgbmV3RE5BLnB1c2gobmV3R2VuZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXdETkE7XHJcbiAgICB9O1xyXG4gICAgUG9wdWxhdGlvbi5wcm90b3R5cGUuZGlzY3JldGVNdXRhdGlvbiA9IGZ1bmN0aW9uIChkbmEpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRuYS5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IGVudmlyb25tZW50XzEuZW52aXJvbm1lbnQubXV0YXRpb25SYXRlKVxyXG4gICAgICAgICAgICAgICAgZG5hW2ldID0gKDAsIGNhcl8xLnJhbmRvbUdlbmUpKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFBvcHVsYXRpb24ucHJvdG90eXBlLmV4cGxpY2l0TXV0YXRpb24gPSBmdW5jdGlvbiAoZG5hKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkbmEubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgdmFyIGdlbmUgPSBkbmFbaV07XHJcbiAgICAgICAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgZW52aXJvbm1lbnRfMS5lbnZpcm9ubWVudC5tdXRhdGlvblJhdGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBwZXJ0dXJiYXRpb24gPSBjb3JlXzEuVmVjMi5yYW5kb20oLjA1KTtcclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGNsYW1wIG1hZ25pdHVkZVxyXG4gICAgICAgICAgICAgICAgZ2VuZS5hZGQocGVydHVyYmF0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBQb3B1bGF0aW9uLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uIChjaXJjdWl0KSB7XHJcbiAgICAgICAgdmFyIGxpZmVzcGFuID0gZW52aXJvbm1lbnRfMS5lbnZpcm9ubWVudC5saWZlc3BhbiwgbWF0aW5nUG9vbCA9IHRoaXMuaXRlbXM7XHJcbiAgICAgICAgdmFyIGNyb3Nzb3ZlciA9IHtcclxuICAgICAgICAgICAgJ3NwbGl0LXBvaW50JzogdGhpcy5zcGxpdFBvaW50Q3Jvc3NvdmVyLFxyXG4gICAgICAgICAgICAnaW50ZXJtZWRpYXRlJzogdGhpcy5pbnRlcm1lZGlhdGVDcm9zc292ZXIsXHJcbiAgICAgICAgICAgICd1bmlmb3JtJzogdGhpcy51bmlmb3JtQ3Jvc3NvdmVyXHJcbiAgICAgICAgfVtlbnZpcm9ubWVudF8xLmVudmlyb25tZW50LmNyb3Nzb3Zlcl07XHJcbiAgICAgICAgdmFyIG11dGF0ZSA9IHtcclxuICAgICAgICAgICAgJ2Rpc2NyZXRlJzogdGhpcy5kaXNjcmV0ZU11dGF0aW9uLFxyXG4gICAgICAgICAgICAnZXhwbGljaXQnOiB0aGlzLmV4cGxpY2l0TXV0YXRpb25cclxuICAgICAgICB9W2Vudmlyb25tZW50XzEuZW52aXJvbm1lbnQubXV0YXRpb25dO1xyXG4gICAgICAgIGZ1bmN0aW9uIGZpdG5lc3MoY2FyKSB7XHJcbiAgICAgICAgICAgIGlmIChjYXIuc3RhdGUua2luZCA9PSAnY29tcGxldGVkJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVudmlyb25tZW50XzEuZW52aXJvbm1lbnQuc2NvcmUuYmFzZSArICgxIC0gY2FyLnN0YXRlLmNvbXBsZXRpdGlvblRpbWUgLyBsaWZlc3BhbikgKiBlbnZpcm9ubWVudF8xLmVudmlyb25tZW50LnNjb3JlLm9uR29hbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdG90YWxDaGVja3BvaW50cyA9IGNpcmN1aXQuY2hlY2twb2ludHMubGVuZ3RoIHx8IDEsIGhpdHRlZCA9IGNhci5oaXR0ZWRDaGVja3BvaW50cy5zaXplO1xyXG4gICAgICAgICAgICB2YXIgc2NvcmUgPSBoaXR0ZWQgLyAodG90YWxDaGVja3BvaW50cyArIDEpICogZW52aXJvbm1lbnRfMS5lbnZpcm9ubWVudC5zY29yZS5iYXNlO1xyXG4gICAgICAgICAgICBpZiAoY2FyLnN0YXRlLmtpbmQgPT0gJ2RlYWQnKVxyXG4gICAgICAgICAgICAgICAgc2NvcmUgLT0gZW52aXJvbm1lbnRfMS5lbnZpcm9ubWVudC5zY29yZS5kZWFkUGVuYWxpdHk7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLm1heCgwLCBzY29yZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBmaXRuZXNzZXMgPSBtYXRpbmdQb29sLm1hcChmaXRuZXNzKSwgdG90YWxGaXRuZXNzID0gZml0bmVzc2VzLnJlZHVjZShmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYSArIGI7IH0pLCBwcm9iYWJpbGl0aWVzID0gZml0bmVzc2VzLm1hcChmdW5jdGlvbiAoZml0KSB7IHJldHVybiBmaXQgLyB0b3RhbEZpdG5lc3M7IH0pO1xyXG4gICAgICAgIGZ1bmN0aW9uIHNlbGVjdCgpIHtcclxuICAgICAgICAgICAgdmFyIHAgPSBNYXRoLnJhbmRvbSgpO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1hdGluZ1Bvb2wubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBwcm9iYWJpbGl0eSA9IHByb2JhYmlsaXRpZXNbaV0sIGVsZW1lbnQgPSBtYXRpbmdQb29sW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHAgPiBwcm9iYWJpbGl0eSlcclxuICAgICAgICAgICAgICAgICAgICBwIC09IHByb2JhYmlsaXR5O1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGVsaXRoaXNtOiBpbmNsdWRlIHRoZSBiZXN0IGVsZW1lbnQgaW4gdGhlIG5leHQgcG9wdWxhdGlvblxyXG4gICAgICAgIHZhciBiZXN0Rml0ID0gMCwgZWxpdGUgPSBudWxsO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zaXplOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgdmFyIGZpdCA9IGZpdG5lc3Nlc1tpXTtcclxuICAgICAgICAgICAgaWYgKGZpdCA+IGJlc3RGaXQpIHtcclxuICAgICAgICAgICAgICAgIGJlc3RGaXQgPSBmaXQ7XHJcbiAgICAgICAgICAgICAgICBlbGl0ZSA9IG1hdGluZ1Bvb2xbaV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGF2ZXJhZ2VGaXQgPSB0b3RhbEZpdG5lc3MgLyBtYXRpbmdQb29sLmxlbmd0aDtcclxuICAgICAgICB1aV8xLnRvb2x0aXAudXBkYXRlKHtcclxuICAgICAgICAgICAgbWF4Rml0bmVzczogYmVzdEZpdCxcclxuICAgICAgICAgICAgYXZlcmFnZUZpdG5lc3M6IGF2ZXJhZ2VGaXRcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgbmV4dEdlbmVyYXRpb24gPSBbZWxpdGVdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zaXplIC0gMTsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIHZhciBmaXJzdFBhcmVudCA9IHNlbGVjdCgpLCBzZWNvbmRQYXJlbnQgPSBzZWxlY3QoKSwgbmV3RE5BID0gY3Jvc3NvdmVyKGZpcnN0UGFyZW50LCBzZWNvbmRQYXJlbnQpO1xyXG4gICAgICAgICAgICBtdXRhdGUobmV3RE5BKTtcclxuICAgICAgICAgICAgbmV4dEdlbmVyYXRpb24ucHVzaChuZXcgY2FyXzFbXCJkZWZhdWx0XCJdKG5ld0ROQSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLml0ZW1zID0gbmV4dEdlbmVyYXRpb247XHJcbiAgICB9O1xyXG4gICAgUG9wdWxhdGlvbi5yYW5kb20gPSBmdW5jdGlvbiAoc2l6ZSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUG9wdWxhdGlvbihuZXcgQXJyYXkoc2l6ZSlcclxuICAgICAgICAgICAgLmZpbGwoMClcclxuICAgICAgICAgICAgLm1hcChmdW5jdGlvbiAoKSB7IHJldHVybiBjYXJfMVtcImRlZmF1bHRcIl0ucmFuZG9tKCk7IH0pKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gUG9wdWxhdGlvbjtcclxufSgpKTtcclxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBQb3B1bGF0aW9uO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcclxuZXhwb3J0cy5pbml0aWFsaXplID0gZXhwb3J0cy50b29sdGlwID0gZXhwb3J0cy50YWJzID0gZXhwb3J0cy5zaW11bGF0aW9uID0gZXhwb3J0cy5lZGl0b3IgPSBleHBvcnRzLnBhbmVscyA9IHZvaWQgMDtcclxudmFyIHBhbmVsX21hbmFnZXJfMSA9IHJlcXVpcmUoXCIuL3BhbmVsLW1hbmFnZXJcIik7XHJcbnZhciBzaW11bGF0aW9uXzEgPSByZXF1aXJlKFwiLi9wYW5lbHMvc2ltdWxhdGlvblwiKTtcclxudmFyIGVkaXRvcl8xID0gcmVxdWlyZShcIi4vcGFuZWxzL2VkaXRvclwiKTtcclxudmFyIHRhYnNfMSA9IHJlcXVpcmUoXCIuL3RhYnNcIik7XHJcbnZhciBwb3B1bGF0aW9uX3Rvb2x0aXBfMSA9IHJlcXVpcmUoXCIuL3BvcHVsYXRpb24tdG9vbHRpcFwiKTtcclxuZXhwb3J0cy5wYW5lbHMgPSBuZXcgcGFuZWxfbWFuYWdlcl8xW1wiZGVmYXVsdFwiXSgpO1xyXG5mdW5jdGlvbiBjcmVhdGVQYW5lbFRhYihwYW5lbHMsIG5hbWUpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbmFtZTogbmFtZSxcclxuICAgICAgICBvcGVuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHBhbmVscy5ydW4obmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5mdW5jdGlvbiBpbml0aWFsaXplKGNpcmN1aXQpIHtcclxuICAgIHZhciB0b29sdGlwQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rvb2x0aXAnKTtcclxuICAgIGV4cG9ydHMudG9vbHRpcCA9IG5ldyBwb3B1bGF0aW9uX3Rvb2x0aXBfMVtcImRlZmF1bHRcIl0odG9vbHRpcENvbnRhaW5lcik7XHJcbiAgICBleHBvcnRzLmVkaXRvciA9IG5ldyBlZGl0b3JfMVtcImRlZmF1bHRcIl0oY2lyY3VpdCk7XHJcbiAgICBleHBvcnRzLnNpbXVsYXRpb24gPSBuZXcgc2ltdWxhdGlvbl8xW1wiZGVmYXVsdFwiXShjaXJjdWl0KTtcclxuICAgIGV4cG9ydHMucGFuZWxzLmFkZCgnZWRpdG9yJywgZXhwb3J0cy5lZGl0b3IpO1xyXG4gICAgZXhwb3J0cy5wYW5lbHMuYWRkKCdzaW11bGF0aW9uJywgZXhwb3J0cy5zaW11bGF0aW9uKTtcclxuICAgIHZhciBzaW11bGF0aW9uQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpbXVsYXRpb24tYmFyJyk7XHJcbiAgICB2YXIgZWRpdG9yQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkaXRvci1iYXInKTtcclxuICAgIHZhciBlZGl0b3JCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZWRpdG9yLWJ0bicpO1xyXG4gICAgdmFyIHNpbXVsYXRpb25CdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2ltdWxhdGlvbi1idG4nKTtcclxuICAgIHZhciBwYXVzZUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaW11bGF0aW9uLXBhdXNlJyk7XHJcbiAgICB2YXIgdG9nZ2xlID0gZnVuY3Rpb24gKF8pIHsgcmV0dXJuIGV4cG9ydHMuc2ltdWxhdGlvbi5wYXVzZWQgPSAhZXhwb3J0cy5zaW11bGF0aW9uLnBhdXNlZDsgfTtcclxuICAgIGV4cG9ydHMuc2ltdWxhdGlvbi5hZGRTaG9ydGN1dCgnICcsIHRvZ2dsZSk7XHJcbiAgICBwYXVzZUJ0bi5vbmNsaWNrID0gdG9nZ2xlO1xyXG4gICAgZXhwb3J0cy50YWJzID0gbmV3IHRhYnNfMS5UYWJHcm91cCgpO1xyXG4gICAgZXhwb3J0cy50YWJzLmF0dGFjaChlZGl0b3JCdG4sIGNyZWF0ZVBhbmVsVGFiKGV4cG9ydHMucGFuZWxzLCAnZWRpdG9yJykpO1xyXG4gICAgZXhwb3J0cy50YWJzLmJpbmQoJ2VkaXRvcicsIGVkaXRvckJhcik7XHJcbiAgICB2YXIgZWRpdG9yTW9kZVRhYnMgPSBuZXcgdGFic18xLlRhYkdyb3VwKCk7XHJcbiAgICBlZGl0b3JNb2RlVGFicy5hdHRhY2goZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkaXRvci1kcmF3JyksIHtcclxuICAgICAgICBuYW1lOiAnZHJhdycsXHJcbiAgICAgICAgb3BlbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBleHBvcnRzLmVkaXRvci5zZXRNb2RlKGVkaXRvcl8xLkVkaXRvck1vZGUuRFJBVyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBlZGl0b3JNb2RlVGFicy5hdHRhY2goZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VkaXRvci1jYW5jZWwnKSwge1xyXG4gICAgICAgIG5hbWU6ICdjYW5jZWwnLFxyXG4gICAgICAgIG9wZW46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgZXhwb3J0cy5lZGl0b3Iuc2V0TW9kZShlZGl0b3JfMS5FZGl0b3JNb2RlLkNBTkNFTCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICB2YXIgc3ViamVjdEJhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkcmF3LXN1YmplY3QnKTtcclxuICAgIGVkaXRvck1vZGVUYWJzLmJpbmQoJ2RyYXcnLCBzdWJqZWN0QmFyKTtcclxuICAgIGVkaXRvck1vZGVUYWJzLm9wZW4oJ2RyYXcnKTtcclxuICAgIHZhciBlZGl0b3JEcmF3U3ViamVjdCA9IG5ldyB0YWJzXzEuVGFiR3JvdXAoKTtcclxuICAgIGVkaXRvckRyYXdTdWJqZWN0LmF0dGFjaChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZHJhdy13YWxsJyksIHtcclxuICAgICAgICBuYW1lOiAnd2FsbCcsXHJcbiAgICAgICAgb3BlbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBleHBvcnRzLmVkaXRvci5zZXREcmF3U3ViamVjdChlZGl0b3JfMS5FbnRpdHlUeXBlLldBTEwpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgZWRpdG9yRHJhd1N1YmplY3QuYXR0YWNoKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkcmF3LWNoZWNrcG9pbnQnKSwge1xyXG4gICAgICAgIG5hbWU6ICdjaGVja3BvaW50JyxcclxuICAgICAgICBvcGVuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGV4cG9ydHMuZWRpdG9yLnNldERyYXdTdWJqZWN0KGVkaXRvcl8xLkVudGl0eVR5cGUuQ0hFQ0tQT0lOVCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBlZGl0b3JEcmF3U3ViamVjdC5hdHRhY2goZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RyYXctZ29hbCcpLCB7XHJcbiAgICAgICAgbmFtZTogJ2dvYWwnLFxyXG4gICAgICAgIG9wZW46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgZXhwb3J0cy5lZGl0b3Iuc2V0RHJhd1N1YmplY3QoZWRpdG9yXzEuRW50aXR5VHlwZS5HT0FMKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIGVkaXRvckRyYXdTdWJqZWN0Lm9wZW4oJ3dhbGwnKTtcclxuICAgIC8vIGVkaXRvciBzaG9ydGN1dHNcclxuICAgIGV4cG9ydHMuZWRpdG9yLmFkZFNob3J0Y3V0KCdkJywgZnVuY3Rpb24gKF8pIHsgcmV0dXJuIGVkaXRvck1vZGVUYWJzLm9wZW4oJ2RyYXcnKTsgfSk7XHJcbiAgICBleHBvcnRzLmVkaXRvci5hZGRTaG9ydGN1dCgnYycsIGZ1bmN0aW9uIChfKSB7IHJldHVybiBlZGl0b3JNb2RlVGFicy5vcGVuKCdjYW5jZWwnKTsgfSk7XHJcbiAgICBleHBvcnRzLmVkaXRvci5hZGRTaG9ydGN1dCgnMScsIGZ1bmN0aW9uIChfKSB7IHJldHVybiBlZGl0b3JEcmF3U3ViamVjdC5vcGVuKCd3YWxsJyk7IH0pO1xyXG4gICAgZXhwb3J0cy5lZGl0b3IuYWRkU2hvcnRjdXQoJzInLCBmdW5jdGlvbiAoXykgeyByZXR1cm4gZWRpdG9yRHJhd1N1YmplY3Qub3BlbignY2hlY2twb2ludCcpOyB9KTtcclxuICAgIGV4cG9ydHMuZWRpdG9yLmFkZFNob3J0Y3V0KCczJywgZnVuY3Rpb24gKF8pIHsgcmV0dXJuIGVkaXRvckRyYXdTdWJqZWN0Lm9wZW4oJ2dvYWwnKTsgfSk7XHJcbiAgICBleHBvcnRzLnRhYnMuYXR0YWNoKHNpbXVsYXRpb25CdG4sIGNyZWF0ZVBhbmVsVGFiKGV4cG9ydHMucGFuZWxzLCAnc2ltdWxhdGlvbicpKTtcclxuICAgIGV4cG9ydHMudGFicy5iaW5kKCdzaW11bGF0aW9uJywgc2ltdWxhdGlvbkJhcik7XHJcbiAgICBleHBvcnRzLnRhYnMub3Blbignc2ltdWxhdGlvbicpO1xyXG59XHJcbmV4cG9ydHMuaW5pdGlhbGl6ZSA9IGluaXRpYWxpemU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xyXG52YXIgUGFuZWxNYW5hZ2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gUGFuZWxNYW5hZ2VyKCkge1xyXG4gICAgICAgIHRoaXMucGFuZWxzID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlUGFuZWwgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgUGFuZWxNYW5hZ2VyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAobmFtZSwgcGFuZWwpIHtcclxuICAgICAgICBwYW5lbC5pbml0aWFsaXplKCk7XHJcbiAgICAgICAgdGhpcy5wYW5lbHMuc2V0KG5hbWUsIHBhbmVsKTtcclxuICAgIH07XHJcbiAgICBQYW5lbE1hbmFnZXIucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgdmFyIF9hO1xyXG4gICAgICAgIGlmICghdGhpcy5wYW5lbHMuaGFzKG5hbWUpKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vIHBhbmVsIG9mIG5hbWUgJyArIG5hbWUgKyAnIGF2YWlsYWJsZScpO1xyXG4gICAgICAgIHZhciBwYW5lbCA9IHRoaXMucGFuZWxzLmdldChuYW1lKTtcclxuICAgICAgICAoX2EgPSB0aGlzLmFjdGl2ZVBhbmVsKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuY2xvc2UoKTtcclxuICAgICAgICBwYW5lbC5ydW4oKTtcclxuICAgICAgICB0aGlzLmFjdGl2ZVBhbmVsID0gcGFuZWw7XHJcbiAgICB9O1xyXG4gICAgUGFuZWxNYW5hZ2VyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoY29udGV4dCwgZHQpIHtcclxuICAgICAgICB2YXIgX2E7XHJcbiAgICAgICAgKF9hID0gdGhpcy5hY3RpdmVQYW5lbCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnJlbmRlcihjb250ZXh0LCBkdCk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFBhbmVsTWFuYWdlcjtcclxufSgpKTtcclxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBQYW5lbE1hbmFnZXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBiICE9PSBcImZ1bmN0aW9uXCIgJiYgYiAhPT0gbnVsbClcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xyXG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG4gICAgfTtcclxufSkoKTtcclxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcclxuZXhwb3J0cy5FZGl0b3JNb2RlID0gZXhwb3J0cy5FbnRpdHlUeXBlID0gdm9pZCAwO1xyXG52YXIgY29yZV8xID0gcmVxdWlyZShcIi4uLy4uL2NvcmVcIik7XHJcbnZhciBjaXJjdWl0XzEgPSByZXF1aXJlKFwiLi4vLi4vY2lyY3VpdFwiKTtcclxudmFyIGdyYXBoaWNzXzEgPSByZXF1aXJlKFwiLi4vLi4vZ3JhcGhpY3NcIik7XHJcbnZhciBkYiA9IHJlcXVpcmUoXCIuLi8uLi9kYlwiKTtcclxudmFyIHBhbmVsXzEgPSByZXF1aXJlKFwiLi9wYW5lbFwiKTtcclxudmFyIGVudmlyb25tZW50XzEgPSByZXF1aXJlKFwiLi4vLi4vZW52aXJvbm1lbnRcIik7XHJcbnZhciBFbnRpdHlUeXBlO1xyXG4oZnVuY3Rpb24gKEVudGl0eVR5cGUpIHtcclxuICAgIEVudGl0eVR5cGVbRW50aXR5VHlwZVtcIldBTExcIl0gPSAwXSA9IFwiV0FMTFwiO1xyXG4gICAgRW50aXR5VHlwZVtFbnRpdHlUeXBlW1wiR09BTFwiXSA9IDFdID0gXCJHT0FMXCI7XHJcbiAgICBFbnRpdHlUeXBlW0VudGl0eVR5cGVbXCJDSEVDS1BPSU5UXCJdID0gMl0gPSBcIkNIRUNLUE9JTlRcIjtcclxufSkoRW50aXR5VHlwZSA9IGV4cG9ydHMuRW50aXR5VHlwZSB8fCAoZXhwb3J0cy5FbnRpdHlUeXBlID0ge30pKTtcclxudmFyIEVkaXRvck1vZGU7XHJcbihmdW5jdGlvbiAoRWRpdG9yTW9kZSkge1xyXG4gICAgRWRpdG9yTW9kZVtFZGl0b3JNb2RlW1wiRFJBV1wiXSA9IDBdID0gXCJEUkFXXCI7XHJcbiAgICBFZGl0b3JNb2RlW0VkaXRvck1vZGVbXCJDQU5DRUxcIl0gPSAxXSA9IFwiQ0FOQ0VMXCI7XHJcbn0pKEVkaXRvck1vZGUgPSBleHBvcnRzLkVkaXRvck1vZGUgfHwgKGV4cG9ydHMuRWRpdG9yTW9kZSA9IHt9KSk7XHJcbnZhciBFZGl0b3IgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XHJcbiAgICBfX2V4dGVuZHMoRWRpdG9yLCBfc3VwZXIpO1xyXG4gICAgZnVuY3Rpb24gRWRpdG9yKGNpcmN1aXQpIHtcclxuICAgICAgICBpZiAoY2lyY3VpdCA9PT0gdm9pZCAwKSB7IGNpcmN1aXQgPSBudWxsOyB9XHJcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcykgfHwgdGhpcztcclxuICAgICAgICBfdGhpcy5jaXJjdWl0ID0gY2lyY3VpdDtcclxuICAgICAgICBfdGhpcy5sYXN0UG9pbnQgPSBudWxsO1xyXG4gICAgICAgIF90aGlzLmN1cnJlbnRQb2ludCA9IG51bGw7XHJcbiAgICAgICAgX3RoaXMubW91c2VQcmVzc2VkID0gZmFsc2U7XHJcbiAgICAgICAgX3RoaXMubW92aW5nVmVsb2NpdHkgPSBmYWxzZTtcclxuICAgICAgICBfdGhpcy5kcmF3U3ViamVjdCA9IEVudGl0eVR5cGUuV0FMTDtcclxuICAgICAgICBfdGhpcy5tb2RlID0gRWRpdG9yTW9kZS5EUkFXO1xyXG4gICAgICAgIF90aGlzLmNpcmN1aXQgPSBjaXJjdWl0ICE9PSBudWxsICYmIGNpcmN1aXQgIT09IHZvaWQgMCA/IGNpcmN1aXQgOiBuZXcgY2lyY3VpdF8xW1wiZGVmYXVsdFwiXShbXSk7XHJcbiAgICAgICAgcmV0dXJuIF90aGlzO1xyXG4gICAgfVxyXG4gICAgRWRpdG9yLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuYXR0YWNoSGFuZGxlcnMoKTtcclxuICAgIH07XHJcbiAgICBFZGl0b3IucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBfc3VwZXIucHJvdG90eXBlLnJ1bi5jYWxsKHRoaXMpO1xyXG4gICAgICAgIHRoaXMucmVzZXREcmF3KCk7XHJcbiAgICB9O1xyXG4gICAgRWRpdG9yLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBfc3VwZXIucHJvdG90eXBlLmNsb3NlLmNhbGwodGhpcyk7XHJcbiAgICAgICAgdmFyIGxvYWRlZENpcmN1aXQgPSBkYi5jdXJyZW50RW50cnkoKTtcclxuICAgICAgICBkYi5zYXZlKGxvYWRlZENpcmN1aXQsIHRoaXMuY2lyY3VpdCk7XHJcbiAgICB9O1xyXG4gICAgRWRpdG9yLnByb3RvdHlwZS5zZXRNb2RlID0gZnVuY3Rpb24gKG1vZGUpIHtcclxuICAgICAgICB0aGlzLm1vZGUgPSBtb2RlO1xyXG4gICAgfTtcclxuICAgIEVkaXRvci5wcm90b3R5cGUuc2V0RHJhd1N1YmplY3QgPSBmdW5jdGlvbiAoc3ViamVjdCkge1xyXG4gICAgICAgIHRoaXMuZHJhd1N1YmplY3QgPSBzdWJqZWN0O1xyXG4gICAgfTtcclxuICAgIEVkaXRvci5wcm90b3R5cGUuZmluZEVudGl0eSA9IGZ1bmN0aW9uIChwb2ludCkge1xyXG4gICAgICAgIHZhciB0aHJlc2hvbGQgPSAyO1xyXG4gICAgICAgIC8vIHJldHVybnMgYW4gb2JqZWN0IHdpdGggdGhlIGVudGl0eSB0b3VjaGluZyB0aGUgcG9pbnQgYW5kIGhpcyB0eXBlXHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuY2lyY3VpdC53YWxsczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgdmFyIHdhbGwgPSBfYVtfaV07XHJcbiAgICAgICAgICAgIGlmICgoMCwgZ3JhcGhpY3NfMS5wb2ludEluTGluZSkocG9pbnQsIHdhbGwsIHRocmVzaG9sZCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4geyBlbnRpdHk6IHdhbGwsIHR5cGU6IEVudGl0eVR5cGUuV0FMTCB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKHZhciBfYiA9IDAsIF9jID0gdGhpcy5jaXJjdWl0LmNoZWNrcG9pbnRzOyBfYiA8IF9jLmxlbmd0aDsgX2IrKykge1xyXG4gICAgICAgICAgICB2YXIgY2hlY2twb2ludCA9IF9jW19iXTtcclxuICAgICAgICAgICAgaWYgKCgwLCBncmFwaGljc18xLnBvaW50SW5MaW5lKShwb2ludCwgY2hlY2twb2ludCwgdGhyZXNob2xkKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB7IGVudGl0eTogY2hlY2twb2ludCwgdHlwZTogRW50aXR5VHlwZS5DSEVDS1BPSU5UIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmNpcmN1aXQuZ29hbCAmJiAoMCwgZ3JhcGhpY3NfMS5wb2ludEluTGluZSkocG9pbnQsIHRoaXMuY2lyY3VpdC5nb2FsLCB0aHJlc2hvbGQpKVxyXG4gICAgICAgICAgICByZXR1cm4geyBlbnRpdHk6IHRoaXMuY2lyY3VpdC5nb2FsLCB0eXBlOiBFbnRpdHlUeXBlLkdPQUwgfTtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH07XHJcbiAgICBFZGl0b3IucHJvdG90eXBlLmRlbGV0ZUVudGl0eSA9IGZ1bmN0aW9uICh0b0VyYXNlKSB7XHJcbiAgICAgICAgdmFyIGVudGl0eSA9IHRvRXJhc2UuZW50aXR5LCB0eXBlID0gdG9FcmFzZS50eXBlO1xyXG4gICAgICAgIGlmICh0eXBlID09IEVudGl0eVR5cGUuR09BTCkge1xyXG4gICAgICAgICAgICB0aGlzLmNpcmN1aXQuZ29hbCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGUgPT0gRW50aXR5VHlwZS5XQUxMKSB7XHJcbiAgICAgICAgICAgIHZhciBpID0gdGhpcy5jaXJjdWl0LndhbGxzLmluZGV4T2YoZW50aXR5KTtcclxuICAgICAgICAgICAgdGhpcy5jaXJjdWl0LndhbGxzLnNwbGljZShpLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZSA9PSBFbnRpdHlUeXBlLkNIRUNLUE9JTlQpIHtcclxuICAgICAgICAgICAgdmFyIGkgPSB0aGlzLmNpcmN1aXQuY2hlY2twb2ludHMuaW5kZXhPZihlbnRpdHkpO1xyXG4gICAgICAgICAgICB0aGlzLmNpcmN1aXQuY2hlY2twb2ludHMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBFZGl0b3IucHJvdG90eXBlLmF0dGFjaEhhbmRsZXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0TW91c2VQb3NpdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgICAgICAgICBpZiAodGFyZ2V0Lm5vZGVOYW1lICE9PSAnQ0FOVkFTJylcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB2YXIgcmVjdCA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBjb3JlXzEuVmVjMihldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0LCBldmVudC5jbGllbnRZIC0gcmVjdC50b3ApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3aW5kb3cub25tb3VzZXVwID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmICghX3RoaXMuYWN0aXZlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICBpZiAoIV90aGlzLm1vdXNlUHJlc3NlZClcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKF90aGlzLm1vdmluZ1ZlbG9jaXR5KSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5tb3ZpbmdWZWxvY2l0eSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKF90aGlzLm1vZGUgPT0gRWRpdG9yTW9kZS5EUkFXKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGluZSA9IHsgc3RhcnQ6IF90aGlzLmxhc3RQb2ludCwgZW5kOiBfdGhpcy5jdXJyZW50UG9pbnQgfTtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoX3RoaXMuZHJhd1N1YmplY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIEVudGl0eVR5cGUuV0FMTDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5jaXJjdWl0LndhbGxzLnB1c2gobGluZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjYXNlIEVudGl0eVR5cGUuR09BTDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5jaXJjdWl0LmdvYWwgPSBzdHJ1Y3R1cmVkQ2xvbmUobGluZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjYXNlIEVudGl0eVR5cGUuQ0hFQ0tQT0lOVDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5jaXJjdWl0LmNoZWNrcG9pbnRzLnB1c2gobGluZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF90aGlzLnJlc2V0RHJhdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF90aGlzLm1vdXNlUHJlc3NlZCA9IGZhbHNlO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgd2luZG93Lm9ubW91c2Vtb3ZlID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmICghX3RoaXMuYWN0aXZlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB2YXIgbW91c2VQb3NpdGlvbiA9IGdldE1vdXNlUG9zaXRpb24oZXZlbnQpO1xyXG4gICAgICAgICAgICAvLyBtb3VzZSBvdXRzaWRlIHBlcm1pdHRlZCByZWdpb25cclxuICAgICAgICAgICAgaWYgKG1vdXNlUG9zaXRpb24gPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKF90aGlzLm1vZGUgPT0gRWRpdG9yTW9kZS5EUkFXKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoX3RoaXMubW92aW5nVmVsb2NpdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBzZXR0aW5nIHN0YXJ0aW5nIHZlbG9jaXR5XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZlbG9jaXR5ID0gbmV3IGNvcmVfMS5WZWMyKDEsIDApLCBhbmdsZSA9IG1vdXNlUG9zaXRpb24uYW5nbGVCZXR3ZWVuKF90aGlzLmNpcmN1aXQuc3Bhd25Qb2ludCk7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY2lyY3VpdC5zdGFydFZlbG9jaXR5ID0gdmVsb2NpdHkucm90YXRlKGFuZ2xlKS5tdWwoMik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50UG9pbnQgPSBtb3VzZVBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKF90aGlzLm1vZGUgPT0gRWRpdG9yTW9kZS5DQU5DRUwpIHtcclxuICAgICAgICAgICAgICAgIGlmICghX3RoaXMubW91c2VQcmVzc2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIHRvRXJhc2UgPSBfdGhpcy5maW5kRW50aXR5KG1vdXNlUG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRvRXJhc2UgPT0gbnVsbClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5kZWxldGVFbnRpdHkodG9FcmFzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHdpbmRvdy5vbm1vdXNlZG93biA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICBpZiAoIV90aGlzLmFjdGl2ZSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgdmFyIG1vdXNlUG9zaXRpb24gPSBnZXRNb3VzZVBvc2l0aW9uKGV2ZW50KTtcclxuICAgICAgICAgICAgLy8gbW91c2Ugb3V0c2lkZSBwZXJtaXR0ZWQgcmVnaW9uXHJcbiAgICAgICAgICAgIGlmIChtb3VzZVBvc2l0aW9uID09IG51bGwpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIGlmIChldmVudC5jdHJsS2V5KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBzZXR0aW5nIHRoZSBzcGF3biBwb2ludFxyXG4gICAgICAgICAgICAgICAgX3RoaXMuY2lyY3VpdC5zcGF3blBvaW50ID0gbW91c2VQb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBfdGhpcy5tb3VzZVByZXNzZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAoX3RoaXMubW9kZSA9PSBFZGl0b3JNb2RlLkRSQVcpIHtcclxuICAgICAgICAgICAgICAgIGlmICgoMCwgZ3JhcGhpY3NfMS5pc0luc2lkZUNpcmNsZSkobW91c2VQb3NpdGlvbiwgX3RoaXMuY2lyY3VpdC5zcGF3blBvaW50LCA1KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG1vdmluZyBzdGFydCB2ZWxvY2l0eVxyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLm1vdmluZ1ZlbG9jaXR5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKF90aGlzLmxhc3RQb2ludCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubGFzdFBvaW50ID0gbW91c2VQb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuICAgIEVkaXRvci5wcm90b3R5cGUuZHJhd2luZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZVByZXNzZWQgJiYgIXRoaXMubW92aW5nVmVsb2NpdHkgJiYgdGhpcy5tb2RlID09IEVkaXRvck1vZGUuRFJBVztcclxuICAgIH07XHJcbiAgICBFZGl0b3IucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIChjb250ZXh0LCBkdCkge1xyXG4gICAgICAgIHZhciBjb2xvcnMgPSBlbnZpcm9ubWVudF8xLmVudmlyb25tZW50LmNvbG9ycztcclxuICAgICAgICBpZiAodGhpcy5kcmF3aW5nKCkpIHtcclxuICAgICAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IGNvbG9ycy53YWxsO1xyXG4gICAgICAgICAgICA7XHJcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5kcmF3U3ViamVjdCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBFbnRpdHlUeXBlLkdPQUw6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gY29sb3JzLmdvYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXNlIEVudGl0eVR5cGUuQ0hFQ0tQT0lOVDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBjb2xvcnMuY2hlY2twb2ludDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAoMCwgZ3JhcGhpY3NfMS5kcmF3TGluZSkoY29udGV4dCwgeyBzdGFydDogdGhpcy5jdXJyZW50UG9pbnQsIGVuZDogdGhpcy5sYXN0UG9pbnQgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY2lyY3VpdC5kcmF3KGNvbnRleHQpO1xyXG4gICAgfTtcclxuICAgIEVkaXRvci5wcm90b3R5cGUucmVzZXREcmF3ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMubGFzdFBvaW50ID0gbnVsbDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRQb2ludCA9IG51bGw7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIEVkaXRvcjtcclxufShwYW5lbF8xW1wiZGVmYXVsdFwiXSkpO1xyXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IEVkaXRvcjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XHJcbnZhciBrZXlib2FyZF8xID0gcmVxdWlyZShcIi4uLy4uL2tleWJvYXJkXCIpO1xyXG52YXIgUGFuZWwgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBQYW5lbCgpIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgUGFuZWwucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XHJcbiAgICB9O1xyXG4gICAgUGFuZWwucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9O1xyXG4gICAgUGFuZWwucHJvdG90eXBlLmFkZFNob3J0Y3V0ID0gZnVuY3Rpb24gKGtleSwgaGFuZGxlciwgbW9kaWZpZXJzKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICBpZiAobW9kaWZpZXJzID09PSB2b2lkIDApIHsgbW9kaWZpZXJzID0ga2V5Ym9hcmRfMS5LZXlib2FyZE1vZGlmaWVycy5OT05FOyB9XHJcbiAgICAgICAgdmFyIHdyYXBwZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKCFfdGhpcy5hY3RpdmUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIGhhbmRsZXIoZXZlbnQpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAga2V5Ym9hcmRfMS5rZXlib2FyZC5saXN0ZW4oa2V5LCB3cmFwcGVyLCBtb2RpZmllcnMpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBQYW5lbDtcclxufSgpKTtcclxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBQYW5lbDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcclxuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgICAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2xhc3MgZXh0ZW5kcyB2YWx1ZSBcIiArIFN0cmluZyhiKSArIFwiIGlzIG5vdCBhIGNvbnN0cnVjdG9yIG9yIG51bGxcIik7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbiAgICB9O1xyXG59KSgpO1xyXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xyXG52YXIgcGFuZWxfMSA9IHJlcXVpcmUoXCIuL3BhbmVsXCIpO1xyXG52YXIgcG9wdWxhdGlvbl8xID0gcmVxdWlyZShcIi4uLy4uL3BvcHVsYXRpb25cIik7XHJcbnZhciBlbnZpcm9ubWVudF8xID0gcmVxdWlyZShcIi4uLy4uL2Vudmlyb25tZW50XCIpO1xyXG52YXIgX18xID0gcmVxdWlyZShcIi4uXCIpO1xyXG52YXIgU2ltdWxhdGlvblBhbmVsID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgX19leHRlbmRzKFNpbXVsYXRpb25QYW5lbCwgX3N1cGVyKTtcclxuICAgIGZ1bmN0aW9uIFNpbXVsYXRpb25QYW5lbChjaXJjdWl0KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcykgfHwgdGhpcztcclxuICAgICAgICBfdGhpcy5jaXJjdWl0ID0gY2lyY3VpdDtcclxuICAgICAgICBfdGhpcy5wb3B1bGF0aW9uID0gbnVsbDtcclxuICAgICAgICBfdGhpcy5saWZlc3BhbiA9IGVudmlyb25tZW50XzEuZW52aXJvbm1lbnQubGlmZXNwYW47XHJcbiAgICAgICAgX3RoaXMudGltZSA9IDA7XHJcbiAgICAgICAgX3RoaXMuZ2VuZXJhdGlvbiA9IDA7XHJcbiAgICAgICAgX3RoaXMucGF1c2VkID0gZmFsc2U7XHJcbiAgICAgICAgX3RoaXMucG9wdWxhdGlvblNpemUgPSBlbnZpcm9ubWVudF8xLmVudmlyb25tZW50LnBvcHVsYXRpb24uc2l6ZTtcclxuICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICB9XHJcbiAgICBTaW11bGF0aW9uUGFuZWwucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMudGltZSA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMucG9wdWxhdGlvbi5pdGVtczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgdmFyIGNhciA9IF9hW19pXTtcclxuICAgICAgICAgICAgY2FyLnJlc2V0KHRoaXMuY2lyY3VpdC5zcGF3blBvaW50LCB0aGlzLmNpcmN1aXQuc3RhcnRWZWxvY2l0eSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZ2VuZXJhdGlvbiArPSAxO1xyXG4gICAgICAgIF9fMS50b29sdGlwLnVwZGF0ZSh7IGdlbmVyYXRpb246IHRoaXMuZ2VuZXJhdGlvbiB9KTtcclxuICAgIH07XHJcbiAgICBTaW11bGF0aW9uUGFuZWwucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gaW5pdGlhbGl6ZSBwb3B1bGF0aW9uXHJcbiAgICAgICAgX18xLnRvb2x0aXAucmVzZXQoKTtcclxuICAgICAgICB0aGlzLmdlbmVyYXRpb24gPSAwO1xyXG4gICAgICAgIHRoaXMucG9wdWxhdGlvbiA9IHBvcHVsYXRpb25fMVtcImRlZmF1bHRcIl0ucmFuZG9tKHRoaXMucG9wdWxhdGlvblNpemUpO1xyXG4gICAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgIH07XHJcbiAgICBTaW11bGF0aW9uUGFuZWwucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBfc3VwZXIucHJvdG90eXBlLnJ1bi5jYWxsKHRoaXMpO1xyXG4gICAgICAgIF9fMS50b29sdGlwLnNob3coKTtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemUoKTtcclxuICAgIH07XHJcbiAgICBTaW11bGF0aW9uUGFuZWwucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIF9zdXBlci5wcm90b3R5cGUuY2xvc2UuY2FsbCh0aGlzKTtcclxuICAgICAgICBfXzEudG9vbHRpcC5oaWRlKCk7XHJcbiAgICB9O1xyXG4gICAgU2ltdWxhdGlvblBhbmVsLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgICB2YXIgdGltZUV4cGlyZWQgPSB0aGlzLnRpbWUgPj0gdGhpcy5saWZlc3BhbiwgZW5kZWRHZW5lcmF0aW9uID0gIXRoaXMucG9wdWxhdGlvbi5pdGVtcy5zb21lKGZ1bmN0aW9uIChjYXIpIHsgcmV0dXJuIGNhci5zdGlsbFJ1bm5pbmcoKTsgfSk7XHJcbiAgICAgICAgaWYgKHRpbWVFeHBpcmVkIHx8IGVuZGVkR2VuZXJhdGlvbikge1xyXG4gICAgICAgICAgICAvLyBubyBjYXIgYWxpdmUgZXZhbHVhdGUgbmV4dCBnZW5lcmF0aW9uIG9mIGNhcnNcclxuICAgICAgICAgICAgdGhpcy5wb3B1bGF0aW9uLmV2YWx1YXRlKHRoaXMuY2lyY3VpdCk7XHJcbiAgICAgICAgICAgIC8vIHJlc2V0IGNhciBwb3NpdGlvbnNcclxuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5wb3B1bGF0aW9uLml0ZW1zOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICB2YXIgY2FyID0gX2FbX2ldO1xyXG4gICAgICAgICAgICBjYXIudXBkYXRlKHRoaXMuY2lyY3VpdCwgdGhpcy50aW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy50aW1lICs9IDE7XHJcbiAgICB9O1xyXG4gICAgU2ltdWxhdGlvblBhbmVsLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoY29udGV4dCwgZHQpIHtcclxuICAgICAgICBpZiAoIXRoaXMucGF1c2VkKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKGR0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jaXJjdWl0LmRyYXcoY29udGV4dCk7XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMucG9wdWxhdGlvbi5pdGVtczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgdmFyIGNhciA9IF9hW19pXTtcclxuICAgICAgICAgICAgY2FyLmRyYXcoY29udGV4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGRyYXcgdGltZSBsaW5lXHJcbiAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBlbnZpcm9ubWVudF8xLmVudmlyb25tZW50LmNvbG9ycy5saWZlc3BhbkJhcjtcclxuICAgICAgICB2YXIgdyA9IGNvbnRleHQuY2FudmFzLndpZHRoLCBoID0gY29udGV4dC5jYW52YXMuaGVpZ2h0LCBiYXIgPSB3ICogKDEgLSB0aGlzLnRpbWUgLyB0aGlzLmxpZmVzcGFuKSwgYmFySGVpZ2h0ID0gNTtcclxuICAgICAgICBjb250ZXh0LmZpbGxSZWN0KDAsIGggLSBiYXJIZWlnaHQsIGJhciwgYmFySGVpZ2h0KTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gU2ltdWxhdGlvblBhbmVsO1xyXG59KHBhbmVsXzFbXCJkZWZhdWx0XCJdKSk7XHJcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gU2ltdWxhdGlvblBhbmVsO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbiAoZCwgYikge1xyXG4gICAgICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xyXG4gICAgICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcclxuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxuICAgIH07XHJcbn0pKCk7XHJcbnZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcclxuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0KSB7XHJcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSlcclxuICAgICAgICAgICAgICAgIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufTtcclxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcclxudmFyIHRvb2x0aXBfMSA9IHJlcXVpcmUoXCIuL3Rvb2x0aXBcIik7XHJcbnZhciBQb3B1bGF0aW9uVG9vbHRpcCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIF9fZXh0ZW5kcyhQb3B1bGF0aW9uVG9vbHRpcCwgX3N1cGVyKTtcclxuICAgIGZ1bmN0aW9uIFBvcHVsYXRpb25Ub29sdGlwKGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBlbGVtZW50KSB8fCB0aGlzO1xyXG4gICAgICAgIF90aGlzLmluZm8gPSB7XHJcbiAgICAgICAgICAgIG1heEZpdG5lc3M6IDAsXHJcbiAgICAgICAgICAgIGF2ZXJhZ2VGaXRuZXNzOiAwLFxyXG4gICAgICAgICAgICBnZW5lcmF0aW9uOiAwXHJcbiAgICAgICAgfTtcclxuICAgICAgICBfdGhpcy5tYXhMYWJlbCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLm1heC1maXQnKTtcclxuICAgICAgICBfdGhpcy5hdmVyYWdlTGFiZWwgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hdmctZml0Jyk7XHJcbiAgICAgICAgX3RoaXMuZ2VuZXJhdGlvbkxhYmVsID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZ2VuZXJhdGlvbicpO1xyXG4gICAgICAgIHJldHVybiBfdGhpcztcclxuICAgIH1cclxuICAgIFBvcHVsYXRpb25Ub29sdGlwLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX2EgPSB0aGlzLmluZm8sIG1heEZpdG5lc3MgPSBfYS5tYXhGaXRuZXNzLCBhdmVyYWdlRml0bmVzcyA9IF9hLmF2ZXJhZ2VGaXRuZXNzLCBnZW5lcmF0aW9uID0gX2EuZ2VuZXJhdGlvbjtcclxuICAgICAgICB0aGlzLm1heExhYmVsLmlubmVySFRNTCA9IG1heEZpdG5lc3MudG9TdHJpbmcoKTtcclxuICAgICAgICB0aGlzLmF2ZXJhZ2VMYWJlbC5pbm5lckhUTUwgPSBhdmVyYWdlRml0bmVzcy50b1N0cmluZygpO1xyXG4gICAgICAgIHRoaXMuZ2VuZXJhdGlvbkxhYmVsLmlubmVySFRNTCA9IGdlbmVyYXRpb24udG9TdHJpbmcoKTtcclxuICAgIH07XHJcbiAgICBQb3B1bGF0aW9uVG9vbHRpcC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKG5ld0luZm8pIHtcclxuICAgICAgICB0aGlzLmluZm8gPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgdGhpcy5pbmZvKSwgbmV3SW5mbyk7XHJcbiAgICAgICAgdGhpcy53cml0ZSgpO1xyXG4gICAgfTtcclxuICAgIFBvcHVsYXRpb25Ub29sdGlwLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgIG1heEZpdG5lc3M6IDAsXHJcbiAgICAgICAgICAgIGF2ZXJhZ2VGaXRuZXNzOiAwLFxyXG4gICAgICAgICAgICBnZW5lcmF0aW9uOiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFBvcHVsYXRpb25Ub29sdGlwO1xyXG59KHRvb2x0aXBfMVtcImRlZmF1bHRcIl0pKTtcclxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBQb3B1bGF0aW9uVG9vbHRpcDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XHJcbmV4cG9ydHMuVGFiR3JvdXAgPSB2b2lkIDA7XHJcbnZhciBUYWJHcm91cCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFRhYkdyb3VwKCkge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlVGFiID0gbnVsbDtcclxuICAgICAgICB0aGlzLmJ1dHRvbnMgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgdGhpcy50YWJzID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHRoaXMuYmluZGVkRWxlbWVudHMgPSBuZXcgTWFwKCk7XHJcbiAgICB9XHJcbiAgICBUYWJHcm91cC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgdmFyIHRhYiA9IHRoaXMudGFicy5nZXQobmFtZSk7XHJcbiAgICAgICAgaWYgKCF0YWIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvcjogY2Fubm90IGZpbmQgYSB0YWIgbmFtZWQgXFwnJyArIG5hbWUgKyAnXFwnJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZVRhYikge1xyXG4gICAgICAgICAgICB2YXIgdGFiQnV0dG9uID0gdGhpcy5idXR0b25zLmdldCh0aGlzLmFjdGl2ZVRhYi5uYW1lKTtcclxuICAgICAgICAgICAgdGFiQnV0dG9uID09PSBudWxsIHx8IHRhYkJ1dHRvbiA9PT0gdm9pZCAwID8gdm9pZCAwIDogdGFiQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB2YXIgZWxlbWVudHNfMyA9IHRoaXMuYmluZGVkRWxlbWVudHMuZ2V0KHRoaXMuYWN0aXZlVGFiLm5hbWUpIHx8IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIGVsZW1lbnRzXzEgPSBlbGVtZW50c18zOyBfaSA8IGVsZW1lbnRzXzEubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYmluZGVkRWxlbWVudCA9IGVsZW1lbnRzXzFbX2ldO1xyXG4gICAgICAgICAgICAgICAgYmluZGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbmV3QnV0dG9uID0gdGhpcy5idXR0b25zLmdldCh0YWIubmFtZSk7XHJcbiAgICAgICAgbmV3QnV0dG9uID09PSBudWxsIHx8IG5ld0J1dHRvbiA9PT0gdm9pZCAwID8gdm9pZCAwIDogbmV3QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlVGFiID0gdGFiO1xyXG4gICAgICAgIHZhciBlbGVtZW50cyA9IHRoaXMuYmluZGVkRWxlbWVudHMuZ2V0KG5hbWUpIHx8IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9hID0gMCwgZWxlbWVudHNfMiA9IGVsZW1lbnRzOyBfYSA8IGVsZW1lbnRzXzIubGVuZ3RoOyBfYSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBiaW5kZWRFbGVtZW50ID0gZWxlbWVudHNfMltfYV07XHJcbiAgICAgICAgICAgIGJpbmRlZEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRhYi5vcGVuKCk7XHJcbiAgICB9O1xyXG4gICAgVGFiR3JvdXAucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uIChidXR0b24sIHRhYikge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5idXR0b25zLnNldCh0YWIubmFtZSwgYnV0dG9uKTtcclxuICAgICAgICB0aGlzLnRhYnMuc2V0KHRhYi5uYW1lLCB0YWIpO1xyXG4gICAgICAgIGJ1dHRvbi5vbmNsaWNrID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gX3RoaXMub3Blbih0YWIubmFtZSk7IH07XHJcbiAgICB9O1xyXG4gICAgVGFiR3JvdXAucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgIHZhciBlbGVtZW50cyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMTsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnRzW19pIC0gMV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgdGFiID0gdGhpcy50YWJzLmdldChuYW1lKTtcclxuICAgICAgICBpZiAoIXRhYikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yOiBjYW5ub3QgZmluZCBhIHRhYiBuYW1lZCBcXCcnICsgbmFtZSArICdcXCcnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5iaW5kZWRFbGVtZW50cy5zZXQobmFtZSwgZWxlbWVudHMpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBUYWJHcm91cDtcclxufSgpKTtcclxuZXhwb3J0cy5UYWJHcm91cCA9IFRhYkdyb3VwO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcclxudmFyIFRvb2x0aXAgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBUb29sdGlwKGVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgfVxyXG4gICAgVG9vbHRpcC5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICB9O1xyXG4gICAgVG9vbHRpcC5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH07XHJcbiAgICByZXR1cm4gVG9vbHRpcDtcclxufSgpKTtcclxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBUb29sdGlwO1xyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfYTtcclxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcclxudmFyIGNvcmVfMSA9IHJlcXVpcmUoXCIuL2NvcmVcIik7XHJcbnZhciBjaXJjdWl0XzEgPSByZXF1aXJlKFwiLi9jaXJjdWl0XCIpO1xyXG52YXIgdWkgPSByZXF1aXJlKFwiLi91aVwiKTtcclxudmFyIHVpXzEgPSByZXF1aXJlKFwiLi91aVwiKTtcclxudmFyIGRiID0gcmVxdWlyZShcIi4vZGJcIik7XHJcbmZ1bmN0aW9uIGNyZWF0ZUNpcmN1aXQocG9pbnRzKSB7XHJcbiAgICB2YXIgd2FsbHMgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9pbnRzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdmFyIHAxID0gcG9pbnRzW2ldLCBwMiA9IHBvaW50c1soaSArIDEpICUgcG9pbnRzLmxlbmd0aF07XHJcbiAgICAgICAgd2FsbHMucHVzaCh7IHN0YXJ0OiBwMSwgZW5kOiBwMiB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgY2lyY3VpdF8xW1wiZGVmYXVsdFwiXSh3YWxscyk7XHJcbn1cclxuZnVuY3Rpb24gZ2V0RGVmYXVsdENpcmN1aXQoKSB7XHJcbiAgICB2YXIgd2FsbHMgPSBbXHJcbiAgICAgICAgeyBzdGFydDogbmV3IGNvcmVfMS5WZWMyKDgxLCAyNTcpLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMigyNDUsIDQxMCkgfSxcclxuICAgICAgICB7IHN0YXJ0OiBuZXcgY29yZV8xLlZlYzIoMjMxLCAxOTQpLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMigzNDAsIDI4MykgfSxcclxuICAgICAgICB7IHN0YXJ0OiBuZXcgY29yZV8xLlZlYzIoMzQyLCAyODMpLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMig0MjUsIDI1MikgfSxcclxuICAgICAgICB7IHN0YXJ0OiBuZXcgY29yZV8xLlZlYzIoNDI3LCAyNTIpLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMig0NTEsIDE2NikgfSxcclxuICAgICAgICB7IHN0YXJ0OiBuZXcgY29yZV8xLlZlYzIoMjQ1LCA0MDgpLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMigzMzYsIDQzMCkgfSxcclxuICAgICAgICB7IHN0YXJ0OiBuZXcgY29yZV8xLlZlYzIoMzM5LCA0MzApLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMig0NzgsIDM3OCkgfSxcclxuICAgICAgICB7IHN0YXJ0OiBuZXcgY29yZV8xLlZlYzIoNDc5LCAzNzgpLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMig1MjcsIDMyMykgfSxcclxuICAgICAgICB7IHN0YXJ0OiBuZXcgY29yZV8xLlZlYzIoNTI3LCAzMjMpLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMig1NTksIDIwMikgfSxcclxuICAgICAgICB7IHN0YXJ0OiBuZXcgY29yZV8xLlZlYzIoNTU5LCAyMDIpLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMig2MTgsIDE5MikgfSxcclxuICAgICAgICB7IHN0YXJ0OiBuZXcgY29yZV8xLlZlYzIoNDUyLCAxNjUpLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMig1MTUsIDExMykgfSxcclxuICAgICAgICB7IHN0YXJ0OiBuZXcgY29yZV8xLlZlYzIoNTQ5LCA5NiksIGVuZDogbmV3IGNvcmVfMS5WZWMyKDY5MSwgNjcpIH0sXHJcbiAgICAgICAgeyBzdGFydDogbmV3IGNvcmVfMS5WZWMyKDUxNiwgMTA5KSwgZW5kOiBuZXcgY29yZV8xLlZlYzIoNTQ2LCA5NSkgfSxcclxuICAgICAgICB7IHN0YXJ0OiBuZXcgY29yZV8xLlZlYzIoNjI0LCAxOTEpLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMig2OTksIDE2OSkgfSxcclxuICAgICAgICB7IHN0YXJ0OiBuZXcgY29yZV8xLlZlYzIoNjk5LCAxNzEpLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMig4MTgsIDI1MCkgfSxcclxuICAgICAgICB7IHN0YXJ0OiBuZXcgY29yZV8xLlZlYzIoNjkxLCA2MyksIGVuZDogbmV3IGNvcmVfMS5WZWMyKDc2MCwgNzMpIH0sXHJcbiAgICAgICAgeyBzdGFydDogbmV3IGNvcmVfMS5WZWMyKDc2MCwgNzYpLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMig4NzUsIDE0MSkgfSxcclxuICAgICAgICB7IHN0YXJ0OiBuZXcgY29yZV8xLlZlYzIoODIyLCAyNTMpLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMig4NDAsIDMwOCkgfSxcclxuICAgICAgICB7IHN0YXJ0OiBuZXcgY29yZV8xLlZlYzIoODQwLCAzMDgpLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMig4OTksIDQxMykgfSxcclxuICAgICAgICB7IHN0YXJ0OiBuZXcgY29yZV8xLlZlYzIoODk5LCA0MTQpLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMigxMDExLCA0NzgpIH0sXHJcbiAgICAgICAgeyBzdGFydDogbmV3IGNvcmVfMS5WZWMyKDg3NywgMTQyKSwgZW5kOiBuZXcgY29yZV8xLlZlYzIoOTMxLCAyMTApIH0sXHJcbiAgICAgICAgeyBzdGFydDogbmV3IGNvcmVfMS5WZWMyKDkzMSwgMjEwKSwgZW5kOiBuZXcgY29yZV8xLlZlYzIoOTY5LCAzMDgpIH0sXHJcbiAgICAgICAgeyBzdGFydDogbmV3IGNvcmVfMS5WZWMyKDk3MCwgMzExKSwgZW5kOiBuZXcgY29yZV8xLlZlYzIoMTAzNSwgMzYwKSB9LFxyXG4gICAgICAgIHsgc3RhcnQ6IG5ldyBjb3JlXzEuVmVjMigxMDM1LCAzNjApLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMigxMTc4LCAzMjYpIH0sXHJcbiAgICAgICAgeyBzdGFydDogbmV3IGNvcmVfMS5WZWMyKDEyMTcsIDQyNyksIGVuZDogbmV3IGNvcmVfMS5WZWMyKDEyMjcsIDMwOCkgfSxcclxuICAgICAgICB7IHN0YXJ0OiBuZXcgY29yZV8xLlZlYzIoMTAxMSwgNDc3KSwgZW5kOiBuZXcgY29yZV8xLlZlYzIoMTIxMSwgNDI2KSB9LFxyXG4gICAgICAgIHsgc3RhcnQ6IG5ldyBjb3JlXzEuVmVjMigxMTc3LCAzMjUpLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMigxMjI1LCAzMDkpIH0sXHJcbiAgICAgICAgeyBzdGFydDogbmV3IGNvcmVfMS5WZWMyKDc0LCAyNTUpLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMigyMzQsIDE5NCkgfVxyXG4gICAgXTtcclxuICAgIHZhciBjaXJjdWl0ID0gbmV3IGNpcmN1aXRfMVtcImRlZmF1bHRcIl0od2FsbHMpO1xyXG4gICAgY2lyY3VpdC5zcGF3blBvaW50ID0gbmV3IGNvcmVfMS5WZWMyKDIwMCwgMjUwKTtcclxuICAgIGNpcmN1aXQuZ29hbCA9IHtcclxuICAgICAgICBzdGFydDogbmV3IGNvcmVfMS5WZWMyKDExNTAsIDMyMCksXHJcbiAgICAgICAgZW5kOiBuZXcgY29yZV8xLlZlYzIoMTE1MCwgNDUwKVxyXG4gICAgfTtcclxuICAgIGNpcmN1aXQuY2hlY2twb2ludHMgPSBbXHJcbiAgICAgICAgeyBzdGFydDogbmV3IGNvcmVfMS5WZWMyKDQxOCwgMjUyKSwgZW5kOiBuZXcgY29yZV8xLlZlYzIoNTM2LCAzMjYpIH0sXHJcbiAgICAgICAgeyBzdGFydDogbmV3IGNvcmVfMS5WZWMyKDU0NCwgOTcpLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMig1NjAsIDIwNSkgfSxcclxuICAgICAgICB7IHN0YXJ0OiBuZXcgY29yZV8xLlZlYzIoNzU1LCA3MyksIGVuZDogbmV3IGNvcmVfMS5WZWMyKDY5NywgMTczKSB9LFxyXG4gICAgICAgIHsgc3RhcnQ6IG5ldyBjb3JlXzEuVmVjMig4MTMsIDI0OSksIGVuZDogbmV3IGNvcmVfMS5WZWMyKDkzMSwgMjA4KSB9LFxyXG4gICAgICAgIHsgc3RhcnQ6IG5ldyBjb3JlXzEuVmVjMig5NjcsIDMxNCksIGVuZDogbmV3IGNvcmVfMS5WZWMyKDg5MywgNDMyKSB9LFxyXG4gICAgICAgIHsgc3RhcnQ6IG5ldyBjb3JlXzEuVmVjMigxMDM3LCAzNTUpLCBlbmQ6IG5ldyBjb3JlXzEuVmVjMigxMDEyLCA0ODEpIH0sXHJcbiAgICBdO1xyXG4gICAgcmV0dXJuIGNpcmN1aXQ7XHJcbn1cclxudmFyIGNpcmN1aXQgPSAoX2EgPSBkYi5sb2FkKCkpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IGdldERlZmF1bHRDaXJjdWl0KCk7XHJcbmZ1bmN0aW9uIHVwZGF0ZShkdCkge1xyXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcclxuICAgIHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG4gICAgdWlfMS5wYW5lbHMucmVuZGVyKGNvbnRleHQsIGR0KTtcclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcclxufVxyXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdWkuaW5pdGlhbGl6ZShjaXJjdWl0KTtcclxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyk7XHJcbiAgICBjYW52YXMud2lkdGggPSBjYW52YXMucGFyZW50RWxlbWVudC5jbGllbnRXaWR0aDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXMucGFyZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XHJcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZSk7XHJcbn07XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==