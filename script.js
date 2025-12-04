// ==================== GAME MANAGER ====================
class GameManager {
    constructor() {
        this.currentScreen = 'main-menu';
        this.selectedCharacter = null;
        this.selectedLevel = 1;
        this.customization = {
            primaryColor: '#00ffff',
            secondaryColor: '#ff00ff',
            glowIntensity: 70
        };
        this.gameState = {
            xp: 0,
            score: 0,
            health: 100,
            maxHealth: 100,
            unlockedPowers: [],
            completedMissions: []
        };
        this.init();
    }

    init() {
        this.loadGameData();
        this.updateXPDisplay();
        this.initializeCharacters();
        this.initializeLevels();
        this.initializeMissions();
        this.initializePowers();
        this.setupEventListeners();
    }

    loadGameData() {
        const saved = localStorage.getItem('cyberbotsRPG');
        if (saved) {
            const data = JSON.parse(saved);
            this.gameState.xp = data.xp || 0;
            this.gameState.unlockedPowers = data.unlockedPowers || [];
            this.gameState.completedMissions = data.completedMissions || [];
            this.selectedCharacter = data.selectedCharacter || null;
            this.selectedLevel = data.selectedLevel || 1;
        }
        
        // Desbloquear poderes básicos automaticamente
        const basicPowers = ['basic-nova', 'basic-shadow', 'basic-titan', 'basic-phoenix', 
                             'basic-quantum', 'basic-neon', 'basic-steel', 'basic-plasma', 
                             'basic-omega', 'basic-volt'];
        basicPowers.forEach(powerId => {
            if (!this.gameState.unlockedPowers.includes(powerId)) {
                this.gameState.unlockedPowers.push(powerId);
            }
        });
        this.saveGameData();
    }

    saveGameData() {
        const data = {
            xp: this.gameState.xp,
            unlockedPowers: this.gameState.unlockedPowers,
            completedMissions: this.gameState.completedMissions,
            selectedCharacter: this.selectedCharacter,
            selectedLevel: this.selectedLevel
        };
        localStorage.setItem('cyberbotsRPG', JSON.stringify(data));
    }

    updateXPDisplay() {
        document.getElementById('xp-amount').textContent = this.gameState.xp;
    }

    addXP(amount) {
        this.gameState.xp += amount;
        this.updateXPDisplay();
        this.saveGameData();
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
    }

    showMainMenu() {
        this.showScreen('main-menu');
    }

    showCharacterSelect() {
        this.showScreen('character-select');
        this.renderCharacterGrid();
    }

    showCustomization() {
        if (!this.selectedCharacter) {
            alert('Selecione um personagem primeiro!');
            return;
        }
        this.showScreen('customization');
        this.updatePreview();
    }

    showLevelSelect() {
        this.showScreen('level-select');
        this.renderLevelGrid();
    }

    showMissions() {
        this.showScreen('missions-screen');
        this.renderMissions();
    }

    showPowers() {
        this.showScreen('powers-screen');
        document.getElementById('powers-xp').textContent = this.gameState.xp;
        this.renderPowers();
    }

    setupEventListeners() {
        const colorPrimary = document.getElementById('color-primary');
        const colorSecondary = document.getElementById('color-secondary');
        const glowIntensity = document.getElementById('glow-intensity');

        if (colorPrimary) {
            colorPrimary.addEventListener('input', (e) => {
                this.customization.primaryColor = e.target.value;
                this.updatePreview();
            });
        }

        if (colorSecondary) {
            colorSecondary.addEventListener('input', (e) => {
                this.customization.secondaryColor = e.target.value;
                this.updatePreview();
            });
        }

        if (glowIntensity) {
            glowIntensity.addEventListener('input', (e) => {
                this.customization.glowIntensity = e.target.value;
                this.updatePreview();
            });
        }
    }

    updatePreview() {
        const preview = document.getElementById('preview-bot');
        if (preview) {
            preview.style.setProperty('--primary-color', this.customization.primaryColor);
            preview.style.setProperty('--secondary-color', this.customization.secondaryColor);
            preview.style.setProperty('--glow-intensity', `${this.customization.glowIntensity}px`);
        }
    }

    startGame() {
        if (!this.selectedCharacter) {
            alert('Selecione um personagem!');
            return;
        }
        this.showScreen('game-screen');
        this.gameState.health = this.gameState.maxHealth;
        this.gameState.score = 0;
        
        // Atualizar display do nível
        const levelName = this.getLevel(this.selectedLevel)?.name || this.selectedLevel;
        document.getElementById('current-level').textContent = levelName;
        
        gameEngine.start();
        this.setupMobileControls();
    }

