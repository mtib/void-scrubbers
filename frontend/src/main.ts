import App from './App';

window.onload = () => {
    // Initialize the game application
    const app = new App();
    app.start();

    // Handle window resizing
    window.addEventListener('resize', () => {
        app.resize();
    });
};
