///<reference path="../../../assets/vendor/pow2/pow2.d.ts"/>
///<reference path="../../../types/ace/ace.d.ts"/>
///<reference path="../../../types/angular/angular.d.ts"/>
///<reference path="../../app.ts"/>
///<reference path="../../services/tasks.ts"/>
///<reference path="../../formats/tiledFormat.ts"/>

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
      static $inject:string[] = ['$document','$tasks','$injector'];
      constructor(
         public $document:any,
         public $tasks:any,
         public $injector:any) {
         this.loader = this.$injector.instantiate(TiledMapLoader);
      }

      public loader:TiledMapLoader;

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
      handleMouseDown(event:any) {
         var e = event;
         if(event.originalEvent.touches) {
            e = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
         }
         this.drag.start = new Point(e.screenX,e.screenY);
         this.drag.active = true;
         this.drag.start = new Point(e.screenX,e.screenY);
         this.drag.current = this.drag.start.clone();
         this.drag.delta = new pow2.Point(0,0);
         this.drag.scrollStart = new Point(this.cameraCenter.x,this.cameraCenter.y);
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
            this.drag.current.set(evt.screenX,evt.screenY);
            this.drag.delta.set(this.drag.start.x - this.drag.current.x, this.drag.start.y - this.drag.current.y);

            this.cameraCenter.x = this.drag.scrollStart.x + this.drag.delta.x * (1 / this.cameraZoom);
            this.cameraCenter.y = this.drag.scrollStart.y + this.drag.delta.y * (1 / this.cameraZoom);

            this.updateCamera();
            event.stopPropagation();
            return false;
         };
         this.$document.on('mousemove touchmove', _mouseMove);
         this.$document.on('mouseup touchend', _mouseUp);
         event.stopPropagation();
         return false;
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
                           t = tileMap;
                           buildMapRender();
                        }).catch((e:any)=>{
                           console.error(e);
                        });
                     });
                     //t.load(newUrl,buildMapRender);
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
                     tileEditor.cameraCenter.set(t.size.x * t.tileSize.x / 2, t.size.y * t.tileSize.y / 2);
                     tileEditor.cameraHeight = element.height();
                     tileEditor.cameraWidth = element.width();
                     tileEditor.cameraZoom = 1;
                     tileEditor.updateCamera();

                     $platform.setTitle(newUrl);
                     var spriteTextures:any = {};
                     _.each(t.tileSets,(tsx:pow2.editor.ITileSet) => {
                        spriteTextures[tsx.url] = new PIXI.BaseTexture(tsx.image,PIXI.scaleModes.NEAREST);
                     });

                     // Pre allocate display object containers.
                     angular.forEach(t.layers,(layer:pow2.editor.formats.tiled.ITiledLayer) => {
                        var container = new PIXI.DisplayObjectContainer();
                        tileEditor.layers.push(<IEditableTileLayer>{
                           objects:container,
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
                           var container = tileEditor.layers[index].objects;
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
                                       var sprite = new PIXI.Sprite(texture);
                                       sprite.x = col * t.tileSize.y;
                                       sprite.y = row * t.tileSize.x;
                                       sprite.width = t.tileSize.x;
                                       sprite.height = t.tileSize.y;
                                       //sprite.anchor = centerOrigin;
                                       container.addChild(sprite);
                                    }
                                 }
                              }
                           }
                           _.each(l.objects,(obj:pow2.editor.formats.tiled.ITiledObject) => {
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
                     var text = new PIXI.Text(stats, {
                        font:"16px courier",
                        fill:"white",
                        stroke:"black",
                        strokeThickness:3
                     });
                     text.x = text.y = 10;
                     stage.addChild(text);
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
}
