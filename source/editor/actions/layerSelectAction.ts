module pow2.editor {

   export class LayerSelectAction extends BaseAction {
      public name:string = "Set Active Layer";
      private _lastLayer:number;
      constructor(
         public tileEditor:TileEditorController,
         public index:number){
         super();
         if(index > tileEditor.layers.length || index < 0){
            throw new Error("LayerSelectAction: layer index out of range");
         }
         this._lastLayer = tileEditor.activeLayerIndex;
      }

      execute():boolean {
         if(!super.execute()){
            return false;
         }
         this.tileEditor.activeLayerIndex = this.index;
         return true;
      }

      undo():boolean {
         if(!super.undo()){
            return false;
         }
         this.tileEditor.activeLayerIndex = this._lastLayer;
         return true;
      }
   }

}