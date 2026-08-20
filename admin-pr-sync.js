(function(){
  const timer=setInterval(()=>{
    const newBtn=document.getElementById('friendNewBtn');
    if(!newBtn||document.getElementById('friendSyncBtn'))return;
    const button=document.createElement('button');button.id='friendSyncBtn';button.type='button';button.className='ghost-btn';button.textContent='导入 PR 友链';newBtn.parentElement.appendChild(button);
    button.addEventListener('click',async()=>{if(!confirm('从 friend-links.json 导入并更新友链？'))return;try{const response=await fetch('/api/admin/friend-links/sync',{method:'POST'});const data=await response.json();if(!response.ok)throw Error(data.error||'导入失败');alert(`已导入 ${data.count} 条友链，请刷新列表查看。`);location.reload();}catch(error){alert(error.message);}});
    clearInterval(timer);
  },250);
  setTimeout(()=>clearInterval(timer),15000);
})();
