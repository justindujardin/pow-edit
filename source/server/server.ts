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
///<reference path="../../types/node/node.d.ts"/>
/// <reference path="../../assets/build/pow-edit.d.ts"/>
/// <reference path="../../assets/bower_components/pow-core/lib/pow-core.d.ts"/>
module pow2.editor {

   "use strict";
   var express:any = require('express');
   var fs:any = require('graceful-fs');
   var path = require('path');
   var server = express();
   var serverPort = process.env.PORT || 5216;

   var enumPath = (location:string,done:(err:any,files?:IFileInfo[]) => any,replace:(name:string)=>string) => {
      var results:IFileInfo[] = [];
      fs.readdir(location, (err, list) => {
         if (err) {
            return done(err);
         }
         var pending = list.length;
         if (!pending) {
            return done(null, results);
         }
         return list.forEach((file) => {
            var name = path.join(location,file);
            var result:IFileInfo = {
               name:file,
               path:replace(location),
               full:replace(name)
            };
            results.push(result);
            fs.stat(name, (err, stat) => {
               if (stat && stat.isDirectory()) {
                  enumPath(name, (err:any, res?:IFileInfo[]) => {

                     // Sort by folder/file and alpha files.
                     result.children = res.sort((a,b)=>{
                        if(!a.children || a.children.length === 0){
                           return 1;
                        }
                        if(!b.children || b.children.length === 0) {
                           return -1;
                        }
                        return a.name.localeCompare(b.name);
                     });
                     if (!--pending) {
                        done(null, results);
                     }
                  },replace);
               }
               else {
                  if (!--pending) {
                     done(null, results);
                  }
               }
            });
         });
      });
   };


   server.use(express.bodyParser());
   server.use(express.cookieParser());
   server.use(express.compress());
   server.get('/', function (req, res) {
      res.render(path.resolve(__dirname, '../app.html'));
   });

   var cachedFiles:any[] = null;
   /**
    * A Quick demo hack for enumerating system files.  Calculate this once and cache it, because
    * it could potentially be an expensive operation, and we'll be running on slow ass free Heroku
    * servers.
    */
   server.get('/files', function (req, res) {
      if(cachedFiles){
         res.json(cachedFiles,200);
         res.end();
         return;
      }
      enumPath('assets/maps/',(err,results?) => {
         if(!err) {
            cachedFiles = results;
            res.json(results, 200);
         }
         else {
            res.write('' + err, 400);
         }
         res.end();
      },(name:string)=>{
         return name.replace('assets/maps','maps');
      });
   });

   server.use(express.static(path.resolve(__dirname, "assets/")));
   server.use(express.static(path.resolve(__dirname, "../")));
   server.use('/source',express.static(path.resolve(__dirname, "../../source")));

// Use EJS templating with Express, and assign .html as the default extension.
   server.engine('.html', require('ejs').__express);
   server.set('view engine', 'html');

   server.configure("development", function () {
      server.use(express.errorHandler({
         dumpExceptions: true,
         showStack: true
      }));
   });
   server.configure("production", function () {
      server.use(express.errorHandler());
   });
   var listen = server.listen(serverPort);
   console.log('POW Edit server on http://localhost:' + serverPort);
}