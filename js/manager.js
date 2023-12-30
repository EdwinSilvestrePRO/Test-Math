import TestMath, { delay } from '/interactive.js';

class PerfilManager extends TestMath {
	#days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
	#months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
	#isProcessing = false;
	#objectForEdit = null;
	#statusSubmit = false;
	#interfaceForQuery = function (resolve, reject) {
		this.CONTEXT.templateForQuery.content.querySelector("p#query").innerHTML = this.message;
		document.body.appendChild( document.importNode(this.CONTEXT.templateForQuery.content, true) );

		let $query = document.querySelector("div.c-query");
		$query.onclick = evArg => {
			if (evArg.target.matches('button#omit')) {
				$query.classList.add('toLeft');
				setTimeout(()=> {
					$query.parentElement.removeChild($query);
					resolve(false);
				}, 310);
			}
			else if (evArg.target.matches('button#confirm-close')) {
				$query.classList.add('toLeft');
				setTimeout(()=> {
					$query.parentElement.removeChild($query);
					resolve(true);
				}, 310);
			}
			else {}
		}
		setTimeout(()=> $query.classList.remove('toLeft'), 10);
	}
	constructor (student, elementOfDate, points, access, templateForEdit, templateForQuery) {
		// satisface TestMath...
		super(document.createElement("template"), document.createElement("main"), null);
		// more data...
		this.student = student;
		this.elementOfDate = elementOfDate;
		this.points = points;
		this.$access = access;
		this.templateForEdit = templateForEdit;
		this.templateForQuery = templateForQuery;
	}
	getClock (dateActual) {
		let [hours, minutes, seconds, meridiem ] = [dateActual.getHours(), dateActual.getMinutes(), dateActual.getSeconds(), "Am" ];
		if(hours > 12) {
			hours = hours - 12;
			meridiem = "Pm";
		}
		else {
			hours = hours;
			meridiem = "Am";
		}
		return `${hours}:${minutes}:${seconds} ${meridiem}`;
	}
	async sendMessage ($message) {
		let pattern = /[a-z]{4,}/i,
			top = Math.abs(document.body.parentElement.getBoundingClientRect().y);

		this.#isProcessing = true;
		if(pattern.test($message.value)) {
			window.scroll({
				left: 0,
				top: 0,
				behavior: 'smooth'
			});

			let authorization = await this.verifyOfAccess();

			if($message.value.length >= 40001) {
				window.scroll({
					left: 0,
					top,
					behavior: 'smooth'
				});
				$message.previousElementSibling.textContent = `Demaciado extenso, el límite es de 40000 caracteres y usted ya ha insertado ${$message.value.length} caracteres.`;
				$message.previousElementSibling.classList.remove('notVisible');
				await delay(5000);
				$message.previousElementSibling.classList.add('notVisible');
				$message.previousElementSibling.textContent = "";
			}
			else if(authorization) {
				window.scroll({
					left: 0,
					top,
					behavior: 'smooth'
				});
				authorization.message = $message.value;

				const responseOfSend = await fetch(window.location.href, {
					method: 'post',
					mode: 'cors',
					headers: {Connection: "close"},
					body: JSON.stringify(authorization)
				});
				if (responseOfSend.status == 205) {
					$message.value = "¡Mensaje enviado exitosamente!";
					$message.classList.add('sended');
					await delay(3000);
					$message.classList.remove('sended');
					$message.value = "";
				}
				else {
					$message.previousElementSibling.textContent = responseOfSend.statusText;
					$message.previousElementSibling.classList.remove('notVisible');
					await delay(3000);
					$message.previousElementSibling.classList.add('notVisible');
					$message.previousElementSibling.textContent = "";
				}
			}
		}
		else {
			$message.previousElementSibling.textContent = "Para eviarlo se necesita contenido válido";
			$message.previousElementSibling.classList.remove('notVisible');
			await delay(3000);
			$message.previousElementSibling.classList.add('notVisible');
			$message.previousElementSibling.textContent = "";
		}
		this.#isProcessing = false;
	}
	viewPerfilInterface (dataOfUser) {
		this.student.textContent = dataOfUser["name-user"];
		let dateOfRegistry = new Date(dataOfUser.dateOfRegistry);
		let dateInString = `${ this.#days[dateOfRegistry.getDay()] }, ${dateOfRegistry.getDate()} de ${this.#months[dateOfRegistry.getMonth()]} del año ${dateOfRegistry.getFullYear()} a las ${this.getClock(dateOfRegistry)}`;
		this.elementOfDate.textContent = dateInString;

		let contentButtonForReset = document.createElement("div");
		contentButtonForReset.className = "c-button";
		contentButtonForReset.innerHTML = `<button id="reset">Reiniciar</button>`;

		const $fragment = document.createDocumentFragment();

		const relationWithArithmetic = [
			{name: 'adition', value: 'Suma'},
			{name: 'sustraction', value: 'Resta'},
			{name: 'multiplication', value: 'Multiplicación'},
			{name: 'division', value: 'División'},
			{name: 'arithmetic-operations', value: "Oper. Combinadas"}
		];
		dataOfUser.arithmetic.split("; ").forEach(element=> {
			let [key, point] = element.split("=");
			for (let {name, value} of relationWithArithmetic) {
				if(key == name) {
					let $p = document.createElement('p');
					$p.innerHTML = `${value}: <i>${point} puntos</i>`;
					$fragment.appendChild($p);
				} else {}
			}
		});
		$fragment.appendChild(contentButtonForReset);
		this.points.innerHTML = `<h2>Puntuaciones actuales en Aritmética:</h2>`;
		this.points.appendChild($fragment);
		setTimeout(()=> this.points.parentElement.classList.remove("hide"), 100);
	}
	async closeSession () {
		window.scroll({
			left: 0,
			top: 0,
			behavior: 'smooth'
		});
		this.#isProcessing = true;

		let isForClose = await new Promise(this.#interfaceForQuery.bind({
			CONTEXT: this,
			message: `¿Desea serrar sesión <strong>${this.objDataOfUser['name-user']}</strong>?`
		}));

		if (isForClose) {
			document.cookie = `credentialOfUserInCodeTMH=0; max-age=0; path=/; samesite=strict; domain=${window.location.host}`;
			document.cookie = `startedTMH=0; max-age=0; path=/; samesite=strict; domain=${window.location.host}`;
			sessionStorage.removeItem('statusInTMH');
			setTimeout(()=> window.location.reload(), 100);
		}
		else {}
		this.#isProcessing = false;
	}
	verifyOfAccess () {
		return new Promise((resolve, reject)=> {
			let nodeActual = document.importNode(this.$access.content, true);
			document.body.appendChild(nodeActual);
			
			setTimeout(()=> {
				let $formForAccess = document.querySelector("form.c-interfaceForAccess");
				$formForAccess.querySelector("i#n-userVisible").textContent = this.objDataOfUser["name-user"];

				$formForAccess.classList.remove("hide");
				const CONTEXT = this;
				let $message = $formForAccess.querySelector("div#message"),
					$cancellAccess = $formForAccess.querySelector("button#cancell-access");

					$cancellAccess.onclick = evArg => {
						this.cancellAccess(evArg.target.form);
						resolve(false);
					}

				$message.onanimationend = function () {
					this.textContent = "";
					this.classList.add("notVisible");
				}
				$formForAccess.onsubmit = function (evArg) {
					evArg.preventDefault();
					// if ( !(this. >= 4 && password.value.length <= 80) )
					if (this.password.value.length <= 4) {
						$message.textContent = "Demaciada corta para enviar, ¡escríbe la correcta!";
						$message.classList.remove("notVisible");
					}
					else if (this.password.value.length >= 80) {
						$message.textContent = "Demaciada larga para enviar, ¡escríbe la correcta!";
						$message.classList.remove("notVisible");
					}
					else {
						window.fetch(this.action, {
							method: 'checkout',
							headers: {
								"connection": "close",
								"content-type": "application/json"
							},
							body: JSON.stringify({
								password: this.password.value
							})
						})
						.then(response=> {
							if (response.status == 202) return response.json();
							else return response.text();
						})
						.then (obj=> {
							if(typeof obj == "object") {
								resolve(obj);
								CONTEXT.cancellAccess($cancellAccess.form);
							}
							else {
								$message.textContent = obj;
								$message.classList.remove("notVisible");
							}
						})
						.catch(error=> {
							$message.textContent = error.message;
							$message.classList.remove("notVisible");
						});
					}
				}
			}, 0);

		});
	}
	cancellAccess ($form) {
		$form.classList.add("hide");
		setTimeout(()=> {
			$form.parentElement.removeChild($form);
		}, 360);
	}
	async thinHandler (evArg) {
		if(evArg.type == "submit") {
			this.#statusSubmit = true;
			evArg.preventDefault();
			let posibleError = this.validator(evArg.target);
			if(posibleError) {
				let $dialog = evArg.target.querySelector("div#dialog2");
				$dialog.textContent = posibleError;
				$dialog.className = "";
			}
			else if (this.#objectForEdit['name-user'] == evArg.target.name.value && evArg.target.password.value == this.#objectForEdit.password) {
				this.#statusSubmit = false;
				let $dialog = evArg.target.querySelector("div#dialog2");
				$dialog.textContent = "¡Ya está Guardado!";
				$dialog.className = "";
			}
			else {
				let newData = {
					'name-user': evArg.target.name.value,
					password: evArg.target.password.value
				}
				let updateOfServer = await window.fetch(evArg.target.action, {
					method: 'post',
					mode: 'cors',
					headers: {
						"content-type": "application/json",
						"accept": "application/json",
						"connection": 'close'
					},
					body: JSON.stringify(newData)
				});
				if(updateOfServer.status == 202) {
					this.#objectForEdit = await updateOfServer.json();
					let $dialog = evArg.target.querySelector("div#dialog2");
					$dialog.textContent = "¡Guardado!";
					$dialog.className = "";
				}
				else {
					let $dialog = evArg.target.querySelector("div#dialog2");
					$dialog.textContent = await updateOfServer.text();
					$dialog.className = "";
				}
				this.#statusSubmit = false;
			}
		}
		else if (evArg.type == "animationend" && evArg.target.matches("div#dialog2")) {
			evArg.target.textContent = "";
			evArg.target.className = "hide";
		}
		else if(evArg.type == 'click' && evArg.target.matches("button#close-setting") && !this.#statusSubmit) {
			const $formForEdition = document.getElementById("editDataToUser");
			$formForEdition.classList.add("toLeft");
			await delay(500);
			$formForEdition.parentElement.removeChild($formForEdition);
			this.#isProcessing = false;
			this.objDataOfUser['name-user'] = this.#objectForEdit['name-user'];
			this.viewPerfilInterface(this.objDataOfUser);
			this.#objectForEdit = null;
		}
		else {}
	}
	async editDataOfUser () {
		this.#isProcessing = true;
		window.scroll({
			left: 0,
			top: 0,
			behavior: 'smooth'
		});
		this.#objectForEdit = await this.verifyOfAccess();
		if (this.#objectForEdit) {
			let frm = document.importNode( this.templateForEdit.content, true );
			document.body.appendChild(frm);
			const $formForEdition = document.getElementById("editDataToUser");
			$formForEdition.name.value = this.#objectForEdit['name-user'];
			$formForEdition.password.value = this.#objectForEdit.password;
			$formForEdition.onsubmit = this.thinHandler.bind(this);
			$formForEdition.onclick = this.thinHandler.bind(this);
			$formForEdition.onanimationend = this.thinHandler.bind(this);

			await delay(500);
			$formForEdition.classList.remove("toLeft");
		}
		else this.#isProcessing = false;
	}
	async resetPoints () {
		this.#isProcessing = true;
		window.scroll({
			left: 0,
			top: 0,
			behavior: 'smooth'
		});
		const authorization = await this.verifyOfAccess();
		if (authorization) {
			let isAccept = await new Promise(this.#interfaceForQuery.bind({
				CONTEXT: this,
				message: `¿Desea usted <strong>${authorization['name-user']}</strong> reiniciar las puntuaciones?`
			}));

			 if (isAccept) {
				let resetResponse = await fetch(window.location.href, {
					method: 'put',
					mode: 'cors',
					headers: {}
				});
				
				if (resetResponse.status == 208) {
					this.objDataOfUser.arithmetic = await resetResponse.text();

					this.viewPerfilInterface(this.objDataOfUser);
				}
				else
					alert(await resetResponse.text());
			}
			else {}
		}

		this.#isProcessing = false;
	}
	async deleteAccount () {
		this.#isProcessing = true;
		window.scroll({
			left: 0,
			top: 0,
			behavior: 'smooth'
		});
		const authorization = await this.verifyOfAccess();

		if (authorization) {
			let isAccept = await new Promise(this.#interfaceForQuery.bind({
				CONTEXT: this,
				message: `¿Desea usted <strong>${authorization['name-user']}</strong> eliminar su cuenta de <strong>Test Math</strong>?`
			}));

			if (isAccept) {
				let confirmDelete = await fetch(window.location.href, {
					method: 'DELETE',
					mode: 'cors',
					headers: {}
				});
				if (confirmDelete.status == 205) {
					document.cookie = `credentialOfUserInCodeTMH=0; max-age=0; path=/; samesite=strict; domain=${window.location.host}`;
					document.cookie = `startedTMH=0; max-age=0; path=/; samesite=strict; domain=${window.location.host}`;
					sessionStorage.removeItem('statusInTMH');

					alert(`Su cuenta ya ha sido eliminada de Test Math ${authorization['name-user']}.`);

					setTimeout(()=> window.location.reload(), 100);
				}
				else {
					alert(`Su cuenta no se ha eliminado ${authorization['name-user']} porque se ha expirado su tiempo, inicie sesión para tener acceso a eliminarlo.`);
					window.location.reload();
				}
			}
			else {}
		}

		this.#isProcessing = false;
	}
	viewPassword($input, $button)  {
		$input.setAttribute("type", "text");
		$button.textContent = "ocultar";
		$button.className = "hide";
	}
	hidePassword($input, $button)  {
		$input.setAttribute("type", "password");
		$button.textContent = "mostrar";
		$button.className = "view";
	}
	static async Main (evArg) {
		const perfilManager = new PerfilManager(
			document.querySelector("main.container i#student"),
			document.querySelector("main.container i#dateOfRegistry"),
			document.getElementById("points"),
			document.getElementById("@access"),
			document.getElementById('@editData'),
			document.getElementById('@queries')
		);
		
		if (await perfilManager.isStarted) perfilManager.viewPerfilInterface(perfilManager.objDataOfUser);
		else {
			if(perfilManager.imStarted == "Running") {
				alert("Su tiempo de sessión ya ha expirado, Inicie sesión nuevamente");
			}
			else {}
			window.location.href = window.location.origin;
		}
		// Handler event click
		document.addEventListener("click", perfilManager.handlerEventClick.bind(perfilManager), {
			once: false,
			capture: true
		});

		document.getElementById("return-home")
		.addEventListener("click", ()=> window.location.href = window.location.origin, {
			once: true,
			capture: true
		});
		document.addEventListener("submit", perfilManager.handlerEventSubmit.bind(perfilManager), {once: false, capture: true});
	}
	handlerEventClick (evArg) {
		if (evArg.target.matches("div.c-button button#close-session")) {
			if(!this.#isProcessing) this.closeSession();
		}
		else if (evArg.target.matches("div.c-button button#edit")) {
			if(!this.#isProcessing) this.editDataOfUser();
		}
		else if (evArg.target.matches("div.c-button button#delete-account")) {
			if(!this.#isProcessing) this.deleteAccount();
		}
		else if (evArg.target.matches("article#points button#reset")) {
			if(!this.#isProcessing) this.resetPoints();
		}
		else if(evArg.target.matches("div.box-password button.view")) this.viewPassword(evArg.target.previousElementSibling, evArg.target);
		else if(evArg.target.matches("div.box-password button.hide")) this.hidePassword(evArg.target.previousElementSibling, evArg.target);
	}
	handlerEventSubmit (evArg) {
		if(evArg.target.matches('form.c-message')) {
			evArg.preventDefault();
			if(!this.#isProcessing) this.sendMessage(evArg.target.message);
		}
	}
}

window.addEventListener("DOMContentLoaded", PerfilManager.Main, {
	once: true,
	capure: true
});