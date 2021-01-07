// Klick auf
// Finde folgendes Symbol:
// Bitte klicke auf 

var sentence = ["Bitte klicke auf ", "Finde folgendes Symbol: ", "Klick auf "];
var words = [];

const fetch = require("node-fetch");

(async () => {
    while (true) {
        try {
            var res = await fetch("https://captcha.anime4you.one/Captcheck/api.php?action=new");
            var j = await res.json();
        } catch {
            debugger;
        }
        let q = j.question_i;

        let word;
        for (let b of sentence) {
            if (q.startsWith(b)) {
                word = q.substr(b.length, q.length - b.length);
                word = word.substr(0, word.length - 1);
            }
        }
        console.log(word);
        if (!words.includes(word)) words.push(word);

        // console.log(j.question_i);
    }
})();

setTimeout(() => { }, 10000)