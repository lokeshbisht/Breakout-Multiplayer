/** @type {HTMLCanvasElement} */
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

canvas.style.border = "1px solid #0ff";

// set stroke width
ctx.lineWidth = 3;

// game variables and constants
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const PADDLE_MARGIN_BOTTOM = 50;

const BALL_RADIUS = 8;
const BALL_SPEED = 4;

let LIFE = 3;
let GAME_OVER = false;

const SCORE_UNIT = 20;
let SCORE = 0;

let LEVEL = 1;
const MAX_LEVEL = 5;

let leftArrow = false;
let rightArrow = false;

//create the paddle object
const paddle = {

    x: canvas.width / 2 - PADDLE_WIDTH / 2,
    y: canvas.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dx: 5
}

// create ball object
const ball = {

    x: canvas.width / 2,
    y: paddle.y - BALL_RADIUS,
    radius: BALL_RADIUS,
    speed: BALL_SPEED,
    dx: BALL_SPEED * (Math.random() * 2 - 1),
    dy: -BALL_SPEED
}

// create the brick
const brick = {
    row: 1,
    column: 5,
    width: 55,
    height: 20,
    offsetLeft: 20,
    offsetTop: 20,
    marginTop: 20,
    fillColor: "#2e3548",
    strokeColor: "#FFF"
}

let bricks = [];

// create bricks
function createBricks() {

    for (var r = 0; r < brick.row; r++) {

        bricks[r] = [];

        for (var c = 0; c < brick.column; c++) {

            bricks[r][c] = {
                x: c * (brick.offsetLeft + brick.width) + brick.offsetLeft,
                y: r * (brick.offsetTop + brick.height) + brick.offsetTop + brick.marginTop,
                status: true
            }
        }
    }
}

createBricks();

// draw the bricks
function drawBricks() {

    for (let r = 0; r < brick.row; r++) {

        for (let c = 0; c < brick.column; c++) {
            let b = bricks[r][c];

            if (b.status) {
                ctx.fillStyle = brick.fillColor;
                ctx.fillRect(b.x, b.y, brick.width, brick.height);

                ctx.strokeStyle = brick.strokeColor;
                ctx.strokeRect(b.x, b.y, brick.width, brick.height);
            }
        }
    }

}


