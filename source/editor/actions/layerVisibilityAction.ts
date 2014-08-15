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