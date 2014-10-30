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

   interface FloodTile {
      index:number;
      gid:number;
   }

   export class TileFloodPaintAction extends BaseAction {
      public name:string = "Flood Fill Tile";
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
         this._sourceGid = layer.tiles[index];
         this._mapArea = new pow2.Rect(layer.point,layer.size);
      }
      private _sourceGid:number;
      private _changed:FloodTile[] = [];
      private _mapArea:pow2.Rect;
      execute():boolean {
         if(!super.execute()){
            return false;
         }
         if(this._sourceGid === this.gid){
            return false;
         }
         var x = this.index % this.layer.size.x;
         var y = (this.index - x) / this.layer.size.x;
         this._floodPaint(x,y);
         return true;
      }
      undo():boolean {
         if(!super.undo()){
            return false;
         }
         while(this._changed.length > 0){
            var memento:FloodTile = this._changed.pop();
            this.layer.setTileGid(memento.index,memento.gid);
         }
         return true;
      }


      /**
       * Flood fill (simple recursive)
       *
       * TODO: Stack to avoid overflow with large maps
       */
      private _floodPaint(x:number,y:number){
         if(!this._validIndex(x,y)){
            return;
         }
         this._paintAt(x,y);

         this._floodPaint(x,y-1);
         this._floodPaint(x+1,y);
         this._floodPaint(x,y+1);
         this._floodPaint(x-1,y);
      }
      private _validIndex(x:number,y:number){
         if(!this._mapArea.pointInRect(x,y)){
            return false;
         }
         var index:number = y * this.layer.size.x + x;
         return this.layer.tiles[index] == this._sourceGid;
      }

      private _paintAt(x:number,y:number){
         var index:number = y * this.layer.size.x + x;
         this.layer.setTileGid(index,this.gid);
         this._changed.push({
            index:index,
            gid:this._sourceGid
         });
      }
   }

}