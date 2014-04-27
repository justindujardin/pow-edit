///<reference path="../../types/ace/ace.d.ts"/>
///<reference path="../../types/angular/angular.d.ts"/>
///<reference path="../app.ts"/>
///<reference path="../services/tileMap.ts"/>

module pow2.editor {
   declare var requestAnimFrame:any;
   declare var PIXI:any;

   pow2.editor.app.directive("pixi", [
      "$timeout",
      "$rootScope",
      "platform",
      ($timeout:ng.ITimeoutService,$rootScope:any,platform:IAppPlatform) => {
         return {
            restrict: "E",
            replace: true,
            template: "<div class=\"pixi-stage\"></div>",
            link: (scope, element, attrs:any) => {

               // create an new instance of a pixi stage
               var stage = new PIXI.Stage(0x2b2b2b, true);

               // create a renderer instance
               var renderer = PIXI.autoDetectRenderer(element.height(),element.width());
               // add the renderer view element to the DOM
               element.append(renderer.view);

               var t:pow2.editor.tiled.TileMap = new pow2.editor.tiled.TileMap(platform);
               t.load('assets/maps/sewer.tmx',() => {
                  var spriteTextures:any = {};
                  var layerContainers:{
                     [name:string]:any;
                  } = {};
                  /**
                   * TODO: Sprites for each tile, in a container, marked cacheAsTexture.
                   */
                  _.each(t.map.tilesets,(tsx:pow2.editor.tiled.TiledTSX) => {
                     spriteTextures[tsx.url] = new PIXI.BaseTexture(tsx.image,PIXI.scaleModes.NEAREST);
                  });

                  var layers = t.getLayers();
                  // Each layer
                  _.each(layers,(l:tiled.ITiledLayer) => {
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
                              container.addChild(sprite);
                           }
                        }
                     }
                     container.scale = new PIXI.Point(2,2);
                     stage.addChild(container);
                  });

                  function animate() {
//                     _.each(layerContainers,(c) => {
//                        c.scale.x += 0.01;
//                        c.scale.y += 0.01;
//                        if(c.scale.x > 3 || c.scale.y > 3){
//                           c.scale.x = c.scale.y = 1;
//                        }
//                     });
                     renderer.render(stage);
                     requestAnimFrame(animate);
                  }
                  requestAnimFrame(animate);
               });

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

            }
         };
      }
   ]);
}
