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

   export interface IDragEvent {
      active:boolean;
      delta:pow2.Point;
      start:pow2.Point;
      current:pow2.Point;
      cameraStart:pow2.Point;
   }


   export interface IEditableSprite extends PIXI.Sprite{
      powtile:EditableTile;
   }

   export class EditableTile {
      _gid:number;
      _tileIndex:number;
      sprite:IEditableSprite;
      constructor(
         public texture: PIXI.Texture,
         public tileEditor:TileEditorController=null) {
         this.sprite = <IEditableSprite>new PIXI.Sprite(texture);
         this.sprite.powtile = this;
         this.sprite.setInteractive(true);
         this.sprite.mouseover = (mouseData:PIXI.InteractionData) => {
            //console.log(mouseData.target);
            if(this.tileEditor && this.tileEditor.dragPaint !== -1){
               this.tileEditor.paintAt(this._tileIndex);
            }
            mouseData.target.tint = 0x00FF00;
         };
         this.sprite.mouseout = (mouseData:PIXI.InteractionData) => {
            //console.log(mouseData);
            mouseData.target.tint = 0xFFFFFF;
         };
      }
   }
}