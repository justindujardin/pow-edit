var pow2;
(function (pow2) {
    pow2.data = {
        maps: {},
        sprites: {},
        items: {},
        creatures: [],
        weapons: [],
        armor: []
    };

    function registerData(key, value) {
        pow2.data[key] = value;
    }
    pow2.registerData = registerData;

    function getData(key) {
        return pow2.data[key];
    }
    pow2.getData = getData;

    function registerMap(name, value) {
        pow2.data.maps[name] = value;
    }
    pow2.registerMap = registerMap;

    function describeSprites(value) {
        for (var prop in value) {
            if (value.hasOwnProperty(prop)) {
                pow2.data.sprites[prop] = _.extend(pow2.data.sprites[prop] || {}, value[prop]);
            }
        }
    }
    pow2.describeSprites = describeSprites;

    function registerSprites(name, value) {
        for (var prop in value) {
            if (value.hasOwnProperty(prop)) {
                pow2.data.sprites[prop] = _.defaults(pow2.data.sprites[prop] || {}, value[prop]);
            }
        }
    }
    pow2.registerSprites = registerSprites;

    function getSpriteMeta(name) {
        return pow2.data.sprites[name];
    }
    pow2.getSpriteMeta = getSpriteMeta;

    function registerCreatures(level, creatures) {
        _.each(creatures, function (c) {
            pow2.data.creatures.push(_.extend(c, { level: level }));
        });
    }
    pow2.registerCreatures = registerCreatures;
    function registerWeapons(level, weapons) {
        _.each(weapons, function (c) {
            var item = _.extend(c, {
                level: level,
                itemType: "weapon"
            });
            pow2.data.weapons.push(item);
        });
    }
    pow2.registerWeapons = registerWeapons;
    function registerArmor(level, items) {
        _.each(items, function (c) {
            pow2.data.armor.push(_.extend(c, {
                level: level,
                itemType: "armor"
            }));
        });
    }
    pow2.registerArmor = registerArmor;
    function getMap(name) {
        return pow2.data.maps[name];
    }
    pow2.getMap = getMap;
    function getMaps() {
        return pow2.data.maps;
    }
    pow2.getMaps = getMaps;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var Events = (function () {
        function Events() {
        }
        Events.prototype.on = function (eventName, callback, context) {
        };
        Events.prototype.off = function (eventName, callback, context) {
        };
        Events.prototype.trigger = function (eventName) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
        };
        Events.prototype.bind = function (eventName, callback, context) {
        };
        Events.prototype.unbind = function (eventName, callback, context) {
        };
        Events.prototype.once = function (events, callback, context) {
        };
        Events.prototype.listenTo = function (object, events, callback) {
        };
        Events.prototype.listenToOnce = function (object, events, callback) {
        };
        Events.prototype.stopListening = function (object, events, callback) {
        };
        return Events;
    })();
    pow2.Events = Events;
    _.extend(Events.prototype, Backbone.Events);
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var Animator = (function () {
        function Animator() {
            this.interpFrame = 0;
            this.animElapsed = 0;
            this.animDuration = 0;
            this.frames = [0];
            this.sourceMeta = null;
            this.sourceAnims = null;
        }
        Animator.prototype.setAnimationSource = function (spriteName) {
            console.log("Sprite is " + spriteName);
            this.sourceMeta = pow2.getSpriteMeta(spriteName);
            this.sourceAnims = this.sourceMeta.animations;
            this.setAnimation('down');
        };

        Animator.prototype.setAnimation = function (name) {
            if (!this.sourceAnims) {
                throw new Error("Invalid source animations");
            }
            var data = this.sourceAnims[name];
            if (!data) {
                throw new Error("Invalid animation name - " + name);
            }
            this.frames = data.frames;
            this.animDuration = data.duration;
        };

        Animator.prototype.updateTime = function (elapsedMs) {
            this.animElapsed += elapsedMs;
            var factor = this.animElapsed / this.animDuration;
            var index = Math.round(this.interpolate(0, this.frames.length - 1, factor));
            this.interpFrame = this.frames[index];
            if (this.animElapsed > this.animDuration) {
                this.animElapsed = 0;
            }
        };

        Animator.prototype.interpolate = function (from, to, factor) {
            factor = Math.min(Math.max(factor, 0), 1);
            return (from * (1.0 - factor)) + (to * factor);
        };

        Animator.prototype.getFrame = function () {
            return this.interpFrame;
        };
        return Animator;
    })();
    pow2.Animator = Animator;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var Point = (function () {
        function Point(pointOrX, y) {
            if (pointOrX instanceof Point) {
                this.set(pointOrX.x, pointOrX.y);
            } else if (typeof pointOrX === 'string' && typeof y === 'string') {
                this.set(parseFloat(pointOrX), parseFloat(y));
            } else if (typeof pointOrX == 'number' && typeof y === 'number') {
                this.set(pointOrX, y);
            } else {
                this.zero();
            }
        }
        Point.prototype.toString = function () {
            return "" + this.x + "," + this.y;
        };

        Point.prototype.set = function (pointOrX, y) {
            if (pointOrX instanceof Point) {
                this.x = pointOrX.x;
                this.y = pointOrX.y;
            } else {
                this.x = typeof pointOrX !== 'undefined' ? pointOrX : 0;
                this.y = typeof y !== 'undefined' ? y : 0;
            }
            return this;
        };

        Point.prototype.clone = function () {
            return new Point(this.x, this.y);
        };

        Point.prototype.copy = function (from) {
            this.x = from.x;
            this.y = from.y;
            return this;
        };

        Point.prototype.truncate = function () {
            this.x = Math.floor(this.x);
            this.y = Math.floor(this.y);
            return this;
        };

        Point.prototype.round = function () {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
            return this;
        };

        Point.prototype.add = function (pointOrXOrValue, y) {
            if (pointOrXOrValue instanceof Point) {
                this.x += pointOrXOrValue.x;
                this.y += pointOrXOrValue.y;
            } else if (pointOrXOrValue && typeof y === 'undefined') {
                this.x += pointOrXOrValue;
                this.y += pointOrXOrValue;
            } else {
                this.x += pointOrXOrValue;
                this.y += y;
            }
            return this;
        };
        Point.prototype.subtract = function (point) {
            this.x -= point.x;
            this.y -= point.y;
            return this;
        };

        Point.prototype.multiply = function (pointOrXOrValue, y) {
            if (pointOrXOrValue instanceof Point) {
                this.x *= pointOrXOrValue.x;
                this.y *= pointOrXOrValue.y;
            } else if (pointOrXOrValue && typeof y === 'undefined') {
                this.x *= pointOrXOrValue;
                this.y *= pointOrXOrValue;
            } else {
                this.x *= pointOrXOrValue;
                this.y *= y;
            }
            return this;
        };

        Point.prototype.divide = function (pointOrXOrValue, y) {
            if (pointOrXOrValue instanceof Point) {
                if (pointOrXOrValue.x === 0 || pointOrXOrValue.y === 0) {
                    throw new Error("Divide by zero");
                }
                this.x /= pointOrXOrValue.x;
                this.y /= pointOrXOrValue.y;
            } else if (pointOrXOrValue && typeof y === 'undefined') {
                if (pointOrXOrValue === 0) {
                    throw new Error("Divide by zero");
                }
                this.x /= pointOrXOrValue;
                this.y /= pointOrXOrValue;
            } else {
                if (pointOrXOrValue === 0 || y === 0) {
                    throw new Error("Divide by zero");
                }
                this.x /= pointOrXOrValue;
                this.y /= y;
            }
            return this;
        };

        Point.prototype.inverse = function () {
            this.x *= -1;
            this.y *= -1;
            return this;
        };
        Point.prototype.equal = function (point) {
            return this.x === point.x && this.y === point.y;
        };

        Point.prototype.isZero = function () {
            return this.x === 0 && this.y === 0;
        };
        Point.prototype.zero = function () {
            this.x = this.y = 0;
            return this;
        };

        Point.prototype.interpolate = function (from, to, factor) {
            factor = Math.min(Math.max(factor, 0), 1);
            this.x = (from.x * (1.0 - factor)) + (to.x * factor);
            this.y = (from.y * (1.0 - factor)) + (to.y * factor);
            return this;
        };

        Point.prototype.magnitude = function () {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        };

        Point.prototype.magnitudeSquared = function () {
            return this.x * this.x + this.y * this.y;
        };

        Point.prototype.normalize = function () {
            var m = this.magnitude();
            if (m > 0) {
                this.x /= m;
                this.y /= m;
            }
            return this;
        };
        return Point;
    })();
    pow2.Point = Point;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var Rect = (function () {
        function Rect(rectOrPointOrX, extentOrY, width, height) {
            if (rectOrPointOrX instanceof Rect) {
                this.point = new pow2.Point(rectOrPointOrX.point);
                this.extent = new pow2.Point(rectOrPointOrX.extent);
            } else if (width && height) {
                this.point = new pow2.Point(rectOrPointOrX, extentOrY);
                this.extent = new pow2.Point(width, height);
            } else if (rectOrPointOrX instanceof pow2.Point && extentOrY instanceof pow2.Point) {
                this.point = new pow2.Point(rectOrPointOrX);
                this.extent = new pow2.Point(extentOrY);
            } else {
                this.point = new pow2.Point(0, 0);
                this.extent = new pow2.Point(1, 1);
            }
            return this;
        }
        Rect.prototype.toString = function () {
            return "p(" + this.point.toString() + ") extent(" + this.extent.toString() + ")";
        };

        Rect.prototype.set = function (rectOrPointOrX, extentOrY, width, height) {
            if (rectOrPointOrX instanceof Rect) {
                this.point.set(rectOrPointOrX.point);
                this.extent.set(rectOrPointOrX.extent);
            } else if (width && height) {
                this.point.set(rectOrPointOrX, extentOrY);
                this.extent.set(width, height);
            } else if (rectOrPointOrX instanceof pow2.Point && extentOrY instanceof pow2.Point) {
                this.point.set(rectOrPointOrX);
                this.extent.set(extentOrY);
            } else {
                throw new Error("Unsupported arguments to Rect.set");
            }
            return this;
        };

        Rect.prototype.clone = function () {
            return new Rect(this.point.clone(), this.extent.clone());
        };

        Rect.prototype.clamp = function (rect) {
            if (this.point.x < rect.point.x) {
                this.point.x += rect.point.x - this.point.x;
            }
            if (this.point.y < rect.point.y) {
                this.point.y += rect.point.y - this.point.y;
            }
            if (this.point.x + this.extent.x > rect.point.x + rect.extent.x) {
                this.point.x -= ((this.point.x + this.extent.x) - (rect.point.x + rect.extent.x));
            }
            if (this.point.y + this.extent.y > rect.point.y + rect.extent.y) {
                this.point.y -= ((this.point.y + this.extent.y) - (rect.point.y + rect.extent.y));
            }

            return this;
        };

        Rect.prototype.clip = function (clipRect) {
            var right = this.point.x + this.extent.x;
            var bottom = this.point.y + this.extent.y;
            this.point.x = Math.max(clipRect.point.x, this.point.x);
            this.extent.x = Math.min(clipRect.point.x + clipRect.extent.x, right) - this.point.x;
            this.point.y = Math.max(clipRect.point.y, this.point.y);
            this.extent.x = Math.min(clipRect.point.y + clipRect.extent.y, bottom) - this.point.y;
            return this;
        };
        Rect.prototype.isValid = function () {
            return this.extent.x > 0 && this.extent.y > 0;
        };
        Rect.prototype.intersect = function (clipRect) {
            return !(clipRect.point.x > this.point.x + this.extent.x || clipRect.point.x + clipRect.extent.x < this.point.x || clipRect.point.y > this.point.y + this.extent.y || clipRect.point.y + clipRect.extent.y < this.point.y);
        };

        Rect.prototype.pointInRect = function (pointOrX, y) {
            var x = 0;
            if (pointOrX instanceof pow2.Point) {
                x = pointOrX.x;
                y = pointOrX.y;
            } else {
                x = pointOrX;
            }
            if (x >= this.point.x + this.extent.x || y >= this.point.y + this.extent.y) {
                return false;
            }
            return !(x < this.point.x || y < this.point.y);
        };

        Rect.prototype.getCenter = function () {
            var x = parseFloat((this.point.x + this.extent.x * 0.5).toFixed(2));
            var y = parseFloat((this.point.y + this.extent.y * 0.5).toFixed(2));
            return new pow2.Point(x, y);
        };

        Rect.prototype.setCenter = function (pointOrX, y) {
            var x;
            if (pointOrX instanceof pow2.Point) {
                x = pointOrX.x;
                y = pointOrX.y;
            } else {
                x = pointOrX;
            }
            this.point.x = parseFloat((x - this.extent.x * 0.5).toFixed(2));
            this.point.y = parseFloat((y - this.extent.y * 0.5).toFixed(2));
            return this;
        };

        Rect.prototype.scale = function (value) {
            this.point.multiply(value);
            this.extent.multiply(value);
            return this;
        };

        Rect.prototype.round = function () {
            this.point.round();
            this.extent.set(Math.ceil(this.extent.x), Math.ceil(this.extent.y));
            return this;
        };

        Rect.prototype.getLeft = function () {
            return this.point.x;
        };
        Rect.prototype.getTop = function () {
            return this.point.y;
        };
        Rect.prototype.getRight = function () {
            return this.point.x + this.extent.x;
        };
        Rect.prototype.getBottom = function () {
            return this.point.y + this.extent.y;
        };
        Rect.prototype.getHalfSize = function () {
            return new pow2.Point(this.extent.x / 2, this.extent.y / 2);
        };

        Rect.prototype.addPoint = function (value) {
            if (value.x < this.point.x) {
                this.extent.x = this.extent.x - (value.x - this.point.x);
                this.point.x = value.x;
            }
            if (value.y < this.point.y) {
                this.extent.y = this.extent.y - (value.x - this.point.y);
                this.point.y = value.y;
            }
            if (value.x > this.point.x + this.extent.x) {
                this.extent.x = value.x - this.point.x;
            }
            if (value.y > this.point.y + this.extent.y) {
                this.extent.y = value.y - this.point.y;
            }
        };

        Rect.prototype.inflate = function (x, y) {
            if (typeof x === "undefined") { x = 1; }
            if (typeof y === "undefined") { y = 1; }
            this.point.x -= x;
            this.extent.x += 2 * x;
            this.point.y -= y;
            this.extent.y += 2 * y;
            return this;
        };
        return Rect;
    })();
    pow2.Rect = Rect;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var Time = (function () {
        function Time(options) {
            this.autoStart = false;
            this.tickRateMS = 32;
            this.mspf = 0;
            this.world = null;
            this.lastTime = 0;
            this.time = 0;
            this.running = false;
            this.objects = [];
            _.extend(this, options || {});
            this.polyFillAnimationFrames();
            if (this.autoStart) {
                this.start();
            }
        }
        Time.prototype.start = function () {
            var _this = this;
            if (this.running) {
                return;
            }
            this.running = true;
            var _frameCallback = function (time) {
                _this.time = Math.floor(time);
                var now = new Date().getMilliseconds();
                var elapsed = Math.floor(time - _this.lastTime);
                if (elapsed >= _this.tickRateMS) {
                    _this.lastTime = time;
                    _this.tickObjects(elapsed);
                }
                _this.processFrame(elapsed);
                _this.mspf = new Date().getMilliseconds() - now;
                window.requestAnimationFrame(_frameCallback);
            };
            _frameCallback(0);
        };

        Time.prototype.stop = function () {
            this.running = false;
        };

        Time.prototype.removeObject = function (object) {
            this.objects = _.filter(this.objects, function (o) {
                return o.id != object.id;
            });
        };

        Time.prototype.addObject = function (object) {
            if (_.where(this.objects, { id: object.id }).length > 0) {
                return;
            }
            this.objects.push(object);
        };

        Time.prototype.tickObjects = function (elapsedMS) {
            _.each(this.objects, function (o) {
                return o.tick && o.tick(elapsedMS);
            });
        };
        Time.prototype.processFrame = function (elapsedMS) {
            _.each(this.objects, function (o) {
                return o.processFrame && o.processFrame(elapsedMS);
            });
        };

        Time.prototype.polyFillAnimationFrames = function () {
            var lastTime = 0;
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            for (var i = 0; i < vendors.length; i++) {
                if (window.requestAnimationFrame) {
                    return;
                }
                window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
            }
            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = function (callback) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var tickListener = function () {
                        callback(currTime + timeToCall);
                    };
                    var id = window.setTimeout(tickListener, timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
            }
        };
        return Time;
    })();
    pow2.Time = Time;
})(pow2 || (pow2 = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var pow2;
(function (pow2) {
    var Resource = (function (_super) {
        __extends(Resource, _super);
        function Resource(url, data) {
            if (typeof data === "undefined") { data = null; }
            _super.call(this);
            this.loader = null;
            this._ready = false;
            this.url = url;
            this.data = data;
        }
        Resource.prototype.load = function () {
            console.log("Loading: " + this.url);
        };

        Resource.prototype.setLoader = function (loader) {
            this.loader = loader;
        };

        Resource.prototype.isReady = function () {
            return this.data !== null && this._ready === true;
        };

        Resource.prototype.ready = function () {
            this._ready = true;
            this.trigger('ready', this);
        };
        Resource.prototype.failed = function (error) {
            this._ready = false;
            console.log("ERROR loading resource: " + this.url + "\n   -> " + error);
            this.trigger('failed', this);
        };
        return Resource;
    })(Backbone.Model);
    pow2.Resource = Resource;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var AudioResource = (function (_super) {
        __extends(AudioResource, _super);
        function AudioResource() {
            _super.apply(this, arguments);
        }
        AudioResource.prototype.load = function () {
            var _this = this;
            var sources = _.keys(AudioResource.types).length;
            var invalid = [];
            var incrementFailure = function (path) {
                sources--;
                invalid.push(path);
                if (sources <= 0) {
                    _this.failed("No valid sources at the following URLs\n   " + invalid.join('\n   '));
                }
            };

            var reference = document.createElement('audio');

            _.each(AudioResource.types, function (mime, extension) {
                if (!reference.canPlayType(mime + ";")) {
                    return;
                }
                var source = document.createElement('source');
                source.type = mime;
                source.src = _this.url + '.' + extension;
                source.addEventListener('error', function (e) {
                    incrementFailure(source.src);
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return false;
                });
                reference.appendChild(source);
            });
            reference.addEventListener('canplaythrough', function () {
                _this.data = reference;
                _this.ready();
            });
        };
        AudioResource.types = {
            'mp3': 'audio/mpeg',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav'
        };
        return AudioResource;
    })(pow2.Resource);
    pow2.AudioResource = AudioResource;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var ImageResource = (function (_super) {
        __extends(ImageResource, _super);
        function ImageResource() {
            _super.apply(this, arguments);
        }
        ImageResource.prototype.load = function () {
            var _this = this;
            var reference = document.createElement('img');
            reference.onload = function () {
                _this.data = reference;
                _this.ready();
            };
            reference.onerror = function (err) {
                _this.failed(err);
            };
            reference.src = this.url;
        };
        return ImageResource;
    })(pow2.Resource);
    pow2.ImageResource = ImageResource;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var JSONResource = (function (_super) {
        __extends(JSONResource, _super);
        function JSONResource() {
            _super.apply(this, arguments);
        }
        JSONResource.prototype.load = function () {
            var _this = this;
            var request = $.getJSON(this.url);
            request.done(function (object) {
                _this.data = object;
                _this.ready();
            });
            request.fail(function (jqxhr, settings, exception) {
                _this.failed(exception);
            });
        };
        return JSONResource;
    })(pow2.Resource);
    pow2.JSONResource = JSONResource;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var ScriptResource = (function (_super) {
        __extends(ScriptResource, _super);
        function ScriptResource() {
            _super.apply(this, arguments);
        }
        ScriptResource.prototype.load = function () {
            var _this = this;
            var request = $.getScript(this.url);
            request.done(function (script) {
                _this.data = script;
                _this.ready();
            });
            request.fail(function (jqxhr, settings, exception) {
                _this.failed(exception);
            });
        };
        return ScriptResource;
    })(pow2.Resource);
    pow2.ScriptResource = ScriptResource;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var XMLResource = (function (_super) {
        __extends(XMLResource, _super);
        function XMLResource() {
            _super.apply(this, arguments);
        }
        XMLResource.prototype.load = function () {
            var _this = this;
            var request = $.get(this.url);
            request.done(function (object) {
                _this.data = $(object);
                _this.prepare(_this.data);
            });
            request.fail(function (jqxhr, settings, exception) {
                _this.failed(exception);
            });
        };

        XMLResource.prototype.prepare = function (data) {
            this.ready();
        };

        XMLResource.prototype.getElTag = function (el) {
            if (el) {
                var name = el.prop('tagName');
                if (name) {
                    return name.toLowerCase();
                }
            }
            return null;
        };

        XMLResource.prototype.getRootNode = function (tag) {
            if (!this.data) {
                return null;
            }
            return $(_.find(this.data, function (d) {
                return d.tagName && d.tagName.toLowerCase() === tag;
            }));
        };

        XMLResource.prototype.getChildren = function (el, tag) {
            var list = el.find(tag);
            return _.compact(_.map(list, function (c) {
                var child = $(c);
                return child.parent()[0] !== el[0] ? null : child;
            }));
        };

        XMLResource.prototype.getChild = function (el, tag) {
            return this.getChildren(el, tag)[0];
        };

        XMLResource.prototype.getElAttribute = function (el, name) {
            if (el) {
                var attr = el.attr(name);
                if (attr) {
                    return attr;
                }
            }
            return null;
        };
        return XMLResource;
    })(pow2.Resource);
    pow2.XMLResource = XMLResource;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    (function (tiled) {
        

        

        

        function readITiledBase(el) {
            return {
                name: getElAttribute(el, 'name'),
                x: parseInt(getElAttribute(el, 'x') || "0"),
                y: parseInt(getElAttribute(el, 'y') || "0"),
                width: parseInt(getElAttribute(el, 'width') || "0"),
                height: parseInt(getElAttribute(el, 'height') || "0"),
                visible: parseInt(getElAttribute(el, 'visible') || "1") === 1
            };
        }
        tiled.readITiledBase = readITiledBase;

        function readITiledLayerBase(el) {
            var result = readITiledBase(el);

            result.opacity = parseInt(getElAttribute(el, 'opacity') || "1");

            var props = readTiledProperties(el);
            if (props) {
                result.properties = props;
            }
            return result;
        }
        tiled.readITiledLayerBase = readITiledLayerBase;

        function readTiledProperties(el) {
            var propsObject = getChild(el, 'properties');
            if (propsObject && propsObject.length > 0) {
                var properties = {};
                var props = getChildren(propsObject, 'property');
                _.each(props, function (p) {
                    var key = getElAttribute(p, 'name');
                    var value = getElAttribute(p, 'value');

                    if (typeof value === 'string') {
                        var checkValue = value.toLowerCase();
                        if (checkValue === 'true' || checkValue === 'false') {
                            value = checkValue === 'true';
                        } else if (!isNaN((checkValue = parseFloat(value)))) {
                            value = checkValue;
                        }
                    }
                    properties[key] = value;
                });
                return properties;
            }
            return null;
        }
        tiled.readTiledProperties = readTiledProperties;

        function getChildren(el, tag) {
            var list = el.find(tag);
            return _.compact(_.map(list, function (c) {
                var child = $(c);
                return child.parent()[0] !== el[0] ? null : child;
            }));
        }
        tiled.getChildren = getChildren;

        function getChild(el, tag) {
            return getChildren(el, tag)[0];
        }
        tiled.getChild = getChild;

        function getElAttribute(el, name) {
            if (el) {
                var attr = el.attr(name);
                if (attr) {
                    return attr;
                }
            }
            return null;
        }
        tiled.getElAttribute = getElAttribute;
    })(pow2.tiled || (pow2.tiled = {}));
    var tiled = pow2.tiled;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var TilesetTile = (function () {
        function TilesetTile(id) {
            this.properties = {};
            this.id = id;
        }
        return TilesetTile;
    })();
    pow2.TilesetTile = TilesetTile;

    var TiledTSXResource = (function (_super) {
        __extends(TiledTSXResource, _super);
        function TiledTSXResource() {
            _super.apply(this, arguments);
            this.name = null;
            this.tilewidth = 16;
            this.tileheight = 16;
            this.imageWidth = 0;
            this.imageHeight = 0;
            this.image = null;
            this.firstgid = -1;
            this.tiles = [];
        }
        TiledTSXResource.prototype.prepare = function (data) {
            var _this = this;
            var tileSet = this.getRootNode('tileset');
            this.name = this.getElAttribute(tileSet, 'name');
            this.tilewidth = parseInt(this.getElAttribute(tileSet, 'tilewidth'));
            this.tileheight = parseInt(this.getElAttribute(tileSet, 'tileheight'));

            var tiles = this.getChildren(tileSet, 'tile');
            _.each(tiles, function (ts) {
                var id = parseInt(_this.getElAttribute(ts, 'id'));
                var tile = new TilesetTile(id);
                tile.properties = pow2.tiled.readTiledProperties(ts);
                _this.tiles.push(tile);
            });

            var image = this.getChild(tileSet, 'img');
            if (image && image.length > 0) {
                var source = this.getElAttribute(image, 'source');
                this.imageWidth = parseInt(this.getElAttribute(image, 'width') || "0");
                this.imageHeight = parseInt(this.getElAttribute(image, 'height') || "0");
                console.log("Tileset source: " + source);
                this.loader.load('/maps/' + source, function (res) {
                    _this.image = res;
                    if (!res.isReady()) {
                        throw new Error("Failed to load required TileMap image: " + source);
                    }

                    _this.imageWidth = _this.image.data.width;
                    _this.imageHeight = _this.image.data.height;

                    var xUnits = _this.imageWidth / _this.tilewidth;
                    var yUnits = _this.imageHeight / _this.tileheight;
                    var tileCount = xUnits * yUnits;
                    var tileLookup = new Array(tileCount);
                    for (var i = 0; i < tileCount; i++) {
                        tileLookup[i] = false;
                    }
                    _.each(_this.tiles, function (tile) {
                        tileLookup[tile.id] = tile.properties;
                    });

                    _this.tiles = tileLookup;

                    _this.ready();
                });
            } else {
                this.ready();
            }
        };

        TiledTSXResource.prototype.hasGid = function (gid) {
            return this.firstgid !== -1 && gid >= this.firstgid && gid < this.firstgid + this.tiles.length;
        };

        TiledTSXResource.prototype.getTileMeta = function (gidOrIndex) {
            var index = this.firstgid !== -1 ? (gidOrIndex - (this.firstgid)) : gidOrIndex;
            var tilesX = this.imageWidth / this.tilewidth;
            var x = index % tilesX;
            var y = Math.floor((index - x) / tilesX);
            return _.extend(this.tiles[index] || {}, {
                image: this.image,
                x: x * this.tilewidth,
                y: y * this.tileheight,
                width: this.tilewidth,
                height: this.tileheight
            });
        };
        return TiledTSXResource;
    })(pow2.XMLResource);
    pow2.TiledTSXResource = TiledTSXResource;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var TiledTMXResource = (function (_super) {
        __extends(TiledTMXResource, _super);
        function TiledTMXResource() {
            _super.apply(this, arguments);
            this.width = 0;
            this.height = 0;
            this.orientation = "orthogonal";
            this.tileheight = 16;
            this.tilewidth = 16;
            this.version = 1;
            this.properties = {};
            this.tilesets = {};
            this.layers = [];
            this.objectGroups = [];
        }
        TiledTMXResource.prototype.prepare = function (data) {
            var _this = this;
            this.$map = this.getRootNode('map');
            this.version = parseInt(this.getElAttribute(this.$map, 'version'));
            this.width = parseInt(this.getElAttribute(this.$map, 'width'));
            this.height = parseInt(this.getElAttribute(this.$map, 'height'));
            this.orientation = this.getElAttribute(this.$map, 'orientation');
            this.tileheight = parseInt(this.getElAttribute(this.$map, 'tileheight'));
            this.tilewidth = parseInt(this.getElAttribute(this.$map, 'tilewidth'));
            this.properties = pow2.tiled.readTiledProperties(this.$map);
            var tileSetDeps = [];
            var tileSets = this.getChildren(this.$map, 'tileset');
            _.each(tileSets, function (ts) {
                var source = _this.getElAttribute(ts, 'source');
                if (source) {
                    tileSetDeps.push({
                        source: '/maps/' + source,
                        firstgid: parseInt(_this.getElAttribute(ts, 'firstgid') || "-1")
                    });
                }
            });

            var layers = this.getChildren(this.$map, 'layer');
            _.each(layers, function (layer) {
                var tileLayer = pow2.tiled.readITiledLayerBase(layer);
                _this.layers.push(tileLayer);

                var data = _this.getChild(layer, 'data');
                if (data) {
                    var encoding = _this.getElAttribute(data, 'encoding');
                    if (!encoding || encoding.toLowerCase() !== 'csv') {
                        throw new Error("Pow2 only supports CSV maps.  Edit the Map Properties (for:" + _this.url + ") in Tiled to use the CSV option when saving.");
                    }
                    tileLayer.data = JSON.parse('[' + $.trim(data.text()) + ']');
                }
            });

            var objectGroups = this.getChildren(this.$map, 'objectgroup');
            _.each(objectGroups, function ($group) {
                var objectGroup = pow2.tiled.readITiledLayerBase($group);
                objectGroup.objects = [];
                var color = _this.getElAttribute($group, 'color');
                if (color) {
                    objectGroup.color = color;
                }

                var objects = _this.getChildren($group, 'object');
                _.each(objects, function (object) {
                    objectGroup.objects.push(pow2.tiled.readITiledLayerBase(object));
                });
                _this.objectGroups.push(objectGroup);
            });

            var _next = function () {
                if (tileSetDeps.length <= 0) {
                    return _this.ready();
                }
                var dep = tileSetDeps.shift();
                return _this.loader.load(dep.source, function (tsr) {
                    _this.tilesets[tsr.name] = tsr;
                    tsr.firstgid = dep.firstgid;
                    _next();
                });
            };
            _next();
        };
        return TiledTMXResource;
    })(pow2.XMLResource);
    pow2.TiledTMXResource = TiledTMXResource;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var ResourceLoader = (function () {
        function ResourceLoader() {
            this._cache = {};
            this._types = {
                'png': pow2.ImageResource,
                'js': pow2.ScriptResource,
                'json': pow2.JSONResource,
                'xml': pow2.XMLResource,
                'tmx': pow2.TiledTMXResource,
                'tsx': pow2.TiledTSXResource,
                '': pow2.AudioResource
            };
            this._doneQueue = [];
            this.world = null;
            this.id = _.uniqueId();
        }
        ResourceLoader.prototype.onAddToWorld = function (world) {
            world.time.addObject(this);
        };
        ResourceLoader.prototype.onRemoveFromWorld = function (world) {
            world.time.removeObject(this);
        };

        ResourceLoader.prototype.tick = function (elapsed) {
        };
        ResourceLoader.prototype.processFrame = function (elapsed) {
            var doneQueue = this._doneQueue;
            this._doneQueue = [];
            _.each(doneQueue, function (done) {
                done.cb(done.result);
            });
        };

        ResourceLoader.prototype.ensureType = function (extension, type) {
            this._types[extension] = type;
        };

        ResourceLoader.prototype.getResourceExtension = function (url) {
            var index = url.lastIndexOf('.');
            if (index === -1) {
                return '';
            }
            return url.substr(index + 1);
        };

        ResourceLoader.prototype.create = function (typeConstructor, data) {
            var type = new typeConstructor(null, data);
            type.setLoader(this);
            return type;
        };

        ResourceLoader.prototype.load = function (sources, done) {
            var results = [];
            var loadQueue = 0;
            if (!_.isArray(sources)) {
                sources = [sources];
            }
            function _checkDone() {
                if (done && loadQueue === 0) {
                    var result = results.length > 1 ? results : results[0];
                    done(result);
                }
            }
            for (var i = 0; i < sources.length; i++) {
                var src = sources[i];
                var extension = this.getResourceExtension(src);
                var resourceType = this._types[extension];
                if (!resourceType) {
                    console.error("Unknown resource type: " + src);
                    return;
                }
                var resource = this._cache[src];
                if (!resource) {
                    resource = this._cache[src] = new resourceType(src, this);
                    resource.setLoader(this);
                } else if (resource.isReady()) {
                    results.push(resource);
                    continue;
                }
                resource.extension = extension;
                loadQueue++;

                resource.once('ready', function (resource) {
                    console.log("Loaded asset: " + resource.url);
                    loadQueue--;
                    _checkDone();
                });
                resource.once('failed', function (resource) {
                    console.log("Failed to load asset: " + resource.url);
                    loadQueue--;
                    _checkDone();
                });
                resource.load();
                results.push(resource);
            }
            var obj = results.length > 1 ? results : results[0];
            if (loadQueue === 0) {
                if (this.world && done) {
                    this._doneQueue.push({ cb: done, result: obj });
                } else if (done) {
                    _.defer(function () {
                        done(obj);
                    });
                }
            }
            return obj;
        };
        return ResourceLoader;
    })();
    pow2.ResourceLoader = ResourceLoader;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var SpriteRender = (function () {
        function SpriteRender() {
            this.canvas = null;
            this.context = null;
            this.world = null;
            this.canvas = document.createElement('canvas');
            this.sizeCanvas(SpriteRender.SIZE, SpriteRender.SIZE);
        }
        SpriteRender.prototype.onAddToWorld = function (world) {
        };
        SpriteRender.prototype.onRemoveFromWorld = function (world) {
        };

        SpriteRender.prototype.sizeCanvas = function (width, height) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.context = this.canvas.getContext('2d');
            this.context.webkitImageSmoothingEnabled = false;
            this.context.mozImageSmoothingEnabled = false;
        };

        SpriteRender.prototype.getSpriteSheet = function (name, done) {
            if (typeof done === "undefined") { done = function () {
            }; }
            if (this.world) {
                return this.world.loader.load("/images/" + name + ".png", done);
            }
            return null;
        };

        SpriteRender.prototype.getSingleSprite = function (spriteName, frame, done) {
            var _this = this;
            if (typeof frame === "undefined") { frame = 0; }
            if (typeof done === "undefined") { done = function (result) {
            }; }
            var coords = pow2.data.sprites[spriteName];
            if (!coords) {
                throw new Error("Unable to find sprite by name: " + spriteName);
            }
            return this.getSpriteSheet(coords.source, function (image) {
                var cell = _this.getSpriteRect(spriteName, frame);

                _this.sizeCanvas(cell.extent.x, cell.extent.y);
                _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
                _this.context.drawImage(image.data, cell.point.x, cell.point.y, cell.extent.x, cell.extent.y, 0, 0, _this.canvas.width, _this.canvas.height);
                var src = _this.canvas.toDataURL();
                var result = new Image();
                result.src = src;
                result.onload = function () {
                    done && done(result);
                };
                result.onerror = function (err) {
                    done && done(err);
                };
            });
        };

        SpriteRender.prototype.getSpriteRect = function (name, frame) {
            if (typeof frame === "undefined") { frame = 0; }
            var c = this.getSpriteMeta(name);
            var cx = c.x;
            var cy = c.y;
            if (c.frames > 1) {
                var sourceWidth = SpriteRender.SIZE;
                var sourceHeight = SpriteRender.SIZE;
                if (c && typeof c.cellWidth !== 'undefined' && typeof c.cellHeight !== 'undefined') {
                    sourceWidth = c.cellWidth;
                    sourceHeight = c.cellHeight;
                }
                var cwidth = c.width / sourceWidth;
                var fx = (frame % (cwidth));
                var fy = Math.floor((frame - fx) / cwidth);
                cx += fx * sourceWidth;
                cy += fy * sourceHeight;
            } else {
                sourceWidth = c.width;
                sourceHeight = c.height;
            }
            return new pow2.Rect(cx, cy, sourceWidth, sourceHeight);
        };

        SpriteRender.prototype.getSpriteMeta = function (name) {
            var desc = pow2.data.sprites[name];
            if (!desc) {
                throw new Error("Missing sprite data for: " + name);
            }
            return desc;
        };
        SpriteRender.SIZE = 16;
        return SpriteRender;
    })();
    pow2.SpriteRender = SpriteRender;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    

    var State = (function () {
        function State() {
            this.transitions = [];
        }
        State.prototype.enter = function (machine) {
        };
        State.prototype.exit = function (machine) {
        };
        State.prototype.update = function (machine) {
            _.any(this.transitions, function (t) {
                return t.evaluate(machine) && machine.setCurrentState(t.targetState);
            });
        };
        return State;
    })();
    pow2.State = State;

    var StateTransition = (function () {
        function StateTransition() {
        }
        StateTransition.prototype.evaluate = function (machine) {
            return !machine.paused;
        };
        return StateTransition;
    })();
    pow2.StateTransition = StateTransition;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    

    var StateMachine = (function (_super) {
        __extends(StateMachine, _super);
        function StateMachine() {
            _super.apply(this, arguments);
            this.defaultState = null;
            this.states = [];
            this._currentState = null;
            this._previousState = null;
            this._newState = false;
            this.paused = false;
        }
        StateMachine.prototype.update = function (data) {
            this._newState = false;
            if (this._currentState === null) {
                this.setCurrentState(this.defaultState);
            }
            if (this._currentState !== null) {
                this._currentState.update(this);
            }

            if (this._newState === false && this._currentState !== null) {
                this._previousState = this._currentState;
            }
        };
        StateMachine.prototype.addState = function (state) {
            this.states.push(state);
        };
        StateMachine.prototype.addStates = function (states) {
            this.states = _.unique(this.states.concat(states));
        };

        StateMachine.prototype.getCurrentState = function () {
            return this._currentState;
        };
        StateMachine.prototype.getCurrentName = function () {
            return this._currentState !== null ? this._currentState.name : null;
        };

        StateMachine.prototype.setCurrentState = function (newState) {
            var state = typeof newState === 'string' ? this.getState(newState) : newState;
            var oldState = this._currentState;
            if (!state) {
                console.error("STATE NOT FOUND: " + newState);
                return false;
            }
            this._newState = true;
            this._previousState = this._currentState;
            this._currentState = state;
            if (oldState) {
                this.trigger("exit", oldState, state);
                oldState.exit(this);
            }
            state.enter(this);
            this.trigger("enter", state, oldState);
            return true;
        };
        StateMachine.prototype.getPreviousState = function () {
            return this._previousState;
        };
        StateMachine.prototype.getState = function (name) {
            var state = _.find(this.states, function (s) {
                return s.name === name;
            });
            return state;
        };
        return StateMachine;
    })(pow2.Events);
    pow2.StateMachine = StateMachine;

    var TickedStateMachine = (function (_super) {
        __extends(TickedStateMachine, _super);
        function TickedStateMachine() {
            _super.apply(this, arguments);
        }
        TickedStateMachine.prototype.onAddToWorld = function (world) {
            world.time.addObject(this);
        };
        TickedStateMachine.prototype.onRemoveFromWorld = function (world) {
            world.time.removeObject(this);
        };
        TickedStateMachine.prototype.tick = function (elapsed) {
            this.update(elapsed);
        };
        return TickedStateMachine;
    })(StateMachine);
    pow2.TickedStateMachine = TickedStateMachine;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var World = (function () {
        function World(services) {
            var _this = this;
            this.loader = null;
            services = _.defaults(services, {
                loader: new pow2.ResourceLoader,
                time: new pow2.Time({ autoStart: true }),
                scene: null,
                state: null,
                input: new pow2.Input,
                sprites: new pow2.SpriteRender
            });
            _.extend(this, services);

            _.each(services, function (s, k) {
                _this.mark(s);
            });
        }
        World.prototype.setService = function (name, value) {
            this.mark(value);
            this[name] = value;
            return value;
        };

        World.prototype.mark = function (object) {
            if (object) {
                object.world = this;
                if (object.onAddToWorld) {
                    object.onAddToWorld(this);
                }
            }
        };

        World.prototype.erase = function (object) {
            if (object) {
                if (object.onRemoveFromWorld) {
                    object.onRemoveFromWorld(this);
                }
                delete object.world;
            }
        };
        return World;
    })();
    pow2.World = World;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    

    var SceneComponent = (function (_super) {
        __extends(SceneComponent, _super);
        function SceneComponent(name) {
            if (typeof name === "undefined") { name = _.uniqueId('comp'); }
            _super.call(this);
            this.name = name;
            this.id = _.uniqueId();
        }
        SceneComponent.prototype.connectComponent = function () {
            this.scene = this.host.scene;
            return true;
        };
        SceneComponent.prototype.disconnectComponent = function () {
            this.scene = null;
            return true;
        };
        SceneComponent.prototype.syncComponent = function () {
            this.scene = this.host.scene;
            return !!this.scene;
        };
        return SceneComponent;
    })(pow2.Events);
    pow2.SceneComponent = SceneComponent;

    var TickedComponent = (function (_super) {
        __extends(TickedComponent, _super);
        function TickedComponent() {
            _super.apply(this, arguments);
            this.tickRateMS = 300;
        }
        TickedComponent.prototype.tick = function (elapsed) {
        };

        TickedComponent.prototype.interpolateTick = function (elapsed) {
        };
        return TickedComponent;
    })(SceneComponent);
    pow2.TickedComponent = TickedComponent;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    

    var SceneObject = (function (_super) {
        __extends(SceneObject, _super);
        function SceneObject(options) {
            _super.call(this);
            this.id = _.uniqueId();
            this._components = [];
            _.extend(this, _.defaults(options || {}), {
                point: new pow2.Point(0, 0),
                size: new pow2.Point(1, 1),
                enabled: true
            });
        }
        SceneObject.prototype.tick = function (elapsed) {
            if (!this.enabled) {
                return;
            }
            _.each(this._components, function (o) {
                if (o.tick) {
                    o.tick(elapsed);
                }
            });
        };

        SceneObject.prototype.interpolateTick = function (elapsed) {
            if (!this.enabled) {
                return;
            }
            _.each(this._components, function (o) {
                if (o.interpolateTick) {
                    o.interpolateTick(elapsed);
                }
            });
        };

        SceneObject.prototype.destroy = function () {
            _.each(this._components, function (o) {
                o.disconnectComponent();
            });
            if (this.scene) {
                this.scene.removeObject(this);
            }
        };

        SceneObject.prototype.findComponent = function (type) {
            return _.find(this._components, function (comp) {
                return comp instanceof type;
            });
        };
        SceneObject.prototype.findComponents = function (type) {
            return _.filter(this._components, function (comp) {
                return comp instanceof type;
            });
        };

        SceneObject.prototype.syncComponents = function () {
            _.each(this._components, function (comp) {
                comp.syncComponent();
            });
        };

        SceneObject.prototype.addComponent = function (component, silent) {
            if (typeof silent === "undefined") { silent = false; }
            if (_.where(this._components, { id: component.id }).length > 0) {
                throw new Error("Component added twice");
            }
            component.host = this;
            if (component.connectComponent() === false) {
                delete component.host;
                console.log("Component " + component.name + " failed to register.");
                return false;
            }
            this._components.push(component);
            if (silent !== true) {
                this.syncComponents();
            }
            return true;
        };

        SceneObject.prototype.addComponentDictionary = function (components, silent) {
            var _this = this;
            var failed = null;
            _.each(components, function (comp, key) {
                if (failed) {
                    return;
                }
                if (!_this.addComponent(comp, true)) {
                    failed = comp;
                }
            });
            if (failed) {
                console.log("Failed to add component set to host. Component " + failed.toString() + " failed to connect to host.");
            } else {
                this.syncComponents();
            }
            return !failed;
        };
        SceneObject.prototype.removeComponentDictionary = function (components, silent) {
            var previousCount = this._components.length;
            var removeIds = _.map(components, function (value) {
                return value.id;
            });
            this._components = _.filter(this._components, function (obj) {
                if (_.indexOf(removeIds, obj.id) !== -1) {
                    if (obj.disconnectComponent() === false) {
                        return true;
                    }
                    obj.host = null;
                    return false;
                }
                return true;
            });
            var change = this._components.length === previousCount;
            if (change && silent !== true) {
                this.syncComponents();
            }
            return change;
        };

        SceneObject.prototype.removeComponentByType = function (componentType, silent) {
            if (typeof silent === "undefined") { silent = false; }
            var component = this.findComponent(componentType);
            if (!component) {
                return false;
            }
            return this.removeComponent(component);
        };

        SceneObject.prototype.removeComponent = function (component, silent) {
            if (typeof silent === "undefined") { silent = false; }
            var previousCount = this._components.length;
            this._components = _.filter(this._components, function (obj) {
                if (obj.id === component.id) {
                    if (obj.disconnectComponent() === false) {
                        return true;
                    }
                    obj.host = null;
                    return false;
                }
                return true;
            });
            var change = this._components.length === previousCount;
            if (change && silent !== true) {
                this.syncComponents();
            }
            return change;
        };
        return SceneObject;
    })(pow2.Events);
    pow2.SceneObject = SceneObject;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var SceneSpatialDatabase = (function () {
        function SceneSpatialDatabase() {
            this._pointRect = new pow2.Rect(0, 0, 1, 1);
            this._objects = [];
        }
        SceneSpatialDatabase.prototype.addSpatialObject = function (obj) {
            if (obj && obj.point instanceof pow2.Point) {
                this._objects.push(obj);
            }
        };

        SceneSpatialDatabase.prototype.removeSpatialObject = function (obj) {
            this._objects = _.filter(this._objects, function (o) {
                return o.id !== obj.id;
            });
        };

        SceneSpatialDatabase.prototype.queryPoint = function (point, type, results) {
            this._pointRect.point.set(point);
            return this.queryRect(this._pointRect, type, results);
        };
        SceneSpatialDatabase.prototype.queryRect = function (rect, type, results) {
            var foundAny;
            if (!results) {
                throw new Error("Results array must be provided to query scene spatial database");
            }
            foundAny = false;
            var list = this._objects;
            var i, len, o;
            for (i = 0, len = list.length; i < len; i++) {
                o = list[i];
                if (type && !(o instanceof type)) {
                    continue;
                }
                if (o.enabled === false) {
                    continue;
                }
                if (o.point && this.pointInRect(rect, o.point)) {
                    results.push(o);
                    foundAny = true;
                }
            }
            return foundAny;
        };

        SceneSpatialDatabase.prototype.pointInRect = function (rect, point) {
            if (point.x < rect.point.x || point.y < rect.point.y) {
                return false;
            }
            if (point.x >= rect.point.x + rect.extent.x || point.y >= rect.point.y + rect.extent.y) {
                return false;
            }
            return true;
        };
        return SceneSpatialDatabase;
    })();
    pow2.SceneSpatialDatabase = SceneSpatialDatabase;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var Scene = (function (_super) {
        __extends(Scene, _super);
        function Scene(options) {
            if (typeof options === "undefined") { options = {}; }
            _super.call(this);
            this.id = _.uniqueId();
            this.name = _.uniqueId('scene');
            this.db = new pow2.SceneSpatialDatabase;
            this.options = {};
            this._objects = [];
            this._views = [];
            this.world = null;
            this.fps = 0;
            this.time = 0;
            this.paused = false;
            this.options = _.defaults(options || {}, {
                debugRender: false
            });
        }
        Scene.prototype.destroy = function () {
            var _this = this;
            if (this.world) {
                this.world.erase(this);
            }
            _.each(this._objects, function (obj) {
                _this.removeObject(obj, true);
            });
            _.each(this._views, function (obj) {
                _this.removeView(obj);
            });
            this.paused = true;
        };

        Scene.prototype.onAddToWorld = function (world) {
            world.time.addObject(this);
        };
        Scene.prototype.onRemoveFromWorld = function (world) {
            world.time.removeObject(this);
        };

        Scene.prototype.tick = function (elapsed) {
            if (this.paused) {
                return;
            }
            for (var i = 0; i < this._objects.length; i++) {
                this._objects[i].tick(elapsed);
            }
        };
        Scene.prototype.processFrame = function (elapsed) {
            if (this.paused) {
                return;
            }
            this.time = this.world.time.time;

            for (var i = 0; i < this._objects.length; i++) {
                var o = this._objects[i];
                if (o.interpolateTick) {
                    o.interpolateTick(elapsed);
                }
            }

            for (var i = 0; i < this._views.length; i++) {
                this._views[i]._render(elapsed);
            }

            var currFPS = elapsed ? 1000 / elapsed : 0;
            this.fps += (currFPS - this.fps) / 10;
        };

        Scene.prototype.removeIt = function (property, object) {
            var _this = this;
            this[property] = _.filter(this[property], function (obj) {
                if (obj.id === object.id) {
                    _this.db.removeSpatialObject(obj);
                    if (obj.onRemoveFromScene) {
                        obj.onRemoveFromScene(_this);
                    }
                    if (_this.world) {
                        _this.world.erase(obj);
                    }
                    delete obj.scene;
                    return false;
                }
                return true;
            });
        };

        Scene.prototype.addIt = function (property, object) {
            if (object.scene) {
                object.scene.removeIt(property, object);
            }

            if (_.where(this[property], { id: object.id }).length > 0) {
                throw new Error("Object added to scene twice");
            }
            this[property].push(object);

            if (this.world) {
                this.world.mark(object);
            }

            this.db.addSpatialObject(object);

            object.scene = this;
            if (object.onAddToScene) {
                object.onAddToScene(this);
            }
        };

        Scene.prototype.findIt = function (property, object) {
            return _.where(this[property], { id: object.id });
        };

        Scene.prototype.addView = function (view) {
            if (!(view instanceof pow2.SceneView)) {
                throw new Error("Scene.addView: must be a SceneView");
            }
            this.addIt('_views', view);
        };

        Scene.prototype.removeView = function (view) {
            this.removeIt('_views', view);
        };

        Scene.prototype.findView = function (view) {
            return this.findIt('_views', view);
        };

        Scene.prototype.addObject = function (object) {
            if (!(object instanceof pow2.SceneObject)) {
                throw new Error("Scene.addObject: must be a SceneObject");
            }
            this.addIt('_objects', object);
        };
        Scene.prototype.removeObject = function (object, destroy) {
            if (typeof destroy === "undefined") { destroy = true; }
            this.removeIt('_objects', object);
            if (destroy) {
                object.destroy();
            }
        };
        Scene.prototype.findObject = function (object) {
            return this.findIt('_objects', object);
        };

        Scene.prototype.componentByType = function (type) {
            var obj = _.find(this._objects, function (o) {
                return !!o.findComponent(type);
            });
            if (!obj) {
                return null;
            }
            return obj.findComponent(type);
        };

        Scene.prototype.componentsByType = function (type) {
            return _.chain(this._objects).map(function (o) {
                return o.findComponents(type);
            }).flatten().compact().value();
        };

        Scene.prototype.objectsByName = function (name) {
            return _.filter(this._objects, function (o) {
                return o.name === name;
            });
        };
        Scene.prototype.objectByName = function (name) {
            return _.find(this._objects, function (o) {
                return o.name === name;
            });
        };
        Scene.prototype.objectsByType = function (type) {
            return _.filter(this._objects, function (o) {
                return o instanceof type;
            });
        };
        Scene.prototype.objectByType = function (type) {
            return _.find(this._objects, function (o) {
                return o instanceof type;
            });
        };
        Scene.prototype.objectsByComponent = function (type) {
            return _.filter(this._objects, function (o) {
                return !!o.findComponent(type);
            });
        };
        Scene.prototype.objectByComponent = function (type) {
            return _.find(this._objects, function (o) {
                return !!o.findComponent(type);
            });
        };
        return Scene;
    })(pow2.Events);
    pow2.Scene = Scene;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var CameraComponent = (function (_super) {
        __extends(CameraComponent, _super);
        function CameraComponent() {
            _super.apply(this, arguments);
        }
        CameraComponent.prototype.process = function (view) {
            view.camera.point.set(this.host.point);
            view.cameraScale = 4;
            var canvasSize = view.screenToWorld(new pow2.Point(view.context.canvas.width, view.context.canvas.height), view.cameraScale);
            view.camera.extent.set(canvasSize);
        };
        return CameraComponent;
    })(pow2.SceneComponent);
    pow2.CameraComponent = CameraComponent;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var SceneView = (function (_super) {
        __extends(SceneView, _super);
        function SceneView(canvas, loader) {
            _super.call(this);
            this.cameraComponent = null;
            this.scene = null;
            this.loader = null;
            this.animations = [];
            this.canvas = canvas;
            if (!canvas) {
                throw new Error("A Canvas is required");
            }
            this.$el = $(canvas);
            this.context = canvas.getContext("2d");
            if (!this.context) {
                throw new Error("Could not retrieve Canvas context");
            }
            var contextAny = this.context;
            contextAny.webkitImageSmoothingEnabled = false;
            contextAny.mozImageSmoothingEnabled = false;
            this.camera = new pow2.Rect(0, 0, 9, 9);
            this.cameraScale = 1.0;
            this.unitSize = SceneView.UNIT;
            this._sheets = {};
            this.loader = loader;
        }
        SceneView.prototype.onAddToWorld = function (world) {
        };
        SceneView.prototype.onRemoveFromWorld = function (world) {
        };

        SceneView.prototype.setScene = function (scene) {
            if (this.scene) {
                this.scene.removeView(this);
            }
            this.scene = scene;
            if (this.scene) {
                this.scene.addView(this);
            }
        };

        SceneView.prototype.renderToCanvas = function (width, height, renderFunction) {
            var buffer = document.createElement('canvas');
            buffer.width = width;
            buffer.height = height;
            var context = buffer.getContext('2d');

            context.webkitImageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false;
            renderFunction(context);
            return buffer;
        };

        SceneView.prototype.renderFrame = function (elapsed) {
        };

        SceneView.prototype.renderPost = function () {
        };

        SceneView.prototype.setRenderState = function () {
            if (!this.context) {
                return;
            }
            this.context.save();
            this.context.scale(this.cameraScale, this.cameraScale);
        };

        SceneView.prototype.restoreRenderState = function () {
            if (!this.context) {
                return false;
            }
            this.context.restore();
            return true;
        };

        SceneView.prototype.render = function () {
            this._render(0);
        };

        SceneView.prototype._render = function (elapsed) {
            this.processCamera();
            this.setRenderState();
            this.renderFrame(elapsed);
            this.renderAnimations();
            this.renderPost();
            if (this.scene && this.scene.options.debugRender) {
                this.debugRender();
            }
            this.restoreRenderState();
        };

        SceneView.prototype.debugRender = function (debugStrings) {
            if (typeof debugStrings === "undefined") { debugStrings = []; }
            if (!this.context) {
                return;
            }
            var fontSize = 4;
            debugStrings.push("MSPF: " + this.world.time.mspf);
            debugStrings.push("FPS:  " + this.scene.fps.toFixed(0));

            this.context.save();
            this.context.scale(1, 1);
            this.context.font = "bold " + fontSize + "px Arial";
            var renderPos = this.worldToScreen(this.camera.point);
            var x = renderPos.x + 10;
            var y = renderPos.y + 10;
            var i;
            for (i = 0; i < debugStrings.length; ++i) {
                this.context.fillStyle = "rgba(0,0,0,0.8)";
                this.context.fillText(debugStrings[i], x + 0.5, y + 0.5);
                this.context.fillStyle = "rgba(255,255,255,1)";
                this.context.fillText(debugStrings[i], x, y);
                y += fontSize;
            }
            this.context.restore();
        };

        SceneView.prototype.getSpriteSheet = function (name, done) {
            if (!this._sheets[name]) {
                this._sheets[name] = this.loader.load("/images/" + name + ".png", done);
            }
            return this._sheets[name];
        };

        SceneView.prototype.processCamera = function () {
            if (this.cameraComponent) {
                this.cameraComponent.process(this);
            }
        };

        SceneView.prototype.clearRect = function () {
            var renderPos, x, y;
            x = y = 0;
            if (this.camera) {
                renderPos = this.worldToScreen(this.camera.point);
                x = renderPos.x;
                y = renderPos.y;
            }
            return this.context.clearRect(x, y, this.context.canvas.width, this.context.canvas.height);
        };

        SceneView.prototype.worldToScreen = function (value, scale) {
            if (typeof scale === "undefined") { scale = 1; }
            if (value instanceof pow2.Rect) {
                return new pow2.Rect(value).scale(this.unitSize * scale);
            } else if (value instanceof pow2.Point) {
                return new pow2.Point(value).multiply(this.unitSize * scale);
            }
            return value * (this.unitSize * scale);
        };

        SceneView.prototype.screenToWorld = function (value, scale) {
            if (typeof scale === "undefined") { scale = 1; }
            if (value instanceof pow2.Rect) {
                return new pow2.Rect(value).scale(1 / (this.unitSize * scale));
            } else if (value instanceof pow2.Point) {
                return new pow2.Point(value).multiply(1 / (this.unitSize * scale));
            }
            return value * (1 / (this.unitSize * scale));
        };

        SceneView.prototype.renderAnimations = function () {
            var i, len, animation;
            for (i = 0, len = this.animations.length; i < len; i++) {
                animation = this.animations[i];
                animation.done = animation.fn(animation.frame);
                if (this.scene.time >= animation.time) {
                    animation.frame += 1;
                    animation.time = this.scene.time + animation.rate;
                }
            }
            return this.animations = _.filter(this.animations, function (a) {
                return a.done !== true;
            });
        };

        SceneView.prototype.playAnimation = function (tickRate, animFn) {
            if (!this.scene) {
                throw new Error("Cannot queue an animation for a view that has no scene");
            }
            return this.animations.push({
                frame: 0,
                time: this.scene.time + tickRate,
                rate: tickRate,
                fn: animFn
            });
        };
        SceneView.UNIT = 16;
        return SceneView;
    })(pow2.SceneObject);
    pow2.SceneView = SceneView;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    (function (KeyCode) {
        KeyCode[KeyCode["UP"] = 38] = "UP";
        KeyCode[KeyCode["DOWN"] = 40] = "DOWN";
        KeyCode[KeyCode["LEFT"] = 37] = "LEFT";
        KeyCode[KeyCode["RIGHT"] = 39] = "RIGHT";
        KeyCode[KeyCode["BACKSPACE"] = 8] = "BACKSPACE";
        KeyCode[KeyCode["COMMA"] = 188] = "COMMA";
        KeyCode[KeyCode["DELETE"] = 46] = "DELETE";
        KeyCode[KeyCode["END"] = 35] = "END";
        KeyCode[KeyCode["ENTER"] = 13] = "ENTER";
        KeyCode[KeyCode["ESCAPE"] = 27] = "ESCAPE";
        KeyCode[KeyCode["HOME"] = 36] = "HOME";
        KeyCode[KeyCode["SPACE"] = 32] = "SPACE";
        KeyCode[KeyCode["TAB"] = 9] = "TAB";
    })(pow2.KeyCode || (pow2.KeyCode = {}));
    var KeyCode = pow2.KeyCode;

    var Input = (function () {
        function Input() {
            var _this = this;
            this._keysDown = {};
            this._mouseElements = [];
            window.addEventListener("keydown", function (ev) {
                _this._keysDown[ev.which] = true;
            });
            window.addEventListener('keyup', function (ev) {
                _this._keysDown[ev.which] = false;
            });
            var hooks = this._mouseElements;
            window.addEventListener('mousemove', function (ev) {
                _.each(hooks, function (hook) {
                    if (ev.srcElement === hook.view.canvas) {
                        Input.mouseOnView(ev, hook.view, hook);
                    } else {
                        hook.point.set(-1, -1);
                        hook.world.set(-1, -1);
                    }
                    return false;
                });
            });
        }
        Input.mouseOnView = function (ev, view, coords) {
            var result = coords || {
                point: new pow2.Point(),
                world: new pow2.Point()
            };
            var canoffset = $(ev.srcElement).offset();
            var x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
            var y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top);
            result.point.set(x, y);

            var worldMouse = view.screenToWorld(result.point, view.cameraScale).add(view.camera.point).round();
            result.world.set(worldMouse.x, worldMouse.y);
            return result;
        };

        Input.prototype.mouseHook = function (view, name) {
            var hooks = _.where(this._mouseElements, { name: name });
            if (hooks.length > 0) {
                return hooks[0];
            }
            var result = {
                name: name,
                view: view,
                point: new pow2.Point(-1, -1),
                world: new pow2.Point(-1, -1)
            };
            this._mouseElements.push(result);
            return result;
        };

        Input.prototype.mouseUnhook = function (nameOrView) {
            this._mouseElements = _.filter(this._mouseElements, function (hook) {
                return hook.name === nameOrView || hook.view.id === nameOrView.id;
            });
        };

        Input.prototype.getMouseHook = function (nameOrView) {
            return _.find(this._mouseElements, function (hook) {
                return hook.name === nameOrView || hook.view.id === nameOrView.id;
            });
        };

        Input.prototype.keyDown = function (key) {
            return !!this._keysDown[key];
        };
        return Input;
    })();
    pow2.Input = Input;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var SceneObjectRenderer = (function () {
        function SceneObjectRenderer() {
        }
        SceneObjectRenderer.prototype.render = function (object, data, view) {
        };
        return SceneObjectRenderer;
    })();
    pow2.SceneObjectRenderer = SceneObjectRenderer;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var CollisionComponent = (function (_super) {
        __extends(CollisionComponent, _super);
        function CollisionComponent() {
            _super.apply(this, arguments);
            this.collideBox = new pow2.Rect(0, 0, 0, 0);
            this.resultsArray = [];
        }
        CollisionComponent.prototype.collide = function (x, y, type, results) {
            if (typeof type === "undefined") { type = pow2.SceneObject; }
            if (typeof results === "undefined") { results = []; }
            this.collideBox.point.x = x;
            this.collideBox.point.y = y;
            return this.host.scene.db.queryRect(this.collideBox, type, results);
        };
        CollisionComponent.prototype.collideFirst = function (x, y, type) {
            if (typeof type === "undefined") { type = pow2.SceneObject; }
            this.collideBox.point.x = x;
            this.collideBox.point.y = y;
            this.resultsArray.length = 0;
            var hit = this.host.scene.db.queryRect(this.collideBox, type, this.resultsArray);
            return hit ? this.resultsArray[0] : null;
        };
        return CollisionComponent;
    })(pow2.SceneComponent);
    pow2.CollisionComponent = CollisionComponent;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var MovableComponent = (function (_super) {
        __extends(MovableComponent, _super);
        function MovableComponent() {
            _super.apply(this, arguments);
            this._elapsed = 0;
            this.path = [];
            this.tickRateMS = 250;
            this.velocity = new pow2.Point(0, 0);
            this.workPoint = new pow2.Point(0, 0);
        }
        MovableComponent.prototype.connectComponent = function () {
            this.host.point.round();
            this.targetPoint = this.host.point.clone();
            this.host.renderPoint = this.targetPoint.clone();
            return true;
        };
        MovableComponent.prototype.syncComponent = function () {
            this.collider = this.host.findComponent(pow2.CollisionComponent);
            return _super.prototype.syncComponent.call(this);
        };

        MovableComponent.prototype.beginMove = function (from, to) {
        };
        MovableComponent.prototype.endMove = function (from, to) {
        };

        MovableComponent.prototype.collideMove = function (x, y, results) {
            if (typeof results === "undefined") { results = []; }
            if (!this.collider) {
                return false;
            }
            return this.collider.collide(x, y, pow2.SceneObject, results);
        };

        MovableComponent.prototype.setMoveFilter = function (filter) {
            this.moveFilter = filter;
        };
        MovableComponent.prototype.clearMoveFilter = function () {
            this.moveFilter = null;
        };

        MovableComponent.prototype.updateVelocity = function () {
            if (!this.host.world || !this.host.world.input) {
                return;
            }

            var hasCreateTouch = document.createTouch;
            var worldInput = this.host.world.input;
            if (hasCreateTouch && worldInput.analogVector instanceof pow2.Point) {
                this.velocity.x = 0;
                if (worldInput.analogVector.x < -20) {
                    this.velocity.x -= 1;
                } else if (worldInput.analogVector.x > 20) {
                    this.velocity.x += 1;
                }
                this.velocity.y = 0;
                if (worldInput.analogVector.y < -20) {
                    this.velocity.y -= 1;
                } else if (worldInput.analogVector.y > 20) {
                    this.velocity.y += 1;
                }
            } else {
                this.velocity.x = 0;
                if (worldInput.keyDown(37 /* LEFT */)) {
                    this.velocity.x -= 1;
                }
                if (worldInput.keyDown(39 /* RIGHT */)) {
                    this.velocity.x += 1;
                }
                this.velocity.y = 0;
                if (worldInput.keyDown(38 /* UP */)) {
                    this.velocity.y -= 1;
                }
                if (worldInput.keyDown(40 /* DOWN */)) {
                    this.velocity.y += 1;
                }
            }
        };

        MovableComponent.prototype.interpolateTick = function (elapsed) {
            var factor;
            factor = this._elapsed / this.tickRateMS;
            this.host.renderPoint.set(this.host.point.x, this.host.point.y);
            if (this.velocity.isZero()) {
                return;
            }
            this.host.renderPoint.interpolate(this.host.point, this.targetPoint, factor);
            this.host.renderPoint.x = parseFloat(this.host.renderPoint.x.toFixed(2));
            this.host.renderPoint.y = parseFloat(this.host.renderPoint.y.toFixed(2));
        };

        MovableComponent.prototype.tick = function (elapsed) {
            this._elapsed += elapsed;
            if (this._elapsed < this.tickRateMS) {
                return;
            }

            this._elapsed = this._elapsed % this.tickRateMS;

            if (!this.targetPoint.equal(this.host.point) && !this.collideMove(this.targetPoint.x, this.targetPoint.y)) {
                this.workPoint.set(this.host.point);
                this.host.point.set(this.targetPoint);
                this.endMove(this.workPoint, this.targetPoint);
            }

            this.updateVelocity();

            this.targetPoint.set(this.host.point);

            var zero = this.velocity.isZero();
            if (zero && this.path.length === 0) {
                return;
            }

            if (zero) {
                var next = this.path.shift();
                this.velocity.set(next.x - this.host.point.x, next.y - this.host.point.y);
            } else {
                this.path.length = 0;
            }
            this.targetPoint.add(this.velocity);

            if (this.velocity.y !== 0 && !this.collideMove(this.host.point.x, this.targetPoint.y)) {
                this.targetPoint.x = this.host.point.x;
            } else if (this.velocity.x !== 0 && !this.collideMove(this.targetPoint.x, this.host.point.y)) {
                this.targetPoint.y = this.host.point.y;
            } else {
                this.targetPoint.set(this.host.point);

                this.path.length = 0;
                return;
            }

            var moveFn = this.moveFilter || this.beginMove;
            moveFn.call(this, this.host.point, this.targetPoint);
        };
        return MovableComponent;
    })(pow2.TickedComponent);
    pow2.MovableComponent = MovableComponent;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var DEFAULTS = {
        url: null,
        volume: 1,
        loop: false
    };

    var SoundComponent = (function (_super) {
        __extends(SoundComponent, _super);
        function SoundComponent(options) {
            if (typeof options === "undefined") { options = DEFAULTS; }
            _super.call(this);
            if (typeof options !== 'undefined') {
                _.extend(this, DEFAULTS, options);
            }
        }
        SoundComponent.prototype.disconnectComponent = function () {
            if (this.audio.isReady()) {
                this.audio.data.pause();
                this.audio.data.currentTime = 0;
            }
            return _super.prototype.disconnectComponent.call(this);
        };

        SoundComponent.prototype.connectComponent = function () {
            var _this = this;
            if (!_super.prototype.connectComponent.call(this) || !this.url) {
                return false;
            }
            if (this.audio && this.audio.isReady()) {
                this.audio.data.currentTime = 0;
                this.audio.data.volume = this.volume;
                return true;
            }
            this.audio = this.host.world.loader.load(this.url, function () {
                if (_this.audio.isReady()) {
                    _this.audio.data.currentTime = 0;
                    _this.audio.data.volume = _this.volume;
                    _this.audio.data.loop = _this.loop;
                    _this.audio.data.play();
                    _this.audio.data.addEventListener('timeupdate', function () {
                        if (_this.audio.data.currentTime >= _this.audio.data.duration) {
                            if (!_this.loop) {
                                _this.audio.data.pause();
                                _this.trigger("audio:done", _this);
                            } else {
                                _this.trigger("audio:loop", _this);
                            }
                        }
                    });
                }
            });
            return true;
        };
        return SoundComponent;
    })(pow2.SceneComponent);
    pow2.SoundComponent = SoundComponent;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var StateMachineComponent = (function (_super) {
        __extends(StateMachineComponent, _super);
        function StateMachineComponent() {
            _super.apply(this, arguments);
            this.machine = null;
            this.paused = false;
        }
        StateMachineComponent.prototype.tick = function (elapsed) {
            if (this.paused) {
                return;
            }
            if (this.machine) {
                this.machine.update(this);
            }
        };
        return StateMachineComponent;
    })(pow2.TickedComponent);
    pow2.StateMachineComponent = StateMachineComponent;
})(pow2 || (pow2 = {}));
//# sourceMappingURL=pow2.js.map