    setupMobileControls() {
        const mobileControls = document.getElementById('mobile-controls');
        if (!mobileControls) return;

        // Remove listeners antigos
        const buttons = mobileControls.querySelectorAll('button');
        buttons.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
        });

        // D-Pad controls
        const dpadBtns = document.querySelectorAll('.dpad-btn');
        dpadBtns.forEach(btn => {
            const action = btn.dataset.action;
            
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!gameEngine || !gameEngine.player) return;
                
                switch(action) {
                    case 'left':
                        gameEngine.keys.left = true;
                        break;
                    case 'right':
                        gameEngine.keys.right = true;
                        break;
                }
            });

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                if (!gameEngine || !gameEngine.player) return;
                
                switch(action) {
                    case 'left':
                        gameEngine.keys.left = false;
                        break;
                    case 'right':
                        gameEngine.keys.right = false;
                        break;
                }
            });

            btn.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                if (!gameEngine || !gameEngine.player) return;
                
                switch(action) {
                    case 'left':
                        gameEngine.keys.left = false;
                        break;
                    case 'right':
                        gameEngine.keys.right = false;
                        break;
                }
            });
        });

        // Action buttons
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            const action = btn.dataset.action;
            
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!gameEngine || !gameEngine.player) return;
                
                switch(action) {
                    case 'jump':
                        gameEngine.player.jump();
                        break;
                    case 'superjump':
                        gameEngine.player.superJump();
                        break;
                    case 'attack':
                        gameEngine.player.attack();
                        break;
                    case 'power':
                        gameEngine.player.useSpecialPower();
                        break;
                }
            });
        });
    }


    getActivePowers() {
        const charData = this.getCharacter(this.selectedCharacter);
        if (!charData) return [];
        
        return this.powers.filter(power => 
            power.robotId === this.selectedCharacter && 
            this.gameState.unlockedPowers.includes(power.id)
        );
    }

    hasPower(powerId) {
        return this.gameState.unlockedPowers.includes(powerId);
    }

    restartGame() {
        this.startGame();
    }

    pauseGame() {
        gameEngine.pause();
        this.showMainMenu();
    }

    endGame(victory) {
        const earnedXP = Math.floor(this.gameState.score / 10);
        this.addXP(earnedXP);

        if (victory) {
            document.getElementById('victory-score').textContent = this.gameState.score;
            document.getElementById('victory-xp').textContent = earnedXP;
            this.showScreen('victory-screen');
        } else {
            document.getElementById('defeat-score').textContent = this.gameState.score;
            document.getElementById('defeat-xp').textContent = earnedXP;
            this.showScreen('defeat-screen');
        }
    }

    showReward(xp, message) {
        document.getElementById('reward-xp').textContent = xp;
        document.getElementById('reward-message').textContent = message;
        this.showScreen('reward-screen');
    }

    closeReward() {
        this.showMainMenu();
    }

    // ==================== CHARACTERS ====================
    initializeCharacters() {
        this.characters = [
            {
                id: 'nova-prime',
                name: 'Nova Prime',
                icon: '🤖',
                speed: 3.5,
                jumpPower: 15,
                damage: 10,
                description: 'Equilíbrio perfeito entre velocidade e poder'
            },
            {
                id: 'shadow-blade',
                name: 'Shadow Blade',
                icon: '⚔️',
                speed: 5,
                jumpPower: 16,
                damage: 15,
                description: 'Velocista letal com ataques rápidos'
            },
            {
                id: 'titan-core',
                name: 'Titan Core',
                icon: '🛡️',
                speed: 2,
                jumpPower: 12,
                damage: 20,
                description: 'Tanque resistente com poder massivo'
            },
            {
                id: 'cyber-phoenix',
                name: 'Cyber Phoenix',
                icon: '🔥',
                speed: 4,
                jumpPower: 18,
                damage: 12,
                description: 'Mestre dos saltos com ataques flamejantes'
            },
            {
                id: 'quantum-knight',
                name: 'Quantum Knight',
                icon: '⚡',
                speed: 3.5,
                jumpPower: 14,
                damage: 14,
                description: 'Guerreiro tecnológico com energia quântica'
            },
            {
                id: 'neon-striker',
                name: 'Neon Striker',
                icon: '✨',
                speed: 5.5,
                jumpPower: 15,
                damage: 11,
                description: 'Velocista luminoso com reflexos aprimorados'
            },
            {
                id: 'steel-guardian',
                name: 'Steel Guardian',
                icon: '🔰',
                speed: 3,
                jumpPower: 13,
                damage: 18,
                description: 'Protetor de aço com defesa impenetrável'
            },
            {
                id: 'plasma-hunter',
                name: 'Plasma Hunter',
                icon: '💠',
                speed: 4,
                jumpPower: 17,
                damage: 13,
                description: 'Caçador preciso com armas de plasma'
            },
            {
                id: 'omega-sentinel',
                name: 'Omega Sentinel',
                icon: '🎯',
                speed: 3.5,
                jumpPower: 15,
                damage: 16,
                description: 'Sentinela definitiva com sistemas avançados'
            },
            {
                id: 'volt-reaper',
                name: 'Volt Reaper',
                icon: '⚡',
                speed: 5,
                jumpPower: 16,
                damage: 14,
                description: 'Ceifador elétrico com ataques devastadores'
            }
        ];
    }

    renderCharacterGrid() {
        const grid = document.getElementById('character-grid');
        grid.innerHTML = '';

        this.characters.forEach(char => {
            const card = document.createElement('div');
            card.className = 'character-card';
            if (this.selectedCharacter === char.id) {
                card.classList.add('selected');
            }

            card.innerHTML = `
                <div class="character-icon">${char.icon}</div>
                <div class="character-name">${char.name}</div>
                <div class="character-stats">
                    Velocidade: ${char.speed} | Pulo: ${char.jumpPower}<br>
                    Dano: ${char.damage}
                </div>
            `;

            card.addEventListener('click', () => {
                this.selectedCharacter = char.id;
                this.saveGameData();
                this.showCustomization();
            });

            grid.appendChild(card);
        });
    }

    getCharacter(id) {
        return this.characters.find(c => c.id === id);
    }

    // ==================== LEVELS ====================
    initializeLevels() {
        this.levels = [
            {
                id: 1,
                name: 'Iniciante',
                description: 'Perfeito para começar',
                difficulty: 'Muito Fácil',
                enemySpeed: 0.5,
                enemySpawnInterval: 3000,
                maxEnemies: 3,
                enemyDamageMultiplier: 0.7,
                enemyHealthMultiplier: 0.8,
                waves: 3,
                enemiesPerWave: 10
            },
            {
                id: 2,
                name: 'Fácil',
                description: 'Um desafio leve',
                difficulty: 'Fácil',
                enemySpeed: 0.7,
                enemySpawnInterval: 2500,
                maxEnemies: 4,
                enemyDamageMultiplier: 0.85,
                enemyHealthMultiplier: 0.9,
                waves: 4,
                enemiesPerWave: 12
            },
            {
                id: 3,
                name: 'Normal',
                description: 'Equilíbrio entre desafio e diversão',
                difficulty: 'Normal',
                enemySpeed: 1.0,
                enemySpawnInterval: 2000,
                maxEnemies: 5,
                enemyDamageMultiplier: 1.0,
                enemyHealthMultiplier: 1.0,
                waves: 5,
                enemiesPerWave: 15
            },
            {
                id: 4,
                name: 'Difícil',
                description: 'Para jogadores experientes',
                difficulty: 'Difícil',
                enemySpeed: 1.3,
                enemySpawnInterval: 1500,
                maxEnemies: 6,
                enemyDamageMultiplier: 1.2,
                enemyHealthMultiplier: 1.2,
                waves: 6,
                enemiesPerWave: 18
            },
            {
                id: 5,
                name: 'Muito Difícil',
                description: 'Um verdadeiro teste de habilidade',
                difficulty: 'Muito Difícil',
                enemySpeed: 1.5,
                enemySpawnInterval: 1200,
                maxEnemies: 7,
                enemyDamageMultiplier: 1.4,
                enemyHealthMultiplier: 1.4,
                waves: 7,
                enemiesPerWave: 20
            },
            {
                id: 6,
                name: 'Extremo',
                description: 'Apenas para mestres',
                difficulty: 'Extremo',
                enemySpeed: 1.8,
                enemySpawnInterval: 1000,
                maxEnemies: 8,
                enemyDamageMultiplier: 1.6,
                enemyHealthMultiplier: 1.6,
                waves: 8,
                enemiesPerWave: 25
            },
            {
                id: 7,
                name: 'Pesadelo',
                description: 'O desafio definitivo',
                difficulty: 'PESADELO',
                enemySpeed: 2.2,
                enemySpawnInterval: 800,
                maxEnemies: 10,
                enemyDamageMultiplier: 2.0,
                enemyHealthMultiplier: 2.0,
                waves: 10,
                enemiesPerWave: 30
            }
        ];
    }

    renderLevelGrid() {
        const grid = document.getElementById('level-grid');
        const startBtn = document.getElementById('start-game-btn');
        grid.innerHTML = '';

        this.levels.forEach(level => {
            const card = document.createElement('div');
            card.className = 'level-card';
            if (this.selectedLevel === level.id) {
                card.classList.add('selected');
            }

            card.innerHTML = `
                <div class="level-number">${level.id}</div>
                <div class="level-name">${level.name}</div>
                <div class="level-description">${level.description}</div>
                <div class="level-difficulty">Dificuldade: ${level.difficulty}</div>
            `;

            card.addEventListener('click', () => {
                this.selectedLevel = level.id;
                this.saveGameData();
                this.renderLevelGrid();
                
                // Mostrar botão de iniciar partida
                if (startBtn) {
                    startBtn.style.display = 'inline-block';
                }
            });

            grid.appendChild(card);
        });
        
        // Mostrar botão se já tiver nível selecionado
        if (this.selectedLevel && startBtn) {
            startBtn.style.display = 'inline-block';
        }
    }

    getLevel(id) {
        return this.levels.find(l => l.id === id);
    }

    // ==================== MISSIONS ====================
    initializeMissions() {
        this.missions = [
            {
                id: 'first-battle',
                title: 'Primeira Batalha',
                description: 'Derrote 5 inimigos em uma partida',
                reward: 50,
                requirement: 5,
                type: 'kills',
                progress: 0
            },
            {
                id: 'survivor',
                title: 'Sobrevivente',
                description: 'Sobreviva por 60 segundos sem morrer',
                reward: 75,
                requirement: 60,
                type: 'survive',
                progress: 0
            },
            {
                id: 'combo-master',
                title: 'Mestre do Combo',
                description: 'Alcance 500 pontos em uma partida',
                reward: 100,
                requirement: 500,
                type: 'score',
                progress: 0
            },
            {
                id: 'jump-expert',
                title: 'Especialista em Saltos',
                description: 'Execute 50 saltos em uma partida',
                reward: 60,
                requirement: 50,
                type: 'jumps',
                progress: 0
            },
            {
                id: 'elite-warrior',
                title: 'Guerreiro Elite',
                description: 'Derrote 20 inimigos em uma partida',
                reward: 150,
                requirement: 20,
                type: 'kills',
                progress: 0
            },
            {
                id: 'endurance',
                title: 'Resistência',
                description: 'Sobreviva por 120 segundos',
                reward: 120,
                requirement: 120,
                type: 'survive',
                progress: 0
            },
            {
                id: 'high-scorer',
                title: 'Pontuador Master',
                description: 'Alcance 1000 pontos em uma partida',
                reward: 200,
                requirement: 1000,
                type: 'score',
                progress: 0
            },
            {
                id: 'sharpshooter',
                title: 'Atirador de Elite',
                description: 'Derrote 10 inimigos sem tomar dano',
                reward: 180,
                requirement: 10,
                type: 'no-damage-kills',
                progress: 0
            },
            {
                id: 'speedster',
                title: 'Velocista',
                description: 'Derrote 15 inimigos em menos de 60 segundos',
                reward: 160,
                requirement: 15,
                type: 'speed-kills',
                progress: 0
            },
            {
                id: 'jump-master',
                title: 'Mestre dos Saltos',
                description: 'Execute 100 saltos em uma partida',
                reward: 90,
                requirement: 100,
                type: 'jumps',
                progress: 0
            },
            {
                id: 'untouchable',
                title: 'Intocável',
                description: 'Sobreviva 90 segundos sem tomar dano',
                reward: 250,
                requirement: 90,
                type: 'no-damage-time',
                progress: 0
            },
            {
                id: 'destroyer',
                title: 'Destruidor',
                description: 'Derrote 50 inimigos em uma partida',
                reward: 300,
                requirement: 50,
                type: 'kills',
                progress: 0
            },
            {
                id: 'mega-scorer',
                title: 'Mega Pontuador',
                description: 'Alcance 2000 pontos em uma partida',
                reward: 350,
                requirement: 2000,
                type: 'score',
                progress: 0
            },
            {
                id: 'marathon',
                title: 'Maratonista',
                description: 'Sobreviva por 180 segundos',
                reward: 200,
                requirement: 180,
                type: 'survive',
                progress: 0
            },
            {
                id: 'power-user',
                title: 'Usuário de Poderes',
                description: 'Use poderes especiais 20 vezes em uma partida',
                reward: 140,
                requirement: 20,
                type: 'power-usage',
                progress: 0
            },
            {
                id: 'combo-killer',
                title: 'Matador de Combo',
                description: 'Derrote 5 inimigos em menos de 10 segundos',
                reward: 170,
                requirement: 5,
                type: 'combo-kills',
                progress: 0
            },
            {
                id: 'super-jumper',
                title: 'Super Saltador',
                description: 'Use super pulo 30 vezes em uma partida',
                reward: 110,
                requirement: 30,
                type: 'super-jumps',
                progress: 0
            },
            {
                id: 'survivor-pro',
                title: 'Sobrevivente Pro',
                description: 'Sobreviva 150 segundos sem morrer',
                reward: 150,
                requirement: 150,
                type: 'survive',
                progress: 0
            },
            {
                id: 'ultimate-warrior',
                title: 'Guerreiro Supremo',
                description: 'Alcance 3000 pontos em uma partida',
                reward: 500,
                requirement: 3000,
                type: 'score',
                progress: 0
            },
            {
                id: 'legendary',
                title: 'Lendário',
                description: 'Derrote 100 inimigos em uma partida',
                reward: 600,
                requirement: 100,
                type: 'kills',
                progress: 0
            }
        ];
    }

    renderMissions() {
        const list = document.getElementById('missions-list');
        list.innerHTML = '';

        this.missions.forEach(mission => {
            const completed = this.gameState.completedMissions.includes(mission.id);
            const canClaim = mission.progress >= mission.requirement && !completed;
            
            const card = document.createElement('div');
            card.className = 'mission-card' + (completed ? ' completed' : '');

            const progressPercent = Math.min(100, (mission.progress / mission.requirement) * 100);
            const progressText = `${mission.progress} / ${mission.requirement}`;

            card.innerHTML = `
                <div class="mission-title">${mission.title}</div>
                <div class="mission-description">${mission.description}</div>
                <div class="mission-reward">Recompensa: ${mission.reward} XP</div>
                <div class="mission-progress">Progresso: ${progressText} (${Math.floor(progressPercent)}%)</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <button class="mission-btn" ${!canClaim ? 'disabled' : ''} 
                    onclick="game.claimMission('${mission.id}')">
                    ${completed ? 'COMPLETA ✓' : canClaim ? 'RESGATAR RECOMPENSA' : 'EM PROGRESSO'}
                </button>
            `;

            list.appendChild(card);
        });
    }

    claimMission(missionId) {
        if (this.gameState.completedMissions.includes(missionId)) {
            return;
        }

        const mission = this.missions.find(m => m.id === missionId);
        if (!mission) return;

        // Verifica se a missão foi completada
        if (mission.progress < mission.requirement) {
            alert(`Missão não completada! Progresso: ${mission.progress}/${mission.requirement}`);
            return;
        }

        // Resgata a recompensa
        this.gameState.completedMissions.push(missionId);
        this.addXP(mission.reward);
        this.showReward(mission.reward, `Missão "${mission.title}" completa!`);
        this.renderMissions();
    }

    updateMissionProgress(type, value) {
        this.missions.forEach(mission => {
            if (mission.type === type && !this.gameState.completedMissions.includes(mission.id)) {
                mission.progress = Math.max(mission.progress, value);
            }
        });
        this.saveGameData();
    }

    // ==================== POWERS ====================
    initializePowers() {
        this.powers = [
            {
                id: 'basic-nova',
                name: 'Poder Básico Nova',
                robot: 'Nova Prime',
                robotId: 'nova-prime',
                description: 'Poder inicial do Nova Prime',
                cost: 0,
                isBasic: true
            },
            {
                id: 'speed-boost-nova',
                name: 'Impulso Quântico',
                robot: 'Nova Prime',
                robotId: 'nova-prime',
                description: 'Aumenta a velocidade de movimento em 50%',
                cost: 50
            },
            {
                id: 'super-jump-nova',
                name: 'Salto Gravitacional',
                robot: 'Nova Prime',
                robotId: 'nova-prime',
                description: 'Aumenta a altura do pulo em 40%',
                cost: 75
            },
            {
                id: 'basic-shadow',
                name: 'Poder Básico Shadow',
                robot: 'Shadow Blade',
                robotId: 'shadow-blade',
                description: 'Poder inicial do Shadow Blade',
                cost: 0,
                isBasic: true
            },
            {
                id: 'blade-fury',
                name: 'Fúria das Lâminas',
                robot: 'Shadow Blade',
                robotId: 'shadow-blade',
                description: 'Ataques causam 100% mais dano',
                cost: 100
            },
            {
                id: 'shadow-dash',
                name: 'Velocidade das Sombras',
                robot: 'Shadow Blade',
                robotId: 'shadow-blade',
                description: 'Aumenta velocidade em 80%',
                cost: 80
            },
            {
                id: 'basic-titan',
                name: 'Poder Básico Titan',
                robot: 'Titan Core',
                robotId: 'titan-core',
                description: 'Poder inicial do Titan Core',
                cost: 0,
                isBasic: true
            },
            {
                id: 'titan-shield',
                name: 'Escudo Titânico',
                robot: 'Titan Core',
                robotId: 'titan-core',
                description: 'Reduz dano recebido em 50%',
                cost: 120
            },
            {
                id: 'ground-slam',
                name: 'Impacto Sísmico',
                robot: 'Titan Core',
                robotId: 'titan-core',
                description: 'Causa dano em área ao pousar',
                cost: 100
            },
            {
                id: 'basic-phoenix',
                name: 'Poder Básico Phoenix',
                robot: 'Cyber Phoenix',
                robotId: 'cyber-phoenix',
                description: 'Poder inicial do Cyber Phoenix',
                cost: 0,
                isBasic: true
            },
            {
                id: 'phoenix-fire',
                name: 'Chamas da Fênix',
                robot: 'Cyber Phoenix',
                robotId: 'cyber-phoenix',
                description: 'Inimigos queimam ao serem atingidos',
                cost: 90
            },
            {
                id: 'air-dash',
                name: 'Voo Controlado',
                robot: 'Cyber Phoenix',
                robotId: 'cyber-phoenix',
                description: 'Permite um dash no ar',
                cost: 110
            },
            {
                id: 'basic-quantum',
                name: 'Poder Básico Quantum',
                robot: 'Quantum Knight',
                robotId: 'quantum-knight',
                description: 'Poder inicial do Quantum Knight',
                cost: 0,
                isBasic: true
            },
            {
                id: 'quantum-phase',
                name: 'Fase Quântica',
                robot: 'Quantum Knight',
                robotId: 'quantum-knight',
                description: 'Atravessa inimigos temporariamente',
                cost: 150
            },
            {
                id: 'energy-wave',
                name: 'Onda de Energia',
                robot: 'Quantum Knight',
                robotId: 'quantum-knight',
                description: 'Libera onda que empurra inimigos',
                cost: 130
            },
            {
                id: 'basic-neon',
                name: 'Poder Básico Neon',
                robot: 'Neon Striker',
                robotId: 'neon-striker',
                description: 'Poder inicial do Neon Striker',
                cost: 0,
                isBasic: true
            },
            {
                id: 'neon-speed',
                name: 'Velocidade Neon',
                robot: 'Neon Striker',
                robotId: 'neon-striker',
                description: 'Aumenta velocidade em 70%',
                cost: 70
            },
            {
                id: 'light-trail',
                name: 'Rastro Luminoso',
                robot: 'Neon Striker',
                robotId: 'neon-striker',
                description: 'Deixa rastro que danifica inimigos',
                cost: 85
            },
            {
                id: 'basic-steel',
                name: 'Poder Básico Steel',
                robot: 'Steel Guardian',
                robotId: 'steel-guardian',
                description: 'Poder inicial do Steel Guardian',
                cost: 0,
                isBasic: true
            },
            {
                id: 'steel-armor',
                name: 'Armadura de Aço',
                robot: 'Steel Guardian',
                robotId: 'steel-guardian',
                description: 'Reduz dano em 60%',
                cost: 140
            },
            {
                id: 'counter-strike',
                name: 'Contra-Ataque',
                robot: 'Steel Guardian',
                robotId: 'steel-guardian',
                description: 'Reflete 30% do dano recebido',
                cost: 110
            },
            {
                id: 'basic-plasma',
                name: 'Poder Básico Plasma',
                robot: 'Plasma Hunter',
                robotId: 'plasma-hunter',
                description: 'Poder inicial do Plasma Hunter',
                cost: 0,
                isBasic: true
            },
            {
                id: 'plasma-beam',
                name: 'Feixe de Plasma',
                robot: 'Plasma Hunter',
                robotId: 'plasma-hunter',
                description: 'Dispara feixe perfurante',
                cost: 95
            },
            {
                id: 'hunter-mark',
                name: 'Marca do Caçador',
                robot: 'Plasma Hunter',
                robotId: 'plasma-hunter',
                description: 'Inimigos marcados recebem mais dano',
                cost: 105
            },
            {
                id: 'basic-omega',
                name: 'Poder Básico Omega',
                robot: 'Omega Sentinel',
                robotId: 'omega-sentinel',
                description: 'Poder inicial do Omega Sentinel',
                cost: 0,
                isBasic: true
            },
            {
                id: 'omega-protocol',
                name: 'Protocolo Omega',
                robot: 'Omega Sentinel',
                robotId: 'omega-sentinel',
                description: 'Todas estatísticas aumentam 30%',
                cost: 200
            },
            {
                id: 'target-lock',
                name: 'Travamento de Alvo',
                robot: 'Omega Sentinel',
                robotId: 'omega-sentinel',
                description: 'Ataques não erram',
                cost: 120
            },
            {
                id: 'basic-volt',
                name: 'Poder Básico Volt',
                robot: 'Volt Reaper',
                robotId: 'volt-reaper',
                description: 'Poder inicial do Volt Reaper',
                cost: 0,
                isBasic: true
            },
            {
                id: 'volt-surge',
                name: 'Surto Elétrico',
                robot: 'Volt Reaper',
                robotId: 'volt-reaper',
                description: 'Libera descarga elétrica em área',
                cost: 115
            },
            {
                id: 'chain-lightning',
                name: 'Raio em Cadeia',
                robot: 'Volt Reaper',
                robotId: 'volt-reaper',
                description: 'Ataques saltam entre inimigos',
                cost: 135
            }
        ];
    }

    renderPowers() {
        const list = document.getElementById('powers-list');
        list.innerHTML = '';

        this.powers.forEach(power => {
            const unlocked = this.gameState.unlockedPowers.includes(power.id);
            const canAfford = this.gameState.xp >= power.cost;
            const card = document.createElement('div');
            card.className = 'power-card' + (unlocked ? ' unlocked' : '');

            card.innerHTML = `
                <div class="power-title">${power.name}</div>
                <div class="power-robot">Para: ${power.robot}</div>
                <div class="power-description">${power.description}</div>
                <div class="power-cost">Custo: ${power.cost} XP</div>
                <button class="power-btn" 
                    ${unlocked || !canAfford ? 'disabled' : ''} 
                    onclick="game.unlockPower('${power.id}')">
                    ${unlocked ? 'DESBLOQUEADO' : canAfford ? 'DESBLOQUEAR' : 'XP INSUFICIENTE'}
                </button>
            `;

            list.appendChild(card);
        });
    }

    unlockPower(powerId) {
        const power = this.powers.find(p => p.id === powerId);
        if (!power) return;

        if (this.gameState.unlockedPowers.includes(powerId)) {
            return;
        }

        if (this.gameState.xp < power.cost) {
            alert('XP insuficiente!');
            return;
        }

        this.gameState.xp -= power.cost;
        this.gameState.unlockedPowers.push(powerId);
        this.updateXPDisplay();
        this.saveGameData();
        this.showReward(0, `Poder "${power.name}" desbloqueado para ${power.robot}!`);
        this.renderPowers();
    }
}

