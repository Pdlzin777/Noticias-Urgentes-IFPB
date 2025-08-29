if(!token) location.href = '/login.html';


document.getElementById('who').textContent = JSON.parse(localStorage.getItem('user')||'{}').name || '';


document.getElementById('logout').onclick = ()=>{ localStorage.removeItem('token'); localStorage.removeItem('user'); location.href = '/'; };


const headers = { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` };


async function listAdmin(){
const res = await fetch('/api/news?page=1&pageSize=50');
const data = await res.json();
const wrap = document.getElementById('adminList');
wrap.innerHTML = '';
data.items.forEach(n=>{
wrap.insertAdjacentHTML('beforeend', `
<div class="col-md-6">
<div class="card h-100">
<div class="card-body">
<h5>${n.title}</h5>
<p class="small text-muted">${n.category} • ${n.campus}</p>
<div class="d-flex gap-2">
<button class="btn btn-sm btn-ifpb" onclick="editNews(${n.id})">Editar</button>
<button class="btn btn-sm btn-danger" onclick="delNews(${n.id})">Excluir</button>
</div>
</div>
</div>
</div>`);
});
}


async function delNews(id){
if(!confirm('Excluir notícia?')) return;
const res = await fetch(`/api/news/${id}`, { method:'DELETE', headers });
if(res.ok) listAdmin();
}


window.editNews = async function(id){
const res = await fetch(`/api/news?page=1&pageSize=1&q=${id}`); // simples: busque por id no título/resumo, ou faça endpoint dedicado
}


// Criar notícia
const form = document.getElementById('newsForm');
form.onsubmit = async (e)=>{
e.preventDefault();
const payload = {
title: document.getElementById('title').value,
summary: document.getElementById('summary').value,
content: document.getElementById('content').value,
imageUrl: document.getElementById('imageUrl').value,
category: document.getElementById('category').value,
campus: document.getElementById('campus').value,
isFeatured: document.getElementById('isFeatured').checked,
};
const res = await fetch('/api/news', { method:'POST', headers, body: JSON.stringify(payload) });
if(res.ok){
form.reset();
listAdmin();
} else {
alert('Erro ao publicar');
}
};


listAdmin();