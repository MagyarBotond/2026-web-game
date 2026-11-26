const game = document.getElementById("game");
const player = document.getElementById("player");

//gifek ---------------------------------------

const idleGif = "player/john_gun_idle.gif";
const shootGif = "player/john_gun_shoot.gif";

const normalEnemyGif = "enemies/goblindeez.gif";
const armoredEnemyGif = "enemies/goblindeez_tuff.gif";
const fastEnemyGif = "enemies/goblindeez_fast.gif";
const skellyEnemyGif = "enemies/goblindeez_skelly.gif";

const minionEnemyGif = "enemies/goblindeez_imp.gif";
const summonerWalkGif = "enemies/wizard_walk.gif";
const summonerSummoningGif = "enemies/wizard_summon.gif";
const summonerSpawningGif = "enemies/wizard_shoot.gif";

const bulletGif = "other/bullet.png";
const enemyHitGif = "other/boom.gif";

//hang filok ---------------------------------------

const summonerSummonSound = new Audio("sounds/wizard_enemysummon.mp3");
const summonerSummonDoneSound = new Audio("sounds/wizard_summondone.mp3");
const MinionspawnSound = new Audio("sounds/imp_spawn.mp3");
const skellyspawnSound = new Audio("sounds/skelly_spawn.mp3");
skellyspawnSound.volume = 0.45;

const shootingSounds = [
    new Audio("sounds/johngun_shoot1.mp3"),
    new Audio("sounds/johngun_shoot2.mp3")
];

const playerhurtSound = new Audio("sounds/johngun_hurt.mp3");
const playerdeathSound = new Audio("sounds/johngun_death.mp3");

shootingSounds.forEach(sound => sound.volume = 0.4);
let nextShootingSound = 0;

//---------------------------------------


let lane = 2;
let score = 0;
let health = 100;

let enemies = [];
let bullets = [];

let shooting = false;
let gameRunning = false;
let gamePaused = false;
let gameStarted = false;

let shootTimer = null;
let animationFrame = null;

//egyébb beálítás ---------------------------------------

const laneCount = 5;
const frame5Time = 400;

const playerSize = 150;
const enemySize = 130;

const bulletWidth = 50;
const bulletHeight = 30;
const bulletSpeed = 12;

const hitEffectDuration = 250;

const healthRewardInterval = 50;
const healthRewardAmount = 20;
const maxHealth = 100;

let nextHealthReward = 50;

//ellenség beálítás ---------------------------------------

const normalSpeed = 1.5;

const armoredSpeed = 1;
const armoredHealth = 3;

const fastSpeed = 5;

const skellySpeed = 7;

const minionSpeed = 1;
const minionHealth = 2;

const summonerSpeed = 0.2;
const summonerHealth = 10;

const summonerWalkDuration = 7000;
const summonerSummoningDuration = 10000;
const summonerSpawningDuration = 2000;

const normalSize = 140;
const normalScore = 1;
const normalDeathSound = new Audio("sounds/goblindeez_death.mp3");
normalDeathSound.volume = 0.3;

const armoredSize = 160;
const armoredScore = 3;
const armoredDeathSound = new Audio("sounds/heavy_death.mp3");
armoredDeathSound.volume = 0.8;

const fastSize = 130;
const fastScore = 2;
const fastDeathSound = new Audio("sounds/fast_death.mp3");
fastDeathSound.volume = 0.3;

const skellySize = 160;
const skellyScore = 10;
const skellyDeathSound = new Audio("sounds/skelly_death.mp3");
skellyDeathSound.volume = 0.4;

const minionSize = 100;
const minionScore = 2;
const minionDeathSound = new Audio("sounds/imp_death.mp3");

// summoner ---------------------------------------
const summonerSize = 180;
const summonerScore = 20;
const summonerDeathSound = new Audio("sounds/wizard_death.mp3");
minionDeathSound.volume = 0.;

