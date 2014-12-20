/*
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
///<reference path="../../../../types/ace/ace.d.ts"/>
///<reference path="../../../../types/angular/angular.d.ts"/>
///<reference path="../../../app.ts"/>

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
         templateUrl: 'source/editors/tile/directives/tileSetTilePicker.html',
         link: (scope, element:JQuery, attributes) => {
            var tileWidth:number = attributes.tileWidth;
            var tileHeight:number = attributes.tileHeight;
            var pickPoint:pow2.Point = new pow2.Point(0,0);

            var tileForEvent = (ev:any,point:pow2.Point):void => {
               var imgX:number = (ev.offsetX - element[0].offsetLeft) / scale;
               var imgY:number = (ev.offsetY - element[0].offsetTop) / scale;
               var tileX:number = Math.floor(imgX/tileWidth);
               var tileY:number = Math.floor(imgY/tileHeight);
               point.set(tileX,tileY);
            };
            var from:pow2.Point = new pow2.Point();
            element.on('click touchstart',(ev)=>{
               tileForEvent(ev,from);
               if (typeof scope.onPick === 'function') {
                  pickPoint.set(from.x, from.y);
                  scope.onPick({tilePoint:pickPoint});
               }
               selector.css({
                  top:from.y * tileHeight * scale + 'px',
                  left:from.x * tileWidth * scale + 'px',
                  height:tileHeight * scale + 'px',
                  width:tileWidth * scale + 'px'
               });
               ev.preventDefault();
            });

            // Selector indicator
            var selector:JQuery = element.find('.selection');
            // Img source
            var image:JQuery = element.find('img');

            // 16x16 or smaller tile size?
            var tiny:boolean = tileWidth <= 16 || tileHeight <= 16;

            // If the tilesize is 16x16 or less, scale the tileset up
            // to 2x its source size.  This allows easier touch interactions
            // by effectively ensuring there's always a reasonably sized hit
            // box for fat-finger selection.
            var scale:number = tiny ? 2 : 1;
            selector.css({
               height:tileHeight * scale + 'px',
               width:tileWidth * scale + 'px',
               top:0,
               left:0
            });
            var scaleIt:any = () => {
               image.css({
                  height:img.naturalHeight * scale + 'px',
                  width:img.naturalWidth * scale + 'px'
               });
            };
            var img = <HTMLImageElement>image[0];
            if(img.complete){
               scaleIt();
            }
            else {
               img.onload = scaleIt;
            }
            console.log("Picking for tiles of (" + attributes.tileWidth + "," + attributes.tileHeight + ") size");
         }
      };
   }]);
}