// ==================== GAME ENGINE ====================
class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.running = false;
        this.lastTime = 0;
        this.targetFPS = 120;
        this.frameTime = 1000 / this.targetFPS;
        
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        
        this.keys = {};
        this.groundY = 0;
        this.gravity = 0.6;
        
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 2000; // 2 segundos
        this.maxEnemies = 5;
        
        // Sistema de ondas
        this.currentWave = 1;
        this.totalWaves = 3;
        this.enemiesPerWave = 10;
        this.enemiesSpawnedInWave = 0;
        this.enemiesKilledInWave = 0;
        this.waveCooldown = 0;
        this.waveCooldownTime = 3000; // 3 segundos entre ondas
        
        // Estatísticas da partida
        this.stats = {
            kills: 0,
            surviveTime: 0,
            jumps: 0,
            superJumps: 0,
            powerUsage: 0,
            noDamageKills: 0,
            noDamageTime: 0,
            lastDamageTime: 0,
            comboKills: 0,
            comboTimer: 0,
            speedKills: 0,
            speedKillTimer: 0
        };
        
        this.setupCanvas();
        this.setupControls();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.groundY = this.canvas.height - 100;
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.groundY = this.canvas.height - 100;
        });
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Espaço para pular
            if (e.key === ' ' && this.player) {
                this.player.jump();
            }
            
            // Shift para super pulo
            if (e.key === 'Shift' && this.player) {
                this.player.superJump();
            }
            
            // X para atacar
            if (e.key.toLowerCase() === 'x' && this.player) {
                this.player.attack();
            }
            
            // C para usar poder especial
            if (e.key.toLowerCase() === 'c' && this.player) {
                this.player.useSpecialPower();
            }
            
            // E para poder especial alternativo
            if (e.key.toLowerCase() === 'e' && this.player) {
                this.player.useSpecialPower();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    start() {
        if (this.running) return;
        
        this.running = true;
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        
        // Resetar sistema de ondas
        this.currentWave = 1;
        this.enemiesSpawnedInWave = 0;
        this.enemiesKilledInWave = 0;
        this.waveCooldown = 0;
        
        // Resetar estatísticas
        this.stats = {
            kills: 0,
            surviveTime: 0,
            jumps: 0,
            superJumps: 0,
            powerUsage: 0,
            noDamageKills: 0,
            noDamageTime: 0,
            lastDamageTime: 0,
            comboKills: 0,
            comboTimer: 0,
            speedKills: 0,
            speedKillTimer: 0
        };
        
        // Aplicar configurações do nível
        const level = game.getLevel(game.selectedLevel);
        if (level) {
            this.enemySpawnInterval = level.enemySpawnInterval;
            this.maxEnemies = level.maxEnemies;
            this.currentLevel = level;
            this.totalWaves = level.waves;
            this.enemiesPerWave = level.enemiesPerWave;
        }
        
        const charData = game.getCharacter(game.selectedCharacter);
        this.player = new Player(200, this.groundY - 80, charData, game.customization);
        
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }

    pause() {
        this.running = false;
    }

    loop(currentTime) {
        if (!this.running) return;

        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime >= this.frameTime) {
            this.update(deltaTime);
            this.render();
            this.lastTime = currentTime - (deltaTime % this.frameTime);
        }

        requestAnimationFrame((time) => this.loop(time));
    }

    update(deltaTime) {
        // Atualizar tempo de sobrevivência
        this.stats.surviveTime += deltaTime / 1000;
        
        // Atualizar timer de combo
        if (this.stats.comboTimer > 0) {
            this.stats.comboTimer -= deltaTime;
            if (this.stats.comboTimer <= 0) {
                this.stats.comboKills = 0;
            }
        }
        
        // Atualizar timer de velocidade
        if (this.stats.speedKillTimer > 0) {
            this.stats.speedKillTimer -= deltaTime;
        } else {
            this.stats.speedKills = 0;
        }
        
        // Atualizar tempo sem dano
        if (this.stats.lastDamageTime === 0) {
            this.stats.noDamageTime += deltaTime / 1000;
        }
        
        // Atualizar player
        if (this.player) {
            this.player.update(this.keys, deltaTime);
            
            // Checar se morreu
            if (this.player.health <= 0) {
                this.running = false;
                this.updateAllMissions();
                game.endGame(false);
                return;
            }
        }

        // Sistema de ondas
        if (this.waveCooldown > 0) {
            this.waveCooldown -= deltaTime;
        }

        // Checar se a onda foi completada
        if (this.enemiesKilledInWave >= this.enemiesPerWave) {
            if (this.currentWave >= this.totalWaves) {
                // Todas as ondas completas - vitória!
                this.running = false;
                this.updateAllMissions();
                game.endGame(true);
                return;
            } else {
                // Próxima onda
                this.currentWave++;
                this.enemiesSpawnedInWave = 0;
                this.enemiesKilledInWave = 0;
                this.waveCooldown = this.waveCooldownTime;
                this.showWaveMessage();
            }
        }

        // Spawn de inimigos (apenas se não estiver no cooldown entre ondas)
        if (this.waveCooldown <= 0 && this.enemiesSpawnedInWave < this.enemiesPerWave) {
            this.enemySpawnTimer += deltaTime;
            if (this.enemySpawnTimer >= this.enemySpawnInterval && this.enemies.length < this.maxEnemies) {
                this.spawnEnemy();
                this.enemySpawnTimer = 0;
                this.enemiesSpawnedInWave++;
            }
        }

        // Atualizar inimigos
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime);

            // Remover inimigos fora da tela
            if (enemy.x < -100) {
                this.enemies.splice(i, 1);
                continue;
            }

            // Colisão com player
            if (this.player && this.checkCollision(this.player, enemy)) {
                this.player.takeDamage(enemy.damage);
                this.stats.lastDamageTime = Date.now();
                this.stats.noDamageTime = 0;
                this.stats.noDamageKills = 0;
                this.enemies.splice(i, 1);
                continue;
            }

            // Colisão com projéteis
            for (let j = this.projectiles.length - 1; j >= 0; j--) {
                const proj = this.projectiles[j];
                if (this.checkCollision(proj, enemy)) {
                    enemy.takeDamage(proj.damage);
                    this.projectiles.splice(j, 1);
                    
                    if (enemy.health <= 0) {
                        this.stats.kills++;
                        this.enemiesKilledInWave++;
                        this.stats.noDamageKills++;
                        this.stats.comboKills++;
                        this.stats.comboTimer = 10000; // 10 segundos para combo
                        this.stats.speedKills++;
                        if (this.stats.speedKillTimer <= 0) {
                            this.stats.speedKillTimer = 60000; // 60 segundos
                        }
                        
                        game.gameState.score += 50;
                        this.updateScore();
                        this.enemies.splice(i, 1);
                        this.createExplosion(enemy.x, enemy.y);
                    }
                    break;
                }
            }
        }

        // Atualizar projéteis
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.update(deltaTime);
            
            if (proj.x > this.canvas.width || proj.x < 0) {
                this.projectiles.splice(i, 1);
            }
        }

        // Atualizar partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Atualizar progresso das missões em tempo real
        this.updateMissionsProgress();
    }

    updateMissionsProgress() {
        game.updateMissionProgress('kills', this.stats.kills);
        game.updateMissionProgress('survive', Math.floor(this.stats.surviveTime));
        game.updateMissionProgress('score', game.gameState.score);
        game.updateMissionProgress('jumps', this.stats.jumps);
        game.updateMissionProgress('super-jumps', this.stats.superJumps);
        game.updateMissionProgress('power-usage', this.stats.powerUsage);
        game.updateMissionProgress('no-damage-kills', this.stats.noDamageKills);
        game.updateMissionProgress('no-damage-time', Math.floor(this.stats.noDamageTime));
        game.updateMissionProgress('combo-kills', this.stats.comboKills);
        game.updateMissionProgress('speed-kills', this.stats.speedKills);
    }

    updateAllMissions() {
        this.updateMissionsProgress();
    }

    render() {
        // Limpar canvas
        this.ctx.fillStyle = 'rgba(10, 10, 31, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Desenhar chão
        this.ctx.fillStyle = '#00ffff';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#00ffff';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, 5);
        this.ctx.shadowBlur = 0;

        // Desenhar informação de onda
        this.ctx.fillStyle = '#0ff';
        this.ctx.font = 'bold 24px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#0ff';
        this.ctx.fillText(`ONDA ${this.currentWave}/${this.totalWaves}`, this.canvas.width / 2, 40);
        this.ctx.fillText(`Inimigos: ${this.enemiesKilledInWave}/${this.enemiesPerWave}`, this.canvas.width / 2, 70);
        this.ctx.shadowBlur = 0;
        this.ctx.textAlign = 'left';
        
        // Mostrar cooldown entre ondas
        if (this.waveCooldown > 0) {
            this.ctx.fillStyle = '#ff0';
            this.ctx.font = 'bold 32px Orbitron';
            this.ctx.textAlign = 'center';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#ff0';
            this.ctx.fillText(`PRÓXIMA ONDA EM ${Math.ceil(this.waveCooldown / 1000)}s`, this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.shadowBlur = 0;
            this.ctx.textAlign = 'left';
        }

        // Desenhar partículas
        this.particles.forEach(p => p.render(this.ctx));

        // Desenhar projéteis
        this.projectiles.forEach(p => p.render(this.ctx));

        // Desenhar player
        if (this.player) {
            this.player.render(this.ctx);
        }

        // Desenhar inimigos
        this.enemies.forEach(e => e.render(this.ctx));
    }

    showWaveMessage() {
        // Criar efeito visual para nova onda
        for (let i = 0; i < 50; i++) {
            const particle = new Particle(
                this.canvas.width / 2, 
                this.canvas.height / 2,
                Math.random() * 360,
                Math.random() * 8 + 4,
                '#0ff'
            );
            this.particles.push(particle);
        }
    }

    spawnEnemy() {
        const types = ['basic', 'fast', 'tank'];
        const type = types[Math.floor(Math.random() * types.length)];
        const enemy = new Enemy(this.canvas.width + 50, this.groundY - 60, type);
        this.enemies.push(enemy);
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    createExplosion(x, y) {
        for (let i = 0; i < 20; i++) {
            const particle = new Particle(x, y, 
                Math.random() * 360,
                Math.random() * 5 + 2,
                `hsl(${Math.random() * 60 + 180}, 100%, 50%)`
            );
            this.particles.push(particle);
        }
    }

    updateScore() {
        document.getElementById('score').textContent = game.gameState.score;
    }

    fireProjectile(x, y, direction, damage) {
        const proj = new Projectile(x, y, direction, damage);
        this.projectiles.push(proj);
    }

    createFireParticles(x, y) {
        for (let i = 0; i < 10; i++) {
            const particle = new Particle(x, y, 
                Math.random() * 360,
                Math.random() * 3 + 1,
                `hsl(${Math.random() * 60}, 100%, 50%)`
            );
            this.particles.push(particle);
        }
    }

    createLightningEffect(x, y) {
        for (let i = 0; i < 15; i++) {
            const particle = new Particle(x, y, 
                Math.random() * 360,
                Math.random() * 4 + 2,
                `hsl(${180 + Math.random() * 60}, 100%, 70%)`
            );
            this.particles.push(particle);
        }
    }
}

// ==================== PLAYER ====================
class Player {
    constructor(x, y, charData, customization) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 80;
        this.charData = charData;
        this.customization = customization;
        
        // Aplicar poderes desbloqueados
        this.applyPowers();
        
        this.velocityX = 0;
        this.velocityY = 0;
        
        this.health = 100;
        this.maxHealth = 100;
        
        this.jumpsLeft = 3;
        this.maxJumps = 3;
        this.onGround = false;
        
        this.attackCooldown = 0;
        this.attackDelay = 300;
        
        this.damageReduction = 0;
        this.damageReflection = 0;
        
        this.superJumpCooldown = 0;
        this.superJumpDelay = 3000;
        this.specialPowerCooldown = 0;
        this.specialPowerDelay = 5000;
    }

    applyPowers() {
        const activePowers = game.getActivePowers();
        
        // Stats base
        this.speed = this.charData.speed;
        this.jumpPower = this.charData.jumpPower;
        this.damage = this.charData.damage;
        
        // Resetar flags de poderes
        this.hasGroundSlam = false;
        this.hasPhoenixFire = false;
        this.hasQuantumPhase = false;
        this.hasEnergyWave = false;
        this.hasLightTrail = false;
        this.hasVoltSurge = false;
        this.hasChainLightning = false;
        this.hasPlasmaBeam = false;
        
        // Aplicar modificadores dos poderes
        activePowers.forEach(power => {
            switch(power.id) {
                // Nova Prime
                case 'speed-boost-nova':
                    this.speed *= 1.5;
                    break;
                case 'super-jump-nova':
                    this.jumpPower *= 1.4;
                    break;
                
                // Shadow Blade
                case 'blade-fury':
                    this.damage *= 2;
                    break;
                case 'shadow-dash':
                    this.speed *= 1.8;
                    break;
                
                // Titan Core
                case 'titan-shield':
                    this.damageReduction = 0.5;
                    break;
                case 'ground-slam':
                    this.hasGroundSlam = true;
                    break;
                
                // Cyber Phoenix
                case 'air-dash':
                    this.maxJumps = 4;
                    this.jumpsLeft = 4;
                    break;
                case 'phoenix-fire':
                    this.hasPhoenixFire = true;
                    break;
                
                // Quantum Knight
                case 'quantum-phase':
                    this.hasQuantumPhase = true;
                    break;
                case 'energy-wave':
                    this.damage *= 1.3;
                    this.hasEnergyWave = true;
                    break;
                
                // Neon Striker
                case 'neon-speed':
                    this.speed *= 1.7;
                    break;
                case 'light-trail':
                    this.hasLightTrail = true;
                    break;
                
                // Steel Guardian
                case 'steel-armor':
                    this.damageReduction = 0.6;
                    break;
                case 'counter-strike':
                    this.damageReflection = 0.3;
                    break;
                
                // Plasma Hunter
                case 'plasma-beam':
                    this.hasPlasmaBeam = true;
                    break;
                case 'hunter-mark':
                    this.damage *= 1.4;
                    break;
                
                // Omega Sentinel
                case 'omega-protocol':
                    this.speed *= 1.3;
                    this.jumpPower *= 1.3;
                    this.damage *= 1.3;
                    break;
                
                // Volt Reaper
                case 'volt-surge':
                    this.damage *= 1.5;
                    this.hasVoltSurge = true;
                    break;
                case 'chain-lightning':
                    this.hasChainLightning = true;
                    break;
            }
        });
    }

    update(keys, deltaTime) {
        // Movimento horizontal
        this.velocityX = 0;
        if (keys['a'] || keys['arrowleft'] || keys.left) {
            this.velocityX = -this.speed;
        }
        if (keys['d'] || keys['arrowright'] || keys.right) {
            this.velocityX = this.speed;
        }

        this.x += this.velocityX;

        // Limites da tela
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > gameEngine.canvas.width) {
            this.x = gameEngine.canvas.width - this.width;
        }

        // Gravidade
        this.velocityY += gameEngine.gravity;
        this.y += this.velocityY;

        // Chão
        if (this.y + this.height >= gameEngine.groundY) {
            this.y = gameEngine.groundY - this.height;
            this.velocityY = 0;
            this.onGround = true;
            this.jumpsLeft = this.maxJumps;
        } else {
            this.onGround = false;
        }

        // Cooldown de ataque
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }

        // Cooldown de super pulo
        if (this.superJumpCooldown > 0) {
            this.superJumpCooldown -= deltaTime;
        }

        // Cooldown de poder especial
        if (this.specialPowerCooldown > 0) {
            this.specialPowerCooldown -= deltaTime;
        }

        // Atualizar UI
        this.updateHealthBar();
    }

    jump() {
        if (this.jumpsLeft > 0) {
            this.velocityY = -this.jumpPower;
            this.jumpsLeft--;
            gameEngine.stats.jumps++;
        }
    }

    superJump() {
        if (this.superJumpCooldown <= 0) {
            this.velocityY = -this.jumpPower * 2;
            this.jumpsLeft = this.maxJumps;
            gameEngine.createExplosion(this.x + this.width / 2, this.y + this.height);
            this.superJumpCooldown = this.superJumpDelay;
            gameEngine.stats.superJumps++;
        }
    }

    useSpecialPower() {
        if (this.specialPowerCooldown <= 0) {
            let powerUsed = false;
            
            console.log('Tentando usar poder especial...');
            console.log('hasGroundSlam:', this.hasGroundSlam);
            console.log('hasQuantumPhase:', this.hasQuantumPhase);
            console.log('hasEnergyWave:', this.hasEnergyWave);
            console.log('hasLightTrail:', this.hasLightTrail);
            console.log('hasVoltSurge:', this.hasVoltSurge);
            console.log('hasChainLightning:', this.hasChainLightning);
            console.log('hasPhoenixFire:', this.hasPhoenixFire);
            
            // Ground Slam (Titan Core)
            if (this.hasGroundSlam) {
                console.log('Usando Ground Slam!');
                gameEngine.enemies.forEach(enemy => {
                    if (Math.abs(enemy.x - this.x) < 200) {
                        enemy.takeDamage(this.damage * 2);
                    }
                });
                gameEngine.createExplosion(this.x + this.width / 2, this.y + this.height);
                powerUsed = true;
            }
            
            // Quantum Phase (Quantum Knight)
            if (this.hasQuantumPhase) {
                console.log('Usando Quantum Phase!');
                for (let i = 0; i < 30; i++) {
                    gameEngine.createLightningEffect(this.x + this.width / 2, this.y + this.height / 2);
                }
                // Dano em área
                gameEngine.enemies.forEach(enemy => {
                    if (Math.abs(enemy.x - this.x) < 150) {
                        enemy.takeDamage(this.damage * 1.5);
                    }
                });
                powerUsed = true;
            }
            
            // Energy Wave (Quantum Knight)
            if (this.hasEnergyWave) {
                console.log('Usando Energy Wave!');
                gameEngine.enemies.forEach(enemy => {
                    enemy.x += 100;
                    enemy.takeDamage(this.damage);
                });
                for (let i = 0; i < 20; i++) {
                    gameEngine.createLightningEffect(this.x + this.width, this.y + this.height / 2);
                }
                powerUsed = true;
            }
            
            // Light Trail (Neon Striker)
            if (this.hasLightTrail) {
                console.log('Usando Light Trail!');
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        if (gameEngine.running) {
                            gameEngine.fireProjectile(
                                this.x + this.width,
                                this.y + this.height / 2,
                                1,
                                this.damage * 0.5
                            );
                            gameEngine.createFireParticles(this.x + this.width, this.y + this.height / 2);
                        }
                    }, i * 100);
                }
                powerUsed = true;
            }
            
            // Volt Surge (Volt Reaper)
            if (this.hasVoltSurge) {
                console.log('Usando Volt Surge!');
                let hitCount = 0;
                gameEngine.enemies.forEach(enemy => {
                    if (Math.abs(enemy.x - this.x) < 300) {
                        enemy.takeDamage(this.damage * 1.5);
                        hitCount++;
                    }
                });
                console.log('Volt Surge atingiu', hitCount, 'inimigos');
                for (let i = 0; i < 50; i++) {
                    gameEngine.createLightningEffect(
                        this.x + this.width / 2 + (Math.random() - 0.5) * 100,
                        this.y + this.height / 2 + (Math.random() - 0.5) * 100
                    );
                }
                powerUsed = true;
            }
            
            // Chain Lightning (Volt Reaper)
            if (this.hasChainLightning) {
                console.log('Usando Chain Lightning!');
                gameEngine.enemies.slice(0, 3).forEach(enemy => {
                    enemy.takeDamage(this.damage * 1.2);
                    gameEngine.createLightningEffect(enemy.x, enemy.y);
                });
                powerUsed = true;
            }
            
            // Phoenix Fire (Cyber Phoenix)
            if (this.hasPhoenixFire) {
                console.log('Usando Phoenix Fire!');
                let burnCount = 0;
                gameEngine.enemies.forEach(enemy => {
                    if (Math.abs(enemy.x - this.x) < 250) {
                        enemy.takeDamage(this.damage);
                        burnCount++;
                    }
                });
                console.log('Phoenix Fire queimou', burnCount, 'inimigos');
                for (let i = 0; i < 40; i++) {
                    gameEngine.createFireParticles(
                        this.x + this.width / 2 + (Math.random() - 0.5) * 80,
                        this.y + this.height / 2 + (Math.random() - 0.5) * 80
                    );
                }
                powerUsed = true;
            }
            
            // Se nenhum poder especial foi desbloqueado, usar poder básico
            if (!powerUsed) {
                console.log('Usando poder básico (nenhum especial desbloqueado)');
                // Dispara projéteis em leque
                for (let i = -1; i <= 1; i++) {
                    gameEngine.fireProjectile(
                        this.x + this.width,
                        this.y + this.height / 2 + (i * 20),
                        1,
                        this.damage * 0.25
                    );
                }
                powerUsed = true;
            }
            
            if (powerUsed) {
                console.log('Poder usado! Cooldown ativado.');
                this.specialPowerCooldown = this.specialPowerDelay;
                gameEngine.stats.powerUsage++;
            }
        } else {
            console.log('Poder em cooldown:', Math.ceil(this.specialPowerCooldown / 1000), 'segundos restantes');
        }
    }

    attack() {
        if (this.attackCooldown <= 0) {
            // Ataque normal
            gameEngine.fireProjectile(
                this.x + this.width,
                this.y + this.height / 2,
                1,
                this.damage
            );
            
            // Plasma Beam - dispara projétil extra
            if (this.hasPlasmaBeam) {
                gameEngine.fireProjectile(
                    this.x + this.width,
                    this.y + this.height / 2 - 10,
                    1,
                    this.damage * 0.5
                );
            }
            
            // Phoenix Fire - efeito de partículas
            if (this.hasPhoenixFire) {
                gameEngine.createFireParticles(this.x + this.width, this.y + this.height / 2);
            }
            
            // Chain Lightning - efeito visual
            if (this.hasChainLightning) {
                gameEngine.createLightningEffect(this.x + this.width, this.y + this.height / 2);
            }
            
            this.attackCooldown = this.attackDelay;
        }
    }

    takeDamage(amount) {
        // Aplicar redução de dano
        let finalDamage = amount * (1 - this.damageReduction);
        
        this.health -= finalDamage;
        if (this.health < 0) this.health = 0;
        this.updateHealthBar();
        
        // Reflexão de dano (se tiver poder de counter-strike)
        if (this.damageReflection > 0 && gameEngine.enemies.length > 0) {
            const reflectDamage = amount * this.damageReflection;
            // Aplicar dano no inimigo mais próximo
            const nearestEnemy = gameEngine.enemies[0];
            if (nearestEnemy) {
                nearestEnemy.takeDamage(reflectDamage);
            }
        }
    }

    updateHealthBar() {
        const healthPercent = (this.health / this.maxHealth) * 100;
        document.getElementById('health-fill').style.width = healthPercent + '%';
        document.getElementById('health-text').textContent = 
            `HP: ${Math.ceil(this.health)}/${this.maxHealth}`;
    }

    render(ctx) {
        // Corpo do robô
        ctx.save();
        
        // Sombra
        ctx.shadowBlur = this.customization.glowIntensity / 2;
        ctx.shadowColor = this.customization.primaryColor;
        
        // Cabeça
        ctx.fillStyle = this.customization.primaryColor;
        ctx.fillRect(this.x + 15, this.y, 30, 25);
        
        // Olhos
        ctx.fillStyle = this.customization.secondaryColor;
        ctx.fillRect(this.x + 20, this.y + 8, 8, 8);
        ctx.fillRect(this.x + 32, this.y + 8, 8, 8);
        
        // Corpo
        ctx.fillStyle = this.customization.primaryColor;
        ctx.fillRect(this.x + 10, this.y + 25, 40, 35);
        
        // Detalhes do corpo
        ctx.fillStyle = this.customization.secondaryColor;
        ctx.fillRect(this.x + 25, this.y + 30, 10, 25);
        
        // Braços
        ctx.fillStyle = this.customization.primaryColor;
        ctx.fillRect(this.x + 5, this.y + 30, 8, 30);
        ctx.fillRect(this.x + 47, this.y + 30, 8, 30);
        
        // Pernas
        ctx.fillRect(this.x + 18, this.y + 60, 10, 20);
        ctx.fillRect(this.x + 32, this.y + 60, 10, 20);
        
        ctx.restore();
    }
}

