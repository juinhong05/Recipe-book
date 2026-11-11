// Official YouTube IFrame API. No navigation away from the recipe is required.
let apiPromise,player,session=0,readyTimer;
function loadApi(){
 if(window.YT?.Player)return Promise.resolve(window.YT);
 if(apiPromise)return apiPromise;
 apiPromise=new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>{apiPromise=null;reject(new Error('Video service did not respond.'));},15000);
  window.onYouTubeIframeAPIReady=()=>{clearTimeout(timeout);resolve(window.YT);};
  document.querySelector('script[data-youtube-api]')?.remove();
  const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.dataset.youtubeApi='true';script.async=true;
  script.onerror=()=>{clearTimeout(timeout);apiPromise=null;script.remove();reject(new Error('Video service could not load.'));};document.head.append(script);
 });return apiPromise;
}
function showError(message){const status=document.querySelector('#video-status');if(status)status.textContent=message;const retry=document.querySelector('#retry-video');if(retry)retry.hidden=false;}
export function destroyVideo(){session++;clearTimeout(readyTimer);if(player){try{player.destroy();}catch{}player=null;}}
export async function mountVideo(videoId,title){
 if(!/^[A-Za-z0-9_-]{11}$/.test(videoId||'')){showError('A video is not available for this recipe. Follow the written steps above.');return;}
 destroyVideo();const current=session;const mount=document.querySelector('#video-mount');if(!mount)return;
 document.querySelector('#retry-video').hidden=true;document.querySelector('#video-status').textContent='Loading your cooking tutorial…';
 mount.innerHTML='<div class="video-loading">Loading video…</div>';
 try{
  const YT=await loadApi();if(current!==session||!mount.isConnected)return;
  const target=document.createElement('div');target.id='cooking-video';mount.replaceChildren(target);
  readyTimer=setTimeout(()=>{if(current===session)showError('The player is taking longer than expected. Check your connection or try again. Your recipe is still available above.');},18000);
  player=new YT.Player(target,{host:'https://www.youtube-nocookie.com',videoId,width:'100%',height:'100%',playerVars:{playsinline:1,rel:0,origin:location.origin},events:{
   onReady:event=>{if(current!==session)return;clearTimeout(readyTimer);const frame=event.target.getIframe();frame.title=`Cooking tutorial: ${title}`;frame.referrerPolicy='strict-origin-when-cross-origin';document.querySelector('#video-status').textContent='Use the player controls to watch here. Your recipe stays open.';event.target.playVideo();},
   onStateChange:event=>{if(current===session&&event.data===1)document.querySelector('#video-status').textContent='Playing here — your recipe stays open.';},
   onError:event=>{if(current!==session)return;clearTimeout(readyTimer);showError([101,150].includes(event.data)?'The video owner does not allow playback on other websites. You can still follow every written step above.':event.data===100?'This tutorial is no longer available. The written recipe remains available above.':'This tutorial could not play here. Try again, or follow the written cooking steps above.');}
  }});
 }catch{if(current===session){mount.innerHTML='<div class="video-loading">Video unavailable</div>';showError('The video service is unavailable. Check your connection and try again. Your written recipe is still here.');}}
}
