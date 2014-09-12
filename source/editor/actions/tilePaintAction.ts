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
module pow2.editor {

   // Tile Editor actions
   export class TilePaintAction extends BaseAction {
      public name:string = "Paint Tile";
      constructor(
         public tileEditor:TileEditorController,
         public layer:IEditableTileLayer,
         public index:number,
         public gid:number){
         super();
         if(!tileEditor || !layer || typeof gid !== 'number'){
            throw new Error(pow2.errors.INVALID_ARGUMENTS);
         }
         if(index > layer.tiles.length || index < 0){
            throw new Error(pow2.errors.INDEX_OUT_OF_RANGE);
         }
         this._lastGid = layer.tiles[this.index]._gid;
      }

      private _lastGid:number = 0;

      execute():boolean {
         if(!super.execute()){
            return false;
         }
         var tile:EditableTile = this.layer.tiles[this.index];
         tile.sprite.setTexture(this.tileEditor.getGidTexture(this.gid));
         tile._gid = this.gid;
         return true;
      }

      undo():boolean {
         if(!super.undo()){
            return false;
         }
         var tile:EditableTile = this.layer.tiles[this.index];
         tile._gid = this._lastGid;
         tile.sprite.setTexture(this.tileEditor.getGidTexture(this._lastGid));
         return true;
      }
   }

}