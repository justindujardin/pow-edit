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
///<reference path="../../services/actions.ts"/>
///<reference path="../../formats/powTileMap.ts"/>

module pow2.editor {

   /**
    * Remove a layer from a given PowTileMap.
    */
   export class LayerRemoveAction extends BaseAction {
      public name:string = "Remove Layer";
      private _old:PowTileLayer;
      constructor(
         public map:PowTileMap,
         public index:number){
         super();
         if(!map){
            throw new Error(pow2.errors.INVALID_ARGUMENTS);
         }
         /*
          * TODO: Does this object need to be properly cloned?  Assuming not
          * at the moment, because it should stop being manipulated once removed.
          */
         this._old = map.getLayer(index);
      }
      execute():boolean {
         if(!super.execute()){
            return false;
         }
         this.map.removeLayer(this.index);
         return true;
      }

      undo():boolean {
         if(!super.undo()){
            return false;
         }
         this.map.insertLayer(this.index,this._old);
         return true;
      }
   }

}