/* SystemJS module definition */
///<reference path="../node_modules/@types/jquery/index.d.ts"/>
///<reference path="../node_modules/@types/jstree/index.d.ts"/>
///<reference path="../node_modules/@types/signalr/index.d.ts"/>
///<reference path="./app/abp/resources/scripts/abp.d.ts"/>
///<reference path="./app/abp/resources/scripts/libs/abp.jquery.d.ts"/>
///<reference path="./app/abp/resources/scripts/libs/abp.signalr.d.ts"/>
///<reference path="../node_modules/moment/moment.d.ts"/>
///<reference path="../node_modules/@types/moment-timezone/index.d.ts"/>
///<reference path="../node_modules/@types/toastr/index.d.ts"/>
///<reference path="../node_modules/@types/tether/index.d.ts"/>

declare var module: NodeModule;
interface NodeModule {
  id: string;
}

interface JQuery {
  Jcrop(...any): any;
}

interface JQuery {
  timeago(...any): any;
}


