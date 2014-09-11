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
///<reference path="../../types/ace/ace.d.ts"/>
///<reference path="../../types/angular/angular.d.ts"/>
///<reference path="../interfaces/IAppPlatform.ts"/>

module pow2.editor {

   export interface IWorkTask {
      elapsed?: number;
      work:() => boolean; // The work function
      done?:(config:IWorkTask) => void;
   }

   export class TasksService implements IProcessObject {
      _uid:string;
      static $inject:string[] = ['$time'];
      constructor(public $time:pow2.Time){
         this._uid = _.uniqueId('tasks');
         $time.addObject(this);
      }
      destroy(){
         this.$time.removeObject(this);
      }
      tick(elapsed:number) {
         this.processTasks();
      }

      static DEFAULT:string = "global";
      private _tasks:{
         [group:string]:IWorkTask[]
      } = {};

      add(work:() => boolean,group:string=TasksService.DEFAULT) {
         this.addTask(<any>{
            work:work
         },group);
      }
      addTask(task:IWorkTask,group:string=TasksService.DEFAULT) {
         task.elapsed = 0;
         if(typeof task.work !== 'function'){
            throw new Error("Invalid work function");
         }
         if(typeof this._tasks[group] === 'undefined'){
            this._tasks[group] = [];
         }
         this._tasks[group].push(task);
      }
      killTaskGroup(group:string=TasksService.DEFAULT){
         var count:number = this._tasks[group] ? this._tasks[group].length : 0;
         console.log("killing (" + count + ") tasks from group (" + group + ")");
         this._tasks[group] = [];
      }

      getRemainingTasks(group:string=TasksService.DEFAULT):number {
         return this._tasks[group] ? this._tasks[group].length : 0;
      }

      processTasks():number {
         var tasksCompleted:number = 0;
         // Take one task from each group per invocation.
         // TODO: something better.
         _.each(this._tasks,(tasks:IWorkTask[],group:string) => {
            if(!tasks || tasks.length === 0){
               return;
            }
            if(tasks[0].work() === true){
               tasksCompleted++;
               var task = tasks.shift();
               task.done && task.done(task);
            }
         });
         return tasksCompleted;
      }
   }

   pow2.editor.app.factory("$tasks", ['$injector',($injector) => {
      return $injector.instantiate(TasksService);
   }]);
}
