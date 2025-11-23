// DSKY (Display and Keyboard) Interface Controller

class DSKY {
    constructor(agc) {
        this.agc = agc;
        this.inputBuffer = '';
        this.inputMode = null; // 'VERB', 'NOUN', or null
        this.flashInterval = null;
        
        // Display elements
        this.progDisplay = document.getElementById('prog-display');
        this.verbDisplay = document.getElementById('verb-display');
        this.nounDisplay = document.getElementById('noun-display');
        this.r1Display = document.getElementById('r1-display');
        this.r2Display = document.getElementById('r2-display');
        this.r3Display = document.getElementById('r3-display');
        this.compActyLight = document.getElementById('comp-acty-light');
        
        // Bind keyboard events
        this.setupKeyboard();
        this.setupQuickStart();
    }
    
    setupKeyboard() {
        // Handle button clicks
        document.querySelectorAll('.key').forEach(button => {
            button.addEventListener('click', (e) => {
                const key = e.target.dataset.key;
                this.handleKeyPress(key);
            });
        });
        
        // Handle physical keyboard
        document.addEventListener('keydown', (e) => {
            this.handlePhysicalKey(e);
        });
    }
    
    setupQuickStart() {
        document.querySelectorAll('.program-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const prog = parseInt(e.target.dataset.prog);
                this.loadProgram(prog);
            });
        });
    }
    
    handlePhysicalKey(e) {
        const keyMap = {
            'v': 'VERB',
            'n': 'NOUN',
            'p': 'PRO',
            'r': 'KEY REL',
            'e': 'ENTR',
            'c': 'CLR',
            's': 'RSET',
            '+': 'NUM',
            '-': 'MINUS',
            '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
            '5': '5', '6': '6', '7': '7', '8': '8', '9': '9'
        };
        
        const key = keyMap[e.key.toLowerCase()];
        if (key) {
            e.preventDefault();
            this.handleKeyPress(key);
        }
    }
    
    handleKeyPress(key) {
        // Flash COMP ACTY light briefly
        this.flashCompActy();
        
        switch(key) {
            case 'VERB':
                this.inputMode = 'VERB';
                this.inputBuffer = '';
                this.setLight('key-rel', true);
                break;
                
            case 'NOUN':
                this.inputMode = 'NOUN';
                this.inputBuffer = '';
                this.setLight('key-rel', true);
                break;
                
            case 'NUM':
                // Toggle sign (not fully implemented)
                break;
                
            case 'MINUS':
                // Negative sign (not fully implemented)
                break;
                
            case 'CLR':
                this.inputBuffer = '';
                this.inputMode = null;
                this.setLight('key-rel', false);
                break;
                
            case 'PRO':
                // Proceed with current operation
                this.executeProceed();
                break;
                
            case 'KEY REL':
                this.inputBuffer = '';
                this.inputMode = null;
                this.setLight('key-rel', false);
                break;
                
            case 'ENTR':
                this.executeEntry();
                break;
                
            case 'RSET':
                this.reset();
                break;
                
            default:
                // Numeric key
                if (!isNaN(key) && this.inputMode) {
                    this.inputBuffer += key;
                    if (this.inputBuffer.length >= 2) {
                        this.completeEntry();
                    }
                }
                break;
        }
        
        this.updateDisplay();
    }
    
    completeEntry() {
        const value = parseInt(this.inputBuffer);
        
        if (this.inputMode === 'VERB') {
            this.agc.verb = value;
            this.executeVerb(value);
        } else if (this.inputMode === 'NOUN') {
            this.agc.noun = value;
        }
        
        this.inputBuffer = '';
        this.inputMode = null;
        this.setLight('key-rel', false);
    }
    
    executeEntry() {
        if (this.inputBuffer.length > 0) {
            this.completeEntry();
        }
    }
    
    executeProceed() {
        // In a real AGC, PRO would proceed with the current operation
        // For this simulation, we'll use it to start the current program
        if (this.agc.program > 0 && !this.agc.running) {
            this.agc.running = true;
        }
    }
    
    executeVerb(verb) {
        // Simplified verb execution
        // V16 = Monitor displays (auto-update R1, R2, R3)
        // V37 = Load program
        switch(verb) {
            case 16:
                // Start monitoring (already handled in update loop)
                break;
            case 37:
                // Load program - wait for noun with program number
                break;
            case 63:
            case 64:
            case 65:
            case 66:
                // Quick load programs
                this.loadProgram(verb);
                break;
        }
    }
    
    loadProgram(progNum) {
        this.agc.initProgram(progNum);
        this.updateDisplay();
    }
    
    setLight(lightId, active) {
        const light = document.getElementById(lightId);
        if (light) {
            if (active) {
                light.classList.add('active');
            } else {
                light.classList.remove('active');
            }
        }
    }
    
    flashCompActy() {
        this.compActyLight.classList.add('active');
        setTimeout(() => {
            this.compActyLight.classList.remove('active');
        }, 200);
    }
    
    updateDisplay() {
        // Update program display
        this.progDisplay.textContent = this.agc.program.toString().padStart(2, '0');
        
        // Update verb/noun displays
        this.verbDisplay.textContent = this.agc.verb.toString().padStart(2, '0');
        this.nounDisplay.textContent = this.agc.noun.toString().padStart(2, '0');
        
        // Update register displays based on current program/noun
        // For landing programs, show altitude, velocity, fuel
        if (this.agc.program >= 63 && this.agc.program <= 66) {
            // R1: Altitude (in feet, scaled)
            const altScaled = Math.round(this.agc.altitude);
            this.r1Display.textContent = this.formatRegister(altScaled);
            
            // R2: Velocity (ft/s)
            const velScaled = Math.round(this.agc.velocity);
            this.r2Display.textContent = this.formatRegister(velScaled);
            
            // R3: Fuel remaining (percentage * 100)
            const fuelScaled = Math.round(this.agc.fuel * 100);
            this.r3Display.textContent = this.formatRegister(fuelScaled);
            
            // Update indicator lights based on status
            this.setLight('vel', Math.abs(this.agc.velocity) > 50);
            this.setLight('alt', this.agc.altitude < 1000);
            
            if (this.agc.fuel < 10) {
                this.setLight('tracker', true); // Use as fuel warning
            } else {
                this.setLight('tracker', false);
            }
        } else {
            this.r1Display.textContent = '+00000';
            this.r2Display.textContent = '+00000';
            this.r3Display.textContent = '+00000';
        }
        
        // Show PROG light when program is running
        this.setLight('prog', this.agc.running);
    }
    
    formatRegister(value) {
        // Format a number for display in AGC register format
        const sign = value >= 0 ? '+' : '-';
        const absValue = Math.abs(value);
        return sign + absValue.toString().padStart(5, '0');
    }
    
    reset() {
        this.agc.reset();
        this.inputBuffer = '';
        this.inputMode = null;
        this.setLight('key-rel', false);
        this.setLight('prog', false);
        this.setLight('vel', false);
        this.setLight('alt', false);
        this.setLight('tracker', false);
        this.updateDisplay();
    }
    
    // Called periodically to update displays
    update() {
        this.updateDisplay();
        
        // Flash COMP ACTY when computing
        if (this.agc.running && Math.random() < 0.1) {
            this.flashCompActy();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DSKY;
}
