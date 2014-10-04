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
               }
               e.stopImmediatePropagation();
               return false;
            });
            var img:HTMLImageElement = element.children('img');
            console.log("Picking for tiles of (" + attributes.tileWidth + "," + attributes.tileHeight + ") size");
         }
      };
   }]);
}
