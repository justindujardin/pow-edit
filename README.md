pow-edit [![Build Status](https://travis-ci.org/justindujardin/pow-edit.svg?branch=master)](https://travis-ci.org/justindujardin/pow-edit) [![Coverage Status](https://img.shields.io/coveralls/justindujardin/pow-edit.svg)](https://coveralls.io/r/justindujardin/pow-edit?branch=master)
---

A tile map editor for the future... Someday.  Written in TypeScript using Angular and LESS.

> Nothing to see here, yet.  Move along.

## Prerequisites

The things you'll need.

### Node Webkit

Grab a prebuilt binary and put it in the root of this checkout.

* **v0.10.5:** (Sep 16, 2014, based off of Node v0.11.13, Chromium 35.0.1916.157): [release notes](https://groups.google.com/d/msg/node-webkit/l2PsW-0G5Oc/Fx19-UrS3ZoJ)

 * Linux: [32bit](http://dl.node-webkit.org/v0.10.5/node-webkit-v0.10.5-linux-ia32.tar.gz) / [64bit](http://dl.node-webkit.org/v0.10.5/node-webkit-v0.10.5-linux-x64.tar.gz)
 * Windows: [win32](http://dl.node-webkit.org/v0.10.5/node-webkit-v0.10.5-win-ia32.zip)
 * Mac 10.7+: [32bit](http://dl.node-webkit.org/v0.10.5/node-webkit-v0.10.5-osx-ia32.zip) / [64bit](http://dl.node-webkit.org/v0.10.5/node-webkit-v0.10.5-osx-x64.zip)

### Grunt and Bower

Grunt js and bower are required to use the developer workflow.  Install them globally using npm.  You may need to `sudo` on OSX.

> npm install -g grunt bower


### Developing

 - Make sure npm and bower modules are all installed (`npm install && bower install`)
 - Run develop task to start automated build process (`grunt develop`)
 - Run the node-webkit application in the root path.


### Props

Open Source Components:

 - Font Awesome by Dave Gandy - http://fontawesome.io
 - Ace editor : http://ace.c9.io/
 - Source Code Pro font : http://blogs.adobe.com/typblography/2012/09/source-code-pro.html
 - Typescript definitions for Ace, Angular, Jquery, and Node.JS : https://github.com/borisyankov/DefinitelyTyped


### License

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
