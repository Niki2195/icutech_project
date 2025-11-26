// Frontend JS for both pages. Uses Netlify function at /.netlify/functions/soap-proxy as proxy.
const API_PATH = '/.netlify/functions/soap-proxy';

function showMsg(html, type='info', timeout=8000){
  const container = document.getElementById('msg');
  container.innerHTML = `<div class="alert alert-${type}" role="alert">${html}</div>`;
  if(timeout) setTimeout(()=>{ container.innerHTML=''; }, timeout);
}

function escapeXml(s){ return (s||'').replace(/[<>&'"]/g, c=>({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c])); }
function escapeHtml(s){ return (s||'').replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

async function callProxy(action, payloadXml){
  const res = await fetch(API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payloadXml })
  });
  if(!res.ok) throw new Error('Proxy returned ' + res.status);
  return await res.text();
}

function parseAndShow(text, successTitle='Success'){
  if(!text) { showMsg('Empty response','danger'); return; }
  if(text.includes('faultstring') || text.toLowerCase().includes('error') || text.includes('<soap:Fault')){
    showMsg('<strong>Error</strong><br><pre>'+escapeHtml(text)+'</pre>', 'danger', 20000);
    return;
  }
  // try parse xml for body children
  try{
    const doc = (new DOMParser()).parseFromString(text, 'application/xml');
    const body = doc.getElementsByTagName('soap:Body')[0] || doc.getElementsByTagName('Body')[0];
    let out = '';
    if(body){
      for(const node of Array.from(body.childNodes)){
        out += nodeToText(node);
      }
    }
    showMsg('<strong>'+successTitle+'</strong><br><pre>'+escapeHtml(out || text)+'</pre>', 'success', 20000);
  }catch(e){
    showMsg('<strong>'+successTitle+'</strong><br><pre>'+escapeHtml(text)+'</pre>', 'success', 20000);
  }
}

function nodeToText(node, indent=0){
  if(!node) return '';
  const pad = '  '.repeat(indent);
  if(node.nodeType === 3) return node.nodeValue.trim() ? pad + node.nodeValue.trim() + '\n' : '';
  let s = pad + node.nodeName + (node.childNodes.length ? ':\n' : (node.textContent ? ' => ' + node.textContent + '\n' : '\n'));
  for(const ch of Array.from(node.childNodes || [])){ s += nodeToText(ch, indent+1); }
  return s;
}

// Login form (index.html)
const loginForm = document.getElementById('loginForm');
if(loginForm){
  loginForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value.trim();
    if(!login || !password){ showMsg('Please fill both fields','danger'); return; }
    showMsg('Processing...','info',0);
    const xml = `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <login xmlns="http://tempuri.org/">
            <Login>${escapeXml(login)}</Login>
            <Password>${escapeXml(password)}</Password>
          </login>
        </soap:Body>
      </soap:Envelope>
    `.trim();
    try{
      const text = await callProxy('login', xml);
      parseAndShow(text, 'Login success');
    }catch(err){ showMsg('Network/proxy error: '+err.message,'danger',20000); }
  });
}

// Register form (register.html)
const regForm = document.getElementById('registerForm');
if(regForm){
  regForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const login = document.getElementById('reg_login').value.trim();
    const password = document.getElementById('reg_password').value.trim();
    const email = document.getElementById('reg_email').value.trim();
    if(!login || !password){ showMsg('Please fill login and password','danger'); return; }
    showMsg('Creating account...','info',0);
    const xml = `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <RegisterNewCustomer xmlns="http://tempuri.org/">
            <Login>${escapeXml(login)}</Login>
            <Password>${escapeXml(password)}</Password>
            <Email>${escapeXml(email)}</Email>
          </RegisterNewCustomer>
        </soap:Body>
      </soap:Envelope>
    `.trim();
    try{
      const text = await callProxy('register', xml);
      parseAndShow(text, 'Register success');
    }catch(err){ showMsg('Network/proxy error: '+err.message,'danger',20000); }
  });
}
