/*
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
///<reference path="../tileEditorToolbox.ts"/>
///<reference path="../../app.ts"/>
///<reference path="../../services/actions.ts"/>
///<reference path="../../services/tasks.ts"/>
///<reference path="../../services/keys.ts"/>
///<reference path="../../services/time.ts"/>
///<reference path="../../formats/tiledMapLoader.ts"/>
///<reference path="../actions/tilePaintAction.ts"/>
///<reference path="../actions/tileFloodPaintAction.ts"/>
///<reference path="../actions/layerRemoveAction.ts"/>


module pow2.editor {



   export interface TileEditorViewLayer {
      tiles:EditableTile[]; // y * w + x = tile index from col/row
      container: PIXI.DisplayObjectContainer;
      dataSource:PowTileLayer;
   }

   export class TileEditorController extends pow2.Events implements IProcessObject {

      public ed:TileEditor = new TileEditor();
      public blankTile:PIXI.Texture = null;
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
      public activeLayer:PowTileLayer = null; // Reference to the active layer (or null)

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

      // The selected tile to paint
      public tileIndex:number = 46;

      static $inject:string[] = ['$time','$injector','$keys','$platform','$document'];
      constructor(
         public $time:pow2.Time,
         public $injector:any,
         public $keys:pow2.editor.IKeysService,
         public $platform:pow2.editor.IAppPlatform,
         public $document:any) {
         super();
         $time.addObject(this);
         this.loader = this.$injector.instantiate(TiledMapLoader);

         angular.forEach(['ctrl+z','cmd+z'],(c:string)=>{
            this.keyBinds.push($keys.bind(c,()=>{
               var action:IAction = this.ed.actions.undo();
               if(action){
                  this.setDebugText('Undo ' + action.name);
               }
            }));
         });
         angular.forEach(['ctrl+shift+z','cmd+shift+z'],(c:string)=>{
            this.keyBinds.push($keys.bind(c,(e)=>{
               var action:IAction = this.ed.actions.redo();
               if(action){
                  this.setDebugText('Redo ' + action.name);
               }
            }));
         });

         // SAVE
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
      init(element:any,stage:PIXI.Stage){
         this.$time.addObject(this);
         this.container = element;
         var w:number = element.width();
         var h:number = element.height();
         // PIXI hates ios8 and webgl, so use canvas there.
         if(pow2.editor.ios8){
            this.renderer = new PIXI.CanvasRenderer(w,h,element[0]);
         }
         // Otherwise autodetect the renderer based on capabilities.
         else {
            this.renderer = PIXI.autoDetectRenderer(w,h,element[0]);
         }

         this.resize(w,h);
         this.stage = stage;
         this.ed.initEditor(this);
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
         this.ed.destroyEditor();
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

      createContext(object:any):pow2.editor.IEditorContext {
         var ctx = new pow2.editor.LayerEditContext();
         ctx.setEditor(this.ed);
         return ctx;
      }

      setMap(tileMap:PowTileMap){
         if(this.tileMap){
            this.tileMap.off(null,null,this);
         }
         this.picker = null;
         this.tileMap = tileMap;
         if(this.tileMap){
            this.picker = new pow2.editor.PowTileMapPicker(this.tileMap);
            this.setActiveLayer(0);
            this.tileMap.on(PowTileMap.EVENTS.REMOVE_LAYER,(layer:PowTileLayer,index:number)=>{
               this.removeViewLayer(index,layer);
            });
            this.tileMap.on(PowTileMap.EVENTS.ADD_LAYER,(layer:PowTileLayer,index:number)=>{
               this.newViewLayer(index,layer);
            });
         }
      }

      setPaintTile(tileSet:ITileSet,at:pow2.Point){
         var tilesX:number = tileSet.imageSize.x / tileSet.tileSize.x;
         // y * w + x = tile id from col/row
         var index = (at.y * tilesX + at.x) + tileSet.firstIndex;
         if(index > 0 && index < tileSet.tiles.length){
            this.tileIndex = index;
         }
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

      updateCamera() {
         if(!this.sceneContainer){
            return;
         }
         this.sceneContainer.x = -this.cameraCenter.x * this.cameraZoom + (this.cameraWidth / 2);
         this.sceneContainer.y = -this.cameraCenter.y * this.cameraZoom + (this.cameraHeight / 2);
         this.sceneContainer.scale.x = this.sceneContainer.scale.y = this.cameraZoom;
      }


      setTool(name:string){
         if(this.ed.setActiveTool(name)){
            this.trigger('debug','Activate ' + name);
         }
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
       * View Layer Management (to allow various editor directives to access
       * view layers by injecting the controller)
       *
       * View layers are objects that represent a fully rendered layer in the
       * UI, and hold a reference to the original layer data object.  This
       * keeps the data object from having knowledge of the rendering system
       *
       * TODO: This should likely go elsewhere, but where?  Directive? Controller? Service? PlainOldClass?
       */
      private _viewLayers:TileEditorViewLayer[] = [];
      removeViewLayer(index:number,layer:PowTileLayer){
         if(index < 0 || index > this._viewLayers.length){
            throw new Error(pow2.errors.INDEX_OUT_OF_RANGE);
         }
         this.sceneContainer.removeChildAt(index);
         this._viewLayers.splice(index,1);
         layer.off(null,null,this);
      }
      newViewLayer(index:number,layer:PowTileLayer):TileEditorViewLayer {
         var newViewLayer:TileEditorViewLayer = {
            tiles:[],
            container: new PIXI.DisplayObjectContainer(),
            dataSource:layer
         };
         this._viewLayers.splice(index,0,newViewLayer);
         newViewLayer.container.visible = layer.visible;
         layer.on(PowTileLayer.EVENTS.CHANGE_TILE,(index:number)=>{
            var newGid:number = layer.tiles[index];
            var tile:EditableTile = newViewLayer.tiles[index];
            if(tile){
               tile.sprite.setTexture(this.getGidTexture(newGid));
               tile._gid = newGid;
            }
            else {
               // Create sprite if it doesn't already exist.
               var col = index % this.tileMap.size.x;
               var row = (index - col) / this.tileMap.size.x;
               var texture = this.getGidTexture(newGid);
               var tile:EditableTile = new EditableTile(texture);
               tile.sprite.x = col * this.tileMap.tileSize.y;
               tile.sprite.y = row * this.tileMap.tileSize.x;
               tile.sprite.width = this.tileMap.tileSize.x;
               tile.sprite.height = this.tileMap.tileSize.y;
               tile._gid = gid;
               tile._tileIndex = tileIndex;
               newViewLayer.container.addChild(tile.sprite);
               newViewLayer.tiles[index] = tile;
            }
         },this);
         layer.on(PowTileLayer.EVENTS.CHANGE_VISIBLE,()=>{
            newViewLayer.container.visible = layer.visible;
         },this);
         if(layer.tiles){
            for(var col:number = 0; col < this.tileMap.size.x; col++) {
               for (var row:number = 0; row < this.tileMap.size.y; row++) {
                  // y * w + x = tile id from col/row
                  var tileIndex:number = row * this.tileMap.size.x + col;
                  var gid:number = layer.tiles[tileIndex];
                  var meta:ITileData = this.tileMap.tileInfo[gid];
                  if (meta) {
                     var frame = new PIXI.Rectangle(meta.imagePoint.x,meta.imagePoint.y,this.tileMap.tileSize.x,this.tileMap.tileSize.y);
                     var texture = new PIXI.Texture(this.spriteTextures[meta.url],frame);
                     var tile:EditableTile = new EditableTile(texture);
                     tile.sprite.x = col * this.tileMap.tileSize.y;
                     tile.sprite.y = row * this.tileMap.tileSize.x;
                     tile.sprite.width = this.tileMap.tileSize.x;
                     tile.sprite.height = this.tileMap.tileSize.y;
                     tile._gid = gid;
                     tile._tileIndex = tileIndex;

                     newViewLayer.container.addChild(tile.sprite);
                     newViewLayer.tiles[tileIndex] = tile;
                  }
               }
            }
         }
         _.each(layer.objects,(obj:pow2.tiled.ITiledObject) => {
            var box = new PIXI.Graphics();
            box.beginFill(0xFFFFFF);
            box.alpha = 0.6;
            box.lineStyle(1,0xAAAAAA,1);
            box.drawRect(0, 0, obj.width, obj.height);
            box.endFill();
            box.position.x = obj.x;
            box.position.y = obj.y;
            newViewLayer.container.addChild(box);
         });
         this.sceneContainer.addChildAt(newViewLayer.container,index);
         return newViewLayer;
      }
      clearViewLayers() {
         this._viewLayers.length = 0;
      }
      getViewLayers():TileEditorViewLayer[]{
         return this._viewLayers;
      }

      /**
       *
       *  Layer Management Commands
       *
       */
      newLayer() {
         console.log("adding layer after: " + this.tileMap.layers[this.activeLayerIndex].name);
         var newLayer:PowTileLayer = new PowTileLayer(PowTileLayer.TYPES.LAYER);
         var index:number = this.activeLayerIndex + 1;
         newLayer.setSize(this.tileMap.size.clone());
         newLayer.properties = {};
         newLayer.name = "Layer " + index;
         newLayer.point = new pow2.Point(0,0);
         newLayer.visible = true;
         newLayer.opacity = 1;

         this.tileMap.insertLayer(index,newLayer);
         this.newViewLayer(index,newLayer);
         this.setActiveLayer(index);
      }
      newObjectGroup() {
         console.log("adding objectgroup after: " + this.tileMap.layers[this.activeLayerIndex].name);
      }
      removeActiveLayer() {
         console.log("removing layer: " + this.tileMap.layers[this.activeLayerIndex].name);
         if(this.tileMap.layers.length > 1){
            this.ed.actions.executeAction(new LayerRemoveAction(this.tileMap,this.activeLayerIndex));
            if(this.activeLayerIndex >= this.tileMap.layers.length){
               this.setActiveLayer(this.activeLayerIndex-1);
            }
         }
      }
      renameLayer(layer:PowTileLayer,oldName:string,newName:string){
         if(oldName === newName){
            return;
         }
         // NOTE: this is a bit of a hack.  The action is being executed after
         // the layer has changed, so we change it back so that the action
         // can properly record the oldName for undo.   The oldName argument
         // is supplied by the inline-edit callback.
         // The reason it's already changed is because the inline-edit does a 2way
         // binding to the `layer.name` value.
         // TODO: Perhaps remove the ng-model binding on inline-edit and go with
         //       a callback approach that doesn't immediately update the model as a
         //       user types.
         layer.name = oldName;
         this.ed.actions.executeAction(new LayerRenameAction(layer,newName));
      }
      setLayerVisibility(index:number){
         var layer:PowTileLayer = this.tileMap.layers[index];
         if(!layer){
            throw new Error(pow2.errors.INDEX_OUT_OF_RANGE);
         }
         layer.toggleVisible();
         //this.ed.actions.executeAction(new LayerVisibilityAction(this,index,!layer.visible));
      }

      setActiveLayer(index:number) {
         var layer:PowTileLayer = this.tileMap.layers[index];
         if(!layer){
            throw new Error(pow2.errors.INDEX_OUT_OF_RANGE);
         }
         this.activeLayerIndex = index;
         //this.ed.actions.executeAction(new LayerSelectAction(this,index));
         this.activeLayer = layer;
      }

   }

}