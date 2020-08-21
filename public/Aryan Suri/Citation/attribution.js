function attribution() {
    buildAttribution();
    function getParam() {
        let title = $("#titleHolder").text();
        title = `"` + title + `"`;
        let author = $("li.mt-author-information a:first").text();
        let url = window.location.href;

        let param = {
            "title": title,
            "author": author,
            "url": url

        }

        return param
    }

    function buildAttribution() {
        const cc = getCC();
        const param = getParam();
        let attrdiv = document.createElement("div");
        $(attrdiv).attr("id", "SB-PA-AD");
        document.body.appendChild(attrdiv);

        $(attrdiv).html(`

            <div onclick="hideattr()" id="attrModal">

                <div id="attrModalContent" style="cursor: pointer" >
                    
                    <div id="attrHTML">
                        <p id="attr-text"> <a href="${param.url}"> ${param.title} </a> by <a id="attr-author-link" href="">${param.author}</a>, <a href="https://libretexts.org/">LibreTexts</a> is licensed under <a href="${cc.link}"> ${cc.title} </a>.  </p> <br/>
                    </div>


                    <div id="attr-links">
                        <a id="attr-copy" style="text-decoration: none; color: #666" >Copy Text</a>&nbsp;&nbsp;&nbsp;&nbsp;
                        <a id="attr-html" style="text-decoration: none; color: #666" >Copy HTML</a>&nbsp;&nbsp;&nbsp;&nbsp;
                        <a id="attr-author" style="text-decoration: none; color: #666"> Affiliation's Page</a>&nbsp;&nbsp;&nbsp;&nbsp;
                        <a id="attr-program" style="text-decoration: none; color: #666"> Program's Page</a>&nbsp;&nbsp;&nbsp;&nbsp;
                    </div>
                </div>

            </div>`);

        const attrCopy = document.getElementById("attr-copy");
        attrCopy.addEventListener("click", () => {
            let text = document.getElementById("attr-text").innerText;
            let elem = document.createElement("textarea");
            document.body.appendChild(elem);
            elem.value = text;
            elem.select();

            document.execCommand("copy");
            document.body.removeChild(elem);
        });

        //AUTHOR LINKS
        const attrAuthor = $("li.mt-author-information a:first").attr('href');
        $("#attr-author").attr("href", attrAuthor);
        $("#attr-author-link").attr("href", attrAuthor);

        const attrProgram = $("li.mt-author-companyname a:first").attr('href');
        $("#attr-program").attr("href", attrProgram);

        //COPY THE HTML
        const attrHTMLCopy = document.getElementById("attr-html");
        attrHTMLCopy.addEventListener("click", () => {
            let text = $("#attr-text").html();
            let elem = document.createElement("textarea");
            document.body.appendChild(elem);
            elem.value = text;
            elem.select();

            document.execCommand("copy");
            document.body.removeChild(elem);
        });



    }
}

function hideattr() {

    if (!$(event.target).closest('#aM-c').length && !$(event.target).is('#aM-c')) {
        $("#SB-PA-AD").remove();
    }
}