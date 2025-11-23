// Main Application Controller

class App {
    constructor() {
        // Initialize AGC
        this.agc = new AGC();
        
        // Initialize DSKY
        this.dsky = new DSKY(this.agc);
        
        // Initialize Landing Simulation
        this.landingSim = new LandingSimulation(this.agc);
        
        // Initialize Visualization
        this.visualization = new Visualization(this.agc, 'landing-canvas');
        
        // Animation frame tracking
        this.lastTime = 0;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
        
        // Start the animation loop
        this.start();
    }
    
    start() {
        requestAnimationFrame((time) => this.loop(time));
    }
    
    loop(currentTime) {
        // Calculate delta time
        if (this.lastTime === 0) {
            this.lastTime = currentTime;
        }
        
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        
        // Only update if enough time has passed (60 FPS target)
        if (currentTime - this.lastTime >= this.frameInterval) {
            // Update all components
            this.update(deltaTime);
            
            // Draw visualization
            this.draw();
            
            this.lastTime = currentTime;
        }
        
        // Continue the loop
        requestAnimationFrame((time) => this.loop(time));
    }
    
    update(dt) {
        // Update landing simulation (which updates AGC)
        this.landingSim.update(dt);
        
        // Update DSKY displays
        this.dsky.update();
    }
    
    draw() {
        // Draw visualization
        this.visualization.draw();
    }
}

// Initialize the application when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    console.log('Apollo 11 AGC/DSKY Simulation initialized');
});
