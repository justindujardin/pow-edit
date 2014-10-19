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
///<reference path="./tileEditor.ts"/>
module pow2.editor {

   export class TileEditorTool implements IEditorTool {
      name:string = "TileEditorTool";
      editor:TileEditor = null;
      context:IEditorContext = null;
      ctrl:TileEditorController = null;
      iconClass:string = 'fa-question';
      public drag:IDragEvent = {
         active:false,
         start:null,
         current:null,
         cameraStart:null,
         delta:null
      };
      escapeTool(canCancel:boolean):boolean {
         // Clear any custom cursor the tool has set
         this.setCursorClass(null);
         return true;
      }
      activateTool(context:pow2.editor.IEditorContext):boolean {
         this.editor = <TileEditor>context.getEditor();
         this.context = context;
         this.ctrl = this.editor.ctrl;
         return !!this.editor && !!this.context && !!this.ctrl;
      }

      private _cursorSet:string = null;
      setCursorClass(cursorClass:string):boolean{
         var el:any = angular.element(this.ctrl.container);
         if(this._cursorSet !== null){
            el.removeClass(this._cursorSet);
         }
         if(cursorClass !== null){
            el.addClass(cursorClass);
         }
         this._cursorSet = cursorClass;
         return true;
      }

      resetDrag(){
         this.drag = _.extend({},{
            active:false,
            start:null,
            current:null,
            delta:null
         });
      }

      onPointerDown(ev:MouseEvent):any{}
      onPointerMove(ev:MouseEvent):any{}
      onPointerUp(ev:MouseEvent):any{}

      isRightMouse(ev:any):boolean {
         var right:boolean = false;
         if (ev.originalEvent && ev.originalEvent.which) {
            right = (ev.originalEvent.which == 3);
         }
         else if (ev.button){
            right = (ev.button == 2);
         }
         return right;
      }

      beginMove(ev:MouseEvent){
         this.drag.active = true;
         this.drag.start = new pow2.Point(ev.clientX,ev.clientY);
         this.drag.current = this.drag.start.clone();
         this.drag.delta = new pow2.Point(0,0);
         this.drag.cameraStart = new Point(this.editor.ctrl.cameraCenter.x,this.editor.ctrl.cameraCenter.y);
         var _mouseUp = () => {
            this.ctrl.$document.off('mousemove touchmove',_mouseMove);
            this.ctrl.$document.off('mouseup touchend',_mouseUp);
            this.resetDrag();
         };
         var _mouseMove = (evt:any) => {
            if(!this.drag.active){
               return;
            }
            if(evt.originalEvent.touches) {
               evt = evt.originalEvent.touches[0] || evt.originalEvent.changedTouches[0];
            }
            this.drag.current.set(evt.clientX,evt.clientY);
            this.drag.delta.set(this.drag.start.x - this.drag.current.x, this.drag.start.y - this.drag.current.y);

            this.ctrl.cameraCenter.x = this.drag.cameraStart.x + this.drag.delta.x * (1 / this.ctrl.cameraZoom);
            this.ctrl.cameraCenter.y = this.drag.cameraStart.y + this.drag.delta.y * (1 / this.ctrl.cameraZoom);

            this.ctrl.updateCamera();
            ev.stopPropagation();
            return false;
         };
         this.ctrl.$document.on('mousemove touchmove', _mouseMove);
         this.ctrl.$document.on('mouseup touchend', _mouseUp);
         ev.stopPropagation();
         return false;
      }

      handleMouseMove(ev:any){
         this.ctrl.mouseAt = this.ctrl.mouseEventToWorld(ev);
         return this.onPointerMove(ev);
      }

      handleMouseDown(ev:any) {
         var e = ev;
         if(ev.originalEvent.touches) {
            e = ev.originalEvent.touches[0] || ev.originalEvent.changedTouches[0];
         }
         // Capture pointer up
         var _pointerUp = (upEv) => {
            var e = upEv;
            if(ev.originalEvent.touches) {
               e = upEv.originalEvent.touches[0] || upEv.originalEvent.changedTouches[0];
            }
            this.onPointerUp(e);
            this.ctrl.$document.off('mouseup touchend',_pointerUp);
         };
         this.ctrl.$document.on('mouseup touchend', _pointerUp);
         // by default right click will move camera
         if(this.onPointerDown(e) !== false && this.isRightMouse(ev)){
            return this.beginMove(e);
         }
      }
      handleMouseWheel(ev) {
         if(!this.ctrl.sceneContainer) {
            return;
         }
         var delta:number = (ev.originalEvent.detail ? ev.originalEvent.detail * -1 : ev.originalEvent.wheelDelta);
         var move:number = this.ctrl.cameraZoom / 10;
         this.ctrl.cameraZoom += (delta > 0 ? move : -move);
         this.ctrl.updateCamera();
         ev.stopImmediatePropagation();
         ev.preventDefault();
         return false;
      }
   }
}