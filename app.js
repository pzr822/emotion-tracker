const supabase = window.supabase.createClient(
"https://eoeiucawlhojrkisjkpi.supabase.co",
"sb_publishable_ZyNfyZeTnuknsNDyPcO-OQ_wMj6nsge"
);

document.querySelectorAll(".tab-btn").forEach(btn=>{
btn.onclick=()=>{
document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
btn.classList.add("active");
document.getElementById(btn.dataset.tab).classList.add("active");
}
});