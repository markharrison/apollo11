// AGC Core Simulator
// Simplified implementation of Apollo Guidance Computer for Lunar Landing

class AGC {
    constructor() {
        // AGC state
        this.program = 0;  // Current program number
        this.verb = 0;     // Current verb
        this.noun = 0;     // Current noun
        
        // Landing phase tracking (WCHPHASE in AGC)
        // -1 = IGNALG, 0 = BRAKQUAD, 1 = APPRQUAD, 2 = VERTICAL
        this.phase = -1;
        
        // Vehicle state
        this.altitude = 50000;      // feet above lunar surface
        this.velocity = -500;       // vertical velocity (ft/s, negative = descending)
        this.horizontalVel = 400;   // horizontal velocity (ft/s)
        this.fuel = 100;            // percentage
        this.throttle = 0;          // percentage (0-100)
        this.mass = 33000;          // LM mass in pounds
        
        // Landing targets (from AGC TLAND, RLS)
        this.targetAlt = 0;
        this.targetRange = 0;
        
        // Guidance parameters
        this.ttf = 0;               // Time to fall (TTF)
        this.thrust = 0;            // Thrust magnitude
        this.maxThrust = 9870;      // Max descent engine thrust (lbf)
        this.minThrust = 1050;      // Min descent engine thrust (lbf)
        
        // Flags
        this.running = false;
        this.landed = false;
        this.crashed = false;
        
        // Time tracking
        this.missionTime = 0;       // seconds
        this.deltaTime = 0.1;       // simulation time step
        
        // Constants
        this.LUNAR_GRAVITY = 5.32;  // ft/s² (moon gravity)
        this.FUEL_FLOW_RATE = 0.08; // % per second at max thrust
    }
    
    // Initialize for a specific program
    initProgram(progNum) {
        this.program = progNum;
        this.running = false;
        this.landed = false;
        this.crashed = false;
        
        switch(progNum) {
            case 63: // P63 - Braking Phase
                this.phase = 0; // BRAKQUAD
                this.altitude = 50000;
                this.velocity = -500;  // More realistic initial descent rate
                this.horizontalVel = 400;
                this.fuel = 100;
                this.throttle = 0;
                this.missionTime = 0;
                this.running = true;
                break;
                
            case 64: // P64 - Approach Phase
                this.phase = 1; // APPRQUAD
                this.altitude = 7500;
                this.velocity = -150;
                this.horizontalVel = 300;
                this.fuel = 50;
                this.throttle = 40;
                this.missionTime = 0;
                this.running = true;
                break;
                
            case 65: // P65 - Automatic Vertical Descent
                this.phase = 2; // VERTICAL
                this.altitude = 500;
                this.velocity = -25;
                this.horizontalVel = 0;
                this.fuel = 20;
                this.throttle = 30;
                this.missionTime = 0;
                this.running = true;
                break;
                
            case 66: // P66 - Manual Landing (similar to P65 but with manual control)
                this.phase = 2; // VERTICAL
                this.altitude = 500;
                this.velocity = -25;
                this.horizontalVel = 5;
                this.fuel = 20;
                this.throttle = 30;
                this.missionTime = 0;
                this.running = true;
                break;
                
            case 0:  // P00 - Standby
            default:
                this.phase = -1;
                this.running = false;
                break;
        }
    }
    
    // Main guidance loop (called periodically)
    update(dt) {
        if (!this.running || this.landed || this.crashed) {
            return;
        }
        
        this.missionTime += dt;
        
        // Run guidance based on current phase
        switch(this.phase) {
            case 0: // BRAKQUAD - Braking Phase
                this.brakingGuidance(dt);
                // Transition to approach when altitude < 7500 ft
                if (this.altitude < 7500) {
                    this.phase = 1;
                    this.program = 64;
                }
                break;
                
            case 1: // APPRQUAD - Approach Phase
                this.approachGuidance(dt);
                // Transition to vertical when altitude < 500 ft
                if (this.altitude < 500) {
                    this.phase = 2;
                    this.program = 65;
                }
                break;
                
            case 2: // VERTICAL - Vertical Descent
                this.verticalGuidance(dt);
                break;
        }
        
        // Update physics
        this.updatePhysics(dt);
        
        // Check landing conditions
        this.checkLanding();
    }
    
