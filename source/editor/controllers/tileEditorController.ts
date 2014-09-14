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
///<reference path="../../../types/ace/ace.d.ts"/>
///<reference path="../../../types/pixi/PIXI.d.ts"/>
///<reference path="../../../types/angular/angular.d.ts"/>
///<reference path="../../app.ts"/>
///<reference path="../../services/actions.ts"/>
///<reference path="../../services/tasks.ts"/>
///<reference path="../../services/keys.ts"/>
///<reference path="../../formats/tiledMapLoader.ts"/>
///<reference path="../actions/layerSelectAction.ts"/>
///<reference path="../actions/layerVisibilityAction.ts"/>
///<reference path="../actions/tilePaintAction.ts"/>


module pow2.editor {

   export class TileEditorController extends pow2.Events {

      static $inject:string[] = ['$document','$tasks','$injector','$keys','$actions'];
      constructor(
         public $document:any,
         public $tasks:pow2.editor.TasksService,
         public $injector:any,
         public $keys:pow2.editor.IKeysService,
         public $actions:pow2.editor.IActionsService) {
         super();
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
      }

      public blankTile:PIXI.Texture = null;
      public ctx:IContext;

      public loader:TiledMapLoader;
      public tileMap:ITileMap = null;

      // DOM
      public container:HTMLElement;

      // Data
      public keyBinds:number[] = [];
      public layers:ITileLayer[] = [];
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

      // Scenegraph
      public sceneContainer:any = null;

      // tile gid to paint, or -1 if no painting
      public dragPaint:number = -1;

      // The selected tile to paint
      private _tileIndex:number = 46;

      private activeTool:string = 'move';

      public drag:IDragEvent = {
         active:false,
         start:null,
         current:null,
         cameraStart:null,
         delta:null
      };
      public unwatchProgress:any = null;

      init(element){
         this.container = element;
         var w:number = element.width();
         var h:number = element.height();
         // create a renderer instance
         this.renderer = PIXI.autoDetectRenderer(w,h,element[0]);
         this.resize(w,h);
      }
      destroy() {
         angular.forEach(this.keyBinds,(bind:number)=>{
            this.$keys.unbind(bind);
         });
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

      setMap(tileMap:ITileMap){
         this.tileMap = tileMap;
      }

      setPaintTile(tileSet:ITileSet,at:pow2.Point){
         var tilesX:number = tileSet.imageSize.x / tileSet.tileSize.x;
         // y * w + x = tile id from col/row
         var index = (at.y * tilesX + at.x) + tileSet.firstIndex;
         if(index > 0 && index < tileSet.tiles.length){
            this._tileIndex = index;
         }
      }

      setLayerVisibility(index:number){
         var layer:ITileLayer = this.layers[index];
         if(!layer){
            throw new Error(pow2.errors.INDEX_OUT_OF_RANGE);
         }
         this.$actions.executeAction(new LayerVisibilityAction(this,index,!layer.container.visible));
      }

      setActiveLayer(index:number) {
         this.$actions.executeAction(new LayerSelectAction(this,index));
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
            this.blankTile = new PIXI.RenderTexture(this.tileMap.tileSize.x, this.tileMap.tileSize.y);
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
         var layer:ITileLayer = this.layers[this.activeLayerIndex];
         if(!layer || index > layer.tiles.length || index < 0){
            console.error(pow2.errors.INDEX_OUT_OF_RANGE);
            return;
         }
         var newGid:number = this.dragPaint;//this.getRandomInt(1,this.tileMap.tileInfo.length - 1); // ?

         var action:IAction = null;
         if(newGid !== 0){
            var meta:ITileData = this.tileMap.tileInfo[newGid];
            if(!meta){
               throw new Error(pow2.errors.INVALID_ITEM);
            }
            var tile:EditableTile = layer.tiles[index];
            if(tile._gid === newGid){
               return;
            }
            action = new TilePaintAction(this,layer,index,newGid);
         }
         else {
            var tile:EditableTile = layer.tiles[index];
            if(tile._gid === newGid){
               return;
            }
            action = new TilePaintAction(this,layer,index,0);
         }
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


      // TODO: INPUT needs to be in the directive, not the controller.
      /**
       *  Pan Input listener
       *
       *  TODO: Refactor into generic zoom/pan directive that
       *  takes generic x/y/scale props (rather than pixi specific
       *  sceneContainer props) and manipulates them.
       */
      handleMouseDown(event:any) {
         var e = event;
         if(event.originalEvent.touches) {
            e = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
         }
         switch(this.activeTool){
            case 'paint':
               this.dragPaint = this._tileIndex;
               var _stopPaint = () => {
                  this.dragPaint = -1;
                  this.$document.off('mouseup touchend',_stopPaint);
               };
               this.$document.on('mouseup touchend', _stopPaint);
               return;
               break;
            case 'erase':
               this.dragPaint = 0;
               var _stopPaint = () => {
                  this.dragPaint = -1;
                  this.$document.off('mouseup touchend',_stopPaint);
               };
               this.$document.on('mouseup touchend', _stopPaint);
               return;
               break;
            case 'move':
               this.dragPaint = -1;
               this.drag.active = true;
               this.drag.start = new pow2.Point(e.clientX,e.clientY);
               this.drag.current = this.drag.start.clone();
               this.drag.delta = new pow2.Point(0,0);
               this.drag.cameraStart = new Point(this.cameraCenter.x,this.cameraCenter.y);
               var _mouseUp = () => {
                  this.$document.off('mousemove touchmove',_mouseMove);
                  this.$document.off('mouseup touchend',_mouseUp);
                  this.resetDrag();
               };
               var _mouseMove = (evt:any) => {
                  if(!this.drag.active){
                     return;
                  }
                  if(evt.originalEvent.touches) {
                     evt = evt.originalEvent.touches[0] || evt.originalEvent.changedTouches[0];
                  }
                  this.drag.current.set(evt.clientX,evt.clientY);
                  this.drag.delta.set(this.drag.start.x - this.drag.current.x, this.drag.start.y - this.drag.current.y);

                  this.cameraCenter.x = this.drag.cameraStart.x + this.drag.delta.x * (1 / this.cameraZoom);
                  this.cameraCenter.y = this.drag.cameraStart.y + this.drag.delta.y * (1 / this.cameraZoom);

                  this.updateCamera();
                  event.stopPropagation();
                  return false;
               };
               this.$document.on('mousemove touchmove', _mouseMove);
               this.$document.on('mouseup touchend', _mouseUp);
               event.stopPropagation();
               return false;
               break;
         }
      }
      /**
       *  Zoom Input listener
       */
      handleMouseWheel(event) {
         if(!this.sceneContainer) {
            return;
         }
         var delta:number = (event.originalEvent.detail ? event.originalEvent.detail * -1 : event.originalEvent.wheelDelta);
         var move:number = this.cameraZoom / 10;
         this.cameraZoom += (delta > 0 ? move : -move);
         this.updateCamera();
         event.stopImmediatePropagation();
         event.preventDefault();
         return false;
      }


   }

}