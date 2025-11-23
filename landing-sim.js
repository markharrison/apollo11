// Landing Simulation Controller

class LandingSimulation {
    constructor(agc) {
        this.agc = agc;
        this.isPaused = false;
        this.simulationSpeed = 1;
        
        // Telemetry displays
        this.telAltitude = document.getElementById('tel-altitude');
        this.telVelocity = document.getElementById('tel-velocity');
        this.telFuel = document.getElementById('tel-fuel');
        this.telThrottle = document.getElementById('tel-throttle');
        this.telPhase = document.getElementById('tel-phase');
        this.telTTF = document.getElementById('tel-ttf');
        
        // Setup controls
        this.setupControls();
    }
    
    setupControls() {
        // Speed slider
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');
        
        speedSlider.addEventListener('input', (e) => {
            this.simulationSpeed = parseInt(e.target.value);
            speedValue.textContent = this.simulationSpeed + 'x';
        });
        
        // Pause button
        const pauseBtn = document.getElementById('pause-btn');
        pauseBtn.addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
        });
        
        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', () => {
            this.reset();
        });
    }
    
    update(dt) {
        if (!this.isPaused) {
            // Update AGC with scaled time step
            const scaledDt = dt * this.simulationSpeed;
            this.agc.update(scaledDt);
        }
        
        // Update telemetry displays
        this.updateTelemetry();
    }
    
    updateTelemetry() {
        // Altitude
        if (this.agc.altitude > 1000) {
            this.telAltitude.textContent = 
                (this.agc.altitude / 1000).toFixed(1) + ' kft';
        } else {
            this.telAltitude.textContent = 
                Math.round(this.agc.altitude) + ' ft';
        }
        
        // Velocity (show both horizontal and vertical)
        const totalVel = Math.sqrt(
            this.agc.velocity * this.agc.velocity + 
            this.agc.horizontalVel * this.agc.horizontalVel
        );
        this.telVelocity.textContent = 
            Math.round(totalVel) + ' ft/s';
        
        // Add descent rate indicator
        if (this.agc.velocity !== 0) {
            const descRate = Math.abs(this.agc.velocity);
            this.telVelocity.textContent += 
                ' (↓' + descRate.toFixed(1) + ')';
        }
        
        // Fuel
        this.telFuel.textContent = this.agc.fuel.toFixed(1) + '%';
        
        // Apply warning color if fuel is low
        if (this.agc.fuel < 10) {
            this.telFuel.style.color = '#ff3333';
        } else {
            this.telFuel.style.color = '#00ff88';
        }
        
        // Throttle
        this.telThrottle.textContent = Math.round(this.agc.throttle) + '%';
        
        // Phase
        this.telPhase.textContent = this.agc.getPhaseName();
        
        // Add program info
        if (this.agc.program > 0) {
            this.telPhase.textContent += ' (P' + this.agc.program + ')';
        }
        
        // Time to Fall (TTF)
        if (this.agc.running && this.agc.ttf > 0) {
            this.telTTF.textContent = this.agc.ttf.toFixed(1) + ' s';
        } else {
            this.telTTF.textContent = '-- s';
        }
        
        // Landing status
        if (this.agc.landed) {
            this.telPhase.textContent = '✓ LANDED';
            this.telPhase.style.color = '#00ff88';
        } else if (this.agc.crashed) {
            this.telPhase.textContent = '✗ CRASHED';
            this.telPhase.style.color = '#ff3333';
        } else {
            this.telPhase.style.color = '#00ff88';
        }
    }
    
    reset() {
        this.agc.reset();
        this.isPaused = false;
        this.simulationSpeed = 1;
        
        document.getElementById('speed-slider').value = 1;
        document.getElementById('speed-value').textContent = '1x';
        document.getElementById('pause-btn').textContent = 'Pause';
        
        this.updateTelemetry();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LandingSimulation;
}