//hátér, pause és start zene ---------------------------------------

const startMusic = new Audio("music/start_music.mp3");
const pauseMusic = new Audio("music/pause_music.mp3");

const musicTracks = [
    "music/main_music1.mp3",
    "music/main_music2.mp3"
];

const backgroundMusic = new Audio(musicTracks[0]);

[startMusic, pauseMusic, backgroundMusic].forEach(track => {
    track.preload = "auto";
    track.volume = 0.35;
});

startMusic.loop = true;
pauseMusic.loop = true;

let currentMusicTrack = 0;
let musicEnabled = true;

function stopAllMusic() {
    [startMusic, pauseMusic, backgroundMusic].forEach(track => {
        track.pause();
        track.currentTime = 0;
    });
}

function playSceneMusic(scene) {
    if (!musicEnabled) {
        stopAllMusic();
        return;
    }

    stopAllMusic();

    if (scene === "start") {
        startMusic.play().catch(() => {});
    } else if (scene === "pause") {
        pauseMusic.play().catch(() => {});
    } else if (scene === "game") {
        backgroundMusic.play().catch(() => {});
    }
}

backgroundMusic.addEventListener("ended", () => {
    if (!musicEnabled || !gameRunning || gamePaused) return;

    currentMusicTrack = (currentMusicTrack + 1) % musicTracks.length;
    backgroundMusic.src = musicTracks[currentMusicTrack];
    backgroundMusic.play().catch(() => {});
});

playSceneMusic("start");

//hangok ---------------------------------------

let sfxEnabled = true;

const sfxSounds = [
    summonerSummonSound,
    summonerSummonDoneSound,
    MinionspawnSound,
    skellyspawnSound,
    ...shootingSounds,
    playerhurtSound,
    playerdeathSound,
    normalDeathSound,
    armoredDeathSound,
    fastDeathSound,
    skellyDeathSound,
    minionDeathSound,
    summonerDeathSound
];

const originalSfxVolumes = new Map(
    sfxSounds.map(sound => [sound, sound.volume])
);

//hang gomb kép ---------------------------------------

function updateAudioButtonImages() {
    const musicImage = document.getElementById("musicButtonImage");
    const sfxImage = document.getElementById("sfxButtonImage");

    musicImage.src = musicEnabled
        ? "other/music_on.png"
        : "other/music_off.png";

    sfxImage.src = sfxEnabled
        ? "other/sfx_on.png"
        : "other/sfx_off.png";
}


//zene ---------------------------------------


function toggleMusic() {
    musicEnabled = !musicEnabled;

    if (musicEnabled) {
        if (!gameStarted) {
            playSceneMusic("start");
        } else if (gamePaused) {
            playSceneMusic("pause");
        } else if (gameRunning) {
            playSceneMusic("game");
        }
    } else {
        stopAllMusic();
    }

    updateAudioButtonImages();
}

//toggleSfx ---------------------------------------

function toggleSfx() {
    sfxEnabled = !sfxEnabled;

    sfxSounds.forEach(sound => {
        sound.volume = sfxEnabled
            ? originalSfxVolumes.get(sound)
            : 0;
    });

    updateAudioButtonImages();
}

//START/PAUSE ---------------------------------------

function startGame() {
    if (gameStarted) return;

    gameStarted = true;
    gameRunning = true;

    document.getElementById("startMenu").style.display = "none";
    document.getElementById("audioControls").style.display = "flex";
    document.getElementById("pauseButton").style.display = "block";

    updateAudioButtonImages();

    playSceneMusic("game");

    update();
}

function togglePause() {
    if (!gameRunning || !gameStarted) return;

    gamePaused = !gamePaused;

    const pauseMenu = document.getElementById("pauseMenu");
    const pauseButton = document.getElementById("pauseButton");

    if (gamePaused) {
        pauseMenu.style.display = "flex";
        pauseButton.style.display = "none";

        stopShooting();

        playSceneMusic("pause");

        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    } else {
        pauseMenu.style.display = "none";
        pauseButton.style.display = "block";

        playSceneMusic("game");

        update();
    }
}


