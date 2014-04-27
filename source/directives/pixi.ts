///<reference path="../../types/ace/ace.d.ts"/>
///<reference path="../../types/angular/angular.d.ts"/>
///<reference path="../app.ts"/>

module pow2.editor {
   declare var PIXI:any;
   declare var requestAnimFrame:any;

   pow2.editor.app.directive("pixi", [
      "$timeout",
      "$rootScope",
      ($timeout:ng.ITimeoutService,$rootScope:any) => {
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

               // create a texture from an image path
               var texture = PIXI.Texture.fromImage("../image.png");

               // create a tiling sprite ...
               // requires a texture, width and height
               // to work in webGL the texture size must be a power of two
               var tilingSprite = new PIXI.TilingSprite(texture, 1024, 768);
               stage.addChild(tilingSprite);

               var count = 0;
               function animate() {
                  count += 0.005;

                  tilingSprite.tileScale.x = 2 + Math.sin(count);
                  tilingSprite.tileScale.y = 2 + Math.cos(count);

                  tilingSprite.tilePosition.x += 1;
                  tilingSprite.tilePosition.y += 1;

                  // render the stage
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
