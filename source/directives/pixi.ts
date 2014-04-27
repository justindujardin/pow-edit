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


               /**
                *  TODO
                *   - Image fetching for source images should go through Pixi, not Img element and callbacks
                *   - Events and done triggering.  Async load of textures for tilesets needs to be
                *     handled properly.
                */
               var map:pow2.editor.tiled.TileMap = new pow2.editor.tiled.TileMap(platform,'assets/maps/combat.tmx');
               map.load();


               // create an new instance of a pixi stage
               var stage = new PIXI.Stage(0x2b2b2b, true);

               // create a renderer instance
               var renderer = PIXI.autoDetectRenderer(element.height(),element.width());

               // add the renderer view element to the DOM
               element.append(renderer.view);

               // create a texture from an image path
               var texture = PIXI.Texture.fromImage("../image.png");

               // create a tiling sprite ...
               // requires a texture, width and height
               // to work in webGL the texture size must be a power of two
               var tilingSprite = new PIXI.TilingSprite(texture, 1024, 768);
               stage.addChild(tilingSprite);

               var count = 0;
               function animate() {
                  tilingSprite.tilePosition.x += 1;
                  tilingSprite.tilePosition.y += 1;
                  renderer.render(stage);
                  requestAnimFrame(animate);
               }
               requestAnimFrame(animate);

               setTimeout(()=>{
                  var w:number = element.width();
                  var h:number = element.height();
                  renderer.resize(w,h);
                  texture.width = w;
                  texture.height = h;
               },50);
               var debounce;
               angular.element(window).on('resize',() => {
                  clearTimeout(debounce);
                  debounce = setTimeout(() => {
                     var w:number = element.width();
                     var h:number = element.height();
                     renderer.resize(w,h);
                     texture.width = w;
                     texture.height = h;
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
