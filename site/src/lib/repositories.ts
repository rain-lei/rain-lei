export type GithubRepo = {
  name: string;
  description?: string | null;
  language?: string | null;
  stargazers_count?: number | null;
  forks_count?: number | null;
  pushed_at?: string | null;
  topics?: string[];
  html_url?: string;
  fork?: boolean;
  archived?: boolean;
};

export const featuredRepositories=['MarketMirror','ppt_name_replacer'];
export const fallbackRepos:GithubRepo[]=[
  {name:'lingxi',description:'Python 项目',language:'Python',topics:['Python'],html_url:'https://github.com/rain-lei/lingxi'},
  {name:'rain-lei',description:'个人博客源码、文章与 GitHub 资料页',language:'TypeScript',topics:['Astro','Blog'],html_url:'https://github.com/rain-lei/rain-lei'},
  {name:'easyxgame',description:'EasyX 课程作业与原创游戏《萌泡大作战》',language:'C++',topics:['EasyX','Game'],html_url:'https://github.com/rain-lei/easyxgame'},
  {name:'EDAbackend-todo-practice',description:'JWT 鉴权与 Todo CRUD 后端练习',language:'JavaScript',topics:['Express','JWT'],html_url:'https://github.com/rain-lei/EDAbackend-todo-practice'},
  {name:'junli',description:'HTML 页面实验与前端练习',language:'HTML',topics:['HTML'],html_url:'https://github.com/rain-lei/junli'},
  {name:'vibecodearts',description:'ChronoFlow：按个人精力曲线安排任务',language:'TypeScript',topics:['React','Vite'],html_url:'https://github.com/rain-lei/vibecodearts'},
  {name:'MarketMirror',description:'多类型投资者市场冲击仿真平台',language:'Vue',topics:['FastAPI','ECharts'],html_url:'https://github.com/rain-lei/MarketMirror'},
  {name:'ppt_name_replacer',description:'从 Excel 批量生成个性化 PPT 奖状',language:'Python',topics:['Flask','Automation'],html_url:'https://github.com/rain-lei/ppt_name_replacer'},
  {name:'ascd',description:'Vue 3 与 Vite 的前端模板练习',language:'Vue',topics:['Vue 3','Vite'],html_url:'https://github.com/rain-lei/ascd'},
];
export const languageColors:Record<string,string>={TypeScript:'#3178c6',JavaScript:'#f1e05a',Vue:'#41b883',Python:'#3572a5','C++':'#f34b7d',C:'#555555',HTML:'#e34c26',CSS:'#663399'};

export function selectRepositories(repos:GithubRepo[],options:{featured?:string[];exclude?:string[];limit?:number}={}) {
  const byName=new Map(repos.map(repo=>[repo.name.toLowerCase(),repo]));
  const fallbackByName=new Map(fallbackRepos.map(repo=>[repo.name.toLowerCase(),repo]));
  const excluded=new Set(options.exclude?.map(name=>name.toLowerCase()));
  const selected=options.featured?.length
    ? options.featured.map(name=>byName.get(name.toLowerCase())||fallbackByName.get(name.toLowerCase())).filter((repo):repo is GithubRepo=>Boolean(repo))
    : repos;
  return selected.filter(repo=>!excluded.has(repo.name.toLowerCase())).slice(0,options.limit??30);
}
