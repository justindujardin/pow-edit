var pow2;
(function (pow2) {
    (function (errors) {
        errors.INVALID_ARGUMENTS = 'invalid arguments';

        errors.DIVIDE_ZERO = 'divide by zero operation';

        errors.CLASS_NOT_IMPLEMENTED = 'must be implemented in a subclass';

        errors.REQUIRED_ARGUMENT = 'argument must be valid';

        errors.ALREADY_EXISTS = 'already exists and would overwrite existing value';

        errors.INDEX_OUT_OF_RANGE = 'index out of range';

        errors.INVALID_ITEM = 'invalid item type or value';
    })(pow2.errors || (pow2.errors = {}));
    var errors = pow2.errors;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var _worldLookup = {};

    function getWorld(name) {
        return _worldLookup[name];
    }
    pow2.getWorld = getWorld;

    function registerWorld(name, instance) {
        if (!name) {
            throw new Error(pow2.errors.REQUIRED_ARGUMENT);
        }
        if (_worldLookup.hasOwnProperty(name)) {
            throw new Error(pow2.errors.ALREADY_EXISTS);
        }
        _worldLookup[name] = instance;
        return _worldLookup[name];
    }
    pow2.registerWorld = registerWorld;

    function unregisterWorld(name) {
        if (!name) {
            throw new Error(pow2.errors.REQUIRED_ARGUMENT);
        }
        if (!_worldLookup.hasOwnProperty(name)) {
            throw new Error(pow2.errors.INVALID_ARGUMENTS);
        }
        var instance = _worldLookup[name];
        delete _worldLookup[name];
        return instance;
    }
    pow2.unregisterWorld = unregisterWorld;
})(pow2 || (pow2 = {}));
var pow2;
(function (pow2) {
    var Events = (function () {
        function Events() {
        }
        Events.prototype.on = function (name, callback, context) {
            if (!eventsApi(this, 'on', name, [callback, context]) || !callback)
                return this;
            this._events || (this._events = {});
            var events = this._events[name] || (this._events[name] = []);
            events.push({ callback: callback, context: context, ctx: context || this });
            return this;
        };

        Events.prototype.once = function (name, callback, context) {
            if (!eventsApi(this, 'once', name, [callback, context]) || !callback)
                return this;
            var self = this;
            var once = _.once(function () {
                self.off(name, once);
                callback.apply(this, arguments);
            });
            once._callback = callback;
            return this.on(name, once, context);
        };

        Events.prototype.off = function (name, callback, context) {
            var retain, ev, events, names, i, l, j, k;
            if (!this._events || !eventsApi(this, 'off', name, [callback, context]))
                return this;
            if (!name && !callback && !context) {
                this._events = void 0;
                return this;
            }
            names = name ? [name] : _.keys(this._events);
            for (i = 0, l = names.length; i < l; i++) {
                name = names[i];
                if (events = this._events[name]) {
                    this._events[name] = retain = [];
                    if (callback || context) {
                        for (j = 0, k = events.length; j < k; j++) {
                            ev = events[j];
                            if ((callback && callback !== ev.callback && callback !== ev.callback._callback) || (context && context !== ev.context)) {
                                retain.push(ev);
                            }
                        }
                    }
                    if (!retain.length)
                        delete this._events[name];
                }
            }

            return this;
        };

        Events.prototype.trigger = function (name) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            if (!this._events)
                return this;
            var args = Array.prototype.slice.call(arguments, 1);
            if (!eventsApi(this, 'trigger', name, args))
                return this;
            var events = this._events[name];
            var allEvents = this._events.all;
            if (events)
                triggerEvents(events, args);
            if (allEvents)
                triggerEvents(allEvents, arguments);
            return this;
        };
        return Events;
    })();
    pow2.Events = Events;

    var eventSplitter = /\s+/;

    var eventsApi = function (obj, action, name, rest) {
        if (!name)
            return true;

        if (typeof name === 'object') {
            for (var key in name) {
                obj[action].apply(obj, [key, name[key]].concat(rest));
            }
            return false;
        }

        if (eventSplitter.test(name)) {
            var names = name.split(eventSplitter);
            for (var i = 0, l = names.length; i < l; i++) {
                obj[action].apply(obj, [names[i]].concat(rest));
            }
            return false;
        }

        return true;
    };

    var triggerEvents = function (events, args) {
        var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
        switch (args.length) {
            case 0:
                while (++i < l)
                    (ev = events[i]).callback.call(ev.ctx);
                return;
            case 1:
                while (++i < l)
                    (ev = events[i]).callback.call(ev.ctx, a1);
                return;
            case 2:
                while (++i < l)
                    (ev = events[i]).callback.call(ev.ctx, a1, a2);
                return;
            case 3:
                while (++i < l)
                    (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
                return;
            default:
                while (++i < l)
                    (ev = events[i]).callback.apply(ev.ctx, args);
                return;
        }
    };
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
            throw new Error(pow2.errors.CLASS_NOT_IMPLEMENTED);
        };

        Resource.prototype.setLoader = function (loader) {
            this.loader = loader;
        };

        Resource.prototype.isReady = function () {
            return this.data !== null && this._ready === true;
        };

        Resource.prototype.ready = function () {
            this._ready = true;
            this.trigger(Resource.READY, this);
        };
        Resource.prototype.failed = function (error) {
            this._ready = false;

            this.trigger(Resource.FAILED, this);
        };
        Resource.READY = 'ready';
        Resource.FAILED = 'failed';
        return Resource;
    })(pow2.Events);
    pow2.Resource = Resource;
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
            } else if (typeof pointOrX === 'number' && typeof y === 'number') {
                this.x = pointOrX;
                this.y = y;
            } else {
                throw new Error(pow2.errors.INVALID_ARGUMENTS);
            }
            return this;
        };

        Point.prototype.clone = function () {
            return new Point(this.x, this.y);
        };

        Point.prototype.floor = function () {
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
            } else if (typeof pointOrXOrValue === 'number' && typeof y === 'undefined') {
                this.x += pointOrXOrValue;
                this.y += pointOrXOrValue;
            } else {
                this.x += pointOrXOrValue;
                this.y += y;
            }
            return this;
        };

        Point.prototype.subtract = function (pointOrXOrValue, y) {
            if (pointOrXOrValue instanceof Point) {
                this.x -= pointOrXOrValue.x;
                this.y -= pointOrXOrValue.y;
            } else if (typeof pointOrXOrValue === 'number' && typeof y === 'undefined') {
                this.x -= pointOrXOrValue;
                this.y -= pointOrXOrValue;
            } else {
                this.x -= pointOrXOrValue;
                this.y -= y;
            }
            return this;
        };

        Point.prototype.multiply = function (pointOrXOrValue, y) {
            if (pointOrXOrValue instanceof Point) {
                this.x *= pointOrXOrValue.x;
                this.y *= pointOrXOrValue.y;
            } else if (typeof pointOrXOrValue === 'number' && typeof y === 'undefined') {
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
                    throw new Error(pow2.errors.DIVIDE_ZERO);
                }
                this.x /= pointOrXOrValue.x;
                this.y /= pointOrXOrValue.y;
            } else if (typeof pointOrXOrValue === 'number' && typeof y === 'undefined') {
                if (pointOrXOrValue === 0) {
                    throw new Error(pow2.errors.DIVIDE_ZERO);
                }
                this.x /= pointOrXOrValue;
                this.y /= pointOrXOrValue;
            } else {
                if (pointOrXOrValue === 0 || y === 0) {
                    throw new Error(pow2.errors.DIVIDE_ZERO);
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
            } else if (typeof width === 'number' && typeof height === 'number') {
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
            return this.point.toString() + "," + this.extent.toString();
        };

        Rect.prototype.set = function (rectOrPointOrX, extentOrY, width, height) {
            if (rectOrPointOrX instanceof Rect) {
                this.point.set(rectOrPointOrX.point);
                this.extent.set(rectOrPointOrX.extent);
            } else if (typeof width === 'number' && typeof height === 'number') {
                this.point.set(rectOrPointOrX, extentOrY);
                this.extent.set(width, height);
            } else if (rectOrPointOrX instanceof pow2.Point && extentOrY instanceof pow2.Point) {
                this.point.set(rectOrPointOrX);
                this.extent.set(extentOrY);
            } else {
                throw new Error(pow2.errors.INVALID_ARGUMENTS);
            }
            return this;
        };

        Rect.prototype.clone = function () {
            return new Rect(this.point.clone(), this.extent.clone());
        };

        Rect.prototype.clip = function (clipRect) {
            var right = this.point.x + this.extent.x;
            var bottom = this.point.y + this.extent.y;
            this.point.x = Math.max(clipRect.point.x, this.point.x);
            this.extent.x = Math.min(clipRect.point.x + clipRect.extent.x, right) - this.point.x;
            this.point.y = Math.max(clipRect.point.y, this.point.y);
            this.extent.y = Math.min(clipRect.point.y + clipRect.extent.y, bottom) - this.point.y;
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
            } else if (typeof pointOrX === 'number' && typeof y === 'number') {
                x = pointOrX;
            } else {
                throw new Error(pow2.errors.INVALID_ARGUMENTS);
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
                    sources--;
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
            reference.load();
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
                return (child.parent()[0] !== el[0] ? null : child);
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
    var _shared = null;
    var Time = (function () {
        function Time() {
            this.tickRateMS = 32;
            this.mspf = 0;
            this.world = null;
            this.lastTime = 0;
            this.time = 0;
            this.running = false;
            this.objects = [];
            this.polyFillAnimationFrames();
        }
        Time.get = function () {
            if (!_shared) {
                _shared = new pow2.Time();
            }
            return _shared;
        };

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
            this.objects = _.reject(this.objects, function (o) {
                return o._uid === object._uid;
            });
        };

        Time.prototype.addObject = function (object) {
            if (!object._uid) {
                object._uid = _.uniqueId("u");
            }
            if (_.where(this.objects, { _uid: object._uid }).length > 0) {
                return;
            }
            this.objects.push(object);
        };

        Time.prototype.tickObjects = function (elapsedMS) {
            var values = this.objects;
            for (var i = values.length - 1; i >= 0; --i) {
                values[i].tick && values[i].tick(elapsedMS);
            }
        };
        Time.prototype.processFrame = function (elapsedMS) {
            var values = this.objects;
            for (var i = values.length - 1; i >= 0; --i) {
                values[i].processFrame && values[i].processFrame(elapsedMS);
            }
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
var pow2;
(function (pow2) {
    var World = (function () {
        function World(services) {
            var _this = this;
            this.loader = null;
            services = _.defaults(services || {}, {
                loader: new pow2.ResourceLoader(),
                time: new pow2.Time()
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
    var _shared = null;

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
            this._uid = _.uniqueId('res');
        }
        ResourceLoader.get = function () {
            if (!_shared) {
                _shared = new pow2.ResourceLoader();
            }
            return _shared;
        };

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

        ResourceLoader.prototype.registerType = function (extension, type) {
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
            if (typeof typeConstructor !== 'function') {
                throw new Error(pow2.errors.INVALID_ARGUMENTS);
            }
            var type = new typeConstructor(null, data);
            type.setLoader(this);
            return type;
        };

        ResourceLoader.prototype.loadAsType = function (source, resourceType, done) {
            var _this = this;
            var completeCb = function (obj) {
                if (_this.world && done) {
                    _this._doneQueue.push({ cb: done, result: obj });
                } else if (done) {
                    _.defer(function () {
                        done(obj);
                    });
                }
            };
            if (!resourceType) {
                completeCb(null);
                console.error("Unknown resource type: " + source);
                return;
            }

            var resource = this._cache[source];
            if (!resource) {
                resource = this._cache[source] = new resourceType(source, this);
                resource.setLoader(this);
            } else if (resource.isReady()) {
                return completeCb(resource);
            }

            resource.once('ready', function (resource) {
                console.log("Loaded asset: " + resource.url);
                completeCb(resource);
            });
            resource.once('failed', function (resource) {
                completeCb(resource);
            });
            resource.load();
            return resource;
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
    (function (tiled) {
        

        

        

        function readITiledBase(el) {
            return {
                name: getElAttribute(el, 'name'),
                x: parseInt(getElAttribute(el, 'x') || "0"),
                y: parseInt(getElAttribute(el, 'y') || "0"),
                width: parseInt(getElAttribute(el, 'width') || "0"),
                height: parseInt(getElAttribute(el, 'height') || "0"),
                visible: parseInt(getElAttribute(el, 'visible') || "1") === 1,
                _xml: el
            };
        }
        tiled.readITiledBase = readITiledBase;
        function writeITiledBase(el, data) {
            setElAttribute(el, 'name', data.name);
            if (data.type) {
                setElAttribute(el, 'type', data.type);
            }
            if (data.x !== 0) {
                setElAttribute(el, 'x', data.x);
            }
            if (data.y !== 0) {
                setElAttribute(el, 'y', data.y);
            }
            setElAttribute(el, 'width', data.width);
            setElAttribute(el, 'height', data.height);
            if (data.visible === false) {
                setElAttribute(el, 'visible', data.visible);
            }
            if (typeof data.color !== 'undefined') {
                setElAttribute(el, 'color', data.color);
            }
        }
        tiled.writeITiledBase = writeITiledBase;
        function writeITiledObjectBase(el, data) {
            writeITiledBase(el, data);
        }
        tiled.writeITiledObjectBase = writeITiledObjectBase;

        function readITiledObject(el) {
            var result = readITiledLayerBase(el);
            var type = getElAttribute(el, 'type');
            if (type) {
                result.type = type;
            }
            return result;
        }
        tiled.readITiledObject = readITiledObject;

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

        function compactUrl(base, relative) {
            var stack = base.split("/");
            var parts = relative.split("/");
            stack.pop();

            for (var i = 0; i < parts.length; i++) {
                if (parts[i] == ".")
                    continue;
                if (parts[i] == "..")
                    stack.pop();
                else
                    stack.push(parts[i]);
            }
            return stack.join("/");
        }
        tiled.compactUrl = compactUrl;

        function xml2Str(xmlNode) {
            try  {
                return (new XMLSerializer()).serializeToString(xmlNode);
            } catch (e) {
                try  {
                    return xmlNode.xml;
                } catch (e) {
                    throw new Error('Xmlserializer not supported');
                }
            }
        }
        tiled.xml2Str = xml2Str;

        function writeITiledLayerBase(el, data) {
            writeITiledBase(el, data);
            setElAttribute(el, 'opacity', data.opacity);
            writeTiledProperties(el, data.properties);
        }
        tiled.writeITiledLayerBase = writeITiledLayerBase;

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

        function writeTiledProperties(el, data) {
            var result = $('<properties/>');
            _.each(data, function (value, key) {
                var prop = $('<property/>');
                setElAttribute(prop, 'name', key);
                setElAttribute(prop, 'value', value);
                result.append(prop);
            });
            if (result.children().length > 0) {
                el.append(result);
            }
        }
        tiled.writeTiledProperties = writeTiledProperties;

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
        function setElAttribute(el, name, value) {
            el.attr(name, value);
        }
        tiled.setElAttribute = setElAttribute;
        function getElAttribute(el, name) {
            return el.attr(name) || null;
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
            this.relativeTo = null;
            this.imageUrl = null;
            this.literal = null;
        }
        TiledTSXResource.prototype.prepare = function (data) {
            var _this = this;
            var tileSet = this.getRootNode('tileset');
            this.name = this.getElAttribute(tileSet, 'name');
            this.tilewidth = parseInt(this.getElAttribute(tileSet, 'tilewidth'));
            this.tileheight = parseInt(this.getElAttribute(tileSet, 'tileheight'));
            var relativePath = this.url ? this.url.substr(0, this.url.lastIndexOf('/') + 1) : "";

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
                this.imageUrl = pow2.tiled.compactUrl(this.relativeTo ? this.relativeTo : relativePath, source);
                console.log("Tileset source: " + this.imageUrl);
                this.loader.load(this.imageUrl, function (res) {
                    _this.image = res;
                    if (!res.isReady()) {
                        _this.failed("Failed to load required TileMap image: " + source);
                        return;
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
                url: this.imageUrl,
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
            this.xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
        }
        TiledTMXResource.prototype.write = function () {
            var _this = this;
            var root = $('<map/>');
            pow2.tiled.setElAttribute(root, 'version', this.version);
            pow2.tiled.setElAttribute(root, 'orientation', this.orientation);
            pow2.tiled.setElAttribute(root, 'width', this.width);
            pow2.tiled.setElAttribute(root, 'height', this.height);
            pow2.tiled.setElAttribute(root, 'tilewidth', this.tilewidth);
            pow2.tiled.setElAttribute(root, 'tileheight', this.tileheight);
            pow2.tiled.writeTiledProperties(root, this.properties);

            _.each(this.tilesets, function (tileSet) {
                if (!tileSet.literal) {
                    throw new Error("Add support for inline TSX writing");
                }
                if (!tileSet.firstgid) {
                    throw new Error(pow2.errors.INVALID_ITEM);
                }
                var tilesetElement = $('<tileset/>');
                tilesetElement.attr('firstgid', tileSet.firstgid);
                tilesetElement.attr('source', tileSet.literal);
                root.append(tilesetElement);
            });

            _.each(this.layers, function (layer) {
                var layerElement = null;
                if (typeof layer.data !== 'undefined') {
                    layerElement = $('<layer/>');
                    pow2.tiled.writeITiledObjectBase(layerElement, layer);
                    var dataElement = $('<data/>');

                    var expectLength = _this.width * _this.height;
                    if (layer.data.length != expectLength) {
                        throw new Error(pow2.errors.INVALID_ITEM);
                    }

                    dataElement.attr('encoding', 'csv');
                    dataElement.text(layer.data.join(','));
                    layerElement.append(dataElement);
                } else if (typeof layer.objects !== 'undefined') {
                    layerElement = $('<objectgroup/>');
                    _.each(layer.objects, function (obj) {
                        var objectElement = $('<object/>');
                        pow2.tiled.writeITiledObjectBase(objectElement, obj);
                        pow2.tiled.writeTiledProperties(objectElement, obj.properties);
                        layerElement.append(objectElement);
                    });
                } else {
                    throw new Error(pow2.errors.INVALID_ITEM);
                }
                pow2.tiled.writeITiledLayerBase(layerElement, layer);
                root.append(layerElement);
            });
            return this.xmlHeader + pow2.tiled.xml2Str(root[0]);
        };

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
            var relativePath = this.url.substr(0, this.url.lastIndexOf('/') + 1);
            _.each(tileSets, function (ts) {
                var source = _this.getElAttribute(ts, 'source');
                var firstGid = parseInt(_this.getElAttribute(ts, 'firstgid') || "-1");
                if (source) {
                    tileSetDeps.push({
                        source: pow2.tiled.compactUrl(relativePath, source),
                        literal: source,
                        firstgid: firstGid
                    });
                } else {
                    tileSetDeps.push({
                        data: ts,
                        source: relativePath,
                        firstgid: firstGid
                    });
                }
            });

            var layers = this.getChildren(this.$map, 'layer,objectgroup');
            _.each(layers, function (layer) {
                var tileLayer = pow2.tiled.readITiledLayerBase(layer);
                _this.layers.push(tileLayer);

                var data = _this.getChild(layer, 'data');
                if (data) {
                    var encoding = _this.getElAttribute(data, 'encoding');
                    if (!encoding || encoding.toLowerCase() !== 'csv') {
                        _this.failed("Pow2 only supports CSV maps.  Edit the Map Properties (for:" + _this.url + ") in Tiled to use the CSV option when saving.");
                    }
                    tileLayer.data = JSON.parse('[' + $.trim(data.text()) + ']');
                }

                var color = _this.getElAttribute(layer, 'color');
                if (color) {
                    tileLayer.color = color;
                }

                var objects = _this.getChildren(layer, 'object');
                if (objects) {
                    tileLayer.objects = [];
                    _.each(objects, function (object) {
                        tileLayer.objects.push(pow2.tiled.readITiledObject(object));
                    });
                }
            });

            var _next = function () {
                if (tileSetDeps.length <= 0) {
                    return _this.ready();
                }
                var dep = tileSetDeps.shift();
                if (dep.data) {
                    var tsr = _this.loader.create(pow2.TiledTSXResource, dep.data);
                    tsr.relativeTo = relativePath;
                    tsr.once(pow2.Resource.READY, function () {
                        _this.tilesets[tsr.name] = tsr;
                        tsr.firstgid = dep.firstgid;
                        _next();
                    });
                    tsr.once(pow2.Resource.FAILED, function (error) {
                        _this.failed(error);
                    });
                    tsr.prepare(dep.data);
                } else if (dep.source) {
                    _this.loader.load(dep.source, function (tsr) {
                        _this.tilesets[tsr.name] = tsr;
                        tsr.firstgid = dep.firstgid;
                        tsr.literal = dep.literal;
                        _next();
                    });
                } else {
                    throw new Error("Unknown type of tile set data");
                }
            };
            _next();
        };
        return TiledTMXResource;
    })(pow2.XMLResource);
    pow2.TiledTMXResource = TiledTMXResource;
})(pow2 || (pow2 = {}));
//# sourceMappingURL=pow-core.js.map
