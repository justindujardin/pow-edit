///<reference path="../../../types/ace/ace.d.ts"/>
///<reference path="../../../types/angular/angular.d.ts"/>
///<reference path="../../app.ts"/>
///<reference path="../../services/tileMap.ts"/>
///<reference path="../../services/tasks.ts"/>

module pow2.editor {
   declare var requestAnimFrame:any;
   declare var PIXI:any;

   export interface IDragEvent {
      active:boolean;
      delta:pow2.Point;
      start:pow2.Point;
      current:pow2.Point;
      scrollStart:pow2.Point;
   }

   export interface IEditableTileLayer {
      objects:any; // PIXI.DisplayObjectContainer[]
      name:string;
      properties:{
         [name:string]:any
      };
      opacity:number;
   }

   export class TileEditorController {
      // Dependency inject constructor
      static $inject:string[] = ['$document','$tasks'];
      constructor(public $document:any,public $tasks:any){}

      // Layers
      public layers:any[] = [];

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


      public drag:IDragEvent = {
         active:false,
         start:null,
         current:null,
         scrollStart:null,
         delta:null
      };
      public unwatchProgress:any = null;

      init(element){
         // create a renderer instance
         this.renderer = PIXI.autoDetectRenderer(element.height(),element.width());
      }

      toggleLayerVisibility(layer:IEditableTileLayer){
         console.log("Toggle layer " + layer.name + " to - " + layer.objects.visible ? "off" : "on");
         layer.objects.visible = !layer.objects.visible;
      }

