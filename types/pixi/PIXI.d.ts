// Type definitions for PIXI 1.5.0
// Project: https://github.com/GoodBoyDigital/pixi.js/
// Definitions by: xperiments <http://github.com/xperiments>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module PIXI {

    /* CONSTANTS */
    var WEBGL_RENDERER: number;
    var CANVAS_RENDERER: number;
    var VERSION: string;

    enum blendModes {
        NORMAL,
        ADD,
        MULTIPLY,
        SCREEN,
        OVERLAY,
        DARKEN,
        LIGHTEN,
        COLOR_DODGE,
        COLOR_BURN,
        HARD_LIGHT,
        SOFT_LIGHT,
        DIFFERENCE,
        EXCLUSION,
        HUE,
        SATURATION,
        COLOR,
        LUMINOSITY,
    }

    var INTERACTION_REQUENCY: number;
    var AUTO_PREVENT_DEFAULT: boolean;
    var RAD_TO_DEG: number;
    var DEG_TO_RAD: number;

    /* MODULE FUNCTIONS */
    function autoDetectRenderer(width: number, height: number, view?: HTMLCanvasElement, transparent?, antialias?): IPixiRenderer;
    function AjaxRequest(): XMLHttpRequest;

    /*INTERFACES*/
    interface IBasicCallback {
        (): void
    }

    interface IEventCallback {
        (e?: IEvent): void
    }

    interface IEvent {
        type: string;
        content: any;
    }

    interface IHitArea {
        contains(x: number, y: number): boolean;
    }

    interface IInteractionDataCallback {
        (interactionData: InteractionData): void
    }

    interface IPixiRenderer {
        type: number;
        transparent: boolean;
        width: number;
        height: number;
        view: HTMLCanvasElement;

        render(stage: Stage): void;
        resize(width: number, height: number): void;
    }

    interface IBitmapTextStyle {
        font?: string;
        align?: string;
        tint?: string;
    }

    interface ITextStyle {
        font?: string;
        stroke?: string;
        fill?: string;
        align?: string;
        strokeThickness?: number;
        wordWrap?: boolean;
        wordWrapWidth?: number;
    }

    interface IUniform {
        type: string;
        value: any;
    }

    interface ILoader {
        constructor(url: string, crossorigin: boolean);
        load();
    }

    interface ITintMethod {
        (texture: Texture, color: number, canvas: HTMLCanvasElement): void;
    }

    interface IMaskData {
        alpha: number;
        worldTransform: number[];
    }

    interface IRenderSession // unclear; Taken from DisplayObjectContainer:152
    {
        context: CanvasRenderingContext2D;
        maskManager: CanvasMaskManager;
        scaleMode: scaleModes;
        smoothProperty: string;
    }

    interface IShaderAttribute {
        // TODO: Find signature of shader attributes
    }

    interface IFilterBlock {
        // TODO: Find signature of filterBlock
    }

    /* CLASSES */

    class AbstractFilter {
        passes: AbstractFilter[];
        shaders: PixiShader[];
        dirty: boolean;
        padding: number;
        uniforms: { [name: string]: IUniform };
        fragmentSrc: any[];
    }

    class AlphaMaskFilter extends AbstractFilter {
        map: Texture;

        constructor(texture: Texture);
        onTextureLoaded(): void;
    }

    class AssetLoader extends EventTarget {
        assetURLs: string[];
        crossorigin: boolean;
        loadersByType: { [key: string]: ILoader };

        constructor(assetURLs: string[], crossorigin: boolean);
        load(): void;
        onComplete(): void;
    }

    class AtlasLoader extends EventTarget {
        url: string;
        baseUrl: string;
        crossorigin: boolean;
        loaded: boolean;

        constructor(url: string, crossorigin: boolean);
        load(): void;
    }

    class BaseTexture extends EventTarget {
        height: number;
        width: number;
        source: HTMLImageElement;
        scaleMode: scaleModes;
        hasLoaded: boolean;

        constructor(source: HTMLImageElement, scaleMode: scaleModes);
        constructor(source: HTMLCanvasElement, scaleMode: scaleModes);
        destroy(): void;
        updateSourceImage(newSrc: string): void;

        static fromImage(imageUrl: string, crossorigin: boolean, scaleMode: scaleModes): BaseTexture;
        static fromCanvas(canvas: HTMLCanvasElement, scaleMode: scaleModes): BaseTexture;
    }

    class BitmapFontLoader extends EventTarget {
        baseUrl: string;
        crossorigin: boolean;
        texture: Texture;
        url: string;

        constructor(url: string, crossorigin: boolean);
        load(): void;
    }

    class BitmapText extends DisplayObjectContainer {
        width: number;
        height: number;
        fontName: string;
        fontSize: number;
        tint: string;

        constructor(text: string, style: IBitmapTextStyle);
        setText(text: string): void;
        setStyle(style: IBitmapTextStyle): void;
    }

    class BlurFilter extends AbstractFilter {
        blur: number;
        blurX: number;
        blurY: number;
    }

    class CanvasMaskManager {
        pushMask(maskData: IMaskData, context: CanvasRenderingContext2D): void;
        popMask(context: CanvasRenderingContext2D): void;
    }

    class CanvasRenderer implements IPixiRenderer {
        type: number;
        clearBeforeRender: boolean;
        roundPixels: boolean;
        transparent: boolean;
        width: number;
        height: number;
        view: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
        refresh: boolean;
        count: number;
        maskManager: CanvasMaskManager;
        renderSession: IRenderSession;

        constructor(width: number, height: number, view?: HTMLCanvasElement, transparent?: boolean);
        render(stage: Stage): void;
        resize(width: number, height: number): void;
    }

    class CanvasTinter {
        canvas: HTMLCanvasElement;

        getTintedTexture(sprite: Sprite, color: number): HTMLCanvasElement;
        tintWithMultiply(texture: Texture, color: number, canvas: HTMLCanvasElement): void;
        tintWithOverlay(texture: Texture, color: number, canvas: HTMLCanvasElement): void;
        tintWithPerPixel(texture: Texture, color: number, canvas: HTMLCanvasElement): void;

        static cacheStepsPerColorChannel: number;
        static convertTintToImage: boolean;
        static canUseMultiply: boolean;
        static tintMethod: ITintMethod;

        static roundColor(color: number): number;
    }

    class Circle implements IHitArea {
        x: number;
        y: number;
        radius: number;

        constructor(x: number, y: number, radius: number);
        clone(): Circle;
        contains(x: number, y: number): boolean;
    }

    class ColorMatrixFilter extends AbstractFilter {
        matrix: number[];
    }

    class ColorStepFilter extends AbstractFilter {
        step: number;
    }

    class DisplacementFilter extends AbstractFilter {
        map: Texture;
        offset: Point;
        scale: Point;

        constructor(texture: Texture);
    }

    class DisplayObject {
        alpha: number;
        buttonMode: boolean;
        defaultCursor: string;
        filterArea: Rectangle;
        filters: AbstractFilter[];
        hitArea: IHitArea;
        interactive: boolean;
        mask: Graphics;
        parent: DisplayObjectContainer;
        pivot: Point;
        position: Point;
        renderable: boolean;
        rotation: number;
        scale: Point;
        stage: Stage;
        visible: boolean;
        worldAlpha: number;
        worldVisible: boolean;
        x: number;
        y: number;

        click(e: InteractionData): void;
        getBounds(): Rectangle;
        getLocalBounds(): Rectangle;
        mousedown(e: InteractionData): void;
        mouseout(e: InteractionData): void;
        mouseover(e: InteractionData): void;
        mouseup(e: InteractionData): void;
        mouseupoutside(e: InteractionData): void;
        setStateReference(stage: Stage): void;
        tap(e: InteractionData): void;
        touchend(e: InteractionData): void;
        touchendoutside(e: InteractionData): void;
        touchstart(e: InteractionData): void;
        touchmove(e: InteractionData): void;
    }

    class DisplayObjectContainer extends DisplayObject {
        height: number;
        width: number;
        children: DisplayObject[];
        constructor();
        addChild(child: DisplayObject): void;
        addChildAt(child: DisplayObject, index: number): void;
        getChildAt(index: number): DisplayObject;
        removeChild(child: DisplayObject): DisplayObject;
        removeChildAt(index:number ): DisplayObject;
        removeStageReference(): void;
    }

    class Ellipse implements IHitArea {
        x: number;
        y: number;
        width: number;
        height: number;

        constructor(x: number, y: number, width: number, height: number);
        clone(): Ellipse;
        contains(x: number, y: number): boolean;
        getBounds(): Rectangle;
    }

    class EventTarget {
        listeners: { [key: string]: IEventCallback[] };

        addEventListener(type: string, listener: IEventCallback): void;
        dispatchEvent(event: IEvent): void;
        removeAllEventListeners(type: string): void;
        removeEventListener(type: string, listener: IEventCallback): void;
    }

    class FilterTexture {
        fragmentSrc: string[];
        gl: WebGLRenderingContext;
        program: WebGLProgram;

        constructor(gl: WebGLRenderingContext, width: number, height: number);
        clear(): void;
        resize(width: number, height: number): void;
        destroy(): void;
    }

    class Graphics extends DisplayObjectContainer {
        blendMode: blendModes;
        bounds: Rectangle;
        boundsPadding: number;
        fillAlpha: number;
        isMask: boolean;
        lineColor: string;
        lineWidth: number;
        tint: number;

        beginFill(color: number, alpha?: number): void;
        clear(): void;
        drawCircle(x: number, y: number, radius: number): void;
        drawEllipse(x: number, y: number, width: number, height: number): void;
        drawRect(x: number, y: number, width: number, height: number): void;
        endFill(): void;
        generateTexture(): Texture;
        getBounds(): Rectangle;
        lineStyle(lineWidth: number, color: number, alpha: number): void;
        lineTo(x: number, y: number): void;
        moveTo(x: number, y: number): void;
        updateBounds(): void;
    }

    class GrayFilter extends AbstractFilter {
        gray: number;
    }

    class ImageLoader extends EventTarget {
        texture: Texture;

        constructor(url: string, crossorigin?: boolean);
        load(): void;
        loadFramedSpriteSheet(frameWidth: number, frameHeight: number, textureName: string): void;
    }

    class InteractionData {
        global: Point;
        target: Sprite;
        originalEvent: Event;

        getLocalPosition(displayObject: DisplayObject): Point;
    }

    class InteractionManager {
        currentCursorStyle: string;
        mouse: InteractionData;
        mouseOut: boolean;
        mouseoverEnabled: boolean;
        pool: InteractionData[];
        stage: Stage;
        touchs: { [id: string]: InteractionData };

        constructor(stage: Stage);
    }

    class InvertFilter {
        invert: number;
    }

    class JsonLoader extends EventTarget {
        baseUrl: string;
        crossorigin: boolean;
        loaded: boolean;
        url: string;

        constructor(url: string, crossorigin?: boolean);
        load(): void;
    }

    class MovieClip extends Sprite {
        animationSpeed: number;
        currentFrame: number;
        loop: boolean;
        playing: boolean;
        textures: Texture[];
        totalFrames: number;

        constructor(textures: Texture[]);
        onComplete: IBasicCallback;
        gotoAndPlay(frameNumber: number): void;
        gotoAndStop(frameNumber: number): void;
        play(): void;
        stop(): void;
    }

    class NormalMapFilter extends AbstractFilter {
        map: Texture;
        offset: Point;
        scale: Point;
    }

    class PixelateFilter extends AbstractFilter {
        size: number;
    }

    class PixiFastShader {
        gl: WebGLRenderingContext;
        fragmentSrc: string[];
        program: WebGLProgram;
        textureCount: number;
        vertexSrc: string[];

        constructor(gl: WebGLRenderingContext);
        destroy(): void;
        init(): void;
    }

    class PixiShader {
        defaultVertexSrc: string;
        fragmentSrc: string[];
        gl: WebGLRenderingContext;
        program: WebGLProgram;
        textureCount: number;
        attributes: IShaderAttribute[];

        constructor(gl: WebGLRenderingContext);
        destroy(): void;
        init(): void;
        initSampler2D(): void;
        initUniforms(): void;
        syncUniforms(): void;
    }

    class Point {
        x: number;
        y: number;

        constructor(x?: number, y?: number);
        clone(): Point;
        set(x: number, y: number): void;
    }

    class Polygon implements IHitArea {
        points: Point[];

        constructor(points: Point[]);
        constructor(points: number[]);
        constructor(...points: Point[]);
        constructor(...points: number[]);

        clone(): Polygon;
        contains(x: number, y: number): boolean;
    }

    class Rectangle implements IHitArea {
        x: number;
        y: number;
        width: number;
        height: number;

        constructor(x?: number, y?: number, width?: number, height?: number);
        clone(): Rectangle;
        contains(x: number, y: number): boolean;
    }

    class Rope {
        points: Point[];
        vertices: Float32Array;
        uvs: Float32Array;
        colors: Float32Array;
        indices: Uint16Array;

        constructor(texture: Texture, points: Point[]);
        refresh();
        setTexture(texture: Texture);
    }

    class scaleModes {
        public static DEFAULT: number;
        public static LINEAR: number;
        public static NEAREST: number;
    }

    class SepiaFilter {
        sepia: number;
    }

    class Spine {
        url: string;
        crossorigin: boolean;
        loaded: boolean;

        constructor(url: string);
        load();
    }

    class Sprite extends DisplayObjectContainer {
        anchor: Point;
        blendMode: number;
        texture: Texture;
        height: number;
        width: number;
        tint: number;

        setInteractive(interactive:boolean):void;

        constructor(texture: Texture);
        getBounds(): Rectangle;
        setTexture(texture: Texture): void;

        static fromFrame(frameId: string): Sprite;
        static fromImage(url: string): Sprite;
    }

    class SpriteBatch extends PIXI.DisplayObjectContainer {
        constructor(texture?: Texture);
    }

    /* TODO determine type of frames */
    class SpriteSheetLoader extends EventTarget {
        url: string;
        crossorigin: boolean;
        baseUrl: string;
        texture: Texture;
        frames: Object;

        constructor(url: string, crossorigin?: boolean);
        load();
    }

    class Stage extends DisplayObjectContainer {
        interactive: boolean;
        interactionManager: InteractionManager;

        constructor(backgroundColor: number);
        getMousePosition(): Point;
        setBackgroundColor(backgroundColor: number): void;
        setInteractionDelegate(domElement: HTMLElement): void;
    }

    class Strip extends DisplayObjectContainer {
        constructor(texture: Texture, width: number, height: number);
    }

    class Text extends Sprite {
        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;

        constructor(text: string, style?: ITextStyle);
        destroy(destroyTexture: boolean): void;
        setText(text: string): void;
        setStyle(style: ITextStyle): void;
    }

    class Texture extends EventTarget {
        baseTexture: BaseTexture;
        frame: Rectangle;
        trim: Point;
        width: number;
        height: number;

        constructor(baseTexture: BaseTexture, frame?: Rectangle);
        destroy(destroyBase: boolean): void;
        setFrame(frame: Rectangle): void;
        render(displayObject: DisplayObject, position?: Point, clear?: boolean): void;
        on(event: string, callback: Function): void;

        static fromImage(imageUrl: string, crossorigin?: boolean, scaleMode?: scaleModes): Texture;
        static fromFrame(frameId: string): Texture;
        static fromCanvas(canvas: HTMLCanvasElement, scaleMode?: scaleModes): Texture;
        static addTextureToCache(texture: Texture, id: string): void;
        static removeTextureFromCache(id: string): Texture;
    }

    class TilingSprite extends DisplayObjectContainer {
        width: number;
        height: number;
        renderable: boolean;
        texture: Texture;
        tint: number;
        tilePosition: Point;
        tileScale: Point;
        tileScaleOffset: Point;
        blendMode: blendModes;

        constructor(texture: Texture, width: number, height: number);
        generateTilingTexture(forcePowerOfTwo: boolean): void;
    }

    class TwistFilter extends AbstractFilter {
        size: Point;
        angle: number;
        radius: number;
    }

    class WebGLFilterManager {
        filterStack: AbstractFilter[];
        transparent: boolean;
        offsetX: number;
        offsetY: number;

        constructor(gl: WebGLRenderingContext, transparent: boolean);
        setContext(gl: WebGLRenderingContext);
        begin(renderSession: IRenderSession, buffer: ArrayBuffer): void;
        pushFilter(filterBlock: IFilterBlock): void;
        popFilter(): void;
        applyFilterPass(filter: AbstractFilter, filterArea: Texture, width: number, height: number): void;
        initShaderBuffers(): void;
        destroy(): void;
    }

    class WebGLGraphics { }

    class WebGLMaskManager {
        constructor(gl: WebGLRenderingContext);
        setContext(gl: WebGLRenderingContext);
        pushMask(maskData: any[], renderSession: IRenderSession): void;
        popMask(renderSession: IRenderSession): void;
        destroy(): void;
    }

    class WebGLRenderer implements IPixiRenderer {
        type: number;
        contextLost: boolean;
        width: number;
        height: number;
        transparent: boolean;
        view: HTMLCanvasElement;

        constructor(width: number, height: number, view?: HTMLCanvasElement, transparent?: boolean, antialias?: boolean);
        destroy(): void;
        render(stage: Stage): void;
        renderDisplayObject(displayObject: DisplayObject, projection: Point, buffer: WebGLBuffer): void;
        resize(width: number, height: number): void;

        static createWebGLTexture(texture: Texture, gl: WebGLRenderingContext): void;
    }

    class WebGLShaderManager {
        activatePrimitiveShader(): void;
        activateShader(shader: PixiShader): void;
        deactivatePrimitiveShader(): void;
        destroy(): void;
        setAttribs(attribs: IShaderAttribute[]): void;
        setContext(gl: WebGLRenderingContext, transparent: boolean);
    }

    class WebGLSpriteBatch {
        indices: Uint16Array;
        size: number;
        vertices: Float32Array;
        vertSize: number;

        constructor(gl: WebGLRenderingContext);
        begin(renderSession: IRenderSession): void;
        flush(): void;
        end(): void;
        destroy(): void;
        render(sprite: Sprite): void;
        renderTilingSprite(sprite: TilingSprite): void;
        setBlendMode(blendMode: blendModes): void;
        setContext(gl: WebGLRenderingContext): void;
        start(): void;
        stop(): void;
    }

    class RenderTexture extends Texture{
		width:number;
		height:number;
		frame:Rectangle;
		baseTexture:BaseTexture;
		renderer:IPixiRenderer;

		constructor(width, height, renderer?, scaleMode?);
		resize(width, height);
		renderWebGL(displayObject:DisplayObject, position, clear);
		renderCanvas(displayObject:DisplayObject, position, clear);

	}

}

declare function requestAnimFrame( animate: PIXI.IBasicCallback );

declare module PIXI.PolyK {
    function Triangulate(p: number[]): number[];
}
