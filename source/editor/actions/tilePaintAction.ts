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
         if(index > layer.tiles.length || index < 0){
            throw new Error("PaintAction: layer tile index out of range");
         }
         var tile:EditableTile = this.layer.tiles[this.index];
         if(!tile){
            throw new Error("Cannot paint to undefined tile at index " + this.index);
         }
         this._lastGid = tile._gid;
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