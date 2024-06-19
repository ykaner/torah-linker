import {dictaRefLinker} from "./dicta_ref_linker.js";
import {sefariaLinker} from "./sefaria_linker.js";


window.addEventListener('load', function () {
    dictaRefLinker();
});

window.addEventListener('load', function () {
    sefariaLinker();
});

window.addEventListener('keydown', function(event) {
    if (event.altKey && event.key === 'r') {
        console.log('Alt+R was pressed');
        dictaRefLinker();
        sefariaLinker();
    }
});