// draw paddle
function drawPaddle() {

    ctx.fillStyle = "#2e3548";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    ctx.strokeStyle = "#ffcd05";
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// control the paddle
document.addEventListener("keydown", (event) => {
    if (event.keyCode == 37) {
        leftArrow = true;
    }
    if (event.keyCode == 39) {
        rightArrow = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.keyCode == 37) {
        leftArrow = false;
    }
    if (event.keyCode == 39) {
        rightArrow = false;
    }
});

// move paddle
function movePaddle() {
    if (leftArrow &&
        paddle.x > 0) {
        paddle.x -= paddle.dx;
    }

    if (rightArrow &&
        paddle.x + paddle.width < canvas.width) {
        paddle.x += paddle.dx;
    }
}

// draw the ball
function drawBall() {

    ctx.beginPath();

    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffcd05";
    ctx.fill();

    ctx.strokeStyle = "#2e3548";
    ctx.stroke();

    ctx.closePath();
}

// move the ball
function moveBall() {

    ball.x += ball.dx;

    ball.y += ball.dy;
}

// reset the ball
function resetBall() {

    ball.x = canvas.width / 2;
    ball.y = paddle.y - BALL_RADIUS;
    ball.dx = BALL_SPEED * (Math.random() * 2 - 1);
    ball.dy = -BALL_SPEED;
}

// ball and wall collision
function ballWallCollision() {

    if (ball.x + ball.radius > canvas.width ||
        ball.x - ball.radius < 0) {

        WALL_HIT.play();
        ball.dx = -ball.dx;
    }

    if (ball.y - ball.radius < 0) {
        WALL_HIT.play();
        ball.dy = -ball.dy;
    }

    if (ball.y + ball.radius > canvas.height) {

        LIFE_LOST.play();
        LIFE--;
        resetBall();
    }
}

// ball and paddle collision
function ballPaddleCollision() {

    if (ball.x < paddle.x + paddle.width &&
        ball.x > paddle.x &&
        ball.y < paddle.y + paddle.height &&
        ball.y > paddle.y) {

        PADDLE_HIT.play();

        // check where the ball hits the paddle
        let collidePoint = ball.x - (paddle.x + paddle.width / 2);

        // normalise the value
        collidePoint = collidePoint / (paddle.width / 2);

        // calculate the angle of ball
        let angle = collidePoint * Math.PI / 3;

        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = -ball.speed * Math.cos(angle);
    }
}

// ball and brick collision
function ballBrickCollision() {

    for (let r = 0; r < brick.row; r++) {

        for (let c = 0; c < brick.column; c++) {

            let b = bricks[r][c];

            if (b.status) {

                if (ball.x + ball.radius > b.x &&
                    ball.x - ball.radius < b.x + brick.width &&
                    ball.y + ball.radius > b.y &&
                    ball.y - ball.radius < b.y + brick.height) {

                    BRICK_HIT.play();

                    ball.dy = -ball.dy;
                    b.status = false;
                    SCORE += SCORE_UNIT;
                }
            }
        }
    }
}

// show game stats
function showGameStats(text, textX, textY, img, imgX, imgY) {

    // draw text
    ctx.fillStyle = "#FFF";
    ctx.font = "25px Germania One";
    ctx.fillText(text, textX, textY);

    // draw Image
    ctx.drawImage(img, imgX, imgY, 25, 25);
}

// level up
function levelUp() {

    let isLevelDone = true;

    for (let r = 0; r < brick.row; r++) {

        for (let c = 0; c < brick.column; c++) {

            let b = bricks[r][c];

            isLevelDone &= !b.status;
        }
    }

    if (isLevelDone) {

        WIN.play();

        if (LEVEL >= MAX_LEVEL) {
            showYouWin();
            GAME_OVER = true;
            return;
        }
        brick.row++;
        LEVEL++;
        createBricks();
        ball.speed++;
        resetBall();
    }
}
// gameover
function gameOver() {

    if (LIFE <= 0) {
        showYouLose();
        GAME_OVER = true;
    }
}

// draw function
function draw() {

    drawPaddle();

    drawBall();

    drawBricks();

    // show score
    showGameStats(SCORE, 35, 25, SCORE_IMAGE, 5, 5);

    // show lives
    showGameStats(LIFE, canvas.width - 25, 25, LIFE_IMAGE, canvas.width - 55, 5);

    // show level
    showGameStats(LEVEL, canvas.width / 2, 25, LEVEL_IMAGE, canvas.width / 2 - 30, 5);

}
// update function
function update() {

    movePaddle();

    moveBall();

    ballWallCollision();

    ballPaddleCollision();

    ballBrickCollision();

    gameOver();

    levelUp();

}

// main game loop
function loop() {

    // clear the canvas by drawing background
    ctx.drawImage(BG_IMAGE, 0, 0);

    draw();

    update();

    if (!GAME_OVER) {
        requestAnimationFrame(loop);
    }
}

loop();

// select the sound element
const soundElement = document.getElementById("sound");

soundElement.addEventListener("click", audioManager);

function audioManager() {

    let imgSrc = soundElement.getAttribute("src");

    let SOUND_IMG = imgSrc == "img/SOUND_ON.png" ? "img/SOUND_OFF.png" : "img/SOUND_ON.png";

    soundElement.setAttribute("src", SOUND_IMG);

    WALL_HIT.muted = WALL_HIT.muted ? false : true;
    BRICK_HIT.muted = BRICK_HIT.muted ? false : true;
    WIN.muted = WIN.muted ? false : true;
    PADDLE_HIT.muted = PADDLE_HIT.muted ? false : true;
    LIFE_LOST.muted = LIFE_LOST.muted ? false : true;
}

// show elements
const gameover = document.getElementById("gameover");
const youwon = document.getElementById("youwon");
const youlose = document.getElementById("youlose");
const restart = document.getElementById("restart");

restart.addEventListener("click", () => {
    location.reload();
});

function showYouWin() {

    gameover.style.display = "block";
    youwon.style.display = "block";
}

function showYouLose() {

    gameover.style.display = "block";
    youlose.style.display = "block";
}