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

module pow2.editor {

   // Common to everything ---
   export interface ITileBounds {
      point:pow2.Point;
      size:pow2.Point;
   }
   export interface ITileProperties {
      properties?:{
         [key:string]:any
      };
   }

   export interface ITileNamed extends ITileProperties{
      name:string;
   }

   // Tile elements ---
   export interface ITileData extends ITileProperties {
      url: string;
      image: HTMLImageElement;
      imageSize:pow2.Point;
      imagePoint?:pow2.Point;
      visible?:boolean;
      opacity?:number; // 0-1
   }

   export interface ITileSet extends ITileNamed, ITileData {
      tileSize:pow2.Point;
      tiles:ITileData[];
      firstIndex:number;
   }

   // Layers ---
   export interface ITileLayer extends ITileNamed, ITileBounds {
      tiles:number[]; // y * w + x = tile index from col/row
      properties:{
         [name:string]:any
      };
      visible:boolean;
      opacity:number;
      objects:any[];
   }

    // Tile Map ---
   export interface ITileMap extends ITileNamed, ITileBounds {
      // Array of tile meta information sorted by global tileset ID
      tileInfo:ITileData[];
      tileSets:ITileSet[];
      tileSize:pow2.Point;
      layers:ITileLayer[];
   }


}