/* Shared progression rules. Puzzle controllers report completion; they cannot grant the final key. */
(function(root){
 'use strict';
 const roomIds=['mirror','pattern','false-exit'];
 function create(){return {room:0,completed:[],key:false,insideMirror:false,finalUnlocked:false,escaped:false};}
 function available(game,index){return Number.isInteger(index)&&index>=0&&index<3&&(index===0||game.completed.includes(roomIds[index-1]));}
 function enter(game,index){if(!available(game,index)||game.escaped||game.insideMirror)return false;game.room=index;return true;}
 function complete(game,index){if(index!==game.room||!available(game,index)||game.escaped||game.completed.includes(roomIds[index]))return false;game.completed.push(roomIds[index]);return true;}
 function allComplete(game){return roomIds.every(id=>game.completed.includes(id));}
 function collectKey(game){if(!allComplete(game)||game.key||game.escaped)return false;game.key=true;return true;}
 function crossMirror(game){if(!allComplete(game)||!game.key||game.escaped)return false;game.insideMirror=true;return true;}
 function unlock(game){if(!game.insideMirror||!game.key||!allComplete(game)||game.escaped)return false;game.finalUnlocked=true;return true;}
 function escape(game){if(!game.insideMirror||!game.finalUnlocked||!allComplete(game))return false;game.escaped=true;return true;}
 const api={roomIds,create,available,enter,complete,allComplete,collectKey,crossMirror,unlock,escape};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GameProgression=api;
})(typeof globalThis!=='undefined'?globalThis:this);
