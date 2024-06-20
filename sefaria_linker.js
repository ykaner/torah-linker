import { linkerFunction } from "./js/linker.v3";


export async function sefariaLinker() {
    linkerFunction();
    sefaria.link({
        mode: 'popup-click',
        contentLang: "hebrew",
        interfaceLang: "hebrew"
    });
}