//sor magasság ---------------------------------------


function getLaneHeight() {
    return game.clientHeight / laneCount;
}

//játékos elhelyezkedés ---------------------------------------

function updatePlayer() {
    const laneHeight = getLaneHeight();

    player.style.top =
        lane * laneHeight +
        (laneHeight - playerSize) / 2 +
        "px";
}


//---------------------------------------

function updateLanes() {
    const laneHeight = getLaneHeight();

    document.querySelectorAll(".lane").forEach((line, i) => {
        line.style.top = (i + 1) * laneHeight + "px";
    });

    updatePlayer();
}

updateLanes();
window.addEventListener("resize", updateLanes);


//lövöldözés ---------------------------------------

function startShooting() {
    if (shooting || !gameRunning || gamePaused) return;

    shooting = true;

    function fire() {
        if (!shooting || !gameRunning || gamePaused) return;

        player.src = "";

        requestAnimationFrame(() => {
            if (shooting && gameRunning && !gamePaused) {
                player.src = shootGif;
            }
        });

        shootTimer = setTimeout(() => {
            if (!shooting || !gameRunning || gamePaused) return;

            shoot();

            shootTimer = setTimeout(fire, 0);
        }, frame5Time);
    }

    fire();
}

function stopShooting() {
    shooting = false;

    clearTimeout(shootTimer);
    shootTimer = null;

    if (gameRunning && !gamePaused) {
        player.src = idleGif;
    }
}

//
//CONTROL ---------------------------------------


document.addEventListener("keydown", (e) => {
    if (!gameRunning || gamePaused) return;

    if (
        (e.code === "ArrowUp" || e.code === "KeyW") &&
        !e.repeat
    ) {
        lane = Math.max(0, lane - 1);
        updatePlayer();
    }

    if (
        (e.code === "ArrowDown" || e.code === "KeyS") &&
        !e.repeat
    ) {
        lane = Math.min(4, lane + 1);
        updatePlayer();
    }

    if (e.code === "Space") {
        e.preventDefault();
        startShooting();
    }
});

document.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
        stopShooting();
    }
});

window.addEventListener("blur", stopShooting);

//lövés ---------------------------------------

function shoot() {
    if (!gameRunning || gamePaused) return;

    const bullet = document.createElement("img");
    const sound = shootingSounds[nextShootingSound];
    sound.currentTime = 0;
    sound.play().catch(() => {});
    nextShootingSound = 1 - nextShootingSound;
    const bulletX = player.offsetLeft + playerSize;
    bullet.src = bulletGif;
    bullet.className = "bullet";
    bullet.style.left = bulletX + "px";
    bullet.style.top =
        lane * getLaneHeight() +
        getLaneHeight() / 2 -
        bulletHeight / 2 +
        "px";

    game.appendChild(bullet);
    bullets.push({
        element: bullet,
        x: bulletX,
        lane: lane
    });
}

//ellenség találat ---------------------------------------

function showHitEffect(enemy) {
    const effect = document.createElement("img");
    effect.src = enemyHitGif;
    effect.className = "hit-effect";
    effect.style.width = enemy.size + "px";
    effect.style.height = enemy.size + "px";
    effect.style.left = enemy.x + "px";
    effect.style.top =
        enemy.lane * getLaneHeight() +
        (getLaneHeight() - enemy.size) / 2 +
        "px";
    game.appendChild(effect);
    setTimeout(() => {
        effect.remove();
    }, hitEffectDuration);
}

// ellenség spawn ---------------------------------------

