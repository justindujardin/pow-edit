/// <reference path="../../../types/underscore/underscore.d.ts" />
/// <reference path="../../../types/backbone/backbone.d.ts" />
/// <reference path="../../../types/jquery/jquery.d.ts" />
declare module pow2 {
    interface IGameItem {
        name: string;
        cost: number;
        icon: string;
        usedBy?: any[];
    }
    interface IGameWeapon extends IGameItem {
        attack: number;
        hit: number;
    }
    interface IGameArmor extends IGameItem {
        defense: number;
        evade: number;
    }
    interface ISpriteMeta {
        width: number;
        height: number;
        cellWidth?: number;
        cellHeight?: number;
        frames: number;
        source: string;
        x: number;
        y: number;
    }
    var data: {
        maps: {};
        sprites: {};
        items: {};
        creatures: any[];
        weapons: any[];
        armor: any[];
    };
    function registerData(key: string, value: any): void;
    function getData(key: string): any;
    function registerMap(name: string, value: Object): void;
    function describeSprites(value: Object): void;
    function registerSprites(name: string, value: Object): void;
    function getSpriteMeta(name: string): ISpriteMeta;
    function registerCreatures(level: any, creatures: any): void;
    function registerWeapons(level: any, weapons: IGameWeapon[]): void;
    function registerArmor(level: any, items: IGameArmor[]): void;
    function getMap(name: string): any;
    function getMaps(): {};
}
declare module pow2 {
    interface IEvents {
        on? (eventName: any, callback?: Function, context?: any): any;
        off? (eventName?: string, callback?: Function, context?: any): any;
        trigger? (eventName: string, ...args: any[]): any;
        bind? (eventName: string, callback: Function, context?: any): any;
        unbind? (eventName?: string, callback?: Function, context?: any): any;
        once? (events: string, callback: Function, context?: any): any;
        listenTo? (object: any, events: string, callback: Function): any;
        listenToOnce? (object: any, events: string, callback: Function): any;
        stopListening? (object?: any, events?: string, callback?: Function): any;
    }
    class Events implements IEvents {
        constructor();
        public on(eventName: any, callback?: Function, context?: any): any;
        public off(eventName?: string, callback?: Function, context?: any): any;
        public trigger(eventName: string, ...args: any[]): any;
        public bind(eventName: string, callback: Function, context?: any): any;
        public unbind(eventName?: string, callback?: Function, context?: any): any;
        public once(events: string, callback: Function, context?: any): any;
        public listenTo(object: any, events: string, callback: Function): any;
        public listenToOnce(object: any, events: string, callback: Function): any;
        public stopListening(object?: any, events?: string, callback?: Function): any;
    }
}
declare module pow2 {
    class Animator {
        public interpFrame: number;
        public animElapsed: number;
        public animDuration: number;
        public frames: number[];
        public sourceMeta: any;
        public sourceAnims: any;
        public setAnimationSource(spriteName: string): void;
        public setAnimation(name: string): void;
        public updateTime(elapsedMs: number): void;
        public interpolate(from: number, to: number, factor: number): number;
        public getFrame(): number;
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
        public copy(from: Point): Point;
        public truncate(): Point;
        public round(): Point;
        public add(x: number, y: number): Point;
        public add(value: number): Point;
        public add(point: Point): Point;
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
        public magnitude(): number;
        public magnitudeSquared(): number;
        public normalize(): Point;
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
        constructor(rect: IRect);
        constructor(point: Point, extent: Point);
        constructor(x: number, y: number, width: number, height: number);
        public toString(): string;
        public set(rect: IRect): Rect;
        public set(point: Point, extent: Point): Rect;
        public set(x: number, y: number, width: number, height: number): any;
        public clone(): Rect;
        public clamp(rect: IRect): Rect;
        public clip(clipRect: IRect): Rect;
        public isValid(): boolean;
        public intersect(clipRect: IRect): boolean;
        public pointInRect(point: Point): boolean;
        public pointInRect(x: number, y: number): boolean;
        public getCenter(): Point;
        public setCenter(point: Point): Rect;
        public setCenter(x: number, y: number): Rect;
        public scale(value: number): Rect;
        public round(): Rect;
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
    interface IProcessObject {
        id: number;
        tick? (elapsed: number): any;
        processFrame? (elapsed: number): any;
    }
    class Time {
        public autoStart: boolean;
        public tickRateMS: number;
        public mspf: number;
        public world: any;
        public lastTime: number;
        public time: number;
        public running: boolean;
        public objects: IProcessObject[];
        constructor(options: Object);
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
    interface IResource {
        url: string;
        data: any;
        extension: string;
        load(): any;
        isReady(): boolean;
        ready(): any;
        failed(error: any): any;
    }
    class Resource extends Backbone.Model implements IResource {
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
    class AudioResource extends Resource {
        public data: HTMLAudioElement;
        static types: Object;
        public load(): void;
    }
}
declare module pow2 {
    class ImageResource extends Resource {
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
        public data: JQuery;
        public load(): void;
        public prepare(data: any): void;
        public getElTag(el: JQuery): string;
        public getRootNode(tag: string): JQuery;
        public getChildren(el: JQuery, tag: string): JQuery[];
        public getChild(el: JQuery, tag: string): JQuery;
        public getElAttribute(el: JQuery, name: string): string;
    }
}
declare module pow2.tiled {
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
    }
    interface ITiledObject extends ITiledBase {
        properties?: any;
        rotation?: number;
        type?: string;
        gid?: number;
    }
    interface ITiledObjectGroup extends ITiledLayerBase {
        color: string;
        objects: ITiledObject[];
    }
    function readITiledBase(el: JQuery): ITiledBase;
    function readITiledLayerBase(el: JQuery): ITiledLayerBase;
    function readTiledProperties(el: JQuery): {};
    function getChildren(el: JQuery, tag: string): JQuery[];
    function getChild(el: JQuery, tag: string): JQuery;
    function getElAttribute(el: JQuery, name: string): string;
}
declare module pow2 {
    interface ITileMeta {
        image: ImageResource;
        x: number;
        y: number;
        width: number;
        height: number;
        data?: any;
    }
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
        public firstgid: number;
        public tiles: any[];
        public prepare(data: any): void;
        public hasGid(gid: number): boolean;
        public getTileMeta(gidOrIndex: number): ITileMeta;
    }
}
declare module pow2 {
    class TiledTMXResource extends XMLResource {
        public $map: JQuery;
        public width: number;
        public height: number;
        public orientation: string;
        public tileheight: number;
        public tilewidth: number;
        public version: number;
        public properties: any;
        public tilesets: any;
        public layers: any[];
        public objectGroups: any[];
        public prepare(data: any): void;
    }
}
declare module pow2 {
    class ResourceLoader implements IWorldObject, IProcessObject {
        private _cache;
        private _types;
        private _doneQueue;
        public id: number;
        public world: IWorld;
        constructor();
        public onAddToWorld(world: any): void;
        public onRemoveFromWorld(world: any): void;
        public tick(elapsed: number): void;
        public processFrame(elapsed: number): void;
        public ensureType(extension: string, type: Function): void;
        public getResourceExtension(url: string): string;
        public create(typeConstructor: any, data: any): IResource;
        public load(sources: string[], done?: Function): Resource[];
        public load(source: string, done?: Function): Resource;
    }
}
declare module pow2 {
    class SpriteRender implements IWorldObject {
        static SIZE: number;
        public canvas: HTMLCanvasElement;
        public context: CanvasRenderingContext2D;
        public world: IWorld;
        public onAddToWorld(world: IWorld): void;
        public onRemoveFromWorld(world: IWorld): void;
        constructor();
        public sizeCanvas(width: number, height: number): void;
        public getSpriteSheet(name: string, done?: Function): ImageResource;
        public getSingleSprite(spriteName: string, frame?: number, done?: Function): ImageResource;
        public getSpriteRect(name: string, frame?: number): Rect;
        public getSpriteMeta(name: string): ISpriteMeta;
    }
}
declare module pow2 {
    interface IState {
        name: string;
        enter(machine: IStateMachine): any;
        exit(machine: IStateMachine): any;
        update(machine: IStateMachine): any;
    }
    interface IStateTransition {
        targetState: string;
        evaluate(machine: IStateMachine): boolean;
    }
    class State implements IState {
        public name: string;
        public transitions: IStateTransition[];
        public enter(machine: IStateMachine): void;
        public exit(machine: IStateMachine): void;
        public update(machine: IStateMachine): void;
    }
    class StateTransition implements IStateTransition {
        public targetState: string;
        public evaluate(machine: IStateMachine): boolean;
    }
}
declare module pow2 {
    interface IStateMachine extends IEvents {
        paused: boolean;
        update(data: any): any;
        addState(state: IState): any;
        addStates(states: IState[]): any;
        getCurrentState(): IState;
        getCurrentName(): string;
        setCurrentState(name: string): boolean;
        setCurrentState(state: IState): boolean;
        setCurrentState(newState: any): boolean;
        getPreviousState(): IState;
        getState(name: string): IState;
    }
    class StateMachine extends Events implements IStateMachine {
        public defaultState: string;
        public states: IState[];
        private _currentState;
        private _previousState;
        private _newState;
        public paused: boolean;
        public update(data: any): void;
        public addState(state: IState): void;
        public addStates(states: IState[]): void;
        public getCurrentState(): IState;
        public getCurrentName(): string;
        public setCurrentState(state: IState): boolean;
        public setCurrentState(state: string): boolean;
        public getPreviousState(): IState;
        public getState(name: string): IState;
    }
    class TickedStateMachine extends StateMachine implements IWorldObject {
        public world: IWorld;
        public onAddToWorld(world: any): void;
        public onRemoveFromWorld(world: any): void;
        public tick(elapsed: number): void;
    }
}
declare module pow2 {
    interface IWorld {
        loader: ResourceLoader;
        time: Time;
        scene: any;
        input: Input;
        sprites: SpriteRender;
        state: IStateMachine;
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
        public scene: any;
        public input: Input;
        public sprites: SpriteRender;
        public state: IStateMachine;
        constructor(services: any);
        public setService(name: string, value: IWorldObject): IWorldObject;
        public mark(object: IWorldObject): void;
        public erase(object: IWorldObject): void;
    }
}
declare module pow2 {
    interface ISceneComponent extends IObject, IEvents {
        host: SceneObject;
        connectComponent(): boolean;
        disconnectComponent(): boolean;
        syncComponent(): boolean;
    }
    class SceneComponent extends Events implements ISceneComponent {
        public name: string;
        public id: number;
        public scene: Scene;
        public host: SceneObject;
        constructor(name?: string);
        public connectComponent(): boolean;
        public disconnectComponent(): boolean;
        public syncComponent(): boolean;
    }
    class TickedComponent extends SceneComponent {
        public tickRateMS: number;
        public tick(elapsed: number): void;
        public interpolateTick(elapsed: number): void;
    }
}
declare module pow2 {
    interface IObject {
        id: number;
        name: string;
    }
    interface ISceneComponentHost extends IObject {
        addComponent(component: ISceneComponent, silent?: boolean): boolean;
        addComponentDictionary(components: any, silent?: boolean): boolean;
        removeComponent(component: ISceneComponent, silent?: boolean): boolean;
        removeComponentDictionary(components: any, silent?: boolean): boolean;
        syncComponents(): any;
        findComponent(type: Function): ISceneComponent;
        findComponents(type: Function): ISceneComponent[];
    }
    class SceneObject extends Events implements ISceneComponentHost {
        public id: number;
        public name: string;
        public scene: Scene;
        public world: IWorld;
        public enabled: boolean;
        public point: Point;
        public size: Point;
        public renderPoint: Point;
        public _components: ISceneComponent[];
        constructor(options?: any);
        public tick(elapsed: number): void;
        public interpolateTick(elapsed: number): void;
        public destroy(): void;
        public findComponent(type: Function): ISceneComponent;
        public findComponents(type: Function): ISceneComponent[];
        public syncComponents(): void;
        public addComponent(component: ISceneComponent, silent?: boolean): boolean;
        public addComponentDictionary(components: any, silent?: boolean): boolean;
        public removeComponentDictionary(components: any, silent?: boolean): boolean;
        public removeComponentByType(componentType: any, silent?: boolean): boolean;
        public removeComponent(component: ISceneComponent, silent?: boolean): boolean;
    }
}
declare module pow2 {
    class SceneSpatialDatabase {
        private _objects;
        private _pointRect;
        constructor();
        public addSpatialObject(obj: SceneObject): void;
        public removeSpatialObject(obj: SceneObject): void;
        public queryPoint(point: Point, type: any, results: SceneObject[]): boolean;
        public queryRect(rect: Rect, type: any, results: SceneObject[]): boolean;
        public pointInRect(rect: Rect, point: Point): boolean;
    }
}
declare module pow2 {
    class Scene extends Events implements IProcessObject, IWorldObject {
        public id: number;
        public name: string;
        public db: SceneSpatialDatabase;
        public options: any;
        private _objects;
        private _views;
        public world: IWorld;
        public fps: number;
        public time: number;
        public paused: boolean;
        constructor(options?: any);
        public destroy(): void;
        public onAddToWorld(world: IWorld): void;
        public onRemoveFromWorld(world: IWorld): void;
        public tick(elapsed: number): void;
        public processFrame(elapsed: number): void;
        public removeIt(property: string, object: any): void;
        public addIt(property: string, object: any): void;
        public findIt(property: string, object: any): {}[];
        public addView(view: any): void;
        public removeView(view: any): void;
        public findView(view: any): {}[];
        public addObject(object: any): void;
        public removeObject(object: SceneObject, destroy?: boolean): void;
        public findObject(object: any): {}[];
        public componentByType(type: any): ISceneComponent;
        public componentsByType(type: any): ISceneComponent[];
        public objectsByName(name: string): SceneObject[];
        public objectByName(name: string): SceneObject;
        public objectsByType(type: any): SceneObject[];
        public objectByType(type: any): SceneObject;
        public objectsByComponent(type: any): SceneObject[];
        public objectByComponent(type: any): SceneObject;
    }
}
declare module pow2 {
    class CameraComponent extends SceneComponent {
        public process(view: SceneView): void;
    }
}
declare module pow2 {
    class SceneView extends SceneObject implements IWorldObject {
        static UNIT: number;
        public animations: any[];
        public $el: JQuery;
        public canvas: HTMLCanvasElement;
        public context: CanvasRenderingContext2D;
        public camera: Rect;
        public cameraComponent: CameraComponent;
        public cameraScale: number;
        public unitSize: number;
        public _sheets: any;
        public scene: Scene;
        public loader: ResourceLoader;
        public world: IWorld;
        constructor(canvas: HTMLCanvasElement, loader: any);
        public onAddToWorld(world: IWorld): void;
        public onRemoveFromWorld(world: IWorld): void;
        public setScene(scene: Scene): void;
        public renderToCanvas(width: any, height: any, renderFunction: any): HTMLCanvasElement;
        public renderFrame(elapsed: number): void;
        public renderPost(): void;
        public setRenderState(): void;
        public restoreRenderState(): boolean;
        public render(): void;
        public _render(elapsed: number): void;
        public debugRender(debugStrings?: string[]): void;
        public getSpriteSheet(name: string, done?: any): any;
        public processCamera(): void;
        public clearRect(): void;
        public worldToScreen(value: Point, scale?: any): Point;
        public worldToScreen(value: Rect, scale?: any): Rect;
        public worldToScreen(value: number, scale?: any): number;
        public screenToWorld(value: Point, scale?: any): Point;
        public screenToWorld(value: Rect, scale?: any): Rect;
        public screenToWorld(value: number, scale?: any): number;
        public renderAnimations(): any[];
        public playAnimation(tickRate: any, animFn: any): number;
    }
}
declare module pow2 {
    enum KeyCode {
        UP = 38,
        DOWN = 40,
        LEFT = 37,
        RIGHT = 39,
        BACKSPACE = 8,
        COMMA = 188,
        DELETE = 46,
        END = 35,
        ENTER = 13,
        ESCAPE = 27,
        HOME = 36,
        SPACE = 32,
        TAB = 9,
    }
    interface CanvasMouseCoords {
        point: Point;
        world: Point;
    }
    interface NamedMouseElement extends CanvasMouseCoords {
        name: string;
        view: SceneView;
    }
    class Input {
        public _keysDown: Object;
        public _mouseElements: NamedMouseElement[];
        static mouseOnView(ev: MouseEvent, view: SceneView, coords?: CanvasMouseCoords): CanvasMouseCoords;
        constructor();
        public mouseHook(view: SceneView, name: string): NamedMouseElement;
        public mouseUnhook(name: string): any;
        public mouseUnhook(view: SceneView): any;
        public getMouseHook(name: string): NamedMouseElement;
        public getMouseHook(view: SceneView): NamedMouseElement;
        public keyDown(key: number): boolean;
    }
}
declare module pow2 {
    class SceneObjectRenderer {
        public render(object: SceneObject, data: any, view: SceneView): void;
    }
}
declare module pow2 {
    class CollisionComponent extends SceneComponent {
        public collideBox: Rect;
        public resultsArray: any[];
        public collide(x: number, y: number, type?: Function, results?: any[]): boolean;
        public collideFirst(x: number, y: number, type?: Function): SceneObject;
    }
}
declare module pow2 {
    class MovableComponent extends TickedComponent {
        public _elapsed: number;
        public targetPoint: Point;
        public path: Point[];
        public tickRateMS: number;
        public velocity: Point;
        public workPoint: Point;
        public host: SceneObject;
        public collider: CollisionComponent;
        public moveFilter: (from: Point, to: Point) => void;
        public connectComponent(): boolean;
        public syncComponent(): boolean;
        public beginMove(from: Point, to: Point): void;
        public endMove(from: Point, to: Point): void;
        public collideMove(x: number, y: number, results?: SceneObject[]): boolean;
        public setMoveFilter(filter: (from: Point, to: Point) => void): void;
        public clearMoveFilter(): void;
        public updateVelocity(): void;
        public interpolateTick(elapsed: number): void;
        public tick(elapsed: number): void;
    }
}
declare module pow2 {
    interface SoundComponentOptions {
        url: string;
        loop?: boolean;
        volume?: number;
    }
    class SoundComponent extends SceneComponent implements SoundComponentOptions {
        public url: string;
        public volume: number;
        public loop: boolean;
        public audio: AudioResource;
        constructor(options?: SoundComponentOptions);
        public disconnectComponent(): boolean;
        public connectComponent(): boolean;
    }
}
declare module pow2 {
    class StateMachineComponent extends TickedComponent {
        public machine: IStateMachine;
        public paused: boolean;
        public tick(elapsed: number): void;
    }
}
