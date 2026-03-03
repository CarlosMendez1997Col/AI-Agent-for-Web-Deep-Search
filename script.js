const sidebarLeft = document.getElementById('sidebar');
const sidebarRight = document.getElementById('inspector-sidebar');
const toggleLeftBtn = document.getElementById('toggle-sidebar');
const toggleRightBtn = document.getElementById('toggle-inspector');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const inputWrapper = document.getElementById('input-wrapper'); // Para el foco
const sendBtn = document.getElementById('send-btn');
const inspectorContent = document.getElementById('inspector-content');

toggleLeftBtn.addEventListener('click', () => sidebarLeft.classList.toggle('collapsed'));
toggleRightBtn.addEventListener('click', () => sidebarRight.classList.toggle('collapsed'));

// --- Lógica de FOCO DE ATENCIÓN ---
userInput.addEventListener('focus', () => inputWrapper.classList.add('input-container-focus'));
userInput.addEventListener('blur', () => inputWrapper.classList.remove('input-container-focus'));

function addMessage(role, content) {
    const isBot = role === 'bot';
    const wrapper = document.createElement('div');
    wrapper.className = `flex gap-4 animate-fade-in ${!isBot ? 'flex-row-reverse' : ''}`;
    
    wrapper.innerHTML = `
        <div class="w-10 h-10 rounded-xl ${isBot ? 'bg-green-900/20 border-green-500/30' : 'bg-slate-800 border-slate-700'} border flex items-center justify-center flex-shrink-0 shadow-lg">
            <i class="fas ${isBot ? 'fa-robot text-green-400' : 'fa-user text-slate-400 text-xs'}"></i>
        </div>
        <div class="${isBot ? 'bg-[#1e293b]/60 border-slate-700' : 'bg-green-900/10 border-green-900/30'} p-4 rounded-2xl ${isBot ? 'rounded-tl-none' : 'rounded-tr-none'} border max-w-[80%] shadow-sm">
            <p class="text-sm leading-relaxed">${content}</p>
        </div>
    `;
    chatBox.appendChild(wrapper);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function updateInspector(titulo, institucion, extracto) {
    sidebarRight.classList.remove('collapsed');
    inspectorContent.innerHTML = `
        <div class="bg-slate-900/40 rounded-2xl border border-slate-800 p-5 space-y-4 animate-fade-in shadow-inner">
            <div class="flex justify-between items-center">
                <span class="text-[8px] bg-green-500/10 text-green-400 px-2 py-1 rounded-md border border-green-500/20 uppercase font-bold tracking-widest">IA Insight</span>
                <i class="fas fa-atom text-green-500 animate-pulse text-xs"></i>
            </div>
            <div>
                <h3 class="text-xs font-bold text-slate-100 uppercase tracking-tight">${titulo}</h3>
                <p class="text-[10px] text-green-400 mt-1 font-mono">${institucion}</p>
            </div>
            <div class="bg-black/20 p-3 rounded-xl border border-slate-800/50 text-[11px] text-slate-400 leading-relaxed italic">
                "${extracto}"
            </div>
            <button class="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[9px] font-bold border border-slate-700 transition-all text-slate-300">
                EXPANDIR REGISTRO SQL
            </button>
        </div>
    `;
}

async function handleAction() {
    const query = userInput.value.trim();
    if (!query) return;

    addMessage('user', query);
    userInput.value = '';

    setTimeout(() => {
        const respuesta = `He cruzado la consulta "${query}" con nuestra base de datos institucional. Se ha generado un análisis semántico detallado en el panel derecho.`;
        addMessage('bot', respuesta);
        updateInspector(
            "Gobernanza de Aguas en la Cuenca Amazónica", 
            "SEI Latin America / Fondo Verde",
            "Extracción semántica: El documento identifica una brecha técnica en la gestión hídrica de los departamentos de frontera..."
        );
    }, 1000);
}

sendBtn.addEventListener('click', handleAction);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleAction(); });

// ... (Tus constantes actuales se mantienen igual) ...
const timeDisplay = document.getElementById('colombia-time');

// Función para actualizar la hora de Colombia
function updateColombiaTime() {
    const options = {
        timeZone: 'America/Bogota',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    const formatter = new Intl.DateTimeFormat('es-CO', options);
    timeDisplay.textContent = formatter.format(new Date());
}

// Actualizar cada segundo
setInterval(updateColombiaTime, 1000);
updateColombiaTime(); // Llamada inicial

// ... (El resto de tu lógica handleAction y colapsos se mantiene igual) ...