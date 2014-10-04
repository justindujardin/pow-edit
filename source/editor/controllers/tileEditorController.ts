/**
 Copyright (C) 2014 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
///<reference path="../../../assets/bower_components/pow-core/lib/pow-core.d.ts"/>
///<reference path="../tileEditor.ts"/>
///<reference path="../../app.ts"/>
///<reference path="../../services/actions.ts"/>
///<reference path="../../services/tasks.ts"/>
///<reference path="../../services/keys.ts"/>
///<reference path="../../services/time.ts"/>
///<reference path="../../formats/tiledMapLoader.ts"/>
///<reference path="../actions/tilePaintAction.ts"/>


module pow2.editor {



   export interface TileEditorViewLayer {
      tiles:EditableTile[]; // y * w + x = tile index from col/row
      container: PIXI.DisplayObjectContainer;
      dataSource:PowTileLayer;
   }

   export class TileEditorController extends pow2.Events implements IProcessObject {
      static $inject:string[] = ['$document','$tasks','$time','$injector','$keys','$platform','$actions'];
      constructor(
         public $document:any,
         public $tasks:pow2.editor.TasksService,
         public $time:pow2.Time,
         public $injector:any,
         public $keys:pow2.editor.IKeysService,
         public $platform:pow2.editor.IAppPlatform,
         public $actions:pow2.editor.IActionsService) {
         super();
         $time.addObject(this);
         this.loader = this.$injector.instantiate(TiledMapLoader);

         angular.forEach(['ctrl+z','cmd+z'],(c:string)=>{
            this.keyBinds.push($keys.bind(c,()=>{
               var action:IAction = this.$actions.undo();
               if(action){
                  this.setDebugText('Undo ' + action.name);
               }
            }));
         });
         angular.forEach(['ctrl+shift+z','cmd+shift+z'],(c:string)=>{
            this.keyBinds.push($keys.bind(c,(e)=>{
               var action:IAction = this.$actions.redo();
               if(action){
                  this.setDebugText('Redo ' + action.name);
               }
            }));
         });
         this.keyBinds.push($keys.bind('ctrl+s',(e)=>{
            this.loader.save(this.tileMap.name,this.tileMap).then((data:any)=>{
               this.$platform.writeFile(this.tileMap.name,data,(err:any)=>{
                  if(err){
                     throw new Error(err);
                  }
                  console.log('File: ' + this.tileMap.name + ' --- SAVED');
               });
            });
         }));
      }

      public blankTile:PIXI.Texture = null;
//      public ctx:IContext;

      public loader:TiledMapLoader;
      public tileMap:PowTileMap = null;
      public picker:pow2.editor.PowTileMapPicker = null;
      public mouseAt:pow2.Point = new Point(-1,-1);

      // DOM
      public container:HTMLElement;

      // Data
      public keyBinds:number[] = [];
      public spriteTextures:{
         [url:string]:any // PIXI.BaseTexture
      } = {};

      // STATE
      public activeLayerIndex:number = 0; // Current layer index for tools to act on

      // Camera
      public cameraWidth:number;
      public cameraHeight:number;
      public cameraCenter:pow2.Point = new pow2.Point(0,0);
      public cameraZoom:number = 1;

      // Rendering
      public renderer:any;
      public stage:PIXI.Stage;

      // Scenegraph
      public sceneContainer:any = null;

      // tile gid to paint, or -1 if no painting
      public dragPaint:number = -1;

      // The selected tile to paint
      public tileIndex:number = 46;

      public activeTool:string = 'move';

      public drag:IDragEvent = {
         active:false,
         start:null,
         current:null,
         cameraStart:null,
         delta:null
      };
      init(element:any,stage:PIXI.Stage){
         this.$time.addObject(this);
         this.container = element;
         var w:number = element.width();
         var h:number = element.height();
         // create a renderer instance
         this.renderer = PIXI.autoDetectRenderer(w,h,element[0]);
         this.resize(w,h);
         this.stage = stage;
      }
      destroy() {
         angular.forEach(this.keyBinds,(bind:number)=>{
            this.$keys.unbind(bind);
         });
         this.$time.removeObject(this);
         if(this.renderer){
            this.renderer.destroy && this.renderer.destroy();
            this.renderer = null;
         }
         this.container = null;
      }

      // IProcessObject implementation
      _uid:string;
      tick(elapsed:number) {}
      processFrame(elapsed:number) {
         if(this.renderer && this.stage){
            this.renderer.render(this.stage);
         }
      }

      /**
       * Resize the editor view
       */
      resize(extent:Point):TileEditorController;
      resize(w:number,h:number):TileEditorController;
      resize(w:string,h:string):TileEditorController;
      resize(pointOrW:any,wNum?:any):TileEditorController{
         var w:number;
         var h:number;
         if(pointOrW instanceof Point){
            w = pointOrW.x;
            h = pointOrW.y;
         }
         else if(typeof pointOrW === 'string' && typeof wNum === 'string'){
            w = parseFloat(pointOrW);
            h = parseFloat(wNum);
         }
         else if(typeof pointOrW === 'number' && typeof wNum === 'number'){
            w = pointOrW;
            h = wNum;
         }
         else {
            throw new Error(pow2.errors.INVALID_ARGUMENTS);
         }
         this.renderer.resize(w,h);
         this.cameraWidth = w;
         this.cameraHeight = h;
         this.updateCamera();

         return this;
      }

      setMap(tileMap:PowTileMap){
         this.tileMap = tileMap;
         this.picker = new pow2.editor.PowTileMapPicker(this.tileMap);
      }

      setPaintTile(tileSet:ITileSet,at:pow2.Point){
         var tilesX:number = tileSet.imageSize.x / tileSet.tileSize.x;
         // y * w + x = tile id from col/row
         var index = (at.y * tilesX + at.x) + tileSet.firstIndex;
         if(index > 0 && index < tileSet.tiles.length){
            this.tileIndex = index;
         }
      }

      setLayerVisibility(index:number){
         var layer:PowTileLayer = this.tileMap.layers[index];
         if(!layer){
            throw new Error(pow2.errors.INDEX_OUT_OF_RANGE);
         }
         layer.toggleVisible();
         //this.$actions.executeAction(new LayerVisibilityAction(this,index,!layer.visible));
      }

      setActiveLayer(index:number) {
         var layer:PowTileLayer = this.tileMap.layers[index];
         if(!layer){
            throw new Error(pow2.errors.INDEX_OUT_OF_RANGE);
         }
         this.activeLayerIndex = index;
         //this.$actions.executeAction(new LayerSelectAction(this,index));
      }

      loadTextures(tileSets:ITileSet[]){
         this.spriteTextures = {};
         _.each(tileSets,(tsx:pow2.editor.ITileSet) => {
            this.spriteTextures[tsx.url] = new PIXI.BaseTexture(tsx.image,PIXI.scaleModes.NEAREST);
         });
         return this.spriteTextures;
      }

      setDebugText(text:string){
         this.trigger('debug',text);
      }

      /**
       * Returns a random integer between min (inclusive) and max (inclusive)
       * Using Math.round() will give you a non-uniform distribution!
       */
      getRandomInt(min, max) {
         return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      // TODO: Cache these textures by GID.
      getGidTexture(gid:number):PIXI.Texture{
         if(!this.blankTile && this.tileMap){
            this.blankTile = new PIXI.RenderTexture(this.tileMap.tileSize.x, this.tileMap.tileSize.y,this.renderer);
         }
         var meta:ITileData = this.tileMap.tileInfo[gid];
         if(gid <= 0 || !meta){
            return this.blankTile;
         }
         var frame = new PIXI.Rectangle(
            meta.imagePoint.x,
            meta.imagePoint.y,
            this.tileMap.tileSize.x,
            this.tileMap.tileSize.y);
         return new PIXI.Texture(this.spriteTextures[meta.url], frame);
      }

      paintAt(index:number){
         var layer:PowTileLayer = this.tileMap.layers[this.activeLayerIndex];
         if(!layer || index > layer.tiles.length || index < 0){
            return;
         }
         var newGid:number = this.dragPaint;

         var action:IAction = null;
         if(newGid !== 0){
            var meta:ITileData = this.tileMap.tileInfo[newGid];
            if(!meta){
               throw new Error(pow2.errors.INVALID_ITEM);
            }
            var tile:number = layer.tiles[index];
            if(tile === newGid){
               return;
            }
            action = new TilePaintAction(layer,index,newGid);
         }
         else {
            var tile:number = layer.tiles[index];
            if(tile === newGid){
               return;
            }
            action = new TilePaintAction(layer,index,0);
         }
         if(this.$actions.executeAction(action)){
            this.setDebugText(action.name);
         }
      }

      floodPaintAt(index:number,newGid:number=this.dragPaint){
         var layer:PowTileLayer = this.tileMap.layers[this.activeLayerIndex];
         if(!layer || index > layer.tiles.length || index < 0){
            return;
         }
         var action = new TileFloodPaintAction(layer,index,newGid);
         if(this.$actions.executeAction(action)){
            this.setDebugText(action.name);
         }
      }
      resetDrag(){
         this.drag = _.extend({},{
            active:false,
            start:null,
            current:null,
            delta:null
         });
      }

      updateCamera() {
         if(!this.sceneContainer){
            return;
         }
         this.sceneContainer.x = -this.cameraCenter.x * this.cameraZoom + (this.cameraWidth / 2);
         this.sceneContainer.y = -this.cameraCenter.y * this.cameraZoom + (this.cameraHeight / 2);
         this.sceneContainer.scale.x = this.sceneContainer.scale.y = this.cameraZoom;
      }


      setTool(name:string){
         this.activeTool = name;
         this.trigger('debug','Activate ' + name);
      }


      // Convert a Rect/Point/Number from screen coordinates (pixels) to
      // game world coordinates (game unit sizes)
      screenToWorld(value: Point, scale:number = 1): Point {
         value.x *= 1 / (this.tileMap.tileSize.x * scale);
         value.y *= 1 / (this.tileMap.tileSize.y * scale);
         return value;
      }

      mouseEventToWorld(ev:any):pow2.Point {
         ev = ev.originalEvent;
         var relativeElement:any = ev.srcElement;
         var touches:any = (<any>ev).touches;
         if(touches && touches.length > 0){
            ev = <any>touches[0];
         }
         var canoffset = $(relativeElement).offset();
         var x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
         var y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top);

         var worldPos:pow2.Point = new pow2.Point(x - this.sceneContainer.x,y - this.sceneContainer.y);
         return this.screenToWorld(worldPos,this.cameraZoom).floor();
      }


      /**
       * View Layer Management (to allow various editor directives to access view layers by injecting the controller)
       *
       * TODO: Is it bad to expose this to other components?
       */
      private _viewLayers:TileEditorViewLayer[] = [];
      clearViewLayers() {
         this._viewLayers.length = 0;
      }
      pushViewLayer(viewLayer:TileEditorViewLayer){
         this._viewLayers.push(viewLayer);
      }
      getViewLayers():TileEditorViewLayer[]{
         return this._viewLayers;
      }
   }

}