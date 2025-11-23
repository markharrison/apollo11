/**
 * Main Application Controller
 * Integrates AGC simulation, DSKY interface, and visualization
 */

// Global instances
let agc, dsky, visualization;
let animationFrameId = null;
let lastFrameTime = 0;

/**
 * Initialize the application
 */
function init() {
    console.log('Initializing Apollo 11 AGC/DSKY Simulation...');
    
    // Create AGC simulator
    agc = new AGCSimulator();
    
    // Create DSKY controller
    dsky = new DSKYController(agc);
    
    // Create visualization
    visualization = new LandingVisualization('landing-canvas', agc);
    
    // Setup controls
    setupControls();
    
    // Start animation loop
    startAnimationLoop();
    
    console.log('Simulation initialized successfully!');
}

/**
 * Setup UI controls
 */
function setupControls() {
    // Time slider
    const timeSlider = document.getElementById('time-slider');
    const speedDisplay = document.getElementById('speed-display');
    
    timeSlider.addEventListener('input', (e) => {
        const multiplier = parseInt(e.target.value);
        agc.setTimeMultiplier(multiplier);
        speedDisplay.textContent = multiplier + 'x';
    });
    
    // Keyboard control for time slider
    timeSlider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.stopPropagation(); // Prevent DSKY from capturing these keys
        }
    });
    
    // Reset button
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', () => {
        resetSimulation();
    });
    
    // Toggle pause button
    const toggleBtn = document.getElementById('toggle-sim-btn');
    toggleBtn.addEventListener('click', () => {
        const isPaused = agc.togglePause();
        toggleBtn.textContent = isPaused ? 'Resume' : 'Pause';
    });
    
    // Make time slider accessible with keyboard
    timeSlider.setAttribute('tabindex', '0');
    timeSlider.setAttribute('aria-label', 'Simulation speed control');
}

/**
 * Reset simulation to initial state
 */
function resetSimulation() {
    agc.reset();
    dsky.reset();
    
    // Reset UI controls
    const timeSlider = document.getElementById('time-slider');
    const speedDisplay = document.getElementById('speed-display');
    const toggleBtn = document.getElementById('toggle-sim-btn');
    
    timeSlider.value = 1;
    speedDisplay.textContent = '1x';
    toggleBtn.textContent = 'Pause';
    
    console.log('Simulation reset');
}

/**
 * Main animation loop
 */
function startAnimationLoop() {
    function animate(currentTime) {
        // Calculate delta time in seconds
        const deltaTime = lastFrameTime ? (currentTime - lastFrameTime) / 1000 : 0;
        lastFrameTime = currentTime;
        
        // Limit delta time to prevent large jumps
        const clampedDelta = Math.min(deltaTime, 0.1);
        
        // Update AGC simulation
        agc.update(clampedDelta);
        
        // Update DSKY display
        dsky.update();
        
        // Render visualization
        visualization.render();
        
        // Continue animation loop
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // Start the loop
    animationFrameId = requestAnimationFrame(animate);
}

/**
 * Stop animation loop
 */
function stopAnimationLoop() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopAnimationLoop();
});
