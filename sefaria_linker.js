
async function sefariaLinker() {
    const linkerScriptUrl = chrome.runtime.getURL('js/linker.v3.js');
    const linker = await import(linkerScriptUrl);
    linker.linkerFunction();
    sefaria.link({
        mode: 'popup-click',
        contentLang: "hebrew",
        interfaceLang: "hebrew"
    });
}
