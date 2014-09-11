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

   export class LayerSelectAction extends BaseAction {
      public name:string = "Set Active Layer";
      private _lastLayer:number;
      constructor(
         public tileEditor:TileEditorController,
         public index:number){
         super();
         if(index > tileEditor.layers.length || index < 0){
            throw new Error(pow2.errors.INDEX_OUT_OF_RANGE);
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