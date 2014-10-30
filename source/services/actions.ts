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

/// <reference path="../app.ts"/>
/// <reference path="../interfaces/IAction.ts"/>
/// <reference path="../interfaces/IActionManager.ts"/>

module pow2.editor {
   export class BaseAction implements IAction {
      executed:boolean = false;
      constructor(public name:string = "Unnamed Action"){}
      execute():boolean {
         if(!this.executed){
            this.executed = true;
            return true;
         }
         return false;
      }

      undo():boolean {
         if(this.executed){
            this.executed = false;
            return true;
         }
         return false;
      }

   }

   export class ActionManager implements IActionManager {
      private _undoStack:IAction[] = [];
      private _redoStack:IAction[] = [];
      clear() {
         this._undoStack.length = 0;
         this._redoStack.length = 0;
      }

      redo():IAction {
         if(this._redoStack.length === 0){
            return null;
         }
         var last:IAction = this._redoStack[this._redoStack.length-1];
         if(!this._executeAction(last)){
            console.error("Failed to redo action: " + last.name,last);
            return null;
         }
         this._redoStack.pop();
         return last;
      }

      undo():IAction {
         if(this._undoStack.length === 0){
            return null;
         }
         var last:IAction = this._undoStack[this._undoStack.length-1];
         if(!this._undoAction(last)){
            console.error("Failed to undo action: " + last.name,last);
            return null;
         }
         this._undoStack.pop();
         return last;
      }

      getUndoCount():number {
         return this._undoStack.length;
      }

      getRedoCount():number {
         return this._redoStack.length;
      }

      getUndoName(index:number):string {
         var action:IAction = this._undoStack[index];
         if(action && action.name){
            return action.name;
         }
         return "";
      }

      getRedoName(index:number):string {
         var action:IAction = this._redoStack[index];
         if(action && action.name){
            return action.name;
         }
         return "";
      }

      executeAction(action:pow2.editor.IAction):boolean {
         if(!this._executeAction(action)){
            return false;
         }
         // taking a new action makes the redo history invalid
         if(this._redoStack.length > 0){
            this._redoStack.length = 0;
         }
         return true;
      }

      private _executeAction(action:pow2.editor.IAction):boolean {
         if(!action || !action.execute()){
            return false;
         }
         this._undoStack.push(action);
         return true;
      }
      private _undoAction(action:pow2.editor.IAction):boolean {
         if(!action || !action.undo()){
            return false;
         }
         this._redoStack.push(action);
         return true;
      }

   }
}
