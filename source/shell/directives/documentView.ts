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
///<reference path="../../../types/ace/ace.d.ts"/>
///<reference path="../../../types/angular/angular.d.ts"/>
///<reference path="../../app.ts"/>

module pow2.editor {

   pow2.editor.app.directive("documentView", [() => {
      return {
         restrict: "E",
         replace: true,
         transclude:true,
         controller: DocumentViewController,
         controllerAs:"loading",
         templateUrl: 'source/shell/directives/documentView.html'
      };
   }]);

   /**
    * Document view controller.  Has utilities for displaying loading progress
    * and other stuff (TBD).
    */
   export class DocumentViewController {
      public visible:boolean = false;
      public title:string = '';
      public details:string = '';
      public total:number = 0;
      public current:number = 0;
      public barStyle:{
         [key:string]:any
      } = {};

      private _reset(){
         this.visible = false;
         this.current = this.total = 0;
         this.title = this.details = '';
         this._updateProgressStyle();
      }

      private _updateProgressStyle() {
         var value = this.getPercent();
         this.barStyle = {width:value + "%"};
      }

      showLoading(title?:string,details?:string){
         this._reset();
         if(typeof title !== 'undefined'){
            this.title = title;
         }
         if(typeof details !== 'undefined'){
            this.details = details;
         }
         this.visible = true;
      }
      hideLoading(){
         this._reset();
      }
      setLoadingTitle(title:string){
         this.title = title;
      }
      setLoadingDetails(details:string){
         this.details = details;
      }
      setTotal(value:number){
         this.total = value;
         this._updateProgressStyle();
      }
      setCurrent(value:number){
         this.current = value;
         this._updateProgressStyle();
      }
      getPercent():number {
         return (this.total > 0) ? ((this.current / this.total) * 100) : 0;
      }

   }

}
