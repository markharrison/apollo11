/**
 * Landing Visualization Controller
 * Renders the lunar module landing on canvas
 */

class LandingVisualization {
    constructor(canvasId, agcSimulator) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas element with id '${canvasId}' not found`);
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Failed to get 2D context from canvas');
        }
        
        this.agc = agcSimulator;
        
        // Canvas dimensions
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Visualization parameters
        this.scale = 0.01; // pixels per foot
        this.groundLevel = this.height - 50;
        this.moduleWidth = 30;
        this.moduleHeight = 40;
        
        // Telemetry elements
        this.telemElements = {
            altitude: document.getElementById('telem-altitude'),
            velocity: document.getElementById('telem-velocity'),
            hVelocity: document.getElementById('telem-h-velocity'),
            fuel: document.getElementById('telem-fuel'),
            thrust: document.getElementById('telem-thrust'),
            time: document.getElementById('telem-time')
        };
    }
    
    /**
     * Main render loop
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        const state = this.agc.getState();
        
        // Draw stars
        this.drawStars();
        
        // Draw lunar surface
        this.drawLunarSurface();
        
        // Calculate module position
        const moduleX = this.width / 2;
        const moduleY = this.groundLevel - (state.altitude * this.scale);
        
        // Draw altitude reference lines
        this.drawAltitudeReferences(state.altitude);
        
        // Draw lunar module
        this.drawLunarModule(moduleX, moduleY, state.throttle);
        
        // Draw thrust plume
        if (state.throttle > 0 && !state.landed) {
            this.drawThrustPlume(moduleX, moduleY, state.throttle);
        }
        
        // Draw landing message
        if (state.landed) {
            this.drawLandingMessage(true);
        } else if (state.crashed) {
            this.drawLandingMessage(false);
        }
        
        // Update telemetry
        this.updateTelemetry(state);
    }
    
    /**
     * Draw stars in background
     */
    drawStars() {
        this.ctx.fillStyle = '#ffffff';
        
        // Fixed star positions for consistent display
        const stars = [
            {x: 50, y: 30}, {x: 120, y: 80}, {x: 200, y: 45},
            {x: 300, y: 100}, {x: 420, y: 60}, {x: 550, y: 120},
            {x: 650, y: 40}, {x: 720, y: 90}, {x: 100, y: 150},
            {x: 250, y: 180}, {x: 400, y: 160}, {x: 600, y: 200},
            {x: 700, y: 170}
        ];
        
        stars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, 1, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    /**
     * Draw lunar surface
     */
    drawLunarSurface() {
        // Ground
        this.ctx.fillStyle = '#888888';
        this.ctx.fillRect(0, this.groundLevel, this.width, this.height - this.groundLevel);
        
        // Surface details (craters and rocks)
        this.ctx.fillStyle = '#666666';
        
        // Simple craters
        const craters = [
            {x: 100, y: this.groundLevel + 10, r: 15},
            {x: 300, y: this.groundLevel + 5, r: 20},
            {x: 500, y: this.groundLevel + 8, r: 12},
            {x: 700, y: this.groundLevel + 12, r: 18}
        ];
        
        craters.forEach(crater => {
            this.ctx.beginPath();
            this.ctx.arc(crater.x, crater.y, crater.r, 0, Math.PI);
            this.ctx.fill();
        });
        
        // Landing target marker
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        const targetX = this.width / 2;
        const targetY = this.groundLevel;
        
        // Crosshair
        this.ctx.beginPath();
        this.ctx.moveTo(targetX - 20, targetY);
        this.ctx.lineTo(targetX + 20, targetY);
        this.ctx.moveTo(targetX, targetY - 5);
        this.ctx.lineTo(targetX, targetY + 5);
        this.ctx.stroke();
        
        // Target circle
        this.ctx.beginPath();
        this.ctx.arc(targetX, targetY, 30, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    /**
     * Draw altitude reference lines
     */
    drawAltitudeReferences(altitude) {
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        this.ctx.font = '12px "Courier New"';
        this.ctx.fillStyle = '#666666';
        
        const altitudes = [1000, 5000, 10000, 20000, 30000, 40000, 50000];
        
        altitudes.forEach(alt => {
            if (Math.abs(altitude - alt) < 10000) {
                const y = this.groundLevel - (alt * this.scale);
                
                if (y > 0 && y < this.height - 50) {
                    // Line
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, y);
                    this.ctx.lineTo(this.width, y);
                    this.ctx.stroke();
                    
                    // Label
                    this.ctx.fillText(`${alt} ft`, 10, y - 5);
                }
            }
        });
    }
    
    /**
     * Draw lunar module
     */
    drawLunarModule(x, y, throttle) {
        // Descent stage (base)
        this.ctx.fillStyle = '#FFD700';
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 2;
        
        // Octagonal descent stage
        const baseWidth = this.moduleWidth;
        const baseHeight = 15;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x - baseWidth/2, y + baseHeight);
        this.ctx.lineTo(x - baseWidth/2, y);
        this.ctx.lineTo(x - baseWidth/3, y - 5);
        this.ctx.lineTo(x + baseWidth/3, y - 5);
        this.ctx.lineTo(x + baseWidth/2, y);
        this.ctx.lineTo(x + baseWidth/2, y + baseHeight);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Landing legs
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 3;
        
        // Left leg
        this.ctx.beginPath();
        this.ctx.moveTo(x - baseWidth/2, y + 5);
        this.ctx.lineTo(x - baseWidth/2 - 10, y + baseHeight + 10);
        this.ctx.lineTo(x - baseWidth/2 - 15, y + baseHeight + 10);
        this.ctx.stroke();
        
        // Right leg
        this.ctx.beginPath();
        this.ctx.moveTo(x + baseWidth/2, y + 5);
        this.ctx.lineTo(x + baseWidth/2 + 10, y + baseHeight + 10);
        this.ctx.lineTo(x + baseWidth/2 + 15, y + baseHeight + 10);
        this.ctx.stroke();
        
        // Ascent stage (cabin)
        this.ctx.fillStyle = '#C0C0C0';
        this.ctx.strokeStyle = '#A0A0A0';
        this.ctx.lineWidth = 2;
        
        const cabinWidth = this.moduleWidth * 0.6;
        const cabinHeight = 20;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x - cabinWidth/2, y - 5);
        this.ctx.lineTo(x - cabinWidth/2, y - 5 - cabinHeight);
        this.ctx.lineTo(x, y - 5 - cabinHeight - 5);
        this.ctx.lineTo(x + cabinWidth/2, y - 5 - cabinHeight);
        this.ctx.lineTo(x + cabinWidth/2, y - 5);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Window
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.beginPath();
        this.ctx.arc(x, y - 15, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Antenna
        this.ctx.strokeStyle = '#C0C0C0';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 30);
        this.ctx.lineTo(x, y - 40);
        this.ctx.stroke();
    }
    
    /**
     * Draw engine thrust plume
     */
    drawThrustPlume(x, y, throttle) {
        const plumeLength = (throttle / 100) * 60;
        const plumeWidth = 20;
        
        // Create gradient for thrust
        const gradient = this.ctx.createLinearGradient(x, y + 15, x, y + 15 + plumeLength);
        gradient.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 50, 0, 0.1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.moveTo(x - plumeWidth/2, y + 15);
        this.ctx.lineTo(x + plumeWidth/2, y + 15);
        this.ctx.lineTo(x + plumeWidth/3, y + 15 + plumeLength);
        this.ctx.lineTo(x - plumeWidth/3, y + 15 + plumeLength);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    /**
     * Draw landing message
     */
    drawLandingMessage(success) {
        this.ctx.font = 'bold 48px "Courier New"';
        this.ctx.textAlign = 'center';
        
        if (success) {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.shadowColor = '#00ff00';
            this.ctx.shadowBlur = 20;
            this.ctx.fillText('EAGLE HAS LANDED', this.width / 2, this.height / 2);
            this.ctx.shadowBlur = 0;
            
            // Subtitle
            this.ctx.font = '24px "Courier New"';
            this.ctx.fillText('Tranquility Base here', this.width / 2, this.height / 2 + 50);
        } else {
            this.ctx.fillStyle = '#ff0000';
            this.ctx.shadowColor = '#ff0000';
            this.ctx.shadowBlur = 20;
            this.ctx.fillText('CRASH LANDING', this.width / 2, this.height / 2);
            this.ctx.shadowBlur = 0;
            
            // Subtitle
            this.ctx.font = '24px "Courier New"';
            this.ctx.fillText('Mission Failed', this.width / 2, this.height / 2 + 50);
        }
        
        this.ctx.textAlign = 'left';
    }
    
    /**
     * Update telemetry displays
     */
    updateTelemetry(state) {
        this.telemElements.altitude.textContent = Math.round(state.altitude) + ' ft';
        this.telemElements.velocity.textContent = Math.round(state.verticalVelocity) + ' ft/s';
        this.telemElements.hVelocity.textContent = Math.round(state.horizontalVelocity) + ' ft/s';
        this.telemElements.fuel.textContent = Math.round(state.fuelRemaining) + '%';
        this.telemElements.thrust.textContent = Math.round(state.throttle) + '%';
        
        // Format mission time as MM:SS
        const minutes = Math.floor(state.missionTime / 60);
        const seconds = Math.floor(state.missionTime % 60);
        this.telemElements.time.textContent = 
            String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LandingVisualization;
}
