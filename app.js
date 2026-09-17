const SUPABASE_URL = "https://wrgarlhqyifluefjhlmi.supabase.co";
const SUPABASE_KEY = "sb_publishable_8EjeRtlucGIG14COM2ASfw_oG5URlgp";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function getProfile() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return null;
  const { data } = await supabaseClient.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data ? { ...data, email: user.email } : { id:user.id, email:user.email, role:"volunteer" };
}

async function requireAuth(target="login.html") {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) { location.href = target; return null; }
  return user;
}

async function requireAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    location.href = "dashboard.html";
    return null;
  }
  return profile;
}

const loginForm = document.getElementById("login");
if (loginForm) {
  loginForm.onsubmit = async e => {
    e.preventDefault();
    const msg = document.getElementById("msg");
    msg.textContent = "Connexion...";
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value
    });
    if (error) { msg.textContent = "Erreur : " + error.message; return; }
    const profile = await getProfile();
    location.href = profile?.role === "admin" ? "admin.html" : "dashboard.html";
  };
}

const registerForm = document.getElementById("register");
if (registerForm) {
  registerForm.onsubmit = async e => {
    e.preventDefault();
    const msg = document.getElementById("msg");
    msg.textContent = "Création du compte...";
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) { msg.textContent = "Erreur : " + error.message; return; }
    if (data.user) {
      const { error: pError } = await supabaseClient.from("profiles").upsert({
        id:data.user.id, full_name:name, role:"volunteer"
      });
      if (pError) { msg.textContent = "Compte créé, mais profil à finaliser."; return; }
    }
    msg.textContent = "Compte créé ! Vérifiez votre email si la confirmation est activée.";
  };
}

const logout = document.getElementById("logout");
if (logout) logout.onclick = async () => {
  await supabaseClient.auth.signOut();
  location.href = "index.html";
};
