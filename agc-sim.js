/**
 * AGC Simulation - Apollo 11 Lunar Landing Computer
 * Simulates the P63 (Powered Descent) program
 */

class AGCSimulator {
    constructor() {
        // Simulation state
        this.state = {
            // Position and velocity (in feet and feet/second)
            altitude: 50000,           // feet above lunar surface
            verticalVelocity: -450,    // feet/second (negative = descending) - P63 starts from high orbital velocity
            horizontalVelocity: 300,   // feet/second
            horizontalDistance: 0,     // feet from landing site
            
            // Fuel and thrust
            fuelRemaining: 100,        // percentage
            throttle: 0,               // 0-100% thrust
            
            // Mission parameters
            missionTime: 0,            // seconds since P63 ignition
            landed: false,
            crashed: false,
            
            // AGC program state
            currentProgram: 63,        // P63 = Braking Phase, P64 = Approach, P66 = ROD
            currentVerb: 16,           // V16 = Monitor decimal display
            currentNoun: 63,           // N63 = LR altitude, altitude rate, fuel
            
            // Physical constants  
            lunarGravity: 5.31,        // ft/s^2 (1/6 of Earth)
            maxThrust: 150000,         // lbf (simulation value for proper braking physics)
            dryMass: 9300,             // lbs (LM total dry mass)
            fuelMass: 18000,           // lbs (descent propellant)
        };
        
        this.isPaused = false;
        this.timeMultiplier = 1;
        this.lastUpdateTime = Date.now();
        
        // Landing thresholds
        this.SAFE_LANDING_VELOCITY = 10;    // ft/s (increased tolerance)
        this.TOUCHDOWN_ALTITUDE = 10;       // ft
        
        // Guidance parameters for P63
        this.guidancePhase = 'BRAKING';     // BRAKING, APPROACH, or FINAL
    }
    
    /**
     * Main simulation update loop
     */
    update(deltaTime) {
        if (this.isPaused || this.state.landed || this.state.crashed) {
            return;
        }
        
        // Apply time multiplier
        deltaTime *= this.timeMultiplier;
        
        // Update mission time
        this.state.missionTime += deltaTime;
        
        // Run AGC guidance computer
        this.runGuidance(deltaTime);
        
        // Update physics
        this.updatePhysics(deltaTime);
        
        // Check landing conditions
        this.checkLandingConditions();
    }
    
    /**
     * AGC Guidance Computer - Landing Programs
     * P63: Braking Phase (>7500 ft)
     * P64: Approach Phase (7500-500 ft)
     * P66: ROD - Rate of Descent (<500 ft)
     */
    runGuidance(deltaTime) {
        // Determine which program/phase we're in based on altitude
        if (this.state.altitude > 7500) {
            if (this.state.currentProgram !== 63) {
                this.state.currentProgram = 63;
                console.log('Switched to P63 - Braking Phase');
            }
            this.guidancePhase = 'BRAKING';
            this.brakingPhaseGuidance();
        } else if (this.state.altitude > 500) {
            if (this.state.currentProgram !== 64) {
                this.state.currentProgram = 64;
                console.log('Switched to P64 - Approach Phase');
            }
            this.guidancePhase = 'APPROACH';
            this.approachPhaseGuidance();
        } else {
            if (this.state.currentProgram !== 66) {
                this.state.currentProgram = 66;
                console.log('Switched to P66 - ROD (Rate of Descent)');
            }
            this.guidancePhase = 'FINAL';
            this.finalDescentGuidance();
        }
    }
    
    /**
     * Braking Phase Guidance (High altitude)
     * P63: Reduce descent rate from ~450 ft/s to ~40-60 ft/s by 7500 ft
     */
    brakingPhaseGuidance() {
        // P63 target: progressively reduce descent rate as we approach P64 altitude
        // Target descent rate decreases linearly from 450 ft/s at 50000 ft to 60 ft/s at 7500 ft
        const altitudeRatio = (this.state.altitude - 7500) / (50000 - 7500);
        const targetDescentRate = -60 - (altitudeRatio * 390); // -60 to -450 ft/s
        
        // Control to match target descent rate
        const velocityError = this.state.verticalVelocity - targetDescentRate;
        
        // High throttle to brake, reducing as we slow down
        const throttleTarget = 85 - velocityError * 1.5;
        
        this.state.throttle = this.smoothThrottle(throttleTarget, 0.2);
    }
    
    /**
     * Approach Phase Guidance (Medium altitude)
     * Continues to reduce velocity, prepares for final descent
     */
    approachPhaseGuidance() {
        // Target: maintain controlled descent rate
        const targetDescentRate = -40; // ft/s
        const velocityError = this.state.verticalVelocity - targetDescentRate;
        
        // PID-like control
        const throttleTarget = 70 + velocityError * 2.5;
        this.state.throttle = this.smoothThrottle(throttleTarget, 0.15);
    }
    
