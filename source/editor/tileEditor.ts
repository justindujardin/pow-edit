module pow2.editor {

   export interface IDragEvent {
      active:boolean;
      delta:pow2.Point;
      start:pow2.Point;
      current:pow2.Point;
      cameraStart:pow2.Point;
   }

   export interface IEditableTileLayer {
      tiles:EditableTile[]; // y * w + x = tile index from col/row
      objects: PIXI.DisplayObjectContainer;
      data:ITileLayer;
      name:string;
      properties:{
         [name:string]:any
      };
      opacity:number;
   }

   export interface IEditableSprite extends PIXI.Sprite{
      powtile:EditableTile;
   }

   export class EditableTile {
      _gid:number;
      _tileIndex:number;
      sprite:IEditableSprite;
      constructor(
         public tileEditor:TileEditorController,
         public texture: PIXI.Texture) {
         this.sprite = <IEditableSprite>new PIXI.Sprite(texture);
         this.sprite.powtile = this;
         this.sprite.setInteractive(true);
         this.sprite.mouseover = (mouseData:PIXI.InteractionData) => {
            //console.log(mouseData.target);
            if(this.tileEditor.dragPaint !== -1){
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