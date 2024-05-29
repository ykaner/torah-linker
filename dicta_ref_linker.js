import { Readability, isProbablyReaderable } from "@mozilla/readability";
import $ from "jquery";


function injectHtmlAtSubstring(element, substring, htmlToInject) {
    var $element = $(element);
    var content = $element.html();
    var position = content.indexOf(substring);

    if (position !== -1) {
        var beforeSubstring = content.substring(0, position);
        var afterSubstring = content.substring(position + substring.length);

        var newContent = beforeSubstring + substring + htmlToInject + afterSubstring;

        $element.html(newContent);
    }
}


async function dicta_ref_linker() {
    const doc = window.document.cloneNode(true);
    if ( !isProbablyReaderable(doc) ) {
        return;
    }
    const reader = new Readability(doc);
    const parsed = reader.parse();
    console.log(parsed);
    if (parsed.lang != 'he'){
        return;
    }
    const text = parsed.textContent;
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
    const parallels = data.results[0].data;
    for (let par of parallels) {
        console.log(par);
        var elements = $(`:contains(${par.baseMatchedText})` );
        var lowestElements = elements.filter(function() {
            return $(this).find(`:contains(${par.baseMatchedText})`).length === 0;
        });
        lowestElements.each(function() {
            injectHtmlAtSubstring(this, par.baseMatchedText, '<span class="highlight">Injected HTML</span>');
        })

    }
    console.log('all done');
    this.alert(parallels.length);
}


window.addEventListener('load', function () {
    dicta_ref_linker();
})