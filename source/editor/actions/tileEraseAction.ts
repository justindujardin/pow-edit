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
      }

      private _lastGid:number = 0;
      private _lastMeta:ITileData = null;

      execute():boolean {
         if(!super.execute()){
            return false;
         }
         var tile:EditableTile = this.layer.tiles[this.index];
         if(!tile){
            return false;
         }
         this._lastGid = tile._gid;
         this._lastMeta = tile._meta;
         tile._gid = 0;
         tile._meta = null;
         // TODO: Cache this "blank" render texture somewhere.  Maybe a static?
         tile.sprite.setTexture(new PIXI.RenderTexture(this.tileEditor.tileMap.tileSize.x, this.tileEditor.tileMap.tileSize.y));
         return true;
      }

      undo():boolean {
         if(!super.undo()){
            return false;
         }
         var tile:EditableTile = this.layer.tiles[this.index];
         if(!tile){
            return false;
         }

         if(!this._lastGid || !this._lastMeta){
            return false;
         }
         tile._gid = this._lastGid;
         tile._meta = this._lastMeta;
         tile.sprite.setTexture(this.tileEditor.getGidTexture(this._lastGid));
         return true;
      }
   }

}