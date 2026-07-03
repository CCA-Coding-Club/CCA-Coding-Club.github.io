// Import the core Firebase modules directly from the Google CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GithubAuthProvider,
    signOut,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// The cryptographic configuration matrix exfiltrated from the Firebase console
const firebaseConfig = {
    apiKey: "AIzaSyApqYYaArzh4nLQFMLSv6Avd5KWw7FIad8",
    authDomain: "ccacodingclubwebsite.firebaseapp.com",
    projectId: "ccacodingclubwebsite",
    storageBucket: "ccacodingclubwebsite.firebasestorage.app",
    messagingSenderId: "621383915729",
    appId: "1:621383915729:web:7fc37918ea63fa58dc4df0"
};

// Initialize the external apparatus
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const githubProvider = new GithubAuthProvider();

// ============================================================================
// CHRONOLOGICAL DETERMINISM PERIMETER
// No physical DOM interaction may occur until the browser confirms total load completion
// ============================================================================
function initAuth() {

    // Acquire references to your newly injected HTML elements
    const loginBtn = document.getElementById('github-login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userTelemetry = document.getElementById('user-telemetry');

    // Diagnostic validation to ensure the anastomosis holds
    if (!loginBtn || !logoutBtn || !userTelemetry) {
        console.error("DOM Acquisition Failure: Target nodes are absent from the structural matrix.");
        return; // Halt execution to prevent cascading errors
    }

    // Execute the Transduction: Bind the login execution to the kinetic button click
    loginBtn.addEventListener('click', () => {
        signInWithPopup(auth, githubProvider)
            .then((result) => {
                console.log("Cryptographic handshake complete.");
            })
            .catch((error) => {
                console.error("Authorization failed:", error.message);
            });
    });

    // Bind the logout execution
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            console.log("Successfully logged out.");
        });
    });

    // Autonomous State Observer: This watches for changes in the user's status
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is securely within the hierarchy
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            userTelemetry.innerHTML = `Welcome, Coder: (${user.email})`;
        } else {
            // User has returned to the unverified state
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
            userTelemetry.innerHTML = "Status: Guest.";
        }
    });

}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}