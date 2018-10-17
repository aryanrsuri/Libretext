class propagator {
	static display() {
		const target = document.createElement("div");
		let originalURL = "";
		if (window.location.href.includes("Propagator?")) {
			originalURL = decodeURIComponent(window.location.href.split("Propagator?")[1]);
		}
		target.innerHTML = `<div>Source Root URL: <input id="copySource" oninput="propagator.reset()"  value="${originalURL}" placeholder="Paste source address here"/></div>` +
			'<div>Username to Authenticate: <input id="user" oninput="propagator.reset()" placeholder="Username"/></div>' +
			'<div>Password to Authenticate: <input id="password" oninput="propagator.reset()" placeholder="Password" type="password"/></div>' +
			'<div><button onclick="propagator.propagate()">Propagate to other Libraries</button></div><div id="copyResults"></div>';
		target.id = "propagatorContainer";
		document.currentScript.parentNode.insertBefore(target, document.currentScript);
	}

	static async propagate() {
		this.reset();
		let url = propagator.checkURL();
		if (url) {
			const subdomain = url.split("/")[2].split(".")[0];
			let otherArray = ["bio", "biz", "chem", "eng", "geo", "human", "math", "med", "photon", "phys", "socialsci", "stats"];
			if (otherArray.includes(subdomain)) {
				let index = otherArray.indexOf(subdomain);
				if (index > -1) {
					otherArray.splice(index, 1);
					let path = url.split("/").slice(3).join("/");

					//Loader
					this.reset();
					for (let i = 0; i < otherArray.length; i++) {
						this.loader(otherArray[i], "Waiting for Content...");
					}

					//Get Contents
					let content = await propagator.getContent(subdomain, path);

					//Propagatate
					let promiseArray = [];
					this.reset();
					const authen = atob(document.getElementById("user").value + ":" + document.getElementById("password").value);
					for (let i = 0; i < otherArray.length; i++) {
						this.loader(otherArray[i], "Propagating...");
						promiseArray.push(propagator.propagatePage(otherArray[i], path, content, authen));
					}
					await Promise.all(promiseArray);

					// this.reset();
					for (let i = 0; i < otherArray.length; i++) {
						// this.loader(otherArray[i], "Complete!");
					}
				}
			}
		}
		else {
			alert("URL [" + url + "] is not valid!")
		}
	}

	static async getContent(subdomain, path) {
		let content = await fetch("https://" + subdomain + ".libretexts.org/@api/deki/pages/=" + encodeURIComponent(encodeURIComponent(path)) + "/contents?mode=raw");
		content = await content.text();
		content = content.match(/(?<=<body>)([\s\S]*?)(?=<\/body>)/)[1];
		return decodeHTML(content);

		function decodeHTML(content) {
			let ret = content.replace(/&gt;/g, '>');
			ret = ret.replace(/&lt;/g, '<');
			ret = ret.replace(/&quot;/g, '"');
			ret = ret.replace(/&apos;/g, "'");
			ret = ret.replace(/&amp;/g, '&');
			return ret;
		}
	}

	static async propagatePage(subdomain, path, content, authenticate) {
		this.loader(subdomain, content);

		let response = await fetch(subdomain + "/@api/deki/pages/=" + encodeURIComponent(encodeURIComponent(path + child.relativePath)) + "/contents", {
			method: "POST",
			body: content,
			headers: {"Authentication": "Basic "}
		});
	}

	static loader(subdomain, status) {
		let thing = document.createElement("div");
		thing.id = "results" + subdomain;
		thing.innerHTML = `<img src="https://static.libretexts.org/img/LibreTexts/glyphs_blue/${subdomain}.png"><div>${status}</div>`;
		document.getElementById("copyResults").appendChild(thing);
	}

	static checkURL() {
		let url = document.getElementById("copySource").value;
		if (url) {
			let urlArray = url.split("/");
			if (urlArray && urlArray.length >= 2 && urlArray[2].includes("libretexts.org")) {
				return url;
			}
		}
		return false;
	}

	static reset() {
		document.getElementById("copyResults").innerHTML = "";
	}
}

propagator.display();