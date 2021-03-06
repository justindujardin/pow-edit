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

   /**
    * Rename a PowTileLayer.
    */
   export class LayerRenameAction extends BaseAction {
      public name:string = "Rename Layer";
      private _old:string;
      constructor(
         public layer:PowTileLayer,
         public newName:string){
         super();
         if(!newName || !layer){
            throw new Error(pow2.errors.INVALID_ARGUMENTS);
         }
         this._old = layer.name;
      }
      execute():boolean {
         if(!super.execute()){
            return false;
         }
         this.layer.setName(this.newName);
         return true;
      }

      undo():boolean {
         if(!super.undo()){
            return false;
         }
         this.layer.setName(this._old);
         return true;
      }
   }

}