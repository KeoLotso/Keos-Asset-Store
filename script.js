document.addEventListener('DOMContentLoaded', () => {
    const CLIENT_ID = '1357690313896099942';
    const REDIRECT_URI = 'https://keolotso.github.io/Keos-Asset-Store/';
    const DISCORD_ENDPOINT = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=identify`;
    
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const loginSection = document.getElementById('login-section');
    const profileSection = document.getElementById('profile-section');
    const userAvatar = document.getElementById('user-avatar');
    const displayName = document.getElementById('display-name');
    const userId = document.getElementById('user-id');

    function checkLoginStatus() {
        const token = localStorage.getItem('discord_token');
        if (token) {
            fetchUserInfo(token);
            showProfileSection();
        } else {
            showLoginSection();
        }
    }

    function parseHash() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            if (accessToken) {
                localStorage.setItem('discord_token', accessToken);
                history.pushState("", document.title, window.location.pathname);
                fetchUserInfo(accessToken);
                showProfileSection();
            }
        }
    }

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

    function displayUserInfo(user) {
        const avatarUrl = user.avatar 
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` 
            : 'https://cdn.discordapp.com/embed/avatars/0.png';
        
        userAvatar.src = avatarUrl;
        
        displayName.textContent = user.global_name || user.username;
        
        userId.textContent = `@${user.username}`;
    }

    function showLoginSection() {
        loginSection.classList.remove('hidden');
        profileSection.classList.add('hidden');
    }

    function showProfileSection() {
        loginSection.classList.add('hidden');
        profileSection.classList.remove('hidden');
    }

    loginButton.addEventListener('click', () => {
        window.location.href = DISCORD_ENDPOINT;
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('discord_token');
        showLoginSection();
    });

    parseHash();
    checkLoginStatus();
});
