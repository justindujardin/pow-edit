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
///<reference path="../../../bower_components/pow-core/lib/pow-core.d.ts"/>
///<reference path="../../../types/ace/ace.d.ts"/>
///<reference path="../../../types/pixi/PIXI.d.ts"/>
///<reference path="../../../types/angular/angular.d.ts"/>
///<reference path="../../app.ts"/>
///<reference path="../services/actions.ts"/>
///<reference path="../services/tasks.ts"/>
///<reference path="../services/keys.ts"/>
///<reference path="../../formats/tiledFormat.ts"/>
///<reference path="../actions/layerSelectAction.ts"/>
///<reference path="../actions/layerVisibilityAction.ts"/>
///<reference path="../actions/tileEraseAction.ts"/>
///<reference path="../actions/tilePaintAction.ts"/>

module pow2.editor {
   declare var requestAnimFrame:any;
   declare var PIXI:any;

   pow2.editor.app.directive("tileEditorView", [
      "$interval", "$parse","$document","$tasks","$platform",
      ($interval,$parse,$document,$tasks:TasksService,$platform:IAppPlatform) => {

         return {
            restrict: "E",
            replace: true,
            templateUrl: "source/editor/directives/tileEditorView.html",
            require:["tileEditorView","^documentView"],
            controller:TileEditorController,
            controllerAs:'editor',
            compile:(element,attributes) => {
               var source = $parse(attributes.url);

               return (scope, element, attributes:any,controllers:any[]) => {
                  var tileEditor:TileEditorController = controllers[0];
                  var documentViewController:DocumentViewController = controllers[1];

                  var t:pow2.editor.ITileMap = null;

                  tileEditor.init(element);
                  // create an new instance of a pixi stage
                  var stage = new PIXI.Stage(0x111111, true);
                  var newUrl:string = source(scope);

                  /**
                   * Data binding
                   */
                  var updateView = (value) => {
                     newUrl = source(scope);
                     if(!newUrl){
                        return;
                     }
                     if(t && t.name){
                        $tasks.killTaskGroup(t.name);
                     }

                     if(!value){
                        tileEditor.destroyStage(stage);
                        tileEditor.sceneContainer = null;
                        return;
                     }

                     if(tileEditor.sceneContainer){
                        tileEditor.destroyStage(stage);
                     }
                     tileEditor.sceneContainer = new PIXI.DisplayObjectContainer();
                     documentViewController.showLoading('Loading...');
                     $platform.readFile(newUrl,(data) => {
                        var promise:ng.IPromise<ITileMap> = tileEditor.loader.load(newUrl,data);
                        promise.then((tileMap:ITileMap)=>{
                           tileEditor.setMap(tileMap);
                           t = tileMap;
                           buildMapRender();
                        }).catch((e:any)=>{
                           console.error(e);
                        });
                     });
                  };
                  scope.$watch(attributes.url, updateView);


                  // add the renderer view element to the DOM
                  element.append(tileEditor.renderer.view);

                  /**
                   * TODO: Map refactoring:
                   *
                   * - `pow2.editor.formats.tiled` references indicate coupling to Tiled format
                   *   and opportunity to decouple with accessor methods on editable document
                   *   class object.
                   *
                   */

                  // Layer lists
                  var debugText:any = null;
                  function setDebugText(text:string){
                     debugText.setText(text);
                  }
                  var buildMapRender = () => {
                     tileEditor.layers.length = 0;
                     tileEditor.cameraCenter.set(t.size.x * t.tileSize.x / 2, t.size.y * t.tileSize.y / 2);
                     tileEditor.cameraHeight = element.height();
                     tileEditor.cameraWidth = element.width();
                     tileEditor.cameraZoom = 1;
                     tileEditor.updateCamera();

                     $platform.setTitle(newUrl);
                     var spriteTextures:{
                        [url:string]:any // PIXI.BaseTexture
                     } = tileEditor.loadTextures(t.tileSets);


                     // Pre allocate display object containers.
                     angular.forEach(t.layers,(layer:any) => {
                        var container = new PIXI.DisplayObjectContainer();
                        tileEditor.layers.push(<IEditableTileLayer>{
                           tiles: new Array(layer.tiles ? layer.tiles.length : 0),
                           objects:container,
                           data:layer,
                           name:layer.name,
                           properties:layer.properties,
                           opacity:layer.opacity
                        });
                        container.visible = layer.visible;
                        tileEditor.sceneContainer.addChild(container);
                     });

                     // Each layer
                     angular.forEach(t.layers,(l:pow2.editor.ITileLayer,index:number) => {
                        $tasks.add(() => {
                           documentViewController.setLoadingDetails(l.name);
                           var editable:IEditableTileLayer = tileEditor.layers[index];
                           var container = editable.objects;
                           if(l.tiles){
                              for(var col:number = 0; col < t.size.x; col++) {
                                 for (var row:number = 0; row < t.size.y; row++) {
                                    // y * w + x = tile id from col/row
                                    var tileIndex:number = row * t.size.x + col;
                                    var gid:number = l.tiles[tileIndex];
                                    var meta:ITileData = t.tileInfo[gid];
                                    if (meta) {
                                       var frame = new PIXI.Rectangle(meta.imagePoint.x,meta.imagePoint.y,t.tileSize.x,t.tileSize.y);
                                       var texture = new PIXI.Texture(spriteTextures[meta.url],frame);
                                       var tile:EditableTile = new EditableTile(tileEditor,texture);
                                       tile.sprite.x = col * t.tileSize.y;
                                       tile.sprite.y = row * t.tileSize.x;
                                       tile.sprite.width = t.tileSize.x;
                                       tile.sprite.height = t.tileSize.y;
                                       tile._gid = gid;
                                       tile._tileIndex = tileIndex;

                                       //sprite.anchor = centerOrigin;
                                       container.addChild(tile.sprite);
                                       editable.tiles[tileIndex] = tile;
                                    }
                                 }
                              }
                           }
                           _.each(l.objects,(obj:pow2.editor.formats.tiled.ITiledObject) => {
                              var box = new PIXI.Graphics();
                              box.beginFill(0xFFFFFF);
                              box.alpha = 0.6;
                              box.lineStyle(1,0xAAAAAA,1);
                              box.drawRect(0, 0, obj.width, obj.height);
                              box.endFill();
                              box.position.x = obj.x;
                              box.position.y = obj.y;
                              container.addChild(box);
                           });
                           return true;
                        },t.name);
                     });

                     stage.addChild(tileEditor.sceneContainer);

                     var total:number = $tasks.getRemainingTasks(t.name);
                     documentViewController.setLoadingTitle("Building Map...");
                     documentViewController.setTotal(total);
                     tileEditor.unwatchProgress = $interval(()=>{
                        documentViewController.setCurrent(total - $tasks.getRemainingTasks(t.name));
                     },50);

                     $tasks.add(() => {
                        documentViewController.hideLoading();
                        $interval.cancel(tileEditor.unwatchProgress);
                        return true;
                     },t.name);
                     // Debug map stats
                     var stats:string = [
                           'Layers: ' + t.layers.length,
                           'Size: ' + t.size
                     ].join('\n');
                     debugText = new PIXI.Text(stats, {
                        font:"16px courier",
                        fill:"white",
                        stroke:"black",
                        strokeThickness:3
                     });
                     debugText.x = 75;
                     debugText.y = 10;
                     stage.addChild(debugText);
                     tileEditor.on('debug',setDebugText);
                  };

                  element.on('mousedown touchstart',(e)=>{
                     tileEditor.handleMouseDown(e);
                  });
                  element.on("mousewheel DOMMouseScroll MozMousePixelScroll",(e)=>{
                     tileEditor.handleMouseWheel(e);
                  });

                  var scopeDestroyed:boolean = false;
                  /**
                   * Process loop
                   */
                  function animate() {
                     tileEditor.renderer.render(stage);
                     if(!scopeDestroyed){
                        requestAnimFrame(animate);
                     }
                  }
                  requestAnimFrame(animate);

                  /**
                   * Resize hacks.
                   */
                  var updateSize = () => {
                     var w:number = element.width();
                     var h:number = element.height();
                     tileEditor.renderer.resize(w,h);
                     tileEditor.cameraWidth = w;
                     tileEditor.cameraHeight = h;
                     tileEditor.updateCamera();
                  };

                  setTimeout(updateSize,50);
                  var debounce;
                  var resizeHack = () => {
                     clearTimeout(debounce);
                     debounce = setTimeout(updateSize, 100);
                  };
                  angular.element(window).on('resize',resizeHack);
                  element.on('resize',resizeHack);
                  return scope.$on("$destroy", function() {
                     tileEditor.destroy();
                     tileEditor.off('debug',setDebugText);
                     scopeDestroyed = true;
                     tileEditor.destroyStage(stage);
                     $interval.cancel(tileEditor.unwatchProgress);
                     $tasks.killTaskGroup(t.name);
                     t = null;
                     angular.element(window).off('resize');
                  });
               };
            }
         };
      }
   ]);