    // P63 Braking guidance (simplified from LUNAR_LANDING_GUIDANCE_EQUATIONS.agc)
    brakingGuidance(dt) {
        // Calculate time to fall (TTF/8 in original AGC)
        // This is a simplified calculation
        if (this.velocity < 0) {
            this.ttf = Math.abs(this.altitude / this.velocity) * 0.8;
        } else {
            this.ttf = 100;
        }
        
        // Target a smooth descent profile
        // Target velocity based on altitude - slow down as we get lower
        let targetVel;
        if (this.altitude > 30000) {
            targetVel = -350; // High altitude descent
        } else if (this.altitude > 15000) {
            targetVel = -Math.sqrt(this.altitude) * 1.5; // Medium descent
        } else {
            targetVel = -Math.sqrt(this.altitude) * 1.0; // Slower descent
        }
        
        const velError = this.velocity - targetVel;
        
        // Calculate required thrust with stronger control
        // F = m*a, where a = g + (desired acceleration)
        const desiredAccel = velError * 2.0; // Strong proportional control
        const requiredThrust = this.mass * (this.LUNAR_GRAVITY + desiredAccel);
        
        // Set throttle (10% to 100%)
        this.throttle = Math.max(10, Math.min(100, 
            (requiredThrust / this.maxThrust) * 100));
        
        // Reduce horizontal velocity
        const horizDecel = this.horizontalVel * 0.02 * dt;
        this.horizontalVel = Math.max(0, this.horizontalVel - horizDecel);
    }
    
    // P64 Approach guidance
    approachGuidance(dt) {
        // Target descent rate based on altitude
        // Gradually slow down as we approach
        const targetVel = -Math.sqrt(Math.max(10, this.altitude)) * 1.5 - 10;
        const velError = this.velocity - targetVel;
        
        const desiredAccel = velError * 0.8;
        const requiredThrust = this.mass * (this.LUNAR_GRAVITY + desiredAccel);
        
        this.throttle = Math.max(10, Math.min(100, 
            (requiredThrust / this.maxThrust) * 100));
        
        // Continue reducing horizontal velocity
        const horizDecel = this.horizontalVel * 0.05 * dt;
        this.horizontalVel = Math.max(0, this.horizontalVel - horizDecel);
    }
    
    // P65 Vertical descent guidance
    verticalGuidance(dt) {
        // Target final descent rate: -3 to -5 ft/s at touchdown
        let targetVel;
        if (this.altitude > 100) {
            targetVel = -15;
        } else if (this.altitude > 20) {
            targetVel = -8;
        } else {
            targetVel = -3;
        }
        
        const velError = this.velocity - targetVel;
        const desiredAccel = velError * 1.0;
        const requiredThrust = this.mass * (this.LUNAR_GRAVITY + desiredAccel);
        
        this.throttle = Math.max(10, Math.min(100, 
            (requiredThrust / this.maxThrust) * 100));
        
        // Kill any remaining horizontal velocity
        const horizDecel = this.horizontalVel * 0.1 * dt;
        this.horizontalVel = Math.max(0, this.horizontalVel - horizDecel);
    }
    
    // Update vehicle physics
    updatePhysics(dt) {
        // Calculate actual thrust based on throttle
        this.thrust = this.minThrust + (this.maxThrust - this.minThrust) * 
                      (this.throttle / 100);
        
        // Acceleration = (Thrust / Mass) - Gravity
        const accel = (this.thrust / this.mass) - this.LUNAR_GRAVITY;
        
        // Update velocity
        this.velocity += accel * dt;
        
        // Update altitude
        this.altitude += this.velocity * dt;
        
        // Update fuel consumption
        const fuelRate = this.FUEL_FLOW_RATE * (this.throttle / 100);
        this.fuel = Math.max(0, this.fuel - fuelRate * dt);
        
        // Mass decreases as fuel is consumed (simplified)
        this.mass = 15000 + (this.fuel / 100) * 18000;
        
        // Prevent going below surface
        if (this.altitude < 0) {
            this.altitude = 0;
        }
        
        // Stop if out of fuel
        if (this.fuel <= 0) {
            this.throttle = 0;
            this.thrust = 0;
        }
    }
    
    // Check landing conditions
    checkLanding() {
        if (this.altitude <= 0) {
            this.running = false;
            
            // Safe landing conditions:
            // - Vertical velocity < 10 ft/s
            // - Horizontal velocity < 5 ft/s
            if (Math.abs(this.velocity) < 10 && this.horizontalVel < 5) {
                this.landed = true;
                this.crashed = false;
            } else {
                this.landed = false;
                this.crashed = true;
            }
        }
    }
    
    // Get phase name for display
    getPhaseName() {
        switch(this.phase) {
            case -1: return "Standby";
            case 0: return "Braking";
            case 1: return "Approach";
            case 2: return "Vertical Descent";
            default: return "Unknown";
        }
    }
    
    // Reset simulation
    reset() {
        this.phase = -1;
        this.program = 0;
        this.altitude = 50000;
        this.velocity = -5500;
        this.horizontalVel = 5000;
        this.fuel = 100;
        this.throttle = 0;
        this.mass = 33000;
        this.running = false;
        this.landed = false;
        this.crashed = false;
        this.missionTime = 0;
    }
    
    // Manual throttle control (for P66)
    setThrottle(percent) {
        if (this.program === 66) {
            this.throttle = Math.max(0, Math.min(100, percent));
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AGC;
}
