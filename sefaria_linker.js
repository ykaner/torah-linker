import { linkerV3Function } from "./sefaria_linker.v3/main";


export async function sefariaLinker() {
    linkerV3Function();
    sefaria.link({
        mode: 'popup-click',
        contentLang: "hebrew",
        interfaceLang: "hebrew"
    });
}