    /**
     * Final Descent Guidance (Low altitude)
     * Final approach to landing site
     */
    finalDescentGuidance() {
        // Target: gentle touchdown
        const targetDescentRate = Math.max(-6, -this.state.altitude / 70);
        const velocityError = this.state.verticalVelocity - targetDescentRate;
        
        // More aggressive throttle control near surface
        const throttleTarget = 92 + velocityError * 7;
        this.state.throttle = this.smoothThrottle(throttleTarget, 0.25);
        
        // Reduce horizontal velocity
        if (Math.abs(this.state.horizontalVelocity) > 5) {
            this.state.horizontalVelocity *= 0.99;
        }
    }
    
    /**
     * Smooth throttle changes to simulate realistic engine response
     */
    smoothThrottle(target, rate) {
        // Clamp target to valid range (0-100%)
        const clampedTarget = Math.max(0, Math.min(100, target));
        
        const current = this.state.throttle;
        const diff = clampedTarget - current;
        const maxChange = rate * 100;
        
        if (Math.abs(diff) < maxChange) {
            return clampedTarget;
        }
        
        return current + Math.sign(diff) * maxChange;
    }
    
    /**
     * Update physics simulation
     */
    updatePhysics(deltaTime) {
        // Current mass (dry mass + remaining fuel)
        const currentFuelMass = (this.state.fuelRemaining / 100) * this.state.fuelMass;
        const totalMass = this.state.dryMass + currentFuelMass;
        
        // Thrust force
        const thrustForce = (this.state.throttle / 100) * this.state.maxThrust;
        
        // Acceleration from thrust (upward)
        const thrustAcceleration = thrustForce / totalMass;
        
        // Net vertical acceleration (thrust - gravity)
        const verticalAcceleration = thrustAcceleration - this.state.lunarGravity;
        
        // Update vertical velocity
        this.state.verticalVelocity += verticalAcceleration * deltaTime;
        
        // Update altitude
        this.state.altitude += this.state.verticalVelocity * deltaTime;
        
        // Horizontal motion (simplified - no horizontal thrust control)
        this.state.horizontalDistance += this.state.horizontalVelocity * deltaTime;
        
        // Fuel consumption (proportional to throttle)
        const fuelBurnRate = 0.5; // % per second at full throttle
        this.state.fuelRemaining -= (this.state.throttle / 100) * fuelBurnRate * deltaTime;
        this.state.fuelRemaining = Math.max(0, this.state.fuelRemaining);
        
        // Prevent going below surface
        if (this.state.altitude < 0) {
            this.state.altitude = 0;
        }
    }
    
    /**
     * Check if landing or crash occurred
     */
    checkLandingConditions() {
        if (this.state.altitude <= this.TOUCHDOWN_ALTITUDE && !this.state.landed && !this.state.crashed) {
            const landingVelocity = Math.abs(this.state.verticalVelocity);
            
            if (landingVelocity <= this.SAFE_LANDING_VELOCITY && 
                Math.abs(this.state.horizontalVelocity) <= 10) {
                // Successful landing!
                this.state.landed = true;
                this.state.altitude = 0;
                this.state.verticalVelocity = 0;
                this.state.horizontalVelocity = 0;
                this.state.throttle = 0;
                console.log('Eagle has landed!');
            } else {
                // Crash - too fast
                this.state.crashed = true;
                this.state.altitude = 0;
                this.state.verticalVelocity = 0;
                this.state.horizontalVelocity = 0;
                this.state.throttle = 0;
                console.log('Crash landing!');
            }
        }
        
        // Out of fuel
        if (this.state.fuelRemaining <= 0 && !this.state.landed) {
            this.state.throttle = 0;
        }
    }
    
    /**
     * Get DSKY register values based on current Verb/Noun
     */
    getDSKYRegisters() {
        // V16N63: Monitor altitude, velocity (descent rate), and fuel
        if (this.state.currentVerb === 16 && this.state.currentNoun === 63) {
            return {
                r1: Math.round(this.state.altitude),                    // R1: Altitude in feet
                r2: Math.round(Math.abs(this.state.verticalVelocity)),  // R2: Speed (descent rate) in ft/s
                r3: Math.round(this.state.fuelRemaining)                // R3: Fuel remaining %
            };
        }
        
        return { r1: 0, r2: 0, r3: 0 };
    }
    
    /**
     * Process DSKY input
     */
    processDSKYInput(verb, noun) {
        if (verb !== null) {
            this.state.currentVerb = verb;
        }
        if (noun !== null) {
            this.state.currentNoun = noun;
        }
    }
    
    /**
     * Reset simulation to initial state
     */
    reset() {
        this.state.altitude = 50000;
        this.state.verticalVelocity = -150;
        this.state.horizontalVelocity = 300;
        this.state.horizontalDistance = 0;
        this.state.fuelRemaining = 100;
        this.state.throttle = 0;
        this.state.missionTime = 0;
        this.state.landed = false;
        this.state.crashed = false;
        this.guidancePhase = 'BRAKING';
        this.isPaused = false;
    }
    
    /**
     * Pause/unpause simulation
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    }
    
    /**
     * Set simulation speed multiplier
     */
    setTimeMultiplier(multiplier) {
        this.timeMultiplier = Math.max(1, Math.min(20, multiplier));
    }
    
    /**
     * Get current state for display
     */
    getState() {
        return { ...this.state };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AGCSimulator;
}
