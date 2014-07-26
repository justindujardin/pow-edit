module pow2.editor {

   export class TileEraseAction extends BaseAction {
      public name:string = "Clear Tile";
      constructor(
         public tileEditor:TileEditorController,
         public layer:IEditableTileLayer,
         public index:number){
         super();
         if(index > layer.tiles.length || index < 0){
            throw new Error("TileEraseAction: layer tile index out of range");
         }
         var tile:EditableTile = this.layer.tiles[this.index];
         if(!tile){
            throw new Error("Cannot erase undefined tile at index " + this.index);
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