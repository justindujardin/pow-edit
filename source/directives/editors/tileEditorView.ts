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


   pow2.editor.app.directive("tileEditorView", [
      "$timeout",
      "$rootScope",
      "$interval",
      "$parse",
      "$document",
      "$tasks",
      "platform",
      ($timeout:ng.ITimeoutService,
       $rootScope:any,
       $interval:ng.IIntervalService,
       $parse:ng.IParseService,
       $document,
       $tasks:pow2.editor.TasksService,
       platform:IAppPlatform) => {

         var drag:IDragEvent = {
            active:false,
            start:null,
            current:null,
            scrollStart:null,
            delta:null
         };
         var resetDrag = () => {
            drag = _.extend({},{
               active:false,
               start:null,
               current:null,
               delta:null
            });
         };

         var centerOrigin = new PIXI.Point(0.5,0.5);

         var destroyStage = (stage) => {
            if(stage){
               for (var i = stage.children.length - 1; i >= 0; i--) {
                  stage.removeChild(stage.children[i]);
               }
            }
         };

         return {
            restrict: "E",
            replace: true,
            templateUrl: "source/directives/editors/tileEditorView.html",
            require:"^documentView",
            compile:(element,attributes) => {
               var source = $parse(attributes.url);
               var cameraWidth:number;
               var cameraHeight:number;
               var cameraCenter:pow2.Point = new pow2.Point(0,0);
               var cameraZoom:number = 1;
               return (scope, element, attrs:any,documentViewController:DocumentViewController) => {
                  var t:pow2.editor.tiled.TileMap = new pow2.editor.tiled.TileMap(platform);

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
                        destroyStage(stage);
                        sceneContainer = null;
                        return;
                     }

                     if(sceneContainer){
                        destroyStage(stage);
                     }
                     sceneContainer = new PIXI.DisplayObjectContainer();

                     documentViewController.showLoading('Loading...');
                     t.load(newUrl,buildMapRender);
                  };
                  scope.$watch(attrs.url, updateView);


                  // create a renderer instance
                  var renderer = PIXI.autoDetectRenderer(element.height(),element.width());
                  // add the renderer view element to the DOM
                  element.append(renderer.view);

                  var sceneContainer:any = null;
                  var unwatchProgress:any = null;
                  var updateCamera = () => {
                     sceneContainer.x = -cameraCenter.x * cameraZoom + (cameraWidth / 2);
                     sceneContainer.y = -cameraCenter.y * cameraZoom + (cameraHeight / 2);
                     sceneContainer.scale.x = sceneContainer.scale.y = cameraZoom;
                  };
                  var buildMapRender = () => {

                     cameraCenter.set(t.map.width * t.map.tilewidth / 2, t.map.height * t.map.tileheight / 2);
                     cameraHeight = element.height();
                     cameraWidth = element.width();
                     cameraZoom = 1;
                     sceneContainer.pivot = sceneContainer.anchor = centerOrigin;
                     updateCamera();

                     platform.setTitle(newUrl);
                     var spriteTextures:any = {};
                     var layerContainers:any = {};
                     var objectContainers:any = {};
                     _.each(t.map.tilesets,(tsx:pow2.editor.tiled.TiledTSX) => {
                        spriteTextures[tsx.url] = new PIXI.BaseTexture(tsx.image,PIXI.scaleModes.NEAREST);
                     });

                     // Each layer
                     _.each(t.map.layers,(l:tiled.ITiledLayer) => {
                        $tasks.add(() => {
                           documentViewController.setLoadingDetails(l.name);
                           var container = layerContainers[l.name] = new PIXI.DisplayObjectContainer();
                           container.visible = l.visible;
                           container.pivot = container.anchor = centerOrigin;
                           sceneContainer.addChild(container);
                           for(var col:number = 0; col < t.bounds.extent.x; col++) {
                              for (var row:number = 0; row < t.bounds.extent.y; row++) {
                                 var gid:number = t.getTileGid(l.name,col, row);
                                 var meta:tiled.ITileInstanceMeta = t.getTileMeta(gid);
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
                     _.each(t.map.objectGroups,(o:tiled.ITiledObjectGroup) => {
                        $tasks.add(() => {
                           documentViewController.setLoadingDetails(o.name);
                           var container = objectContainers[o.name] = new PIXI.DisplayObjectContainer();
                           _.each(o.objects,(obj:tiled.ITiledObject) => {
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
                           container.pivot = container.anchor = centerOrigin;
                           sceneContainer.addChild(container);
                           //container.cacheAsBitmap = true;
                           return true;
                        },t.mapName);
                     });
                     stage.addChild(sceneContainer);

                     var total:number = $tasks.getRemainingTasks(t.mapName);
                     documentViewController.setLoadingTitle("Building Map...");
                     documentViewController.setTotal(total);
                     unwatchProgress = $interval(()=>{
                        documentViewController.setCurrent(total - $tasks.getRemainingTasks(t.mapName));
                     },50);

                     $tasks.add(() => {
                        documentViewController.hideLoading();
                        $interval.cancel(unwatchProgress);
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

                  /**
                   *  Pan/Zoom input listeners
                   *
                   *  TODO: Refactor into generic zoom/pan directive that
                   *  takes generic x/y/scale props (rather than pixi specific
                   *  sceneContainer props) and manipulates them.
                   */
                  var mouseMove = (event:MouseEvent) => {
                     if(!drag.active){
                        return;
                     }
                     drag.current.set(event.screenX,event.screenY);
                     drag.delta.set(drag.start.x - drag.current.x, drag.start.y - drag.current.y);

                     cameraCenter.x = drag.scrollStart.x + drag.delta.x * (1 / cameraZoom);
                     cameraCenter.y = drag.scrollStart.y + drag.delta.y * (1 /cameraZoom);

                     updateCamera();
                     event.stopPropagation();
                     return false;
                  };
                  var mouseUp = (event:MouseEvent) => {
                     $document.off('mousemove', mouseMove);
                     $document.off('mouseup', mouseUp);
                     resetDrag();
                  };
                  element.on('mousedown',(event:MouseEvent) => {
                     drag.active = true;
                     drag.start = new Point(event.screenX,event.screenY);
                     drag.current = drag.start.clone();
                     drag.delta = new pow2.Point(0,0);
                     drag.scrollStart = new Point(cameraCenter.x,cameraCenter.y);
                     $document.on('mousemove', mouseMove);
                     $document.on('mouseup', mouseUp);
                  });
                  element.on("mousewheel DOMMouseScroll MozMousePixelScroll", (ev) => {
                     if(sceneContainer){
                        var delta:number = (ev.originalEvent.detail ? ev.originalEvent.detail * -1 : ev.originalEvent.wheelDelta);
                        var scale:number = sceneContainer.scale.x;
                        var move:number = scale / 10;
                        scale += (delta > 0 ? move : -move);
                        cameraZoom = scale;
                        updateCamera();
                        ev.stopImmediatePropagation();
                        ev.preventDefault();
                        return false;
                     }
                  });

                  var scopeDestroyed:boolean = false;
                  /**
                   * Process loop
                   */
                  function animate() {
                     renderer.render(stage);
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
                     renderer.resize(w,h);
                     cameraWidth = w;
                     cameraHeight = h;
                     updateCamera();
                  };

                  setTimeout(updateSize,50);
                  var debounce;
                  var resizeHack = () => {
                     clearTimeout(debounce);
                     debounce = setTimeout(updateSize, 20);
                  };
                  angular.element(window).on('resize',resizeHack);
                  element.on('resize',resizeHack);
                  return scope.$on("$destroy", function() {
                     scopeDestroyed = true;
                     destroyStage(stage);
                     $interval.cancel(unwatchProgress);
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
