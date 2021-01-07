const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const getColorIndicesForCoord = (x, y, width) => { // stackoverflow magic
    const red = y * (width * 4) + x * 4;
    return [red, red + 1, red + 2, red + 3];
};

var files = fs.readdirSync(__dirname + "/images/");

var result = {} // filename: "x/y,x/y"

console.log(files);
files.forEach(async (f) => {
    let cv = createCanvas(64, 64);
    let ctx = cv.getContext("2d");

    let toLoad = await loadImage(__dirname + "/images/" + f);

    ctx.drawImage(toLoad, 0, 0, 64, 64);
    let img = ctx.getImageData(0, 0, 64, 64);

    let curStr = "";

    for (let x = 0; x < 64; x++) {
        for (let y = 0; y < 64; y++) {
            let coord = getColorIndicesForCoord(x, y, 64);
            let [r, g, b, a] = coord;

            if (img.data[a] != 0 && img.data[a] != 255) {
                curStr += x + "/" + y + ",";
            }
        }
    }

    console.log(f + " : " + curStr);
    result[f.substr(0, f.length - 4)] = curStr.substr(0, curStr.length-1)
})


setTimeout(() => { 
    fs.writeFileSync("out.json", JSON.stringify(result));

}, 1000)