function addEnemyImage(
    imageSrc,
    enemyX,
    enemyLane,
    hp,
    speed,
    type,
    size,
    scoreValue,
    deathSound
) {
    const element = document.createElement("img");

    element.src = imageSrc;
    element.className = "enemy";
    element.style.width = size + "px";
    element.style.height = size + "px";
    element.style.left = enemyX + "px";
    element.style.top =
        enemyLane * getLaneHeight() +
        (getLaneHeight() - size) / 2 +
        "px";
    game.appendChild(element);
    const enemy = {
        element,
        x: enemyX,
        lane: enemyLane,
        hp,
        maxHp: hp,
        speed,
        type,
        size,
        scoreValue,
        deathSound,
        phase: "walking",
        cycleTimer: null
    };
    enemies.push(enemy);
    return enemy;
}

function spawnMinion(enemyX, enemyLane) {
    if (!gameRunning || gamePaused) return;

    addEnemyImage(
        minionEnemyGif,
        enemyX,
        enemyLane,
        minionHealth,
        minionSpeed,
        "minion",
        minionSize,
        minionScore,
        minionDeathSound
    );
}

function startsummonerCycle(summoner) {
    if (!gameRunning || gamePaused || !enemies.includes(summoner)) return;

    summoner.cycleTimer = setTimeout(() => {
        if (!gameRunning || gamePaused || !enemies.includes(summoner)) return;
        summoner.phase = "summoning";
        summoner.element.src = summonerSummoningGif;
        summonerSummonSound.currentTime = 0;
        summonerSummonSound.play().catch(() => {});

        summoner.cycleTimer = setTimeout(() => {
            if (!gameRunning || gamePaused || !enemies.includes(summoner)) return;
            summoner.phase = "spawning";
            summoner.element.src = summonerSpawningGif;
            summonerSummonDoneSound.currentTime = 0;
            summonerSummonDoneSound.play().catch(() => {});
            summoner.cycleTimer = setTimeout(() => {

                if (!gameRunning || gamePaused || !enemies.includes(summoner)) return;
                const availableLanes = [0, 1, 2, 3, 4];
                availableLanes.sort(() => Math.random() - 0.5);

                for (let i = 0; i < 3; i++) {
                    const minionLane = availableLanes[i];
                    spawnMinion(summoner.x + enemySize, minionLane);
                    MinionspawnSound.currentTime = 0;
                    MinionspawnSound.play().catch(() => {});
                }

                summoner.phase = "walking";
                summoner.element.src = summonerWalkGif;
                startsummonerCycle(summoner);
            }, summonerSpawningDuration);
        }, summonerSummoningDuration);
    }, summonerWalkDuration);
}

function clearEnemyTimers(enemy) {
    if (enemy && enemy.cycleTimer !== null) {
        clearTimeout(enemy.cycleTimer);
        enemy.cycleTimer = null;
    }
}

function spawnEnemy() {
    if (!gameRunning || gamePaused) return;

    const enemyLane = Math.floor(Math.random() * laneCount);
    const enemyX = game.clientWidth-90;
    const random = Math.random();

    // summoner
    if (random < 0.05) {
        const summoner = addEnemyImage(
            summonerWalkGif,
            enemyX,
            enemyLane,
            summonerHealth,
            summonerSpeed,
            "summoner",
            summonerSize,
            summonerScore,
            summonerDeathSound
        );

        startsummonerCycle(summoner);
        return;
    }

    // base
    if (random < 0.60) {
        addEnemyImage(
            normalEnemyGif,
            enemyX,
            enemyLane,
            1,
            normalSpeed,
            "normal",
            normalSize,
            normalScore,
            normalDeathSound
        );
    }

    //tuff
    else if (random < 0.80) {
        addEnemyImage(
            armoredEnemyGif,
            enemyX,
            enemyLane,
            armoredHealth,
            armoredSpeed,
            "armored",
            armoredSize,
            armoredScore,
            armoredDeathSound
        );
    }

    //fast
    else if (random < 0.95) {
        addEnemyImage(
            fastEnemyGif,
            enemyX,
            enemyLane,
            1,
            fastSpeed,
            "fast",
            fastSize,
            fastScore,
            fastDeathSound
        );
    }

    //skelly
    else {
        skellyspawnSound.currentTime = 0;
        skellyspawnSound.play().catch(() => {});

        addEnemyImage(
            skellyEnemyGif,
            enemyX,
            enemyLane,
            1,
            skellySpeed,
            "skelly",
            skellySize,
            skellyScore,
            skellyDeathSound
        );
    }
}

