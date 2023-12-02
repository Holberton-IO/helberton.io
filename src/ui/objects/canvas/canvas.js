// The Paper
var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//enums
//we can make 16 players --> each Character contains an array of 4 colors, 4 characters * 4 colors = 16 players
const size = 40;
const waterCharacter = "#01b0e8"
const lavaCharacter = "#f82222"
const crystalCharacter = "#ef59f2"
const fungiCharacter = "#80b75c"

// The Pen
let c = canvas.getContext('2d');

//arc / circle
function Character(x, y, characterName, size, rotation) {
    const bigEye = "#ffff";
    const smallEye = "#000";

    c.save(); // Save the current transformation state
    c.translate(x, y); // Move the origin to the character's position
    c.rotate(rotation); // Rotate the context

    // head
    c.beginPath();
    c.arc(0, 0, size, 0, Math.PI * 2, false);
    c.fillStyle = characterName;
    c.fill();

    // right white eye
    c.beginPath();
    c.fillStyle = bigEye;
    c.arc(-size / 2, -size / 2.5, size / 4, 0, Math.PI * 2, false);
    c.fill();

    // left white eye
    c.fillStyle = bigEye;
    c.arc(-size / 2, size / 2.5, size / 4, 0, Math.PI * 2, false);
    c.fill();

    // left black eye
    c.beginPath();
    c.fillStyle = smallEye;
    c.arc(-size / 2, size / 2.5, size / 8, 0, Math.PI * 2, false);
    c.fill();

    // right black eye
    c.fillStyle = smallEye;
    c.arc(-size / 2, -size / 2.5, size / 8, 0, Math.PI * 2, false);
    c.fill();

    // Smile
    c.beginPath();
    c.arc(size / 4, 0, size / 2, -0.5 * Math.PI, 0.5 * Math.PI);
    c.lineWidth = size / 10;
    c.stroke();

    c.restore(); // Restore the previous transformation state
}

let x = innerWidth / 2, y = 200;
let characterArray = [waterCharacter, lavaCharacter, crystalCharacter, fungiCharacter]
let r = 0.5

for (let i = 0; i < 4; i++) {
    Character(x, y, characterArray[i], size, (Math.PI * r)); // Rotate each character by an angle
    y += size * 3;
    r += -0.5
}

const rectWidth = 100;
const rectHeight = 100;
var rectX = 50;
var rectY = 50;
var cornerRadius = 10;

function drawMap(rectWidth, rectHeight, rectX, rectY, color) {
    // Set the shadow properties
    c.shadowBlur = 5;
    c.shadowColor = "rgba(0, 0, 0, 0.5)";
    c.shadowOffsetY = 5;

    c.fillStyle = color;
    drawRoundedRect(c, rectX, rectY, rectWidth, rectHeight, cornerRadius);

    function drawRoundedRect(c, x, y, width, height, radius) {
    c.beginPath();
    c.moveTo(x + radius, y);
    c.arcTo(x + width, y, x + width, y + height, radius);
    c.arcTo(x + width, y + height, x, y + height, radius);
    c.arcTo(x, y + height, x, y, radius);
    c.arcTo(x, y, x + width, y, radius);
    c.closePath();
    c.fill();
    };
}

for (let i = 0; i < 6; i++) {
    drawMap(rectWidth, rectHeight, rectX, rectY,"#09172c");
    rectX += 110;
}
rectX = 50;
rectY = 160;
for (let i = 0; i < 6; i++) {
    drawMap(rectWidth, rectHeight, rectX, rectY, "#09172c");
    rectX += 110;
}
drawMap(rectWidth, rectHeight, 50, 400, "#b2ff80");



function drawWaitingLand(rectWidth, rectHeight, rectX, rectY, color) {
    c.shadowBlur = 0;
    c.shadowColor = "rgba(0, 0, 0, 0)";
    c.shadowOffsetY = 0;
    c.fillStyle = color;
    
    c.fillRect(rectX, rectY, rectWidth, rectHeight);
    c.fillStyle = "#b2ff80";
    c.fillRect(rectX + 25, rectY, rectWidth / 2, rectHeight);
}
drawWaitingLand(rectWidth, rectHeight, 500, 500, "#7cb259")
