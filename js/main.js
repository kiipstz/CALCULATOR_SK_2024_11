// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    
    UI.init();
    
    const LOCAL_STORAGE_KEY = 'skCalculatorState_v5'; // Increment version to avoid conflicts

    function runUpdate() {
        const inputs = gatherInputs();
        UI.updateInputVisibility(inputs);
        const result = Calculator.calculate(inputs);
        UI.updateResults(result, inputs);
        saveStateToLocalStorage();
    }
    
    function gatherInputs() {
        const inputs = {};
        document.querySelectorAll('.calc-input').forEach(input => {
            let value;
            if (input.type === 'checkbox') {
                value = input.checked;
            } else if (input.type === 'number') {
                value = input.value === '' ? 0 : parseFloat(input.value);
            } else {
                value = input.value;
            }
            inputs[input.id] = value;
        });
        return inputs;
    }
    
    function saveStateToLocalStorage() {
        const state = {};
        document.querySelectorAll('.calc-input').forEach(input => {
            state[input.id] = (input.type === 'checkbox') ? input.checked : input.value;
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }

    function loadStateFromLocalStorage() {
        const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                for (const id in state) {
                    const input = document.getElementById(id);
                    if (input) {
                        if (input.type === 'checkbox') input.checked = state[id];
                        else input.value = state[id];
                    }
                }
            } catch { localStorage.removeItem(LOCAL_STORAGE_KEY); }
        }
    }

    function resetState() {
        if (confirm("Сигурни ли сте, че искате да изчистите всички полета?")) {
            document.querySelectorAll('.calc-input').forEach(input => {
                if (input.type === 'checkbox') input.checked = false;
                else if (input.tagName === 'SELECT') input.selectedIndex = 0;
                else input.value = '';
            });
            runUpdate();
        }
    }

    function saveStateToFile() {
        const state = {};
        document.querySelectorAll('.calc-input').forEach(input => {
            state[input.id] = (input.type === 'checkbox') ? input.checked : input.value;
        });
        const date = new Date();
        const timestamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const objectName = (document.getElementById('objectName').value.trim() || 'proekt_SK').replace(/\s+/g, '_');
        const filename = `${timestamp}_${objectName}.json`;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
        a.download = filename;
        a.click();
    }

    function loadStateFromFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const state = JSON.parse(e.target.result);
                for (const id in state) {
                    const input = document.getElementById(id);
                    if (input) {
                        if (input.type === 'checkbox') input.checked = state[id];
                        else input.value = state[id];
                    }
                }
                runUpdate();
            } catch { alert('Грешка: Невалиден файл.'); }
        };
        reader.readAsText(file);
        event.target.value = '';
    }
    
    function exportToTxt() {
        const objectName = document.getElementById('objectName').value || 'Неозаглавен обект';
        const logContent = document.getElementById('calculationLog').innerText;
        const finalPriceText = `${document.getElementById('totalHeader').textContent} ${document.getElementById('totalPrice').textContent}`;
        const title = "Минимална себестойност на проектиране – ЧАСТ КОНСТРУКЦИИ";
        const subtitle = `Обект: ${objectName}`;
        const fullText = `${title}\n${subtitle}\n\nНачин на изчисляване:\n${logContent}\n\n${finalPriceText}`;
        const date = new Date();
        const timestamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const filename = `${timestamp}_${objectName.replace(/\s+/g, '_') || 'oferta_SK'}.txt`;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([fullText], { type: 'text/plain;charset=utf-8' }));
        a.download = filename; a.click();
    }
    
    // --- ПРИКРЕПЯНЕ НА EVENT LISTENERS ---
    document.querySelectorAll('.calc-input').forEach(input => {
        const eventType = (input.tagName === 'SELECT' || input.type === 'checkbox') ? 'change' : 'input';
        input.addEventListener(eventType, runUpdate);
    });

    document.getElementById('openTableBtn').addEventListener('click', () => UI.openPriceTable());
    document.getElementById('saveButton').addEventListener('click', saveStateToFile);
    document.getElementById('loadButton').addEventListener('click', () => document.getElementById('loadInput').click());
    document.getElementById('loadInput').addEventListener('change', loadStateFromFile);
    document.getElementById('resetButton').addEventListener('click', resetState);
    document.getElementById('printButton').addEventListener('click', () => {
        const log = document.getElementById('calculationLog').innerText;
        const price = `${document.getElementById('totalHeader').textContent} ${document.getElementById('totalPrice').textContent}`;
        const name = document.getElementById('objectName').value || 'Неозаглавен обект';
        UI.printOffer(log, price, name);
    });
    document.getElementById('exportTxtButton').addEventListener('click', exportToTxt);
    
    const themeToggle = document.getElementById('theme-toggle');
    function setTheme(themeName) {
        localStorage.setItem('skCalculatorTheme', themeName);
        document.body.className = themeName;
    }
    themeToggle.addEventListener('click', () => setTheme(document.body.classList.contains('theme-dark') ? 'theme-light' : 'theme-dark'));
    
    // --- ПЪРВОНАЧАЛНО ЗАРЕЖДАНЕ ---
    loadStateFromLocalStorage();
    setTheme(localStorage.getItem('skCalculatorTheme') || 'theme-light');
    document.getElementById('copyright-year').textContent = new Date().getFullYear();
    runUpdate();
});