//score és health ---------------------------------------

function updateHUD() {
    document.getElementById("score").textContent = score;
    document.getElementById("health").textContent = health;
}

function checkHealthReward() {
    if (score >= nextHealthReward) {
        health = Math.min(
            maxHealth,
            health + healthRewardAmount
        );

        nextHealthReward += healthRewardInterval;

        updateHUD();
    }
}

//játékos sebzés ---------------------------------------

function damagePlayer() {
    health -= 20;

    if (health < 0) {
        health = 0;
    }

    updateHUD();

    if (health <= 0) {
        endGame();
        return true;
    }

    if (!health <= 0) {
        playerhurtSound.currentTime = 0;
        playerhurtSound.play().catch(() => {});
    }

    return false;
}

// ---------------------------------------

function update() {
    if (!gameRunning || gamePaused) return;

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        if (enemy.type === "summoner" && enemy.phase !== "walking") {
            continue;
        }

        enemy.x -= enemy.speed;
        enemy.element.style.left = enemy.x + "px";

        // ------
        if (
            enemy.x < player.offsetLeft + playerSize &&
            enemy.x + enemySize > player.offsetLeft &&
            enemy.lane === lane
        ) {
            clearEnemyTimers(enemy);
            enemy.element.remove();
            enemies.splice(i, 1);

            if (damagePlayer()) return;
            continue;
        }

        // ------
        if (enemy.x < -enemy.size) {
            clearEnemyTimers(enemy);
            enemy.element.remove();
            enemies.splice(i, 1);

            if (damagePlayer()) return;
            continue;
        }
    }

    // ---------------------------------------
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];

        bullet.x += bulletSpeed;
        bullet.element.style.left = bullet.x + "px";

        let hit = false;

        // ------
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];

            if (
                bullet.lane === enemy.lane &&
                bullet.x + bulletWidth > enemy.x &&
                bullet.x < enemy.x + enemySize
            ) {
                bullet.element.remove();
                bullets.splice(i, 1);

                showHitEffect(enemy);

                enemy.hp--;
                hit = true;

                // ------
                if (enemy.hp <= 0) {
                    clearEnemyTimers(enemy);

                    // ------
                    if (enemy.deathSound) {
                        enemy.deathSound.currentTime = 0;
                        enemy.deathSound.play().catch(() => {});
                    }

                    enemy.element.remove();
                    enemies.splice(j, 1);

                    // ------
                    score += enemy.scoreValue;

                    updateHUD();
                    checkHealthReward();
                }

                break;
            }
        }

        if (hit) continue;

        // ------
        if (bullet.x > game.clientWidth) {
            bullet.element.remove();
            bullets.splice(i, 1);
        }
    }

    animationFrame = requestAnimationFrame(update);
}

// game over ---------------------------------------

function endGame() {
    gameRunning = false;
    gamePaused = false;

    stopAllMusic();

    playerdeathSound.currentTime = 0;
    playerdeathSound.play().catch(() => {});

    enemies.forEach(clearEnemyTimers);
    stopShooting();

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    document.getElementById("pauseButton").style.display = "none";
    document.getElementById("pauseMenu").style.display = "none";

    const gameover = document.getElementById("gameover");
    gameover.style.display = "flex";

    document.getElementById("finalscore").textContent =
        "Your score: " + score;
}

// ellenség spawn ---------------------------------------

setInterval(() => {
    if (gameRunning && !gamePaused) {
        spawnEnemy();
    }
}, 1500);