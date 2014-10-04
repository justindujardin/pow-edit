/// <reference path="../types/underscore.d.ts" />
declare module pow2.errors {
    var INVALID_ARGUMENTS: string;
    var DIVIDE_ZERO: string;
    var CLASS_NOT_IMPLEMENTED: string;
    var REQUIRED_ARGUMENT: string;
    var ALREADY_EXISTS: string;
    var INDEX_OUT_OF_RANGE: string;
    var INVALID_ITEM: string;
}
declare module pow2 {
    function getWorld<T>(name: string): T;
    function registerWorld(name: string, instance: any): any;
    function unregisterWorld(name: string): any;
}
declare module pow2 {
    interface IEvents {
        on(name: any, callback?: Function, context?: any): IEvents;
        off(name?: string, callback?: Function, context?: any): IEvents;
        once(events: string, callback: Function, context?: any): IEvents;
        trigger(name: string, ...args: any[]): IEvents;
    }
    class Events implements IEvents {
        private _events;
        public on(name: any, callback?: Function, context?: any): IEvents;
        public once(name: any, callback?: Function, context?: any): IEvents;
        public off(name?: any, callback?: Function, context?: any): IEvents;
        public trigger(name: string, ...args: any[]): IEvents;
    }
}
declare module pow2 {
    interface IResource {
        url: string;
        data: any;
        extension: string;
        load(): any;
        isReady(): boolean;
        ready(): any;
        failed(error: any): any;
    }
    class Resource extends Events implements IResource {
        static READY: string;
        static FAILED: string;
        public url: string;
        public data: any;
        public extension: string;
        public loader: ResourceLoader;
        private _ready;
        constructor(url: string, data?: any);
        public load(): void;
        public setLoader(loader: ResourceLoader): void;
        public isReady(): boolean;
        public ready(): void;
        public failed(error: any): void;
    }
}
declare module pow2 {
    class Point {
        public x: number;
        public y: number;
        constructor();
        constructor(point: Point);
        constructor(x: number, y: number);
        constructor(x: string, y: string);
        public toString(): string;
        public set(point: Point): Point;
        public set(x: number, y: number): Point;
        public clone(): Point;
        public floor(): Point;
        public round(): Point;
        public add(x: number, y: number): Point;
        public add(value: number): Point;
        public add(point: Point): Point;
        public subtract(x: number, y: number): Point;
        public subtract(value: number): Point;
        public subtract(point: Point): Point;
        public multiply(x: number, y: number): Point;
        public multiply(value: number): Point;
        public multiply(point: Point): Point;
        public divide(x: number, y: number): Point;
        public divide(value: number): Point;
        public divide(point: Point): Point;
        public inverse(): Point;
        public equal(point: Point): boolean;
        public isZero(): boolean;
        public zero(): Point;
        public interpolate(from: Point, to: Point, factor: number): Point;
    }
}
declare module pow2 {
    interface IRect {
        point: Point;
        extent: Point;
    }
    class Rect implements IRect {
        public point: Point;
        public extent: Point;
        constructor();
        constructor(rect: IRect);
        constructor(point: Point, extent: Point);
        constructor(x: number, y: number, width: number, height: number);
        public toString(): string;
        public set(rect: IRect): Rect;
        public set(point: Point, extent: Point): Rect;
        public set(x: number, y: number, width: number, height: number): any;
        public clone(): Rect;
        public clip(clipRect: IRect): Rect;
        public isValid(): boolean;
        public intersect(clipRect: IRect): boolean;
        public pointInRect(point: Point): boolean;
        public pointInRect(x: number, y: number): boolean;
        public getCenter(): Point;
        public setCenter(point: Point): Rect;
        public setCenter(x: number, y: number): Rect;
        public getLeft(): number;
        public getTop(): number;
        public getRight(): number;
        public getBottom(): number;
        public getHalfSize(): Point;
        public addPoint(value: Point): void;
        public inflate(x?: number, y?: number): Rect;
    }
}
declare module pow2 {
    class AudioResource extends Resource {
        public data: HTMLAudioElement;
        static types: Object;
        public load(): void;
    }
}
declare module pow2 {
    class ImageResource extends Resource {
        public data: HTMLImageElement;
        public load(): void;
    }
}
declare module pow2 {
    class JSONResource extends Resource {
        public load(): void;
    }
}
declare module pow2 {
    class ScriptResource extends Resource {
        public load(): void;
    }
}
declare module pow2 {
    class XMLResource extends Resource {
        public data: any;
        public load(): void;
        public prepare(data: any): void;
        public getRootNode(tag: string): any;
        public getChildren<T>(el: any, tag: string): T[];
        public getChild<T>(el: any, tag: string): T;
        public getElAttribute(el: any, name: string): any;
    }
}
declare module pow2 {
    interface IProcessObject {
        _uid?: string;
        tick? (elapsed: number): any;
        processFrame? (elapsed: number): any;
    }
    class Time {
        public tickRateMS: number;
        public mspf: number;
        public world: any;
        public lastTime: number;
        public time: number;
        public running: boolean;
        public objects: IProcessObject[];
        constructor();
        static get(): Time;
        public start(): void;
        public stop(): void;
        public removeObject(object: IProcessObject): void;
        public addObject(object: IProcessObject): void;
        public tickObjects(elapsedMS: number): void;
        public processFrame(elapsedMS: number): void;
        public polyFillAnimationFrames(): void;
    }
}
declare module pow2 {
    interface IWorld {
        loader: ResourceLoader;
        time: Time;
        mark(object: IWorldObject): any;
        erase(object: IWorldObject): any;
        setService(name: string, value: IWorldObject): IWorldObject;
    }
    interface IWorldObject {
        world: IWorld;
        onAddToWorld? (world: IWorld): any;
        onRemoveFromWorld? (world: IWorld): any;
    }
    class World implements IWorld {
        public loader: ResourceLoader;
        public time: Time;
        constructor(services?: any);
        public setService(name: string, value: IWorldObject): IWorldObject;
        public mark(object: IWorldObject): void;
        public erase(object: IWorldObject): void;
    }
}
declare module pow2 {
    class ResourceLoader implements IWorldObject, IProcessObject {
        private _cache;
        private _types;
        private _doneQueue;
        public _uid: string;
        public world: IWorld;
        constructor();
        static get(): ResourceLoader;
        public onAddToWorld(world: any): void;
        public onRemoveFromWorld(world: any): void;
        public tick(elapsed: number): void;
        public processFrame(elapsed: number): void;
        public registerType(extension: string, type: Function): void;
        public getResourceExtension(url: string): string;
        public create<T extends IResource>(typeConstructor: any, data: any): T;
        public loadAsType(source: string, resourceType: any, done?: (res?: IResource) => any): IResource;
        public load(sources: string[], done?: (res?: IResource) => any): Resource[];
        public load(source: string, done?: (res?: IResource) => any): Resource;
    }
}
declare module pow2.tiled {
    interface ITileInstanceMeta {
        image: HTMLImageElement;
        url: string;
        x: number;
        y: number;
        width: number;
        height: number;
        data?: any;
    }
    interface ITiledBase {
        name: string;
        x: number;
        y: number;
        width: number;
        height: number;
        visible: boolean;
    }
    interface ITiledLayerBase extends ITiledBase {
        opacity: number;
        properties?: any;
    }
    interface ITiledLayer extends ITiledLayerBase {
        data?: any;
        color?: string;
        objects?: ITiledObject[];
    }
    interface ITiledObject extends ITiledBase {
        properties?: any;
        rotation?: number;
        type?: string;
        gid?: number;
        color?: string;
    }
    interface ITileSetDependency {
        source?: string;
        data?: any;
        firstgid: number;
        literal?: string;
    }
    function readITiledBase(el: any): ITiledBase;
    function writeITiledBase(el: any, data: ITiledObject): void;
    function writeITiledObjectBase(el: any, data: ITiledObject): void;
    function readITiledObject(el: any): ITiledObject;
    function readITiledLayerBase(el: any): ITiledLayerBase;
    function compactUrl(base: string, relative: string): string;
    function xml2Str(xmlNode: any): any;
    function writeITiledLayerBase(el: any, data: ITiledLayerBase): void;
    function readTiledProperties(el: any): {};
    function writeTiledProperties(el: any, data: any): void;
    function getChildren(el: any, tag: string): any[];
    function getChild(el: any, tag: string): any;
    function setElAttribute(el: any, name: string, value: any): void;
    function getElAttribute(el: any, name: string): string;
}
declare module pow2 {
    class TilesetTile {
        public id: number;
        public properties: any;
        constructor(id: number);
    }
    class TiledTSXResource extends XMLResource {
        public name: string;
        public tilewidth: number;
        public tileheight: number;
        public imageWidth: number;
        public imageHeight: number;
        public image: ImageResource;
        public url: string;
        public firstgid: number;
        public tiles: any[];
        public relativeTo: string;
        public imageUrl: string;
        public literal: string;
        public prepare(data: any): void;
        public hasGid(gid: number): boolean;
        public getTileMeta(gidOrIndex: number): tiled.ITileInstanceMeta;
    }
}
declare module pow2 {
    class TiledTMXResource extends XMLResource {
        public $map: any;
        public width: number;
        public height: number;
        public orientation: string;
        public tileheight: number;
        public tilewidth: number;
        public version: number;
        public properties: any;
        public tilesets: any;
        public layers: tiled.ITiledLayer[];
        public xmlHeader: string;
        public write(): any;
        public prepare(data: any): void;
    }
}
