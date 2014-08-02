module pow2.editor {

   export class LayerVisibilityAction extends BaseAction {
      public name:string = "Set Layer Visibility";
      private _lastVisibility:boolean;
      constructor(
         public tileEditor:TileEditorController,
         public index:number,
         public visibility:boolean){
         super();
         if(index > tileEditor.layers.length || index < 0){
            throw new Error("LayerSelectAction: layer index out of range");
         }
         this._lastVisibility = tileEditor.layers[index].objects.visible;
      }

      execute():boolean {
         if(!super.execute()){
            return false;
         }
         var layer:IEditableTileLayer = this.tileEditor.layers[this.index];
         layer.objects.visible = this.visibility;
         return true;
      }

      undo():boolean {
         if(!super.undo()){
            return false;
         }
         var layer:IEditableTileLayer = this.tileEditor.layers[this.index];
         layer.objects.visible = this._lastVisibility;
         return true;
      }
   }

}