// ==================== ENEMY ====================
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 60;
        this.type = type;
        
        // Aplicar multiplicadores do nível
        const level = gameEngine.currentLevel || { enemySpeed: 1.0, enemyDamageMultiplier: 1.0, enemyHealthMultiplier: 1.0 };
        
        switch(type) {
            case 'fast':
                this.speed = 2.5 * level.enemySpeed;
                this.health = 20 * level.enemyHealthMultiplier;
                this.maxHealth = 20 * level.enemyHealthMultiplier;
                this.damage = 10 * level.enemyDamageMultiplier;
                this.color = '#ff00ff';
                break;
            case 'tank':
                this.speed = 1.2 * level.enemySpeed;
                this.health = 50 * level.enemyHealthMultiplier;
                this.maxHealth = 50 * level.enemyHealthMultiplier;
                this.damage = 20 * level.enemyDamageMultiplier;
                this.color = '#ff0000';
                break;
            default: // basic
                this.speed = 1.8 * level.enemySpeed;
                this.health = 30 * level.enemyHealthMultiplier;
                this.maxHealth = 30 * level.enemyHealthMultiplier;
                this.damage = 15 * level.enemyDamageMultiplier;
                this.color = '#ff6600';
        }
    }

    update(deltaTime) {
        this.x -= this.speed;
    }

    takeDamage(amount) {
        this.health -= amount;
    }

    render(ctx) {
        ctx.save();
        
        // Barra de vida
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.x, this.y - 10, this.width, 5);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y - 10, this.width * healthPercent, 5);
        
        // Corpo do inimigo
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        // Cabeça
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 12, this.y, 26, 20);
        
        // Olhos
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x + 17, this.y + 7, 6, 6);
        ctx.fillRect(this.x + 27, this.y + 7, 6, 6);
        
        // Corpo
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 8, this.y + 20, 34, 28);
        
        // Braços
        ctx.fillRect(this.x + 3, this.y + 25, 6, 20);
        ctx.fillRect(this.x + 41, this.y + 25, 6, 20);
        
        // Pernas
        ctx.fillRect(this.x + 15, this.y + 48, 8, 12);
        ctx.fillRect(this.x + 27, this.y + 48, 8, 12);
        
        ctx.restore();
    }
}

// ==================== PROJECTILE ====================
class Projectile {
    constructor(x, y, direction, damage) {
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 8;
        this.direction = direction;
        this.speed = 12;
        this.damage = damage;
    }

    update(deltaTime) {
        this.x += this.speed * this.direction;
    }

    render(ctx) {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffff';
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(this.x, this.y - this.height / 2, this.width, this.height);
        ctx.restore();
    }
}

// ==================== PARTICLE ====================
class Particle {
    constructor(x, y, angle, speed, color) {
        this.x = x;
        this.y = y;
        this.velocityX = Math.cos(angle * Math.PI / 180) * speed;
        this.velocityY = Math.sin(angle * Math.PI / 180) * speed;
        this.color = color;
        this.life = 1.0;
        this.decay = 0.02;
        this.size = Math.random() * 4 + 2;
    }

    update(deltaTime) {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.life -= this.decay;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

// ==================== INITIALIZE ====================
const game = new GameManager();
const gameEngine = new GameEngine();

console.log('CyberBots RPG carregado! Pronto para jogar!');
