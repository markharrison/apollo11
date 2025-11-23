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
    
    try {
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
    } catch (error) {
        console.error('Failed to initialize simulation:', error);
        alert('Failed to initialize the simulation. Please refresh the page and try again.');
    }
}

/**
 * Setup UI controls
 */
function setupControls() {
    // Time slider
    const timeSlider = document.getElementById('time-slider');
    const speedDisplay = document.getElementById('speed-display');
    
    if (timeSlider && speedDisplay) {
        timeSlider.addEventListener('input', (e) => {
            const multiplier = parseInt(e.target.value, 10);
            agc.setTimeMultiplier(multiplier);
            speedDisplay.textContent = multiplier + 'x';
        });
        
        // Keyboard control for time slider
        timeSlider.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.stopPropagation(); // Prevent DSKY from capturing these keys
            }
        });
        
        // Make time slider accessible with keyboard
        timeSlider.setAttribute('tabindex', '0');
        timeSlider.setAttribute('aria-label', 'Simulation speed control');
    }
    
    // Reset button
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetSimulation();
        });
    }
    
    // Toggle pause button
    const toggleBtn = document.getElementById('toggle-sim-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isPaused = agc.togglePause();
            toggleBtn.textContent = isPaused ? 'Resume' : 'Pause';
        });
    }
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
