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

   export class EditableTile {
      private _uid:number = _.uniqueId();
      _gid:number;
      _tileIndex:number;
      sprite:PIXI.Sprite;
      constructor(
         public texture: PIXI.Texture) {
         this.sprite = <PIXI.Sprite>new PIXI.Sprite(texture);
      }
   }

   export class TileEditor implements pow2.editor.IEditor {
      toolbox:pow2.editor.TileEditorToolbox = new pow2.editor.TileEditorToolbox();
      ctrl:TileEditorController = null;
      actions:ActionManager = null;
      defaultTools:pow2.editor.TileEditorTool[] = [];

      private _contexts:pow2.editor.IEditorContext[] = [];
      initEditor(tileEditorController:TileEditorController):boolean {
         console.log("init editor");
         this.actions = new pow2.editor.ActionManager();
         this.ctrl = tileEditorController;
         this.pushContext(this.ctrl.tileMap);
         return true;
      }
      destroyEditor():boolean {
         this.ctrl = null;
         this.actions = null;
         while(this.popContext()){}
         return true;
      }

      setActiveTool(name:string):boolean {
         var ctx = this.getActiveContext();
         if(ctx){
            return ctx.setActiveTool(name);
         }
         return false;
      }
      getActiveTool():pow2.editor.IEditorTool {
         var ctx = this.getActiveContext();
         if(ctx){
            return ctx.getActiveTool();
         }
         return null;

      }


      getActiveContext():pow2.editor.IEditorContext {
         return this._contexts[this._contexts.length-1] || null;
      }
      pushContext(object:any):boolean {
         var ctx:pow2.editor.IEditorContext = this.getActiveContext();
         // Exit any existing context first
         if(ctx && !ctx.exitContext()){
            return false;
         }

         var newCtx = this.ctrl.createContext(object);
         if(newCtx && newCtx.enterContext(object)){
            this._contexts.push(newCtx);
            this.toolbox.fillToolbox(newCtx);
            return true;
         }
         // Error, restore old context
         if(ctx){
            ctx.enterContext(ctx.getContextSource());
         }
         return false;
      }
      popContext():boolean {
         // Must have at least one context
         if(this._contexts.length <= 1){
            return false;
         }
         var ctx:pow2.editor.IEditorContext = this.getActiveContext();
         if(!ctx || !ctx.exitContext()){
            return false;
         }
         this._contexts.pop();
         ctx = this.getActiveContext();
         if(!ctx.enterContext(ctx.getContextSource())){
            throw new Error(pow2.errors.INVALID_ITEM);
         }
         this.toolbox.fillToolbox(ctx);
         return true;
      }
   }
}