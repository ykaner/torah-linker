import { Readability, isProbablyReaderable } from "@mozilla/readability";
import $ from "jquery";


function injectHtmlAtSubstring(element, substring, htmlToInject) {
    var $element = $(element);
    var content = $element.html();
    var position = content.indexOf(substring);

    if (position === -1) {
        console.log("Failed injecting HTML, cannot find: ", substring);
        return;
    }
    var beforeSubstring = content.substring(0, position);
    var afterSubstring = content.substring(position + substring.length);

    var newContent = beforeSubstring + substring + htmlToInject + afterSubstring;

    $element.html(newContent);
}


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

export async function dictaRefLinker() {
    const text = parseText();
    if (text === undefined) {
        return;
    }
    let parallels = await fetchParallels(text);
    parallels = Object.groupBy(parallels, par => par.baseMatchedText);
    let injectedLinksCount = 0;
    for (let key in parallels) {
        let par = parallels[key][0];
        var elements = $(`:contains(${par.baseMatchedText})`);
        var lowestElements = elements.filter(function() {
            return $(this).find(`:contains(${par.baseMatchedText})`).length === 0;
        });
        lowestElements.each(function() {
            injectHtmlAtSubstring(
                this, par.baseMatchedText,
                `<a href=${par.url} target="_blank" rel="noopener noreferrer">[*להרחבה]</a>`
            );
            injectedLinksCount++;
        });

    }
    console.log(
        `all done, found: ${Object.keys(parallels).length} parallels, injected ${injectedLinksCount} links`
    );
}
