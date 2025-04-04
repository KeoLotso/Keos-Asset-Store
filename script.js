document.addEventListener('DOMContentLoaded', () => {
    const CLIENT_ID = '1357690313896099942';
    const REDIRECT_URI = encodeURIComponent(window.location.origin);
    const DISCORD_ENDPOINT = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=identify`;
    
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const loginSection = document.getElementById('login-section');
    const profileSection = document.getElementById('profile-section');
    const userAvatar = document.getElementById('user-avatar');
    const displayName = document.getElementById('display-name');
    const userId = document.getElementById('user-id');

    // Check if user is already logged in (token stored in localStorage)
    function checkLoginStatus() {
        const token = localStorage.getItem('discord_token');
        if (token) {
            fetchUserInfo(token);
            showProfileSection();
        } else {
            showLoginSection();
        }
    }

    // Parse access token from URL hash if present
    function parseHash() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            if (accessToken) {
                localStorage.setItem('discord_token', accessToken);
                // Remove the hash from URL to prevent token leakage
                history.pushState("", document.title, window.location.pathname);
                fetchUserInfo(accessToken);
                showProfileSection();
            }
        }
    }

    // Fetch user information from Discord API
    function fetchUserInfo(token) {
        fetch('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            return response.json();
        })
        .then(data => {
            displayUserInfo(data);
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            localStorage.removeItem('discord_token');
            showLoginSection();
        });
    }

    // Display user information in the profile section
    function displayUserInfo(user) {
        // Set user avatar (Discord uses dynamic CDN URLs for avatars)
        const avatarUrl = user.avatar 
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` 
            : 'https://cdn.discordapp.com/embed/avatars/0.png'; // Default avatar
        
        userAvatar.src = avatarUrl;
        
        // Set display name (preferring username if global_name is not available)
        displayName.textContent = user.global_name || user.username;
        
        // Show user ID or tag
        userId.textContent = `@${user.username}`;
    }

    // Show login section, hide profile section
    function showLoginSection() {
        loginSection.classList.remove('hidden');
        profileSection.classList.add('hidden');
    }

    // Show profile section, hide login section
    function showProfileSection() {
        loginSection.classList.add('hidden');
        profileSection.classList.remove('hidden');
    }

    // Handle login button click
    loginButton.addEventListener('click', () => {
        window.location.href = DISCORD_ENDPOINT;
    });

    // Handle logout button click
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('discord_token');
        showLoginSection();
    });

    // Initialize
    parseHash();
    checkLoginStatus();
});