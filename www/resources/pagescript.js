AOS.init();
// apply HighlightJS
let pres = document.querySelectorAll("pre>code");
for (let i = 0; i < pres.length; i++) {
    hljs.highlightBlock(pres[i]);
}
// add HighlightJS-badge (options are optional)
// let options = {   // optional
//     contentSelector: "#ArticleBody",
//     // CSS class(es) used to render the copy icon.
//     copyIconClass: "fas fa-copy",
//     // CSS class(es) used to render the done icon.
//     checkIconClass: "fas fa-check text-success"
// };
window.highlightJsBadge();