   export class TileEditorController extends pow2.Events {

      static $inject:string[] = ['$document','$tasks','$injector','$platform','$keys','$actions'];
      constructor(
         public $document:any,
         public $tasks:any,
         public $injector:any,
         public $platform:pow2.editor.IAppPlatform,
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

      // Data
      public keyBinds:number[] = [];
      public layers:IEditableTileLayer[] = [];
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

      public hideEmptyLayers:boolean = true;

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
         // create a renderer instance
         this.renderer = PIXI.autoDetectRenderer(element.height(),element.width());
      }
      destroy() {
         angular.forEach(this.keyBinds,(bind:number)=>{
            this.$keys.unbind(bind);
         });
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
         var layer:IEditableTileLayer = this.layers[index];
         if(!layer){
            throw new Error("Invalid layer to toggle visibility of");
         }
         this.$actions.executeAction(new LayerVisibilityAction(this,index,!layer.objects.visible));
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
         var layer:IEditableTileLayer = this.layers[this.activeLayerIndex];
         if(!layer || index > layer.tiles.length || index < 0){
            console.error("paintAt: index out of range");
            return;
         }
         var newGid:number = this.dragPaint;//this.getRandomInt(1,this.tileMap.tileInfo.length - 1); // ?

         var action:IAction = null;
         if(newGid !== 0){
            var meta:ITileData = this.tileMap.tileInfo[newGid];
            if(!meta){
               console.error("No meta for GID: " + newGid);
               return;
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
            action = new TileEraseAction(this,layer,index);
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
         //this.setDebugText(JSON.stringify(this.drag,null,3));
      }
      destroyStage(stage) {
         if(stage){
            for (var i = stage.children.length - 1; i >= 0; i--) {
               stage.removeChild(stage.children[i]);
            }
         }
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


      // INPUT
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
