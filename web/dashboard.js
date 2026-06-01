// Mock data for demo purposes
const mockData = {
    instances: [
        { id: '1', username: 'BravePlayer2024', server: 'play.mineflare.com', status: 'online', java: '17' },
        { id: '2', username: 'SwiftMiner1023', server: 'hub.mineflare.com', status: 'online', java: '21' },
        { id: '3', username: 'NobleFighter5420', server: 'pvp.mineflare.com', status: 'offline', java: '17' }
    ],
    trading: {
        status: 'active',
        profit: 15420,
        trades: 234,
        duration: '2h 34m',
        profitPerHour: 6000
    },
    enchanting: {
        status: 'active',
        jobsCompleted: 45,
        pendingJobs: 8,
        totalCost: 2300,
        jobsPerHour: 18
    },
    brewing: {
        status: 'active',
        batchesCompleted: 23,
        pendingBatches: 2,
        duration: '1h 15m',
        batchesPerHour: 18
    },
    fishing: {
        status: 'active',
        fishCaught: 156,
        totalValue: 8420,
        duration: '45m',
        fishPerHour: 208,
        lastRarity: 'rare'
    },
    mobfarm: {
        status: 'active',
        mobsKilled: 432,
        totalExperience: 5840,
        duration: '1h 20m',
        mobsPerHour: 324,
        topDrop: 'Rotten Flesh (89)'
    },
    pathfinding: {
        status: 'active',
        totalDistance: 2483.5,
        waypoints: 12,
        currentLocation: '(342, 64, -521)',
        destination: 'None'
    }
};

// Update instances display
function updateInstances() {
    const instancesContainer = document.getElementById('instances');
    const html = mockData.instances.map(instance => `
        <div class="instance-item ${instance.status === 'offline' ? 'offline' : ''}">
            <div class="instance-info">
                <div class="instance-username">${instance.username}</div>
                <div class="instance-server">${instance.server} • Java ${instance.java}</div>
            </div>
            <div class="instance-status ${instance.status === 'offline' ? 'offline' : ''}">
                ${instance.status.toUpperCase()}
            </div>
        </div>
    `).join('');
    instancesContainer.innerHTML = html;
}

// Update system status displays
function updateSystems() {
    updateSystemCard('trading', mockData.trading, [
        { label: 'Total Profit', value: `${mockData.trading.profit} coins` },
        { label: 'Trades Completed', value: mockData.trading.trades },
        { label: 'Duration', value: mockData.trading.duration },
        { label: 'Profit/Hour', value: `${mockData.trading.profitPerHour} coins` },
        { label: 'Status', value: mockData.trading.status }
    ]);

    updateSystemCard('enchanting', mockData.enchanting, [
        { label: 'Jobs Completed', value: mockData.enchanting.jobsCompleted },
        { label: 'Pending Jobs', value: mockData.enchanting.pendingJobs },
        { label: 'Total Cost', value: `${mockData.enchanting.totalCost} EXP` },
        { label: 'Jobs/Hour', value: mockData.enchanting.jobsPerHour },
        { label: 'Status', value: mockData.enchanting.status }
    ]);

    updateSystemCard('brewing', mockData.brewing, [
        { label: 'Batches Completed', value: mockData.brewing.batchesCompleted },
        { label: 'Pending Batches', value: mockData.brewing.pendingBatches },
        { label: 'Duration', value: mockData.brewing.duration },
        { label: 'Batches/Hour', value: mockData.brewing.batchesPerHour },
        { label: 'Status', value: mockData.brewing.status }
    ]);

    updateSystemCard('fishing', mockData.fishing, [
        { label: 'Fish Caught', value: mockData.fishing.fishCaught },
        { label: 'Total Value', value: `${mockData.fishing.totalValue} coins` },
        { label: 'Duration', value: mockData.fishing.duration },
        { label: 'Fish/Hour', value: mockData.fishing.fishPerHour },
        { label: 'Last Rarity', value: mockData.fishing.lastRarity },
        { label: 'Status', value: mockData.fishing.status }
    ]);

    updateSystemCard('mobfarm', mockData.mobfarm, [
        { label: 'Mobs Killed', value: mockData.mobfarm.mobsKilled },
        { label: 'Total XP', value: `${mockData.mobfarm.totalExperience} XP` },
        { label: 'Duration', value: mockData.mobfarm.duration },
        { label: 'Mobs/Hour', value: mockData.mobfarm.mobsPerHour },
        { label: 'Top Drop', value: mockData.mobfarm.topDrop },
        { label: 'Status', value: mockData.mobfarm.status }
    ]);

    updateSystemCard('pathfinding', mockData.pathfinding, [
        { label: 'Total Distance', value: `${mockData.pathfinding.totalDistance} blocks` },
        { label: 'Waypoints', value: mockData.pathfinding.waypoints },
        { label: 'Current Location', value: mockData.pathfinding.currentLocation },
        { label: 'Destination', value: mockData.pathfinding.destination },
        { label: 'Status', value: mockData.pathfinding.status }
    ]);
}

function updateSystemCard(systemName, data, stats) {
    const container = document.getElementById(systemName);
    const html = stats.map(stat => `
        <div class="stat-row">
            <span class="stat-label">${stat.label}</span>
            <span class="stat-value">${stat.value}</span>
        </div>
    `).join('');
    container.innerHTML = html;
}

// Initialize dashboard
function init() {
    updateInstances();
    updateSystems();
    // Refresh every 5 seconds
    setInterval(() => {
        updateInstances();
        updateSystems();
    }, 5000);
}

// Start on page load
window.addEventListener('DOMContentLoaded', init);
