///<reference path="../../types/ace/ace.d.ts"/>
///<reference path="../../types/angular/angular.d.ts"/>
///<reference path="../app.ts"/>
///<reference path="../services/tileMap.ts"/>

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


   pow2.editor.app.directive("pixi", [
      "$timeout",
      "$rootScope",
      "$parse",
      "platform",
      ($timeout:ng.ITimeoutService,$rootScope:any,$parse:ng.IParseService,platform:IAppPlatform) => {

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
         return {
            restrict: "E",
            replace: true,
            templateUrl: "source/directives/editorView.html",
            compile:(element,attributes) => {
               var source = $parse(attributes.url);
               return (scope, element, attrs:any) => {

                  var t:pow2.editor.tiled.TileMap = new pow2.editor.tiled.TileMap(platform);

                  // create an new instance of a pixi stage
                  var stage = new PIXI.Stage(0x2b2b2b, true);
                  stage.pivot = centerOrigin;
                  var newUrl:string = source(scope);

                  /**
                   * Data binding
                   */
                  var updateView = () => {
                     newUrl = source(scope);
                     if(!newUrl){
                        return;
                     }
                     if(sceneContainer){
                        for (var i = stage.children.length - 1; i >= 0; i--) {
                           stage.removeChild(stage.children[i]);
                        }
                     }
                     sceneContainer = new PIXI.DisplayObjectContainer();

                     scope.status = "Loading...";
                     t.load(newUrl,buildMapRender);
                  };
                  scope.$watch(attrs.url, updateView);


                  // create a renderer instance
                  var renderer = PIXI.autoDetectRenderer(element.height(),element.width());
                  // add the renderer view element to the DOM
                  element.append(renderer.view);

                  var sceneContainer:any = null;

                  var buildMapRender = () => {
                     scope.$apply(()=>{
                        scope.status = "Building...";
                     });

                     sceneContainer.x = (element.width() / 2) - (t.map.width * t.map.tilewidth / 2);
                     sceneContainer.y = (element.height() / 2) - (t.map.height * t.map.tileheight / 2);
                     sceneContainer.pivot = sceneContainer.anchor = centerOrigin;


                     platform.setTitle(newUrl);
                     var spriteTextures:any = {};
                     var layerContainers:any = {};
                     var objectContainers:any = {};
                     _.each(t.map.tilesets,(tsx:pow2.editor.tiled.TiledTSX) => {
                        spriteTextures[tsx.url] = new PIXI.BaseTexture(tsx.image,PIXI.scaleModes.NEAREST);
                     });

                     // Each layer
                     _.each(t.map.layers,(l:tiled.ITiledLayer) => {
                        var container = layerContainers[l.name] = new PIXI.DisplayObjectContainer();
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
                        container.visible = l.visible;
                        container.pivot = container.anchor = centerOrigin;
                        sceneContainer.addChild(container);
                        //container.cacheAsBitmap = true;
                     });
                     // Each object group
                     _.each(t.map.objectGroups,(o:tiled.ITiledObjectGroup) => {
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
                     });

                     stage.addChild(sceneContainer);


                     scope.$apply(()=>{
                        scope.status = null;
                     });
                     // Debug map stats
                     var stats:string = [
                        'Layers: ' + t.map.layers.length,
                        'Groups: ' + t.map.objectGroups.length,
                        'Size: ' + t.bounds.extent
                     ].join('\n');
                     var text = new PIXI.Text(stats, {
                        font:"20px SourceCodePro-Regular",
                        fill:"white",
                        stroke:"black"
                     });
                     text.x = text.y = 0;
                     stage.addChild(text);
                  };

                  /**
                   *  Pan/Zoom input listeners
                   */
                  element.on('mousedown',(event:MouseEvent) => {
                     drag.active = true;
                     drag.start = new Point(event.screenX,event.screenY);
                     drag.current = drag.start.clone();
                     drag.delta = new pow2.Point(0,0);
                     drag.scrollStart = new Point(sceneContainer.x,sceneContainer.y);
                  });
                  element.on('mousemove',(event:MouseEvent) => {
                     if(!drag.active){
                        return;
                     }
                     drag.current.set(event.screenX,event.screenY);
                     drag.delta.set(drag.start.x - drag.current.x, drag.start.y - drag.current.y);

                     sceneContainer.x = drag.scrollStart.x - drag.delta.x;
                     sceneContainer.y = drag.scrollStart.y - drag.delta.y;

                     event.stopPropagation();
                     return false;
                  });
                  element.on('mouseup',(event:MouseEvent) => {
                     resetDrag();
                  });
                  element.on("mousewheel DOMMouseScroll MozMousePixelScroll", (ev) => {
                     var delta:number = (ev.originalEvent.detail ? ev.originalEvent.detail * -1 : ev.originalEvent.wheelDelta);
                     var scale:number = sceneContainer.scale.x;
                     var move:number = scale / 10;
                     scale += (delta > 0 ? move : -move);
                     sceneContainer.scale.x = sceneContainer.scale.y = scale;
                     ev.stopImmediatePropagation();
                     ev.preventDefault();
                     return false;
                  });

                  /**
                   * Process loop
                   */
                  function animate() {
                     renderer.render(stage);
                     requestAnimFrame(animate);
                  }
                  requestAnimFrame(animate);

                  updateView();

                  /**
                   * Resize hacks.
                   */
                  setTimeout(()=>{
                     var w:number = element.width();
                     var h:number = element.height();
                     renderer.resize(w,h);
                  },50);
                  var debounce;
                  angular.element(window).on('resize',() => {
                     clearTimeout(debounce);
                     debounce = setTimeout(() => {
                        var w:number = element.width();
                        var h:number = element.height();
                        renderer.resize(w,h);
                     }, 20);
                  });
                  return scope.$on("$destroy", function() {
                     angular.element(window).off('resize');
                  });
               };
            }
         };
      }
   ]);
}