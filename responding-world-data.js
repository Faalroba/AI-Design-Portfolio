export const KEYS=['grow','water','paths','gather','garden'];
export const ZONES={grow:{x:-6,z:-2,y:4.2,label:'Grow the Landscape'},water:{x:4.2,z:2.3,y:1.3,label:'Bring Water to Life'},paths:{x:-3.3,z:3.6,y:1.1,label:'Connect the Pathways'},gather:{x:-.4,z:-1.6,y:3.4,label:'Create a Gathering Place'},garden:{x:7,z:-3.6,y:1.9,label:'Bring the Garden to Life'}};
export const EXISTING_TREES=[[-7.7,-3.2,1.07],[-6.1,-4,.86],[-8,-.7,.92],[.9,-5.3,.73]];
export const NEW_TREES=[[-5.7,-1.3,1],[-3.8,-3.6,.94],[-7.3,1.1,.83],[-4.4,-.2,.77],[2.2,-4.5,.85]];
export const RIVER=[[6.9,-6.8],[5,-4.5],[5.9,-2.1],[4.2,.3],[4.8,2.6],[3.4,5],[4.2,6.7]];
export const PATHS=[[[-9,5.5],[-7,4.5],[-5.4,4.1],[-4.3,3.5]],[[-7.8,-5.7],[-5.4,-4.9],[-3.1,-3.9],[-.5,-2.2]],[[1.2,-1.2],[2.5,-2.7],[4,-4.6],[7.5,-5.3]]];
export const CONNECTIONS=[[[-4.3,3.5],[-2.7,2.8],[-1.8,1.3],[-.5,-1]],[[1,-1.5],[2.4,-.1],[3.9,1.7],[5.7,2.1],[8,1.3]]];
export const WALK_ROUTES={grow:[[-6.9,-4.9],[-6,-3.3],[-4.6,-1.1]],water:[[3.9,-4.4],[3.6,-1.9],[2.8,.9],[3.1,3.3]],paths:[[-8.8,5.3],[-5.4,4.1],[-2.7,2.8],[-.6,-1],[2.1,-3.1],[6.9,-5.1]],gather:[[-2.8,-1.7],[-1.4,-2.2],[.5,-1.3],[1.3,-.2]],garden:[[5.9,-5.2],[7.1,-4.5],[8.3,-3.2],[8.2,-2]]};
export function height(x,z){return .17+.13*Math.sin(x*.31)*Math.cos(z*.33)+.95*Math.exp(-((x+5)**2+(z+3)**2)/23)+.27*Math.exp(-((x-1)**2+(z+4.8)**2)/13)+.11*(7-z)/15;}
export function random(seed=1){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
export function curve(points,t){const n=points.length-1,u=Math.max(0,Math.min(.999999,t))*n,i=Math.floor(u),f=u-i,p0=points[Math.max(0,i-1)],p1=points[i],p2=points[Math.min(n,i+1)],p3=points[Math.min(n,i+2)];return [0,1].map(a=>.5*((2*p1[a])+(-p0[a]+p2[a])*f+(2*p0[a]-5*p1[a]+4*p2[a]-p3[a])*f*f+(-p0[a]+3*p1[a]-3*p2[a]+p3[a])*f*f*f));}
export function personPoint(key,index,time,reduced){const t=reduced?.25:(time*.027+index*.23)%2,loop=t>1?2-t:t;return curve(WALK_ROUTES[key],loop);}
