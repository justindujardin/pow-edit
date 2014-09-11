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

   export class TileEraseAction extends BaseAction {
      public name:string = "Clear Tile";
      constructor(
         public tileEditor:TileEditorController,
         public layer:IEditableTileLayer,
         public index:number){
         super();
         if(index > layer.tiles.length || index < 0){
            throw new Error(pow2.errors.INDEX_OUT_OF_RANGE);
         }
         var tile:EditableTile = this.layer.tiles[index];
         if(!tile){
            throw new Error(pow2.errors.INVALID_ITEM);
         }
         this._lastGid = tile._gid;
      }
      private _lastGid:number;

      execute():boolean {
         if(!super.execute()){
            return false;
         }
         var tile:EditableTile = this.layer.tiles[this.index];
         tile._gid = 0;
         tile.sprite.setTexture(this.tileEditor.getGidTexture(0));
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