document.addEventListener('DOMContentLoaded', () => {
    const CLIENT_ID = '1357690313896099942';
    const REDIRECT_URI = encodeURIComponent('https://keolotso.github.io/Keos-Asset-Store/callback.html');
    const SCOPES = 'identify';
    const DISCORD_ENDPOINT = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=${SCOPES}`;

    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const loginSection = document.getElementById('login-section');
    const mainContent = document.getElementById('main-content');
    const displayNameSmall = document.getElementById('display-name-small');
    const userAvatarSmall = document.getElementById('user-avatar-small');

    function checkLoginStatus() {
        const token = localStorage.getItem('discord_token');
        if (token) {
            fetchUserInfo(token);
            showMainContent();
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
                showMainContent();
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
        
        userAvatarSmall.src = avatarUrl;
        displayNameSmall.textContent = user.global_name || user.username;
    }

    function showLoginSection() {
        loginSection.classList.remove('hidden');
        mainContent.classList.add('hidden');
    }

    function showMainContent() {
        loginSection.classList.add('hidden');
        mainContent.classList.remove('hidden');
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
