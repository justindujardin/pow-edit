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
///<reference path="../../services/actions.ts"/>
///<reference path="../../formats/powTileMap.ts"/>

module pow2.editor {

   // Tile Editor actions
   export class TilePaintAction extends BaseAction {
      public name:string = "Paint Tile";
      constructor(
         public layer:PowTileLayer,
         public index:number,
         public gid:number){
         super();
         if(!layer || typeof gid !== 'number'){
            throw new Error(pow2.errors.INVALID_ARGUMENTS);
         }
         if(index > layer.tiles.length || index < 0){
            throw new Error(pow2.errors.INDEX_OUT_OF_RANGE);
         }
         this._lastGid = layer.tiles[this.index];
      }
      private _lastGid:number = 0;
      execute():boolean {
         if(!super.execute()){
            return false;
         }
         this.layer.setTileGid(this.index,this.gid);
         return true;
      }

      undo():boolean {
         if(!super.undo()){
            return false;
         }
         this.layer.setTileGid(this.index,this._lastGid);
         return true;
      }
   }

}