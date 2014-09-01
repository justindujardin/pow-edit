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

/// <reference path="../../assets/bower_components/pow-core/lib/pow-core.d.ts"/>
/// <reference path="../interfaces/ITileMap.ts"/>
/// <reference path="../interfaces/IMapLoader.ts"/>

module pow2.editor {

   export class TiledMapLoader implements IMapLoader {
      static $inject:string[] = ['$q','$rootScope'];
      constructor(
         public $q:ng.IQService,
         public $rootScope:any){
      }

      load(location:string):ng.IPromise<ITileMap> {
         var deferred:ng.IDeferred<ITileMap> = this.$q.defer();
         pow2.ResourceLoader.get().load(location,(tiledResource?: pow2.TiledTMXResource)=>{
            if(!tiledResource.isReady()){
               deferred.reject("Failed to load file");
               this.$rootScope.$$phase || this.$rootScope.$digest();
               return;
            }
            var result:ITileMap = {
               size:new pow2.Point(tiledResource.width,tiledResource.height),
               point:new pow2.Point(0,0),
               tileSize:new pow2.Point(tiledResource.tilewidth,tiledResource.tileheight),
               layers:_.map(tiledResource.layers,(l:pow2.tiled.ITiledLayer)=>{
                  return <ITileLayer>{
                     tiles:l.data,
                     objects:l.objects,
                     size:new pow2.Point(l.width,l.height),
                     name:l.name,
                     point:new pow2.Point(l.x,l.y),
                     visible:l.visible,
                     opacity:l.opacity
                  }
               }),
               tileSets:[],
               tileInfo:[],
               name:tiledResource.url
            };

            var idSortedSets:any = _.sortBy(tiledResource.tilesets, (o:pow2.TiledTSXResource) => {
               return o.firstgid;
            });
            _.each(idSortedSets,(tsxRes:TiledTSXResource) => {
               while(result.tileInfo.length < tsxRes.firstgid){
                  result.tileInfo.push(null);
               }
               _.each(tsxRes.tiles,(t:any,index:number) => {
                  var tilesX = tsxRes.imageWidth / tsxRes.tilewidth;
                  var x = index % tilesX;
                  var y = Math.floor((index- x) / tilesX);
                  result.tileInfo.push(<ITileData>{
                     url:tsxRes.imageUrl,
                     image:tsxRes.image.data,
                     imageSize:new pow2.Point(tsxRes.imageWidth,tsxRes.imageHeight),
                     imagePoint:new pow2.Point(x * tsxRes.tilewidth,y * tsxRes.tileheight),
                     properties: t
                  });
               });
            });

            _.each(tiledResource.tilesets,(tsr:pow2.TiledTSXResource) => {

               result.tileSets.push({
                  tileSize:new pow2.Point(tsr.tilewidth,tsr.tileheight),
                  tiles:tsr.tiles,
                  url:tsr.imageUrl,
                  image:tsr.image.data,
                  firstIndex:tsr.firstgid,
                  imageSize:new pow2.Point(tsr.imageWidth,tsr.imageHeight),
                  name:tsr.name
               });
            });

            deferred.resolve(result);
            this.$rootScope.$$phase || this.$rootScope.$digest();

         });

         return deferred.promise;
      }

      save(location:string, data:ITileMap):ng.IPromise<ITileMap> {
         var deferred:ng.IDeferred<ITileMap> = this.$q.defer();

         return deferred.promise;
      }

   }
}
