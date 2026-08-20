(function(){
  const target=document.getElementById('githubRepos');
  if(!target) return;
  const formatDate=value=>{try{return new Intl.DateTimeFormat('zh-CN',{month:'short',day:'numeric'}).format(new Date(value));}catch(_){return '';}};
  const languageLabel=repo=>repo.language||'多语言项目';
  fetch('https://api.github.com/users/rain-lei/repos?sort=updated&direction=desc&per_page=3',{headers:{Accept:'application/vnd.github+json'}})
    .then(response=>{if(!response.ok) throw new Error('GitHub API unavailable');return response.json();})
    .then(repos=>{
      const visible=(Array.isArray(repos)?repos:[]).filter(repo=>!repo.fork).slice(0,3);
      if(!visible.length) throw new Error('No repositories');
      target.innerHTML=visible.map((repo,index)=>`<a class="reading-item github-repo" href="${repo.html_url}" target="_blank" rel="noopener noreferrer"><span class="reading-no">0${index+1}</span><div><strong>${repo.name}</strong><small>${languageLabel(repo)} · 最近更新 ${formatDate(repo.updated_at)}</small></div><span class="reading-arrow">↗</span></a>`).join('');
    })
    .catch(()=>{
      target.innerHTML='<a class="reading-item github-repo" href="https://github.com/rain-lei?tab=repositories" target="_blank" rel="noopener noreferrer"><span class="reading-no">↗</span><div><strong>查看全部公开仓库</strong><small>rain-lei · GitHub repositories</small></div><span class="reading-arrow">↗</span></a>';
    });
})();
