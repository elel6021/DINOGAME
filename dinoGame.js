const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const imageNames = ['bird', 'cactus', 'dino', 'dino2'];

// グローバルなgameオブジェクト
const game = {
    counter: 0,
    bgm1: new Audio('bgm/fieldSong.mp3'),
    bgm2: new Audio('bgm/jump.mp3'),
    bgmdead: new Audio('bgm/dead.mp3'),
    enemys: [],
    enemyCountdown: 0,
    image: {},
    state: 'loading',
    score: 0,
    timer: null,
    kickback: false,
    backGrounds: []
};

game.bgm1.loop = true;

let imageLoadCounter = 0;
for (let imageName of imageNames) {
    const imagePath = `image/${imageName}.png`;
    game.image[imageName] = new Image();
    game.image[imageName].src = imagePath;
    game.image[imageName].onload = () => {
      imageLoadCounter += 1;
      if (imageLoadCounter === imageNames.length) {
        console.log('画像のロードが完了しました');
        init();
    }
  }
};

function init() {
  game.counter = 0;
  game.enemys = [];
  game.state = "init";
  //画面クリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  game.score = 0;
  createDino();// 恐竜の登場
  drawDino();
  createBackGround();
  drawBackGrounds();
  ctx.fillStyle = 'black';
  ctx.font = 'bold 60px serif';
  ctx.fillText('Press Space key', 60, 150);
  ctx.fillText('or Click to Start', 150, 230);
  game.enemyCountdown = 0;
  game.kickback = false;
}

function start() {
  game.state = 'gaming';
  game.bgm1.play();
  game.timer = setInterval(ticker, 300000);
}

function createDino() {
  game.dino = {
    x: game.image.dino.width / 2,
    y: canvas.height - game.image.dino.height / 2,
    moveY: 0,
    width: game.image.dino.width,
    height: game.image.dino.height,
    image: game.image.dino
  };
}

document.onkeydown = function(e) {
  if(e.key === ' ' && game.state === 'init') {
    start();
  }
  if(e.key === ' ' && game.dino.moveY === 0){
    game.dino.moveY = -41; // ジャンプ
    game.bgm2.play();
  }
  if(e.key === 'Enter' && game.state === 'gameover') {
    init(); //ゲームの再スタート
  }
}

canvas.addEventListener('click', function() {
  if (game.state === 'init') {
    start();
  }
  if (game.dino.moveY === 0) {
    game.dino.moveY = -41; // ジャンプ
    game.bgm2.play();
  }
  if (game.state === 'gameover') {
    init(); // ゲーム再スタート
  } 
});

function ticker() {
  // 画面クリア
  ctx.clearRect(0,0, canvas.width, canvas.height);
  //背景の作成
  if (game.counter % 20 === 0 ) {
    createBackGround();
  }
  // 敵キャラクタの生成
  createEnemys();
  // キャラクタの移動
  moveBackGrounds();
  moveDino();
  moveEnemys();
  // キャラクタの描画
  drawBackGrounds();
  drawDino();
  drawEnemys();
  drawScore();
  // 当たり判定
  hitCheck();
  // キックバックチェック
  kickbackCheck();
  // カウンタの更新
  game.score += 1
  game.counter = (game.counter + 1) % 1000000;
  game.enemyCountdown -= 1;
}

function createBackGround(){
  game.backGrounds = [];
  for (let x = 0; x <= canvas.width; x+=200){
    game.backGrounds.push({
      x: x,
      y: canvas.height,
      width: 200,
      moveX: -10,
    });
  }
}

function moveBackGrounds() {
  for (const backGround of game.backGrounds) {
    backGround.x += backGround.moveX;
  }
}

function drawBackGrounds() {
  ctx.fillStyle = 'sienna';
  for (const backGround of game.backGrounds) {
    ctx.fillRect(backGround.x, backGround.y - 5, backGround.width, 5);
    ctx.fillRect(backGround.x+20,backGround.y-10,backGround.width-40,5);
    ctx.fillRect(backGround.x+50,backGround.y-15,backGround.width-100,5);
  }
}

function kickbackCheck(){
  if (game.kickback === false && game.score >= 1000){
    game.kickback = true
  }
}

function moveDino(){
  game.dino.y += game.dino.moveY;
  if(game.dino.y >= canvas.height - game.image.dino.height / 2){
    game.dino.y = canvas.height - game.image.dino.height / 2; // 地面に着地
    game.dino.moveY = 0;
  } else {
    game.dino.moveY += 3; // 重力で落ちてる
  }
}

function drawDino() {
  // game.counterの値に応じて画像を切り替える　うまくいかない
  ctx.clearRect(game.dino.x - game.dino.width / 2, game.dino.y - game.dino.height / 2, game.dino.width, game.dino.height);
  const frame = game.counter % 30 < 15 ? 0 : 1;
  const dinoImage = frame === 0 ? game.image.dino2 : game.image.dino;
  ctx.drawImage(dinoImage, game.dino.x - game.dino.width /2,
    game.dino.y - game.dino.height / 2 );
}

function drawEnemys() {
  for (const enemy of game.enemys) {
    ctx.drawImage(enemy.image, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2);
  }
}

function createEnemys(){
  if (game.enemyCountdown === 0) {
    game.enemyCountdown = 60 -Math.floor(game.score / 100);
    if (game.enemyCountdown <= 30) game.enemyCountdown = 30;
    switch(Math.floor(Math.random() * 3)) {
      case 0:
        createCactus(canvas.width + game.image.cactus.width / 2);
        break;
      case 1:
        createBird();
        break;
      case 2:
        createCactus(canvas.width + game.image.cactus.width / 2);
        createCactus(canvas.width + game.image.cactus.width * 3 / 2);
        break;
    }
  }
}


function createCactus(createX) {
  game.enemys.push({
    x: createX,
    y: canvas.height - game.image.cactus.height / 2,
    width: game.image.cactus.width,
    height: game.image.cactus.height,
    moveX: -10,
    image: game.image.cactus
  })
}

function createBird() {
  const birdY = Math.random() * (300 - game.image.bird.height) + 150;
  game.enemys.push({
    x: canvas.width + game.image.bird.width / 2,
    y: birdY,
    width: game.image.bird.width,
    height: game.image.bird.height,
    moveX: -15,
    image: game.image.bird
  })
}

function moveEnemys(){
  for(const enemy of game.enemys) {
    enemy.x += enemy.moveX;
  }
  game.enemys = game.enemys.filter(enemy => enemy.x - enemy.width);
}

function hitCheck() {
  for (const enemy of game.enemys) {
    if(
      Math.abs(game.dino.x - enemy.x) < (game.dino.width * 0.8 / 2 + enemy.width * 0.9 / 2) &&
      Math.abs(game.dino.y - enemy.y) < (game.dino.height * 0.5 / 2 + enemy.height * 0.9 / 2)
     ) //当たっている場合
     {
       game.state = 'gameover';
       game.bgm1.pause();
       ctx.font = 'bold 100px serif';
       ctx.fillText(`Game over!`, 150, 200);
       clearInterval(game.timer);
     }
  }
}

function drawScore() {
  ctx.fillStyle = 'black';
  ctx.font = '24px serif';
  ctx.fillText(`score: ${game.score}`, 0, 30)
}