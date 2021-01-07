// ==UserScript==
// @name         Anime4You AntiCaptcha
// @version      4.5
// @description  Anime4You Captcha Skipper, Updated 18.11.2020.
// @author       Temm
// @license      MIT
// @run-at       document-start
// @match        *://*.anime4you.one/show/*
// @require      https://gist.githubusercontent.com/leumasme/325d8450fcb85e8fcdabd3d309ee7e69/raw/30ed399221369074fc68d60053e05b3ea4787d92/onbeforescriptexecute.js
// @require      https://gist.githubusercontent.com/leumasme/acfcb4fdaf0db307b2e0adb350ca34ed/raw/d5709e75ecd8da4ee6da9dd55c0dfac8315a790f/captcheck-data.js
// @updateURL    https://openuserjs.org/meta/Temm/Anime4You_AntiCaptcha.meta.js
// ==/UserScript==

"use strict";

var sentence = ["Bitte klicke auf ", "Finde folgendes Symbol: ", "Klick auf "];


function loadImage(url) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            //"mode": "no-cors"
        })
            .then((res) => res.blob())
            .then((blob) => {
                let reader = new FileReader();
                reader.onloadend = () => {
                    console.log("[AC]: Reader Loadend")
                    let img = new Image();
                    img.onload = () => {
                        resolve(img);
                    }
                    img.src = reader.result;
                }
                console.log(blob);
                reader.readAsDataURL(blob);
            })
    });
}

const getColor = (x, y, width, i) => { // stackoverflow magic
    const red = y * (width * 4) + x * 4;
    let [r, g, b, a] = [red, red + 1, red + 2, red + 3];
    return [i.data[r], i.data[g], i.data[b], i.data[a]];
};

let solution;

(async () => {
    console.log("[AC] Alive");

    window.addEventListener('beforescriptexecute', (e) => {
        if (e.script.src.includes("Captcheck")) {
            e.preventDefault();
        }
    })

    let res = await fetch("https://captcha.anime4you.one/Captcheck/api.php?action=new");
    let j = await res.json();

    let hashes = j.answers;

    let q = j.question_i;
    let word;
    for (let b of sentence) {
        if (q.startsWith(b)) {
            word = q.substr(b.length, q.length - b.length);
            word = word.substr(0, word.length - 1).toLowerCase();
        }
    }
    let data = alldata[word];
    console.log("[AC]: Word is " + word)
    // https://captcha.anime4you.one/Captcheck/api.php?action=img&s=SESSION&c=ANSWER

    j.answers.forEach(async (e) => {
        var ctx = new OffscreenCanvas(64, 64).getContext("2d");

        let url = "https://captcha.anime4you.one/Captcheck/api.php?action=img&s=" + j.session + "&c=" + e;
        let img = await loadImage(url);
        ctx.drawImage(img, 0, 0);

        let imgData = ctx.getImageData(0, 0, 64, 64);

        let cnt = 0;

        for (let x = 0; x < 64; x++) {
            for (let y = 0; y < 64; y++) {
                let [r, g, b, a] = getColor(x, y, 64, imgData);
                let rgba = "R=" + r + " G=" + g + " B=" + b + " A=" + a;
                if (a != 0 && a != 255) {

                    if (!data.includes(x + "/" + y)) {
                        console.log("[AC]: Rejected on " + e + " for " + x + "/" + y + ": was " + rgba);
                        return;
                    }
                    cnt++;
                }
            }
        }

        if (solution != null) {
            console.warn("[AC]: WARN: Multiple Solutions!?");
            if (solution[2] > cnt) return;
        }

        console.log("[AC]: Found Solution CNT=" + cnt + " : " + url)
        solution = [j.session, e, cnt];
    });
})();

let iv = setInterval(() => {
    if (document.getElementById("hosting") != null) {
        if (solution != null) {
            clearInterval(iv);
            var form = new FormData(document.getElementById("captchacheck"));
            form.set("captcheck_session_code", solution[0]);
            form.set("captcheck_selected_answer", solution[1]);
            fetch("/Captcheck/humancheck.php", {
                "method": "POST",
                "body": form
            }).then(d=>d.text()).then(t=>{
                document.getElementById("hosting").innerHTML = t;
            })
        } else console.log("[AC]: Awaiting Solve");
    } else console.log("[AC]: Awaiting Document Load");
}, 200)