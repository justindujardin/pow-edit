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
///<reference path="../../../types/angular/angular.d.ts"/>

module pow2.editor {

   export interface IKeyBindOptions {
      type?:string; // e.g. 'keydown'
      description?:string; // Human readable description
      propagate?:boolean; // pass event up
      inputDisabled?:boolean; // Disable when an input has focus
      target?:any; // The target to bind events on, can be an element or a string ID
      keyCode?:number; // a specific keycode to add to requirements
   }

   export interface IKeyBindInstance {
      id:number; // The id for this binding instance.  Used to unbind it.
      description:string; // Human readable explanation for this binding
      combination:string; // The binding combination input
      event:string; // e.g. keydown
      target:HTMLElement; //
      callback:(e)=>any; // Invoked handler (given original event)
   }

   export interface IKeysService {
      bindings:IKeyBindInstance[]
      bind(combination:string, callback, opt?:IKeyBindOptions):any;
      unbind(bindingId:number):any;
   }
   
   // Work around for stupid Shift key bug created by using lowercase - as a result the shift+num combination was broken
   var SHIFT_NUMS = {
      "`":"~",
      "1":"!",
      "2":"@",
      "3":"#",
      "4":"$",
      "5":"%",
      "6":"^",
      "7":"&",
      "8":"*",
      "9":"(",
      "0":")",
      "-":"_",
      "=":"+",
      ";":":",
      "'":"\"",
      ",":"<",
      ".":">",
      "/":"?",
      "\\":"|"
   };
   // Special Keys - and their codes
   var SPECIAL_KEYS = {
      ESC:27,
      ESCAPE:27,
      TAB:9,
      SPACE:32,
      RETURN:13,
      ENTER:13,
      BACKSPACE:8,

      SCROLLLOCK:145,
      SCROLL_LOCK:145,
      SCROLL:145,
      CAPSLOCK:20,
      CAPS_LOCK:20,
      CAPS:20,
      NUMLOCK:144,
      NUM_LOCK:144,
      NUM:144,

      PAUSE:19,
      BREAK:19,

      INSERT:45,
      HOME:36,
      DELETE:46,
      END:35,

      PAGEUP:33,
      PAGE_UP:33,
      PU:33,

      PAGEDOWN:34,
      PAGE_DOWN:34,
      PD:34,

      LEFT:37,
      UP:38,
      RIGHT:39,
      DOWN:40,

      F1:112,
      F2:113,
      F3:114,
      F4:115,
      F5:116,
      F6:117,
      F7:118,
      F8:119,
      F9:120,
      F10:121,
      F11:122,
      F12:123
   };


