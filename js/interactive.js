export function delay (time) {
	return new Promise ((resolve, reject)=> {
		setTimeout(()=> {
			resolve();
		}, time);
	});
}

export default class TestMath extends Object {
	#totalPointOfArithmetic = 200;
	#testIndex = 1;
	#dataOfUserActual = null;
	#isRunning = false;
	#instanceForConnect = null;
	#statusClick = false;
	#urlPrivate = "";
	#countTest = 0;
	
	get urlActual () { return this.#urlPrivate; }
	set urlActual (val) { this.#urlPrivate = val; }

	#getCookiesOfHere = async function (resolve, reject) {
		let cookiesMatriz = document.cookie.split("; ").filter(el=> el.length > 4),
			isProcessable = cookiesMatriz.length !== 0;

		const dataOfUser = {
			nameUser: null
		}

		if (isProcessable) {
			const verify = await window.fetch(window.location.origin, {
				method: "CHECKOUT",
				mode: "cors",
				headers: {
					"content-type": 'application/json'
				}
			});

			if(verify.status == 202) {
				this.objDataOfUser = await verify.text();
				resolve (isProcessable);
			}
			else resolve(!isProcessable);

		} else resolve(isProcessable);

	}
	welcomeToUser (userData) {
		let { $welcomeTemplate } = this;
		$welcomeTemplate.content.querySelector("i#registred-now").textContent = userData["name-user"];
		let welcomeInterface = document.importNode($welcomeTemplate.content, true);

		document.body.appendChild(welcomeInterface);
		setTimeout(()=> {
			let $section = document.querySelector("section.welcome-actual");
			$section.classList.remove("back");
		}, 1000);
	}
	closeWelcome ({ parentElement }) {
		parentElement.classList.add("back");
		setTimeout(()=> {
			parentElement.parentElement.removeChild(parentElement);
			this.viewInteractiveInterface();
		}, 1000);
	}
	viewPassword ($inputActual, $button) {
		$inputActual.setAttribute("type", "text");
		$button.textContent = "ocultar";
		$button.className = "hide";
	}
	hidePassword ($inputActual, $button) {
		$inputActual.setAttribute("type", "password");
		$button.textContent = "mostrar";
		$button.className = "view";
	}
	get imStarted () {
		return sessionStorage.getItem("statusInTMH");
	}
	set imStarted (value) {
		sessionStorage.setItem("statusInTMH", value);
	}
	get objDataOfUser () {
		return this.#dataOfUserActual;
	}
	set objDataOfUser (dataOfUser) {
		this.#dataOfUserActual = JSON.parse(dataOfUser);
	}
	get isStarted () {
		return new Promise (this.#getCookiesOfHere.bind(this)) ;
	}

	constructor ($forms, main, welcomeTemplate, templateForTypeInterface) {
		super();
		this.imported = document.importNode($forms.content, true);
		this.$loginer = this.imported.querySelector("form#loginer");
		this.$registrator = this.imported.querySelector("form#registrator");
		this.$main = main;
		this.$a = main.querySelector("a#nameVisible");
		this.$porcentArithmetic = main.querySelector("i#porcentArithmetic");
		this.$buttons = main.querySelectorAll("div#tests-ivocators button");
		this.$welcomeTemplate = welcomeTemplate;
		this.templateForTypeInterface = templateForTypeInterface;
	}
	viewInteractiveInterface () {
		this.$a.textContent = this.objDataOfUser["name-user"];
		let pointsTotalOfArithmetic = 0;

		for (let keyValue of this.objDataOfUser.arithmetic.split("; ")) {
			let value = keyValue.split("=")[1];
			pointsTotalOfArithmetic += Number.parseInt(value);
		}
		let pct = (pointsTotalOfArithmetic/this.#totalPointOfArithmetic * 100);
		
		this.$porcentArithmetic.textContent = `${pct}%`;

		if(pct < 48) this.$porcentArithmetic.className = "down";
		else if (pct < 79) this.$porcentArithmetic.className = "media";
		else if (pct < 96) this.$porcentArithmetic.className = "good";
		else if (pct == 100) this.$porcentArithmetic.className = "veryGood";
		else {}

		this.$buttons.forEach(el=> el.removeAttribute("disabled"));

		this.$main.classList.remove("hidden");
		if(this.imStarted !== "Running")
			this.imStarted = "Running";
		else {}
	}
	viewDialog (message, key) {
		let $dialog = document[key].querySelector("div#dialog");
		$dialog.innerHTML = `<button id="close-dialog" type='button'>x</button>${message}`;
		$dialog.classList.remove("not-visible");
	}
	closeDialog ($dialog) {
		$dialog.parentElement.classList.add("not-visible");
		$dialog.parentElement.innerHTML = "";
	}
	viewLgInterface () {
		let { $loginer, $registrator } = this;

		if(Array.from(document.body.children).indexOf($registrator) !== -1) {
			document.body.removeChild($registrator);
		}
		else {}
		document.body.appendChild($loginer);

	}
	viewRgInterface () {
		let { $registrator, $loginer } = this;
	
		if(Array.from(document.body.children).indexOf($loginer) !== -1)  {
			document.body.removeChild($loginer);
		}
		else {}
		document.body.appendChild($registrator);
	}
	validator (formActual) {
		let {name, password, conditions } = formActual;
		let templateOfName = /^[a-z]{1}(\w|\-){2,}\w$/i,
		isViolation = name.value.indexOf("--") !== -1;
		
		if(name.value.length >= 45) return `Su nombre es demaciado largo, su longitud debe de ser igual o menor que 44 caracteres, escriba su nombre de forma mas corta. Longitud de caracteres actual: ${name.value.length}`;

		else if(isViolation) return `Su nombre no puede contener mas de 2 "-", Analízelo: "${name.value}"`;

		else if(!templateOfName.test(name.value))
				return `Su nombre debe de comenzar con una letra, puede contener números y letras los siguientes. También puede separár mediante "-" (El guión será convertido en espacio de separación). Están prohibidos los espacios y otros caracteres especiales: +,=,:,;"...`;
		
		else if ( !(password.value.length >= 4 && password.value.length <= 80) )
				return `Su contraseña debe de cumplir con lo siguiente: la longitud de caracteres debe de ser mayor o igual a 4 y menor o igual a 80`;
		else if(conditions) {
			if (!conditions.checked)
				return `Para registrarse bebe de acceptar los términos y condiciones del uso de ese sitio, ¡Acepte para registrarse!`;
		}

		return false;

	}
	async setStatus () {
		// second main execution
		try {
			if(this.#isRunning) {
				return this.#instanceForConnect = await fetch(`${window.location.origin}/runningTest`, {
					method: 'patch',
					mode: 'cors',
					headers: {Accept: "/"}
				});
			}
			else {
				return this.#instanceForConnect.body.cancel();
			}
		}
		catch (error) {}
	}
	testInterface (obj, isFirst) {
		let $fragment = document.createDocumentFragment(),
		$interfaceImported = null;

		if(obj.typeTest == "EPR") {
			// verry good
			$interfaceImported = document.importNode(this.templateForTypeInterface.content.querySelector("div.i-epr"), true);
			$interfaceImported.querySelector("p.in-e").textContent = obj.explication;
			$interfaceImported.querySelector("p.in-p").textContent = obj.query;
			$interfaceImported.querySelector("div.in-r label").textContent = obj.entid;
		}
		else if(obj.typeTest == "CR") {
			// verry good
			$interfaceImported = document.importNode(this.templateForTypeInterface.content.querySelector("div.i-cr"), true);
			$interfaceImported.querySelector("p.in-e").textContent = obj.explication;
			$interfaceImported.querySelector("p.in-exp").textContent = obj.expantion;
			$interfaceImported.querySelector("div.in-r label").textContent = obj.petition;
		}
		else if(obj.typeTest == "PA") {
			// verry good
			$interfaceImported = document.importNode(this.templateForTypeInterface.content.querySelector("div.i-pa"), true);
			$interfaceImported.querySelector("p.in-e").textContent = obj.explication;
			$interfaceImported.querySelector("p.in-exp").textContent = obj.progresion;
			$interfaceImported.querySelector("div.in-r label").textContent = obj.toEqual;
		}
		else if(obj.typeTest == "OA") {
			// verry good
			$interfaceImported = document.importNode(this.templateForTypeInterface.content.querySelector("div.i-oa"), true);
			$interfaceImported.querySelector("div.in-r label").textContent = obj.operation;
		}
		else
			alert("Es requerido otro tipo de interfaz para que funcione");

		if (isFirst && $interfaceImported)
			$interfaceImported.classList.remove("opacy");
		else ;

		$fragment.appendChild($interfaceImported);

		if(isFirst) {
			let $execs = document.importNode( this.templateForTypeInterface.content.querySelector("div.execs"), true );
			$fragment.appendChild($execs);
		}
		else {}

		return $fragment;
	}
	async thinHandler (evArg) {
		if (this.#statusClick) return ;

		else if (evArg.target.matches("button#stop-test")) {
			this.#statusClick = true;
			let $mainSection = evArg.target.closest("section#r-test");
			$mainSection.classList.add("down");
			await delay(410);
			$mainSection.parentElement
			.removeChild($mainSection);
			this.#isRunning = false;
			this.setStatus();
			await delay(100);
			window.location.reload();
		}
		else if (evArg.target.matches("button#send-response")) {
			this.#statusClick = true;

			let $mainSection = evArg.target.closest("section#r-test"),
				$mainInterface = $mainSection.querySelector("div[data-main=\"true\"]"),
				$calify = $mainSection.querySelector("i#calify"),
				$testMonitor = $mainSection.querySelector("i#count"),
				$resp = $mainSection.querySelector("input#resp"),
				$viewError = $mainSection.querySelector("p#viewWarn");

			if($resp.value.length >= 1) {
				const nextTest = await fetch(this.urlActual, {
					method: 'PUT',
					mode: 'cors',
					headers: {'Content-type': "application/json", Accept: "application/json"},
					body: JSON.stringify({value: $resp.value, testIndex: ++this.#testIndex})
				});

				if (nextTest.status == 200 && nextTest.statusText == 'end-test') {
					const { assertBefore } = await nextTest.json();

					if (assertBefore) {
						$calify.textContent = "¡Correcto!";
						$calify.className = "correct";
					} else {
						$calify.textContent = "¡Incorrecto!";
						$calify.className = "not-correct";
					}

					await delay(3000);

					$mainSection.classList.add("down");
					await delay(410);
					$mainSection.parentElement
					.removeChild($mainSection);
					this.#isRunning = false;
					this.setStatus();
					await delay(100);
					window.location.reload();
				}
				else if (nextTest.status == 200) {
					const testActual = await nextTest.json();

					if (testActual.assertBefore) {
						$calify.textContent = "¡Correcto!";
						$calify.className = "correct";
					} else {
						$calify.textContent = "¡Incorrecto!";
						$calify.className = "not-correct";
					}
					
					await delay(3000);

					$calify.className = "";
					$calify.textContent = "";
					$testMonitor.textContent = `${this.#testIndex}/${this.#countTest}`;
					$mainSection.removeChild($mainInterface);
					$mainSection.appendChild(this.testInterface(testActual));

					$mainInterface = $mainSection.querySelector("div[data-main=\"true\"]");

					await delay(50);
					$mainInterface.classList.remove("opacy");

				}
				else {}
			}
			else $viewError.classList.remove("hide");

			this.#statusClick = false;
		}
	}
	async nextTest (testActual) {
		return new Promise ((resolve, reject)=> {
			console.log();
		});
	}
	async runningTest (typeTest) {
		// first execution
		this.#isRunning = true;
		const loadFirstTest = await fetch(this.urlActual = `${window.location.origin}/${typeTest}`, {
				method: 'GET',
				mode: 'cors',
				headers: {Accept: "application/json"},
			});

		if(loadFirstTest.status === 200) {
			let firstTest = await loadFirstTest.json();
			this.setStatus();
			await delay(100);
			let $mainSection = document.createElement("section");
			$mainSection.id = "r-test";
			$mainSection.className = "down";
			$mainSection.innerHTML = `<h3>Prueba <i id="count">${this.#testIndex}/${this.#countTest = firstTest.countTest}</i> <i id="calify"></i></h3>`;
			
			$mainSection.appendChild( this.testInterface( firstTest, true ) );

			document.body.appendChild($mainSection);

			$mainSection = document.body.querySelector("section#r-test");
			await delay(50);
			$mainSection.classList.remove("down");

			$mainSection.onclick = this.thinHandler.bind(this);
		}
		else {
			this.#isRunning = false;
			alert(`the test ${typeTest} Not Found!`);
		}
	}
	static async Main (evArg) {
		const testMTH = new TestMath(
			document.getElementById("@forms"),
			document.getElementById("interface-v"),
			document.getElementById("@welcomeToUser"),
			document.getElementById("@typeInterfaceForTest")
		);

		if (await testMTH.isStarted) testMTH.viewInteractiveInterface();
		else {
			if(testMTH.imStarted == "Running") alert("Su tiempo de sessión ya ha expirado, Inicie sesión nuevamente");
			else {}
			testMTH.viewLgInterface();
		} 
		// event handlers...
		document.addEventListener("click", testMTH.handlerClick.bind(testMTH), {once: false, capure: false});
		document.addEventListener("submit", testMTH.handlerSubmit.bind(testMTH), {once: false, capure: false});

	}

	handlerClick (evArg) {
		if(evArg.target.matches("#loginer #btregistry")) this.viewRgInterface();

		else if(evArg.target.matches("#registrator #btstart")) this.viewLgInterface();

		else if(evArg.target.matches("#close-dialog")) this.closeDialog(evArg.target);

		else if (evArg.target.matches("#close-wel")) this.closeWelcome(evArg.target.parentElement);

		else if (evArg.target.matches("div.box-password button.view")) this.viewPassword(evArg.target.previousElementSibling, evArg.target);

		else if (evArg.target.matches("div.box-password button.hide")) this.hidePassword(evArg.target.previousElementSibling, evArg.target);

		else if(evArg.target.matches("div#tests-ivocators button")) {
			if(!this.#isRunning) this.runningTest(evArg.target.id);
		}
	}

	handlerSubmit (evArg) {
		if(evArg.target.matches("#loginer") || evArg.target.matches("#registrator")) {
			evArg.preventDefault();
			let posibleError = this.validator(evArg.target);
			
			if(posibleError) {
				this.viewDialog(posibleError, evArg.target.getAttribute("name"));
			}
			else if (evArg.target.id == "loginer") this.login(evArg.target);

			else if (evArg.target.id == "registrator") this.registry(evArg.target);

			else {}
		}
	}

	async login ($form) {
		const momentInMilliSeconds = Date.now();
		let dataForSend = {
			"name-user": $form.name.value,
			password: $form.password.value,
			momentInMilliSeconds
		}
		const dataOfLogin = await fetch($form.action, {
			method: 'checkout',
			mode: "cors",
			headers: {
				"content-type": "application/json; charset=utf-8"
			},
			body: JSON.stringify(dataForSend)
		});
		if (dataOfLogin.status == 202) {
			let dataForProcess = await dataOfLogin.json();

			document.cookie = `credentialOfUserInCodeTMH=${dataForProcess.code}; max-age=${dataForProcess.endMilliSeconds}; path=/; samesite=strict; domain=${window.location.host}`;
			document.cookie = `startedTMH=${momentInMilliSeconds}; max-age=${dataForProcess.endMilliSeconds}; path=/; samesite=strict; domain=${window.location.host}`;
			delete dataForProcess.code;

			this.objDataOfUser = JSON.stringify(dataForProcess);

			$form.parentElement.removeChild($form);

			setTimeout(()=> this.viewInteractiveInterface(), 2000);
		}
		else this.viewDialog(await dataOfLogin.text(), $form.getAttribute("name"));
	}
	async registry ($form) {
		const momentInMilliSeconds = Date.now();
		let dataForSend = {
			"name-user": $form.name.value,
			password: $form.password.value,
			accept: $form.conditions.checked,
			momentInMilliSeconds
		}

		const dataOfRegistry = await fetch($form.action, {
			method: $form.method,
			mode: "cors",
			headers: {
				"content-type": "application/json"
			},
			body: JSON.stringify(dataForSend)
		});

		if (dataOfRegistry.status == 419) {
			let oneMessage = await dataOfRegistry.text();
			this.viewDialog(oneMessage, $form.getAttribute("name"));	
		}
		else {
			let dataForProcess = await dataOfRegistry.json();

			document.cookie = `credentialOfUserInCodeTMH=${dataForProcess.code}; max-age=${dataForProcess.endMilliSeconds}; path=/; samesite=strict; domain=${window.location.host}`;
			document.cookie = `startedTMH=${momentInMilliSeconds}; max-age=${dataForProcess.endMilliSeconds}; path=/; samesite=strict; domain=${window.location.host}`;
			delete dataForProcess.code;

			this.objDataOfUser = JSON.stringify(dataForProcess);

			$form.parentElement.removeChild($form);

			this.welcomeToUser(dataForProcess);
		}
	}
}
if(document.title == "Test Math")
	window.addEventListener("DOMContentLoaded", TestMath.Main, {
	once: true,
	capure: true
});