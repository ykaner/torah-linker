import { dictaRefLinker } from "./dicta_ref_linker.js";
import { sefariaLinker } from "./sefaria_linker.js";


let contentStableTimeout;
function runWhenContentStable() {
    // TODO: check content significant changes.
    clearTimeout(contentStableTimeout);
    contentStableTimeout = setTimeout(() => {
        console.log("Content appears to be stable");
        dictaRefLinker();
        sefariaLinker();
    }, 1000);
}


window.addEventListener('load', function () {
    runWhenContentStable();
});


window.addEventListener('popstate', () => {
    console.log("Page changed via History API");
    runWhenContentStable();
});

let lastUrl = location.href;
const titleObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        console.log('URL changed to', lastUrl);
        runWhenContentStable();
    }

});
titleObserver.observe(window.document.querySelector('title'), { childList: true, characterData: true, subtree: true });
