import $ from "jquery";
import { Readability, isProbablyReaderable } from "@mozilla/readability";
import findAndReplaceDOMText from 'findandreplacedomtext';
import { PopupManager } from "./sefaria_linker.v3/popup";
import { linkerV3Function } from "./sefaria_linker.v3/main";


window.dictaRL = {}


function parseText() {
    const doc = window.document.cloneNode(true);
    if (!isProbablyReaderable(doc)) {
        return;
    }
    const reader = new Readability(doc);
    const parsed = reader.parse();
    if (!parsed.lang || parsed.lang.includes('he')) {
        return parsed.textContent;
        return removeNonHebrewText(parsed.textContent);
    }
    return undefined;
}


function urlify(url) {
    if (typeof(url) != 'string') {
        return url;
    }
    if (url.startsWith('//')) {
        url = 'https://' + url.slice(2);
    }
    return new URL(url);
}


function isSefariaRef(url) {
    url = urlify(url);
    return url.hostname.includes('sefaria');
}


async function fetchParallels(text) {
    const response = await fetch(
        "https://parallels-2-1.loadbalancer.dicta.org.il/parallels/api/findincorpus?minthreshold=10&maxdistance=4", {
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/x-www-form-urlencoded"
        },
        referrer: "https://parallels.dicta.org.il/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: "text=" + text,
        method: "POST",
        mode: "cors",
        credentials: "omit"
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results[0].data;
}

function chooseOldestSource(parallels) {
    // TODO: This is choosing arbitrary. need to choose the best i.e. oldest.
    for (const key in parallels) {
        parallels[key] = parallels[key][0];
    }
    return parallels;
}


async function fetchSefariaSourceData(ref) {
    const options = { method: 'GET', headers: { accept: 'application/json' } };
    const response = await fetch('https://www.sefaria.org/api/v3/texts' + ref, options)
        .then(response => response.json())
        .catch(err => console.error(err));
    let sourceData = {
        ref: response.ref,
        heRef: response.heRef,
        en: [],
        he: [],
        primaryCategory: response.primary_category,
        isTruncated: false
    };
    for (let version of response.versions) {
        if (version.language === 'he') {
            sourceData.he = version.text;
        }
        if (version.language === 'en') {
            sourceData.en = version.text;
        }
    }
    return sourceData;
}


async function fetchSefariaSourceDataForParallels(parallels) {
    const promises = Object.entries(parallels).map(([key, par]) => {
        const url = urlify(par.url);
        if (isSefariaRef(url)) {
            return (async function () {
                let sefariaSourceData = await fetchSefariaSourceData(url.pathname);
                sefariaSourceData.url = url.pathname.slice(1);
                return {key, sefariaSourceData};
            })();
        }
    });
    const results = await Promise.all(promises);
    results.forEach(({key, sefariaSourceData}) => {
        parallels[key].sefariaSourceData = sefariaSourceData;
    });
    return parallels;
}


function popupSetup() {
    dictaRL.popupManager = new PopupManager({
        mode: 'popup-click', 
        contentLang: "hebrew",
        interfaceLang: "hebrew"
    });
    dictaRL.popupManager.setupPopup();
}

export async function dictaRefLinker() {
    linkerV3Function();
    popupSetup();
    const text = parseText();
    if (text === undefined) {
        return;
    }
    let parallels = await fetchParallels(text);
    parallels = Object.groupBy(parallels, par => par.baseMatchedText);
    parallels = chooseOldestSource(parallels); //TODO: This is a lie a placeholder
    parallels = await fetchSefariaSourceDataForParallels(parallels);
    let injectedLinksCount = 0;
    for (const key in parallels) {
        let par = parallels[key];
        let url = urlify(par.url);
        findAndReplaceDOMText(document, {
            preset: 'prose',
            find: par.baseMatchedText,
            replace: function(portion, match) {
                if (!portion.isEnd) {
                    return portion.text;
                }
                let atag = document.createElement("a");
                atag.href = url;
                atag.target = "_blank";
                atag.textContent = "[*להרחבה]";
                let node = document.createElement("span");
                node.innerText = portion.text;
                node.appendChild(atag);
                if (par.sefariaSourceData) {
                    node.className = 'sefaria-ref-wrapper';
                    atag.className = "sefaria-ref";
                    atag.setAttribute('aria-controls', 'sefaria-popup');
                    dictaRL.popupManager.bindEventHandler(atag, url.origin, par.sefariaSourceData);
                }
                injectedLinksCount++;
                return node;
            }
        });
    }
    console.log(
        `all done, found: ${Object.keys(parallels).length} parallels, injected ${injectedLinksCount} links`
    );
}
