///<reference path="../../../types/ace/ace.d.ts"/>
///<reference path="../../../types/angular/angular.d.ts"/>
///<reference path="../../app.ts"/>

module pow2.editor {

   pow2.editor.app.directive("tileSetTilePicker", [() => {
      return {
         restrict: "E",
         scope: {
            url: "@",
            tileWidth: "@",
            tileHeight: "@",
            onPick: "&"
         },
         template: '<img src="{{url}}" class="tile-picker"/>',
         link: (scope, element, attributes) => {
            var tileWidth:number = attributes.tileWidth;
            var tileHeight:number = attributes.tileHeight;
            var pickPoint:pow2.Point = new pow2.Point(0,0);
            element.on('click',(e)=>{

               var imgX:number = e.offsetX - element[0].offsetLeft;
               var imgY:number = e.offsetY - element[0].offsetTop;
               var tileX:number = Math.floor(imgX/tileWidth);
               var tileY:number = Math.floor(imgY/tileHeight);
               console.log("Click image at X:" + tileX + ", Y:" + tileY);
               if (typeof scope.onPick === 'function') {
                  pickPoint.set(tileX, tileY);
                  scope.onPick({tilePoint:pickPoint});
                  e.stopImmediatePropagation();
                  return false;
               }
            });
            var img:HTMLImageElement = element.children('img');
            console.log("Picking for tiles of (" + attributes.tileWidth + "," + attributes.tileHeight + ") size");
         }
      };
   }]);
}
