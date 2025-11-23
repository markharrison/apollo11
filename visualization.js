// Lunar Module Landing Visualization

class Visualization {
    constructor(agc, canvasId) {
        this.agc = agc;
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Canvas dimensions
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // View parameters
        this.viewScale = 1;
        this.viewOffsetX = 0;
        this.viewOffsetY = 0;
        
        // Animation
        this.thrustAnimation = 0;
        this.stars = this.generateStars(100);
        
        // Generate craters once for performance
        this.craters = this.generateCraters(5);
        
        // Make canvas responsive
        this.setupResponsive();
    }
    
    setupResponsive() {
        // Adjust canvas to container size
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            const rect = container.getBoundingClientRect();
            // Maintain aspect ratio
            const scale = Math.min(rect.width / 800, 1);
            this.canvas.style.width = (800 * scale) + 'px';
            this.canvas.style.height = (600 * scale) + 'px';
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }
    
    generateStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height * 0.6,
                brightness: Math.random()
            });
        }
        return stars;
    }
    
    generateCraters(count) {
        const craters = [];
        for (let i = 0; i < count; i++) {
            craters.push({
                x: (i + 0.5) * (this.width / count),
                radius: 20 + Math.random() * 30
            });
        }
        return craters;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw stars
        this.drawStars();
        
        // Draw lunar surface
        this.drawMoonSurface();
        
        // Calculate LM position based on altitude
        this.calculateView();
        
        // Draw landing zone marker
        this.drawLandingZone();
        
        // Draw lunar module
        this.drawLunarModule();
        
        // Draw info overlay
        this.drawInfoOverlay();
        
        // Update animation
        this.thrustAnimation = (this.thrustAnimation + 0.1) % (Math.PI * 2);
    }
    
    drawStars() {
        this.stars.forEach(star => {
            const alpha = 0.3 + star.brightness * 0.7;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.fillRect(star.x, star.y, 1, 1);
        });
    }
    
    drawMoonSurface() {
        const surfaceY = this.height - 100;
        
        // Draw surface
        this.ctx.fillStyle = '#666666';
        this.ctx.fillRect(0, surfaceY, this.width, 100);
        
        // Draw pre-generated craters for performance
        this.ctx.strokeStyle = '#555555';
        this.ctx.lineWidth = 2;
        
        this.craters.forEach(crater => {
            this.ctx.beginPath();
            this.ctx.arc(crater.x, surfaceY, crater.radius, 0, Math.PI, true);
            this.ctx.stroke();
        });
        
        // Draw horizon line
        this.ctx.strokeStyle = '#888888';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, surfaceY);
        this.ctx.lineTo(this.width, surfaceY);
        this.ctx.stroke();
    }
    
    calculateView() {
        // Calculate scale and offset based on altitude
        // Keep LM visible and centered
        const maxAlt = 50000;
        const minAlt = 0;
        
        if (this.agc.altitude > 5000) {
            // High altitude - show more vertical space
            this.viewScale = 0.008;
        } else if (this.agc.altitude > 500) {
            // Medium altitude
            this.viewScale = 0.05;
        } else {
            // Low altitude - zoom in
            this.viewScale = 0.5;
        }
    }
    
    drawLandingZone() {
        const surfaceY = this.height - 100;
        const targetX = this.width / 2;
        
        // Draw target marker
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        
        // Cross marker
        const size = 20;
        this.ctx.beginPath();
        this.ctx.moveTo(targetX - size, surfaceY);
        this.ctx.lineTo(targetX + size, surfaceY);
        this.ctx.moveTo(targetX, surfaceY - size);
        this.ctx.lineTo(targetX, surfaceY + size);
        this.ctx.stroke();
        
        // Circle
        this.ctx.beginPath();
        this.ctx.arc(targetX, surfaceY, size, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawLunarModule() {
        // Calculate LM position
        const surfaceY = this.height - 100;
        const maxDisplayAlt = 400; // Max altitude to show in viewport
        
        // Scale altitude to screen position
        let lmY;
        if (this.agc.altitude > maxDisplayAlt) {
            lmY = 50; // Keep at top if very high
        } else {
            lmY = surfaceY - (this.agc.altitude / maxDisplayAlt) * (surfaceY - 50);
        }
        
        // Horizontal position (affected by horizontal velocity)
        const lmX = this.width / 2 - (this.agc.horizontalVel * 0.1);
        
        // Draw LM body (simplified)
        const lmSize = 30;
        
        // Descent stage (gold foil)
        this.ctx.fillStyle = '#DAA520';
        this.ctx.fillRect(lmX - lmSize/2, lmY, lmSize, lmSize/2);
        
        // Ascent stage (black and gold)
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(lmX - lmSize/3, lmY - lmSize/2, lmSize * 2/3, lmSize/2);
        
        // Landing legs
        this.ctx.strokeStyle = '#DAA520';
        this.ctx.lineWidth = 3;
        
        // Left leg
        this.ctx.beginPath();
        this.ctx.moveTo(lmX - lmSize/2, lmY + lmSize/4);
        this.ctx.lineTo(lmX - lmSize, lmY + lmSize/2);
        this.ctx.stroke();
        
        // Right leg
        this.ctx.beginPath();
        this.ctx.moveTo(lmX + lmSize/2, lmY + lmSize/4);
        this.ctx.lineTo(lmX + lmSize, lmY + lmSize/2);
        this.ctx.stroke();
        
        // Thrust plume (if throttle > 0)
        if (this.agc.throttle > 0 && !this.agc.landed) {
            const plumeLength = (this.agc.throttle / 100) * 40;
            const plumeWidth = (this.agc.throttle / 100) * 20;
            
            // Animated thrust flame
            const flicker = Math.sin(this.thrustAnimation * 10) * 0.2 + 0.8;
            
            const gradient = this.ctx.createLinearGradient(
                lmX, lmY + lmSize/2, 
                lmX, lmY + lmSize/2 + plumeLength
            );
            gradient.addColorStop(0, `rgba(255, 200, 100, ${0.9 * flicker})`);
            gradient.addColorStop(0.5, `rgba(255, 100, 50, ${0.6 * flicker})`);
            gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.moveTo(lmX, lmY + lmSize/2);
            this.ctx.lineTo(lmX - plumeWidth/2, lmY + lmSize/2 + plumeLength);
            this.ctx.lineTo(lmX + plumeWidth/2, lmY + lmSize/2 + plumeLength);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        // RCS thrusters (small)
        if (this.agc.horizontalVel > 1) {
            this.ctx.fillStyle = 'rgba(255, 255, 100, 0.6)';
            this.ctx.fillRect(lmX + lmSize/2, lmY, 8, 3);
        }
        
        // Velocity vector indicator
        if (this.agc.running) {
            this.ctx.strokeStyle = '#00ffff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(lmX, lmY);
            
            // Scale velocity for display
            const velX = -this.agc.horizontalVel * 0.5;
            const velY = -this.agc.velocity * 0.5;
            
            this.ctx.lineTo(lmX + velX, lmY + velY);
            this.ctx.stroke();
            
            // Arrow head
            const angle = Math.atan2(velY, velX);
            this.ctx.beginPath();
            this.ctx.moveTo(lmX + velX, lmY + velY);
            this.ctx.lineTo(
                lmX + velX - 10 * Math.cos(angle - Math.PI/6),
                lmY + velY - 10 * Math.sin(angle - Math.PI/6)
            );
            this.ctx.lineTo(
                lmX + velX - 10 * Math.cos(angle + Math.PI/6),
                lmY + velY - 10 * Math.sin(angle + Math.PI/6)
            );
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
    
    drawInfoOverlay() {
        // Draw altitude reference
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = '14px Courier New';
        
        const surfaceY = this.height - 100;
        
        // Altitude markers on the side
        const altMarkers = [0, 100, 500, 1000, 5000, 10000, 25000, 50000];
        
        altMarkers.forEach(alt => {
            if (alt <= this.agc.altitude * 1.2) {
                const y = surfaceY - (alt / 50000) * (surfaceY - 50);
                
                this.ctx.fillStyle = '#00ff88';
                this.ctx.fillText(alt + ' ft', 10, y);
                
                this.ctx.strokeStyle = '#00ff88';
                this.ctx.globalAlpha = 0.3;
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.width, y);
                this.ctx.stroke();
                this.ctx.globalAlpha = 1.0;
            }
        });
        
        // Landing status message
        if (this.agc.landed) {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = 'bold 36px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('CONTACT LIGHT', this.width / 2, this.height / 2);
            this.ctx.fillText('THE EAGLE HAS LANDED', this.width / 2, this.height / 2 + 50);
        } else if (this.agc.crashed) {
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = 'bold 36px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('HARD LANDING', this.width / 2, this.height / 2);
        }
        
        this.ctx.textAlign = 'left';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Visualization;
}
