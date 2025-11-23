/**
 * DSKY Interface Controller
 * Handles DSKY display and keyboard input
 */

class DSKYController {
    constructor(agcSimulator) {
        this.agc = agcSimulator;
        this.inputBuffer = '';
        this.inputMode = null; // 'VERB', 'NOUN', or 'PROGRAM'
        this.waitingForProgram = false; // True after V37 is entered
        
        // DOM elements
        this.elements = {
            prog: document.getElementById('prog-display'),
            verb: document.getElementById('verb-display'),
            noun: document.getElementById('noun-display'),
            r1: document.getElementById('r1-display'),
            r2: document.getElementById('r2-display'),
            r3: document.getElementById('r3-display')
        };
        
        // Check if all required elements exist
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element) {
                throw new Error(`Required DSKY display element '${key}-display' not found`);
            }
        }
        
        this.statusLights = {
            uplink: document.getElementById('uplink-light'),
            temp: document.getElementById('temp-light'),
            gimbalLock: document.getElementById('gimbal-lock-light'),
            prog: document.getElementById('prog-light'),
            restart: document.getElementById('restart-light'),
            tracker: document.getElementById('tracker-light'),
            alt: document.getElementById('alt-light'),
            vel: document.getElementById('vel-light')
        };
        
        this.initializeKeyboard();
        this.initializeKeyboardShortcuts();
    }
    
    /**
     * Initialize DSKY keyboard buttons
     */
    initializeKeyboard() {
        const buttons = document.querySelectorAll('.key-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const key = button.getAttribute('data-key');
                this.handleKeyPress(key);
                this.animateButton(button);
            });
        });
    }
    
    /**
     * Initialize keyboard shortcuts for accessibility
     */
    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // F1 hotkey to start P63
            if (e.key === 'F1') {
                this.startProgram63();
                e.preventDefault();
                return;
            }
            
            // Number keys
            if (e.key >= '0' && e.key <= '9') {
                this.handleKeyPress(e.key);
                this.highlightButton(e.key);
                e.preventDefault();
            }
            
            // Special keys
            const keyMap = {
                'v': 'VERB',
                'n': 'NOUN',
                'e': 'ENTR',
                'c': 'CLR',
                'r': 'RSET',
                'p': 'PRO',
                '+': '+',
                '-': '-',
                'Enter': 'ENTR',
                'Escape': 'CLR'
            };
            
            if (keyMap[e.key]) {
                this.handleKeyPress(keyMap[e.key]);
                this.highlightButton(keyMap[e.key]);
                e.preventDefault();
            }
        });
    }
    
    /**
     * Handle DSKY key press
     */
    handleKeyPress(key) {
        console.log('DSKY Key:', key);
        
        switch(key) {
            case 'VERB':
                this.inputMode = 'VERB';
                this.inputBuffer = '';
                this.flashDisplay(this.elements.verb);
                break;
                
            case 'NOUN':
                this.inputMode = 'NOUN';
                this.inputBuffer = '';
                this.flashDisplay(this.elements.noun);
                break;
                
            case 'ENTR':
                this.processInput();
                break;
                
            case 'CLR':
                this.clearInput();
                break;
                
            case 'RSET':
                this.reset();
                break;
                
            case 'PRO':
                // Proceed command - acknowledge any alerts
                this.clearStatusLights();
                break;
                
            case '+':
                this.inputBuffer = '+' + this.inputBuffer;
                break;
                
            case '-':
                this.inputBuffer = '-' + this.inputBuffer;
                break;
                
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                if (this.inputBuffer.length < 5) {
                    this.inputBuffer += key;
                    this.updateInputDisplay();
                }
                break;
                
            case 'KEY REL':
                // Key release - not implemented in this simulation
                break;
        }
    }
    
    /**
     * Process entered input
     */
    processInput() {
        if (this.inputBuffer.length === 0) return;
        
        const value = parseInt(this.inputBuffer.replace(/[+-]/g, ''), 10);
        
        // Check if we're waiting for a program number after V37
        if (this.waitingForProgram) {
            this.loadProgram(value);
            this.waitingForProgram = false;
            this.inputBuffer = '';
            this.inputMode = null;
            return;
        }
        
        if (this.inputMode === 'VERB') {
            // V37 is the verb to change programs
            if (value === 37) {
                this.waitingForProgram = true;
                this.inputBuffer = '';
                this.elements.prog.textContent = '--';
                this.flashDisplay(this.elements.prog);
                console.log('Enter program number...');
                return;
            }
            
            this.agc.processDSKYInput(value, null);
            this.elements.verb.textContent = this.formatNumber(value, 2);
            this.flashDisplay(this.elements.verb);
        } else if (this.inputMode === 'NOUN') {
            this.agc.processDSKYInput(null, value);
            this.elements.noun.textContent = this.formatNumber(value, 2);
            this.flashDisplay(this.elements.noun);
        }
        
        this.inputBuffer = '';
        this.inputMode = null;
    }
    
    /**
     * Load a new program
     */
    loadProgram(programNumber) {
        console.log('Loading program:', programNumber);
        
        if (programNumber === 63) {
            this.startProgram63();
        } else {
            console.log(`Program ${programNumber} not implemented in this simulation`);
            this.elements.prog.textContent = this.formatNumber(this.agc.state.currentProgram, 2);
        }
    }
    
    /**
     * Start Program 63 (lunar landing)
     */
    startProgram63() {
        console.log('Starting P63 - Lunar Landing');
        this.agc.reset();
        this.elements.prog.textContent = '63';
        this.elements.verb.textContent = '16';
        this.elements.noun.textContent = '63';
        this.flashDisplay(this.elements.prog);
    }
    
    /**
     * Clear input buffer
     */
    clearInput() {
        this.inputBuffer = '';
        this.inputMode = null;
        this.waitingForProgram = false;
    }
    
    /**
     * Reset DSKY display
     */
    reset() {
        this.inputBuffer = '';
        this.inputMode = null;
        this.elements.verb.textContent = '16';
        this.elements.noun.textContent = '63';
        this.clearStatusLights();
    }
    
    /**
     * Update display based on current input
     */
    updateInputDisplay() {
        const display = this.inputMode === 'VERB' ? this.elements.verb : this.elements.noun;
        if (display) {
            display.textContent = this.inputBuffer.padStart(2, '0');
        }
    }
    
    /**
     * Update DSKY registers from AGC state
     */
    updateRegisters() {
        const registers = this.agc.getDSKYRegisters();
        
        this.elements.r1.textContent = this.formatRegister(registers.r1);
        this.elements.r2.textContent = this.formatRegister(registers.r2);
        this.elements.r3.textContent = this.formatRegister(registers.r3);
    }
    
    /**
     * Update status lights based on simulation state
     */
    updateStatusLights() {
        const state = this.agc.getState();
        
        // ALT light - altitude warning (low altitude)
        this.setStatusLight('alt', state.altitude < 1000);
        
        // VEL light - velocity warning (high descent rate)
        this.setStatusLight('vel', Math.abs(state.verticalVelocity) > 100);
        
        // PROG light - program running
        this.setStatusLight('prog', !state.landed && !state.crashed);
    }
    
    /**
     * Set status light on/off
     */
    setStatusLight(name, on) {
        if (this.statusLights[name]) {
            if (on) {
                this.statusLights[name].classList.add('active');
            } else {
                this.statusLights[name].classList.remove('active');
            }
        }
    }
    
    /**
     * Clear all status lights
     */
    clearStatusLights() {
        Object.values(this.statusLights).forEach(light => {
            light.classList.remove('active');
        });
    }
    
    /**
     * Format number for display
     */
    formatNumber(num, digits) {
        return num.toString().padStart(digits, '0');
    }
    
    /**
     * Format register value with sign
     */
    formatRegister(value) {
        const sign = value >= 0 ? '+' : '-';
        const absValue = Math.abs(value).toString().padStart(5, '0');
        return sign + absValue;
    }
    
    /**
     * Flash display element
     */
    flashDisplay(element) {
        element.style.opacity = '0.3';
        setTimeout(() => {
            element.style.opacity = '1';
        }, 100);
    }
    
    /**
     * Animate button press
     */
    animateButton(button) {
        button.classList.add('pressed');
        setTimeout(() => {
            button.classList.remove('pressed');
        }, 200);
    }
    
    /**
     * Highlight button by key value
     */
    highlightButton(key) {
        const button = document.querySelector(`[data-key="${key}"]`);
        if (button) {
            this.animateButton(button);
        }
    }
    
    /**
     * Main update loop for DSKY display
     */
    update() {
        this.updateRegisters();
        this.updateStatusLights();
        this.updateProgramDisplay();
    }
    
    /**
     * Update program display
     */
    updateProgramDisplay() {
        const state = this.agc.getState();
        if (!this.waitingForProgram) {
            this.elements.prog.textContent = this.formatNumber(state.currentProgram, 2);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DSKYController;
}