   /**
    * Service for managing global key bindings.
    *
    * Based on: http://jsfiddle.net/firehist/nzUBg/
    */
   pow2.editor.app.factory('$keys', ['$window', '$timeout', function ($window, $timeout) {

      var idCounter:number = 1337; // Arbitrary, just for unique ids
      var keyboardManagerService:IKeysService = <any>{};

      var defaultOpt:IKeyBindOptions = {
         type: 'keydown',
         propagate: false,
         description:'',
         inputDisabled: false,
         target: $window.document,
         keyCode: 0
      };

      // Store all keyboard combination shortcuts
      keyboardManagerService.bindings = [];

      // Add a new keyboard combination shortcut
      keyboardManagerService.bind = (combination:string, callback:any, opt?:IKeyBindOptions):number => {

         // Initialize opt object
         opt = angular.extend({}, defaultOpt, opt);
         combination = combination.toUpperCase();
         var elt = opt.target;
         if(typeof opt.target == 'string') {
            elt = document.getElementById(<string>opt.target);
         }

         var fct = (e) => {
            e = e || $window.event;

            // Disable event handler when focus input and textarea
            if (opt.inputDisabled) {
               var elt;
               if (e.target) {
                  elt = e.target;
               }
               else if (e.srcElement) {
                  elt = e.srcElement;
               }
               if (elt.nodeType == 3) {
                  elt = elt.parentNode;
               }
               if (elt.tagName == 'INPUT' || elt.tagName == 'TEXTAREA') {
                  return;
               }
            }

            // Find out which key is pressed
            var code:number;
            if (e.keyCode) {
               code = e.keyCode;
            }
            else if (e.which) {
               code = e.which;
            }
            var character = String.fromCharCode(code).toUpperCase();
            if (code == 188) {
               character = ","; // If the user presses , when the type is onkeydown
            }
            if (code == 190) {
               character = "."; // If the user presses , when the type is onkeydown
            }

            var keys = combination.split("+");
            // Key Pressed - counts the number of valid keypresses - if it is same as the number of keys, the shortcut function is invoked
            var kp = 0;
            // Some modifiers key
            var modifiers = {
               SHIFT: {
                  wanted:		false,
                  pressed:	!!e.shiftKey
               },
               CTRL : {
                  wanted:		false,
                  pressed:	!!e.ctrlKey
               },
               ALT  : {
                  wanted:		false,
                  pressed:	!!e.altKey
               },
               META : { //Meta is Mac specific
                  wanted:		false,
                  pressed:	!!e.metaKey
               }
            };
            // Foreach keys in label (split on +)
            angular.forEach(keys,(k:string)=>{
               switch (k) {
                  case 'CTRL':
                  case 'CONTROL':
                     kp++;
                     modifiers.CTRL.wanted = true;
                     break;
                  case 'SHIFT':
                  case 'ALT':
                  case 'META':
                     kp++;
                     modifiers[k].wanted = true;
                     break;
               }

               if (k.length > 1) { // If it is a special key
                  if(SPECIAL_KEYS[k] == code) kp++;

               } else if (!!opt.keyCode && opt.keyCode === code) {
                  // If a specific key is set into the config
                  kp++;
               } else if(character == k) {
                  // The special keys did not match
                  kp++;
               }
               else if(SHIFT_NUMS[character] && e.shiftKey) { // Stupid Shift key bug created by using lowercase
                  character = SHIFT_NUMS[character];
                  if(character == k) kp++;
               }
            });
            if(kp == keys.length &&
               modifiers.CTRL.pressed == modifiers.CTRL.wanted &&
               modifiers.SHIFT.pressed == modifiers.SHIFT.wanted &&
               modifiers.ALT.pressed == modifiers.ALT.wanted &&
               modifiers.META.pressed == modifiers.META.wanted) {
               $timeout(function() {
                  callback(e);
               }, 1);

               if(!opt.propagate) { // Stop the event
                  // e.cancelBubble is supported by IE - this will kill the bubbling process.
                  e.cancelBubble = true;
                  e.returnValue = false;

                  // e.stopPropagation works in Firefox.
                  if (e.stopPropagation) {
                     e.stopPropagation();
                     e.preventDefault();
                  }
                  return false;
               }
            }

         };
         // Store shortcut
         var newBinding:IKeyBindInstance = {
            id:++idCounter,
            combination:combination,
            description:opt.description,
            callback: fct,
            target: elt,
            event: opt.type
         };
         keyboardManagerService.bindings.push(newBinding);
         //Attach the function with the event
         if(elt.addEventListener) {
            elt.addEventListener(opt.type, fct, false);
         }
         else if(elt.attachEvent) {
            elt.attachEvent('on' + opt.type, fct);
         }
         else {
            elt['on' + opt.type] = fct;
         }
         return newBinding.id;
      };

      // Remove the shortcut - just specify the shortcut and I will remove the binding
      keyboardManagerService.unbind = function (id:number) {
         for(var i:number = 0; i < keyboardManagerService.bindings.length; i++){
            var binding:IKeyBindInstance = keyboardManagerService.bindings[i];
            if(binding.id === id){
               keyboardManagerService.bindings.splice(i,1);
               var type		= binding.event,
                   elt			= binding.target,
                   callback	= binding.callback;
               if(elt.detachEvent) {
                  elt.detachEvent('on' + type, callback);
               }
               else if(elt.removeEventListener) {
                  elt.removeEventListener(type, callback, false);
               }
               else {
                  elt['on'+type] = false;
               }
               return true;
            }
         }
         return false;
      };
      //
      return keyboardManagerService;
   }]);
}


