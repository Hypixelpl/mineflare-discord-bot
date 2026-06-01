// Configuration
const config = {
    domain: localStorage.getItem('domain') || 'localhost:3000',
    updateInterval: 5000
};

// Mock data
const mockData = {
    instances: [
        { id: '1', username: 'BravePlayer2024', server: 'play.mineflare.com', status: 'online', java: '17', ping: 45 },
        { id: '2', username: 'SwiftMiner1023', server: 'hub.mineflare.com', status: 'online', java: '21', ping: 32 },
        { id: '3', username: 'NobleFighter5420', server: 'pvp.mineflare.com', status: 'offline', java: '17', ping: 0 }
    ]
};

// DOM Elements
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const contentScroll = document.querySelector('.main-content');
const domainInput = document.getElementById('domainInput');
const domainBtn = document.getElementById('domainBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    setupEventListeners();
    setupScrollableArea();
    updateInstances();
    updateMinecraftView();
    setInterval(updateMinecraftView, 100);
}

// Event Listeners
function setupEventListeners() {
    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            navigateTo(sectionId);
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });

    // Domain settings
    domainBtn.addEventListener('click', () => {
        config.domain = domainInput.value || 'localhost:3000';
        localStorage.setItem('domain', config.domain);
        showNotification('Domain updated to: ' + config.domain);
    });

    domainInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            domainBtn.click();
        }
    });
}

function setupScrollableArea() {
    const mainContent = document.querySelector('.main-content');
    const header = document.querySelector('.header');
    const scrollableHeight = window.innerHeight - header.offsetHeight;
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'content-scroll';
    contentWrapper.style.height = scrollableHeight + 'px';
    
    const allSections = document.querySelectorAll('.section');
    allSections.forEach(section => {
        contentWrapper.appendChild(section);
    });
    
    mainContent.appendChild(contentWrapper);
}

// Navigation
function navigateTo(sectionId) {
    // Update nav links
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });

    // Update sections
    sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
            section.scrollIntoView();
        }
    });
}

// Update Functions
function updateInstances() {
    const container = document.getElementById('instancesContainer');
    if (!container) return;

    const html = mockData.instances.map(instance => `
        <div class="instance-card">
            <div class="instance-header">
                <span class="instance-username">${instance.username}</span>
                <span class="status-badge ${instance.status}">${instance.status.toUpperCase()}</span>
            </div>
            <div class="instance-info">
                <div><span>Server:</span> <strong>${instance.server}</strong></div>
                <div><span>Java Version:</span> <strong>${instance.java}</strong></div>
                <div><span>Ping:</span> <strong>${instance.ping}ms</strong></div>
                <div><span>Status:</span> <strong>${instance.status === 'online' ? '🟢 Online' : '🔴 Offline'}</strong></div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Minecraft Canvas Rendering
function updateMinecraftView() {
    const canvas = document.getElementById('minecraftCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height * 0.6);

    // Ground
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, height * 0.6, width, height * 0.4);

    // Grass
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, height * 0.6, width, 10);

    // Trees
    drawTree(ctx, width * 0.2, height * 0.4, 40, 80);
    drawTree(ctx, width * 0.5, height * 0.35, 50, 90);
    drawTree(ctx, width * 0.8, height * 0.45, 35, 70);

    // Clouds
    drawCloud(ctx, 100, 50);
    drawCloud(ctx, width - 150, 80);
}

function drawTree(ctx, x, y, trunkWidth, trunkHeight) {
    // Trunk
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - trunkWidth / 2, y, trunkWidth, trunkHeight);

    // Foliage
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.ellipse(x, y - 30, 60, 40, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawCloud(ctx, x, y) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.ellipse(x, y, 40, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 30, y, 35, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x - 30, y, 35, 25, 0, 0, Math.PI * 2);
    ctx.fill();
}

// Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
