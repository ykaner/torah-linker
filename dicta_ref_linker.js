import $ from "jquery";
import { Readability, isProbablyReaderable } from "@mozilla/readability";
import findAndReplaceDOMText from 'findandreplacedomtext';
import { PopupManager } from "./sefaria_linker.v3/popup";


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
    try {
        return new URL(url);
    } catch (TypeError) {
        return undefined;
    }
}


function isSefariaRef(url) {
    url = urlify(url);
    if (url === undefined) {
        return false;
    }
    return url.hostname.includes('sefaria');
}


async function fetchParallels(text) {
    const response = await fetch(
        "https://parallels-2-2.loadbalancer.dicta.org.il/parallels/api/findincorpus?minthreshold=10&maxdistance=4&tanakhMinScore=1.9", {
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


function chooseBestSource(parallels) {
    for (const key in parallels) {
        parallels[key] = parallels[key][0];
    }
    return parallels;
}


function adjustSefariaSourceDataForParallels(parallels) {
    for (const key in parallels) {
        let par = parallels[key];
        const url = urlify(par.url);
        if (isSefariaRef(url)) {
            if (par.compBookXmlId.split('.')[0].toLowerCase() == 'sefaria') {
                par.compBookXmlId = par.compBookXmlId.split('.').slice(1).join('.');
            }
            const bookRefLen = par.compBookXmlId.split('.').length;
            par.sefariaSourceData = {
                ref: par.compBookXmlId,
                heRef: par.compNameHe.split(':').slice(bookRefLen - 1).join(':'),
                en: [],
                he: [par.compMatchedText],
                url: url.pathname.slice(1),
                primaryCategory: par.compBookXmlId.split('.')[0],
            };
        }
    }
    return parallels;
}


function clearParallels() {
    $(".torah-linker-parallel").remove();
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
    clearParallels();
    popupSetup();
    const text = parseText();
    if (text === undefined) {
        return;
    }
    let parallels = await fetchParallels(text);
    parallels = Object.groupBy(parallels, par => par.baseMatchedText);
    parallels = chooseBestSource(parallels);
    parallels = adjustSefariaSourceDataForParallels(parallels);
    let injectedLinksCount = 0;
    for (const key in parallels) {
        let par = parallels[key];
        let url = urlify(par.url);
        if (url === undefined) {
            continue;
        }
        findAndReplaceDOMText(document, {
            preset: 'prose',
            find: par.baseMatchedText,
            replace: function(portion, match) {
                if (!portion.isEnd) {
                    return portion.text;
                }
                let atag = document.createElement("a");
                atag.classList.add("torah-linker-parallel");
                atag.href = url;
                atag.target = "_blank";
                atag.textContent = "[*]";
                let node = document.createElement("span");
                node.innerText = portion.text;
                node.appendChild(atag);
                if (par.sefariaSourceData) {
                    const scrollToRange = {index: par.compStartChar, length: par.compTextLength}
                    dictaRL.popupManager.bindEventHandler(
                        atag, url.origin, par.sefariaSourceData, scrollToRange
                    );
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