      resetDrag(){
         this.drag = _.extend({},{
            active:false,
            start:null,
            current:null,
            delta:null
         });
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


      // INPUT
      /**
       *  Pan Input listener
       *
       *  TODO: Refactor into generic zoom/pan directive that
       *  takes generic x/y/scale props (rather than pixi specific
       *  sceneContainer props) and manipulates them.
       */
      handleMouseDown(event:MouseEvent) {
         this.drag.active = true;
         this.drag.start = new Point(event.screenX,event.screenY);
         this.drag.current = this.drag.start.clone();
         this.drag.delta = new pow2.Point(0,0);
         this.drag.scrollStart = new Point(this.cameraCenter.x,this.cameraCenter.y);
         var _mouseUp = (event:MouseEvent) => {
            this.$document.off('mousemove',_mouseMove);
            this.$document.off('mouseup',_mouseUp);
            this.resetDrag();
         };
         var _mouseMove = (event:MouseEvent) => {
            if(!this.drag.active){
               return;
            }
            this.drag.current.set(event.screenX,event.screenY);
            this.drag.delta.set(this.drag.start.x - this.drag.current.x, this.drag.start.y - this.drag.current.y);

            this.cameraCenter.x = this.drag.scrollStart.x + this.drag.delta.x * (1 / this.cameraZoom);
            this.cameraCenter.y = this.drag.scrollStart.y + this.drag.delta.y * (1 / this.cameraZoom);

            this.updateCamera();
            event.stopPropagation();
            return false;
         };
         this.$document.on('mousemove', _mouseMove);
         this.$document.on('mouseup', _mouseUp);
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

   pow2.editor.app.directive("tileEditorView", [
      "$interval", "$parse","$document","$tasks","$platform",
      ($interval,$parse,$document,$tasks:TasksService,$platform:IAppPlatform) => {

         return {
            restrict: "E",
            replace: true,
            templateUrl: "source/directives/editors/tileEditorView.html",
            require:["tileEditorView","^documentView"],
            controller:TileEditorController,
            controllerAs:'editor',
            compile:(element,attributes) => {
               var source = $parse(attributes.url);

               return (scope, element, attributes:any,controllers:any[]) => {
                  var tileEditor:TileEditorController = controllers[0];
                  var documentViewController:DocumentViewController = controllers[1];
                  var t:pow2.editor.TileMap = new pow2.editor.TileMap($platform);

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
                     if(t.mapName){
                        $tasks.killTaskGroup(t.mapName);
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
                     t.load(newUrl,buildMapRender);
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
                  var buildMapRender = () => {
                     tileEditor.layers.length = 0;
                     tileEditor.cameraCenter.set(t.map.width * t.map.tilewidth / 2, t.map.height * t.map.tileheight / 2);
                     tileEditor.cameraHeight = element.height();
                     tileEditor.cameraWidth = element.width();
                     tileEditor.cameraZoom = 1;
                     tileEditor.updateCamera();

                     $platform.setTitle(newUrl);
                     var spriteTextures:any = {};
                     var objectContainers:any = {};
                     _.each(t.map.tilesets,(tsx:pow2.editor.formats.tiled.TiledTSX) => {
                        spriteTextures[tsx.url] = new PIXI.BaseTexture(tsx.image,PIXI.scaleModes.NEAREST);
                     });

                     // Pre allocate display object containers.
                     angular.forEach(t.map.layers,(layer:pow2.editor.formats.tiled.ITiledLayer) => {
                        tileEditor.layers.push({
                           objects:new PIXI.DisplayObjectContainer(),
                           name:layer.name,
                           properties:layer.properties,
                           opacity:layer.opacity
                        });
                     });

                     // Each layer
                     angular.forEach(t.map.layers,(l:pow2.editor.formats.tiled.ITiledLayer,index:number) => {
                        $tasks.add(() => {
                           documentViewController.setLoadingDetails(l.name);
                           var container = tileEditor.layers[index].objects;
                           container.visible = l.visible;
                           tileEditor.sceneContainer.addChild(container);
                           for(var col:number = 0; col < t.bounds.extent.x; col++) {
                              for (var row:number = 0; row < t.bounds.extent.y; row++) {
                                 var gid:number = t.getTileGid(l.name,col, row);
                                 var meta:pow2.editor.formats.tiled.ITileInstanceMeta = t.getTileMeta(gid);
                                 if (meta) {
                                    var frame = new PIXI.Rectangle(meta.x,meta.y,meta.width,meta.height);
                                    var texture = new PIXI.Texture(spriteTextures[meta.url],frame);
                                    var sprite = new PIXI.Sprite(texture);
                                    sprite.x = col * t.map.tileheight;
                                    sprite.y = row * t.map.tilewidth;
                                    sprite.width = t.map.tilewidth;
                                    sprite.height = t.map.tileheight;
                                    //sprite.anchor = centerOrigin;
                                    container.addChild(sprite);
                                 }
                              }
                           }
                           //container.cacheAsBitmap = true;
                           return true;
                        },t.mapName);
                     });

                     // Each object group
                     _.each(t.map.objectGroups,(o:pow2.editor.formats.tiled.ITiledObjectGroup) => {
                        $tasks.add(() => {
                           documentViewController.setLoadingDetails(o.name);
                           var container = objectContainers[o.name] = new PIXI.DisplayObjectContainer();
                           _.each(o.objects,(obj:pow2.editor.formats.tiled.ITiledObject) => {
                              var box = new PIXI.Graphics();
                              box.beginFill(0xFFFFFF);
                              box.alpha = 0.6;
                              box.lineStyle(1 , 0xAAAAAA);
                              box.drawRect(0, 0, obj.width, obj.height);
                              box.endFill();
                              box.position.x = obj.x;
                              box.position.y = obj.y;
                              container.addChild(box);
                           });
                           container.visible = o.visible;
                           tileEditor.sceneContainer.addChild(container);
                           //container.cacheAsBitmap = true;
                           return true;
                        },t.mapName);
                     });
                     stage.addChild(tileEditor.sceneContainer);

                     var total:number = $tasks.getRemainingTasks(t.mapName);
                     documentViewController.setLoadingTitle("Building Map...");
                     documentViewController.setTotal(total);
                     tileEditor.unwatchProgress = $interval(()=>{
                        documentViewController.setCurrent(total - $tasks.getRemainingTasks(t.mapName));
                     },50);

                     $tasks.add(() => {
                        documentViewController.hideLoading();
                        $interval.cancel(tileEditor.unwatchProgress);
                        return true;
                     },t.mapName);
                     // Debug map stats
                     var stats:string = [
                           'Layers: ' + t.map.layers.length,
                           'Groups: ' + t.map.objectGroups.length,
                           'Size: ' + t.bounds.extent
                     ].join('\n');
                     var text = new PIXI.Text(stats, {
                        font:"16px courier",
                        fill:"white",
                        stroke:"black",
                        strokeThickness:3
                     });
                     text.x = text.y = 10;
                     stage.addChild(text);
                  };

                  element.on('mousedown',(e)=>{
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
                     scopeDestroyed = true;
                     tileEditor.destroyStage(stage);
                     $interval.cancel(tileEditor.unwatchProgress);
                     $tasks.killTaskGroup(t.mapName);
                     t.reset();
                     angular.element(window).off('resize');
                  });
               };
            }
         };
      }
   ]);
}
