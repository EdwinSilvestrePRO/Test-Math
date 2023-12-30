import net from 'node:net';
import http from 'node:http';
import { Buffer } from 'node:buffer';
import anully from 'anully';
import { createReadStream, createWriteStream } from 'node:fs';

function delay (time) {
	return new Promise ((resolve, reject)=> {
		setTimeout(()=> {
			resolve();
		}, time);
	});
}

process.title = "Test Math (Server)";

let responsesActual = new Map();
const posibleTests = ["/adition", "/sustraction", "/multiplication", "/division", "/arithmetic-operations"];

function isUser (credentials) {
	return new Promise((resolve, reject)=> {
		// Bloque para comprobar si el usuario que realiza la prueba es válido:
		const streamUsers = createReadStream("./serverData/usersTMH.json");
		let code = credentials.credentialOfUserInCodeTMH,
			{ startedTMH } = credentials;

		let isAdyacent = false;
		
		let buildObj = "";
		let open = false;
		let closed = false;

		streamUsers.on("data", bufData => {
			let arrActual = bufData.toString('utf-8').split("");
				for (let charActual of arrActual) {
					if(charActual == "{")
						open = true;
						else if (charActual == "}") 
							closed = true;
						else {}

					if(open) {
						buildObj+= charActual;
						if(closed) {
							open = false;
							closed = false;
							let userActual = JSON.parse(buildObj);

							if (userActual.timeOfRegistryOfMilliSeconds.toString() == startedTMH.toString() && code == userActual.code) {
								isAdyacent = true;
								streamUsers.destroy();
								break;
							}
							else {}
							buildObj = "";
						}
					}

				}
			})
			.on('error', console.error)
			.on('close', ()=> resolve(isAdyacent));
	});
}
function nega (socket) {
	const $negaContent = createReadStream ("./nega.htm");
	socket.write(
		"HTTP/1.1 406 Not Acceptable\r\n" +
		"Content-type: text/html; carset=utf-8\r\n" +
		"Connection: close\r\n" +
		"Server: N-S\r\n\r\n"
	);
	$negaContent.pipe(socket);
}
function validatorData (formActual) {
	return new Promise((resolve, reject)=> {
		try {
			let { name, password, condition } = formActual;
			let templateOfName = /^[a-z]{1}(\w|\-){2,}\w$/i,
			isViolation = name.indexOf("--") !== -1;
				
			if(name >= 45) resolve(`Su nombre es demaciado largo, su longitud debe de ser igual o menor que 44 caracteres, escriba su nombre de forma mas corta. Longitud de caracteres actual: ${name.length}`);

			else if(isViolation) resolve(`Su nombre no puede contener mas de 2 "-", Analízelo: "${name.value}"`);

			else if(!templateOfName.test(name))
				resolve(`Su nombre debe de comenzar con una letra, puede contener números y letras los siguientes. También puede separár mediante "-" (El guión será convertido en espacio de separación). Están prohibidos los espacios y otros caracteres especiales: +,=,:,;"...`);
				
			else if ( !(password.length >= 4 && password.length <= 80) )
				resolve(`Su contraseña debe de cumplir con lo siguiente: la longitud de caracteres debe de ser mayor o igual a 4 y menor o igual a 80`);

			else if(condition !== true && condition !== "true")
				resolve(`Para registrarse bebe de acceptar los términos y condiciones del uso de ese sitio, ¡Acepte para registrarse!`);
			else {
				// Bloque para comprobar si el usuario existe:
					const streamUsers = createReadStream("./serverData/usersTMH.json");
					let isAdyacent = false;
								let buildObj = "";
								let open = false;
								let closed = false;

								streamUsers.on("data", bufData => {

									let arrActual = bufData.toString('utf-8').split("");
									for (let charActual of arrActual) {
										if(charActual == "{")
											open = true;
										else if (charActual == "}") 
											closed = true;
										else {}

										if(open) {
											buildObj+= charActual;
											if(closed) {
												open = false;
												closed = false;
												let userActual = JSON.parse(buildObj);

												if (userActual["name-user"] == name) {
													isAdyacent = true;
													streamUsers.destroy();
													break;
												}
												else {}

												buildObj = "";
											}
										}

									}
								})
								.on('error', console.error)
								.on('close', ()=> {
									if (isAdyacent)
										resolve(`Ya está registrado el usuario "${name}", use un nombre de usuario diferente para registrarse o inicie sesión como "${name}"`);
									
									else resolve(false);

								});
			}
		} catch (error) {
			resolve(error.message);
		}
	});
}
function isExistName (informations) {
	return new Promise((resolve, reject)=> {
		// Bloque para comprobar si el nombre de usuario existe:
		const streamUsers = createReadStream("./serverData/usersTMH.json");
		let [code, name] = [informations.credentialOfUserInCodeTMH, informations['name-user']];

		let isAdyacent = false;
		
		let buildObj = "";
		let open = false;
		let closed = false;

		streamUsers.on("data", bufData => {
			let arrActual = bufData.toString('utf-8').split("");
				for (let charActual of arrActual) {
					if(charActual == "{")
						open = true;
						else if (charActual == "}") 
							closed = true;
						else {}

					if(open) {
						buildObj+= charActual;
						if(closed) {
							open = false;
							closed = false;
							let userActual = JSON.parse(buildObj);

							if (userActual["name-user"] == name && code !== userActual.code) {
								isAdyacent = true;
								streamUsers.destroy();
								break;
							}
							else {}
							buildObj = "";
						}
					}

				}
			})
			.on('error', console.error)
			.on('close', ()=> resolve(isAdyacent));
	});
}
function isValidData (obRequestActual, context) {
	try {
		if(context == 'login' || context == 'registry') {
			JSON.parse(obRequestActual.body);		
		} else {}

		if(context == "verify") {
			if (obRequestActual.headers.cookie.split("; ").length < 1) throw null;
		}
		if(context == "verify-v2") {
			if (obRequestActual.headers.cookie.split("; ").length < 1) throw null;
			else JSON.parse(obRequestActual.body);	
		}
		return true;
	}
	catch (error) {
		return false;
	}
}

function generateCode () {
	let codeGenerated = "";
	let letters = [];
	for (let i = 97; i <= 122; i++)
		letters.push( Math.ceil(Math.random()*777)%2 == 0? String.fromCharCode(i) : String.fromCharCode(i).toUpperCase());

		let arrTime = [];

		let index = Math.ceil(Math.random()*(letters.length-1));

		for (let posArr = 0; posArr <= 25; posArr++) {
			let lastEl = arrTime.pop();
			if(lastEl)
				codeGenerated+= lastEl+letters[index];
			else
				codeGenerated+= Math.ceil(Math.random()*9)+letters[index];

			index++;
			if(index < letters.length) {}
			else index = 0;
		}
	return codeGenerated;
}

async function handlerServer (socket) {
	try {
		await delay(50);
		socket.on('data', async function (dataArg) {
			const obRequest = anully(dataArg);
			if(obRequest) {
				switch (obRequest.method.toLowerCase()) {
					case 'get':
						{
							if(obRequest.path == '/') {
								let $home = createReadStream('./home.html');
								this.setEncoding('utf-8');
								this.setDefaultEncoding('utf-8');

								this.write(
									`${obRequest.htWithVersion} 200 ok\r\n` +
									"Content-type: text/html; charset=utf-8\r\n" +
									"Connection: close\r\n" +
									"Server: N-S\r\n\r\n"
								);
								$home.on('data', chunk=> this.write(chunk))
								.on('end', ()=> this.end());
							}
							else if (obRequest.path == '/terminos-condiciones.pdf') {
								let termnStream = createReadStream('./serverData/terms-conditions.pdf');
								this.write(
									`${obRequest.htWithVersion} 200 ok\r\n` +
									"Content-type: application/pdf\r\n" +
									"Connection: close\r\n" +
									"Server: N-S\r\n\r\n"
								);
								termnStream
								.on('data', chunk=> this.write(chunk))
								.on('end', ()=> this.end());
							}
							else if (obRequest.path == '/stetic.css') {
								let stetic = createReadStream('./css/stetic.css');
								this.setEncoding('utf-8');
								this.setDefaultEncoding('utf-8');

								this.write(
									`${obRequest.htWithVersion} 200 ok\r\n` +
									"Content-type: text/css; charset=utf-8\r\n" +
									"Connection: close\r\n" +
									"Server: N-S\r\n\r\n"
								);
								stetic.on('data', chunk=> this.write(chunk))
								.on('end', ()=> this.end());
							}
							else if (obRequest.path == '/styles-forms.css') {
								let stetic2 = createReadStream('./css/styles-forms.css');
								this.setEncoding('utf-8');
								this.setDefaultEncoding('utf-8');

								this.write(
									`${obRequest.htWithVersion} 200 ok\r\n` +
									"Content-type: text/css; charset=utf-8\r\n" +
									"Connection: close\r\n" +
									"Server: N-S\r\n\r\n"
								);
								stetic2.on('data', chunk=> this.write(chunk))
								.on('end', ()=> this.end());
							}
							else if (obRequest.path == '/interactive.js') {
								let interactive = createReadStream('./js/interactive.js');
								this.setEncoding('utf-8');
								this.setDefaultEncoding('utf-8');

								this.write(
									`${obRequest.htWithVersion} 200 ok\r\n` +
									"Content-type: application/javascript; charset=utf-8\r\n" +
									"Connection: close\r\n" +
									"Server: N-S\r\n\r\n"
								);
								interactive.on('data', chunk=> this.write(chunk))
								.on('end', ()=> this.end());
							}
							else if (obRequest.path == '/perfil/manager.js') {
								let manager = createReadStream('./js/manager.js');
								this.setEncoding('utf-8');
								this.setDefaultEncoding('utf-8');

								this.write(
									`${obRequest.htWithVersion} 200 ok\r\n` +
									"Content-type: application/javascript; charset=utf-8\r\n" +
									"Connection: close\r\n" +
									"Server: N-S\r\n\r\n"
								);
								manager.on('data', chunk=> this.write(chunk))
								.on('end', ()=> this.end());
							}
							else if(/favicon/i.test(obRequest.path)) {
								let icon = createReadStream('./favicon.png');
								this.write(
									`${obRequest.htWithVersion} 200 ok\r\n` +
									"Content-type: image/png\r\n" +
									"Connection: close\r\n" +
									"Server: N-S\r\n\r\n"
								);
								icon.on('data', chunk=> this.write(chunk))
								.on('end', ()=> this.end());
							}
							else if (obRequest.path == "/perfil") {
								let $perfil = createReadStream('./perfil.html');
								this.setEncoding('utf-8');
								this.setDefaultEncoding('utf-8');

								this.write(
									`${obRequest.htWithVersion} 200 ok\r\n` +
									"Content-type: text/html; charset=utf-8\r\n" +
									"Connection: close\r\n" +
									"Server: N-S\r\n\r\n"
								);
								$perfil.on('data', chunk=> this.write(chunk))
								.on('end', ()=> this.end());
							}
							else if (obRequest.path == "/perfil/perfilStyles.css") {
								let perfilStyles = createReadStream('./css/perfilStyles.css');
								this.setEncoding('utf-8');
								this.setDefaultEncoding('utf-8');

								this.write(
									`${obRequest.htWithVersion} 200 ok\r\n` +
									"Content-type: text/css; charset=utf-8\r\n" +
									"Connection: close\r\n" +
									"Server: N-S\r\n\r\n"
								);
								perfilStyles.on('data', chunk=> this.write(chunk))
								.on('end', ()=> this.end());	
							}
							else if(posibleTests.indexOf(obRequest.path) !== -1 && isValidData(obRequest, "verify")) {
								const testReference = obRequest.path;

								const credentials = {
									credentialOfUserInCodeTMH: null,
									startedTMH: null
								}
								obRequest.headers.cookie.split("; ").forEach(el=> {
									let [key, value] = el.split("=");
									credentials[key] = value;
								});

								let { credentialOfUserInCodeTMH } = credentials;
								const admition = await isUser(credentials);
								
								if (admition) {
									let isFirst = true;
									let countTest = 0;
									let testActual = null;

									const streamTest = createReadStream(`./tests${testReference}.json`);

									let buildObj = "";
									let open = false;
									let closed = false;

									streamTest.on("data", bufData => {
										let arrActual = bufData.toString('utf-8').split("");
										for (let charActual of arrActual) {
											if(charActual == "{")
												open = true;
											else if (charActual == "}") 
												closed = true;
											else {}

											if(open) {
												buildObj+= charActual;
												if(closed) {
													open = false;
													closed = false;
													
													if(isFirst) {
														testActual = JSON.parse(buildObj);

														responsesActual.set(credentialOfUserInCodeTMH, {forCompare: Number.parseInt(testActual.response), pointActual: 0 });
														delete testActual.response;

														// insertar, obtener y eliminar.
														this.write(
															`${obRequest.htWithVersion} 200 First\r\n` +
															"Content-type: application/json; charset=utf-8\r\n" +
															"Connection: close\r\n" +
															"Server: N-S\r\n\r\n"
														);
														isFirst = false;
													}
													else {}
													countTest++;
													buildObj = "";
												}
											}

										}
									})
									.on('error', console.error)
									.on('close', ()=> {
										testActual.countTest = countTest;
										this.write( JSON.stringify(testActual) );
										this.end();
									});
								}
								else nega(this);
							}
							else {
								this.write(
									`${obRequest.htWithVersion} 404 Not Found\r\n` +
									"Content-type: text/html; charset=utf-8\r\n" +
									"Connection: close\r\n" +
									"Server: N-S\r\n\r\n"
								);
								this.write(`<html>
									<head>
									<title>Direción inválida</title>
									<meta charset="utf-8" >
									</head>
									<body>
									<h1 style="text-align: center">La dirección <i style="color: red">${obRequest.path}</i> no es válida.</h1>
									</body>
									</html>`);
								this.end();
							}
						}
					break;
					case 'patch':
						{
							if(obRequest.path == "/runningTest" && isValidData(obRequest, "verify")) {
								const credentials = {
									credentialOfUserInCodeTMH: null,
									startedTMH: null
								}

								obRequest.headers.cookie.split("; ").forEach(el=> {
									let [key, value] = el.split("=");
									credentials[key] = value;
								});

								let { credentialOfUserInCodeTMH } = credentials;

								if ( responsesActual.has(credentialOfUserInCodeTMH) ) {
									this.write(
										`${obRequest.htWithVersion} 200 Inicialized\r\n` +
										"Connection: live\r\n" +
										"Server: N-S\r\n\r\n"
									);
									this.on("close", ()=> responsesActual.delete(credentialOfUserInCodeTMH) );
								}
								else nega(this);
							}
						}
					break;
					case 'checkout':
						{
							if (obRequest.path == '/' && isValidData(obRequest, "verify")) {
								const credentials = {
									credentialOfUserInCodeTMH: null,
									startedTMH: null
								},
									streamUsers = createReadStream("./serverData/usersTMH.json");

									let isRegistred = false;

								obRequest.headers.cookie.split("; ").forEach(el=> {
									let [key, value] = el.split("=");
									credentials[key] = value;
								});

								let { credentialOfUserInCodeTMH,  startedTMH } = credentials;
								
								let buildObj = "";
								let open = false;
								let closed = false;

								streamUsers.on("data", bufData => {

									let arrActual = bufData.toString('utf-8').split("");
									for (let charActual of arrActual) {
										if(charActual == "{")
											open = true;
										else if (charActual == "}") 
											closed = true;
										else {}

										if(open) {
											buildObj+= charActual;
											if(closed) {
												open = false;
												closed = false;
												let userActual = JSON.parse(buildObj);

												if (userActual.code == credentialOfUserInCodeTMH && Number.parseInt(userActual.timeOfRegistryOfMilliSeconds) == Number.parseInt(startedTMH)) {
													isRegistred = true;
													// Datos que envío al usuario registrado.
													let dataForSend = {
														"name-user": userActual["name-user"],
														dateOfRegistry: userActual.dateOfRegistry,
														endMilliSeconds: userActual.endMilliSeconds,
														arithmetic: userActual.arithmetic
													}

													this.write(
														`${obRequest.htWithVersion} 202 Acepted\r\n` +
														"Content-type: application/json; charset=utf8\r\n" +
														"Server: N-S\r\n" +
														"Connection: close\r\n\r\n"
													);
													this.write(JSON.stringify(dataForSend));
													streamUsers.destroy();
													break;
												}
												else {}

												buildObj = "";
											}
										}

									}
								})
								.on('error', console.error)
								.on('close', ()=> {
									if (!isRegistred) {
										this.write(
											`${obRequest.htWithVersion} 200 Missing-login\r\n` +
											"Content-type: text/txt; charset=utf-8\r\n" +
											"Server: N-S\r\n" +
											"Connection: close\r\n\r\n"
										);
										this.write("¡Hola, bienvenido testMath!");
										this.end();
									}
									else
										this.end();

								});
							} 
							else if (obRequest.path == '/login' && isValidData(obRequest, 'login')) {
								let isLogined = false;
								const userForAccess = JSON.parse( obRequest.body ),
									streamUsers = createReadStream("./serverData/usersTMH.json"),
									writeStreamTemp = createWriteStream("./serverData/dataModifiedActual.json");

									writeStreamTemp.setDefaultEncoding("utf-8");
									writeStreamTemp.write("[\r\n");

								let buildObj = "";
								let open = false;
								let closed = false;
								streamUsers.on("data", bufData => {
									let arrActual = bufData.toString('utf-8').split("");
									for (let charActual of arrActual) {
										if(charActual == "{")
											open = true;
										else if (charActual == "}") 
											closed = true;
										else {}

										if(open) {
											buildObj+= charActual;
											if(closed) {
												open = false;
												closed = false;
												let userActual = JSON.parse(buildObj);

												if (!isLogined && userActual["name-user"] == userForAccess["name-user"] && Buffer.from(userActual.password, "hex").toString('utf-8') == userForAccess.password) {
													isLogined = true;
													userActual.timeOfRegistryOfMilliSeconds = Number.parseInt(userForAccess.momentInMilliSeconds);
													userActual.endMilliSeconds = 604800;
													// Datos que envío al usuario para que inicie sesión
													let dataForSend = {
														"name-user": userActual["name-user"],
														dateOfRegistry: userActual.dateOfRegistry,
														endMilliSeconds: userActual.endMilliSeconds,
														code: userActual.code,
														arithmetic: userActual.arithmetic
													}

													this.write(
														`${obRequest.htWithVersion} 202 Acepted\r\n` +
														"Content-type: application/json; charset=utf8\r\n" +
														"Server: N-S\r\n" +
														"Connection: close\r\n\r\n"
													);
													this.write(JSON.stringify(dataForSend));
													// streamUsers.destroy();
													// break;
												}
												else {}

												writeStreamTemp.write( JSON.stringify(userActual)+",\r\n" );
												buildObj = "";
											}
										}

									}
								})
								.on('error', console.error)
								.on('close', ()=> {
									if (!isLogined) {
										this.write(
											`${obRequest.htWithVersion} 410 Incorrect Data\r\n` +
											"Content-type: text/txt; charset=utf-8\r\n" +
											"Server: N-S\r\n" +
											"Connection: close\r\n\r\n"
										);
										this.write("El nombre o la contraseña está incorrecto, ¡Inténtelo de nuevo o regístrate!");
										this.end();
										writeStreamTemp.end();
									}
									else {
										writeStreamTemp.write("]");
										writeStreamTemp.end();

										let dataForUpdate  = createReadStream(writeStreamTemp.path),
										destinationForUpdate = createWriteStream(streamUsers.path);
											
										destinationForUpdate.on("close", ()=> this.end());
											
										dataForUpdate.pipe(destinationForUpdate);

									}

								});
							}
							else if (obRequest.path == '/perfil/accessToAcction' && isValidData(obRequest, "verify-v2")) {
								const credentials = {
									credentialOfUserInCodeTMH: null,
									startedTMH: null
								},
									streamUsers = createReadStream("./serverData/usersTMH.json");

									let isCorrect = false;

								obRequest.headers.cookie.split("; ").forEach(el=> {
									let [key, value] = el.split("=");
									credentials[key] = value;
								});

								let { credentialOfUserInCodeTMH,  startedTMH } = credentials;
								
								let buildObj = "";
								let open = false;
								let closed = false;

								streamUsers.on("data", bufData => {

									let arrActual = bufData.toString('utf-8').split("");
									for (let charActual of arrActual) {
										if(charActual == "{")
											open = true;
										else if (charActual == "}") 
											closed = true;
										else {}

										if(open) {
											buildObj+= charActual;
											if(closed) {
												open = false;
												closed = false;
												let userActual = JSON.parse(buildObj);

												if (userActual.code == credentialOfUserInCodeTMH && Number.parseInt(userActual.timeOfRegistryOfMilliSeconds) == Number.parseInt(startedTMH)) {

													let realPassword = Buffer.from(userActual.password, "hex").toString('utf-8'),
													{ password } = JSON.parse(obRequest.body);
													isCorrect = realPassword == password;

													if(isCorrect) {
														// Datos que envío al usuario registrado.
														let dataForSend = {
															"name-user": userActual["name-user"],
															dateOfRegistry: userActual.dateOfRegistry,
															endMilliSeconds: userActual.endMilliSeconds,
															password
														}

														this.write(
															`${obRequest.htWithVersion} 202 Acepted\r\n` +
															"Content-type: application/json; charset=utf8\r\n" +
															"Server: N-S\r\n" +
															"Connection: close\r\n\r\n"
														);
														this.write(JSON.stringify(dataForSend));
													}
													else {
														this.write(
															`${obRequest.htWithVersion} 203 Not-Authorized\r\n` +
															"Content-type: text/txt; charset=utf8\r\n" +
															"Server: N-S\r\n" +
															"Connection: close\r\n\r\n"
														);
													}
													streamUsers.destroy();
													break;
												}
												else {}

												buildObj = "";
											}
										}

									}
								})
								.on('error', console.error)
								.on('close', ()=> {
									if (!isCorrect) {
										this.write("La contraseña es incorrecta. ¡Intentelo de nuevo!");
										this.end();
									}
									else
										this.end();
								});
							}
							else nega(this);
						}
					break;
					case 'post':
						{	
							try {
								if(obRequest.path == '/registry' && isValidData(obRequest, 'registry')) {
									let newUserData = JSON.parse( obRequest.body );
									const dataForSave = {
										["name-user"]: newUserData["name-user"],
										password: Buffer.from(newUserData.password, 'utf-8').toString('hex'),
										code: generateCode(),
										timeOfRegistryOfMilliSeconds: newUserData.momentInMilliSeconds,
										dateOfRegistry: new Date(newUserData.momentInMilliSeconds),
										endMilliSeconds: 604800,
										["acept-conditions"]: newUserData.accept,
										arithmetic: "adition=0; sustraction=0; multiplication=0; division=0; arithmetic-operations=0"
									};
									let posibleMessage = await validatorData({
										name: newUserData["name-user"],
										password: newUserData.password,
										condition: newUserData.accept
									});
									if (posibleMessage) {
										this.write(
											`${obRequest.htWithVersion} 419 Read-Message\r\n` +
											"Content-type: text/txt; charset=utf-8\r\n" +
											"Connection: close\r\n" +
											"Server: N-S\r\n\r\n"
										);
										this.write(posibleMessage);

										this.end();
									}
									else {
										// bloque para generar usuario:
										const streamUsers = createReadStream("./serverData/usersTMH.json"),
											writeStreamTemp = createWriteStream("./serverData/dataModifiedActual.json");

											writeStreamTemp.setDefaultEncoding("utf-8");
											writeStreamTemp.write("[\r\n");
											
											writeStreamTemp.write( JSON.stringify(dataForSave)+",\r\n" );

										this.write(
											`${obRequest.htWithVersion} 201 Created\r\n` +
											"Content-type: application/json; charset=utf-8\r\n" +
											"Connection: close\r\n" +
											"Server: N-S\r\n\r\n"
										);

										let buildObj = "";
										let open = false;
										let closed = false;
										streamUsers.on("data", bufData => {
											let arrActual = bufData.toString('utf-8').split("");
											for (let charActual of arrActual) {
												if(charActual == "{")
													open = true;
												else if (charActual == "}") 
													closed = true;
												else {}

												if(open) {
													buildObj+= charActual;
													if(closed) {
														open = false;
														closed = false;
														let userActual = JSON.parse(buildObj);

														writeStreamTemp.write( JSON.stringify(userActual)+",\r\n" );
														buildObj = "";
													}
												}

											}
										})
										.on('error', console.error)
										.on('close', ()=> {
										writeStreamTemp.write("]");
										writeStreamTemp.end();

										let dataForSend = {
											"name-user": dataForSave["name-user"],
											dateOfRegistry: dataForSave.dateOfRegistry,
											endMilliSeconds: dataForSave.endMilliSeconds,
											code: dataForSave.code,
											arithmetic: dataForSave.arithmetic
										}
										this.write( JSON.stringify(dataForSend) );

										let dataForUpdate  = createReadStream(writeStreamTemp.path),
										destinationForUpdate = createWriteStream(streamUsers.path);
											
										destinationForUpdate.on("close", ()=> this.end());
											
										dataForUpdate.pipe(destinationForUpdate);
										});
									}
								}
								else if (obRequest.path == '/perfil' && isValidData(obRequest, 'verify-v2')) {
									const writeTemp = createWriteStream("./serverData/dataModifiedActual.json");
									writeTemp.write("[\r\n");
									writeTemp.write(`${JSON.stringify(JSON.parse(obRequest.body))},\r\n`);

								const streamMessages = createReadStream("./serverData/Messages.json");
								
								let buildObj = "";
								let open = false;
								let closed = false;

								streamMessages.on("data", bufData => {

									let arrActual = bufData.toString('utf-8').split("");
									for (let charActual of arrActual) {
										if(charActual == "{")
											open = true;
										else if (charActual == "}") 
											closed = true;
										else {}

										if(open) {
											buildObj+= charActual;
											if(closed) {
												open = false;
												closed = false;
												writeTemp.write(`${buildObj},\r\n`);
												buildObj = "";
											}
										}

									}
								})
								.on('error', console.error)
								.on('close', ()=> {
									writeTemp.write("]");
									writeTemp.end();
									this.write(
										`${obRequest.htWithVersion} 205 Message-Saved\r\n` +
										"Server: N-S\r\n" +
										"Connection: close\r\n\r\n"
									);

									this.end();
									let dataForUpdate  = createReadStream(writeTemp.path),
									destinationForUpdate = createWriteStream(streamMessages.path);
										
									destinationForUpdate.on("close", ()=> this.end());
										
									dataForUpdate.pipe(destinationForUpdate);
								});

								}
								else if (obRequest.path == '/perfil/editNow' && isValidData(obRequest, 'verify-v2')) {
									let isEdited = false;
									const newData = JSON.parse( obRequest.body ),
										credentials = {
											credentialOfUserInCodeTMH: null,
											startedTMH: null
										};
										obRequest.headers.cookie.split("; ").forEach(el=> {
											let [key, value] = el.split("=");
											credentials[key] = value;
										});
										
										const isExist = await isExistName( Object.assign(newData, credentials) ),

										streamUsers = createReadStream("./serverData/usersTMH.json"),
										writeStreamTemp = createWriteStream("./serverData/dataModifiedActual.json");


										let { credentialOfUserInCodeTMH,  startedTMH } = credentials;

										writeStreamTemp.setDefaultEncoding("utf-8");
										writeStreamTemp.write("[\r\n");

									let buildObj = "";
									let open = false;
									let closed = false;
									streamUsers.on("data", bufData => {
										let arrActual = bufData.toString('utf-8').split("");
										for (let charActual of arrActual) {
											if(charActual == "{")
												open = true;
											else if (charActual == "}") 
												closed = true;
											else {}

											if(open) {
												buildObj+= charActual;
												if(closed) {
													open = false;
													closed = false;
													let userActual = JSON.parse(buildObj);

													if (!isExist && !isEdited && userActual.code == credentialOfUserInCodeTMH && userActual.timeOfRegistryOfMilliSeconds == startedTMH) {
														userActual['name-user'] = newData['name-user'];
														userActual.password = Buffer.from(newData.password, 'utf-8').toString('hex');
														isEdited = true;
														// Datos que envío al usuario para que inicie sesión
														let dataForSend = {
															dateOfRegistry: userActual.dateOfRegistry,
															endMilliSeconds: userActual.endMilliSeconds,
															"name-user": userActual["name-user"],
															password: userActual.password
														}
														this.write(
															`${obRequest.htWithVersion} 202 Acepted\r\n` +
															"Content-type: application/json; charset=utf8\r\n" +
															"Server: N-S\r\n" +
															"Connection: close\r\n\r\n"
														);
														this.write(JSON.stringify(dataForSend));
													}
													else {}

													writeStreamTemp.write( JSON.stringify(userActual)+",\r\n" );
													buildObj = "";
												}
											}

										}
									})
									.on('error', console.error)
									.on('close', ()=> {
										if(!isEdited && isExist) {
											this.write(
												`${obRequest.htWithVersion} 203 is-repeat\r\n` +
												"Content-type: text/txt; charset=utf-8\r\n" +
												"Server: N-S\r\n" +
												"Connection: close\r\n\r\n"
											);
											this.write(`Elige otro nombre diferente, porque ya hay un usuario con el nombre "${newData['name-user']}".`);
											this.end();
											writeStreamTemp.end();
										}
										else if (!isEdited) {
											this.write(
												`${obRequest.htWithVersion} 410 Incorrect Data\r\n` +
												"Content-type: text/txt; charset=utf-8\r\n" +
												"Server: N-S\r\n" +
												"Connection: close\r\n\r\n"
											);
											this.write("Al parecer su tiempo de sesión ha expirado");
											this.end();
											writeStreamTemp.end();
										}
										else {
											writeStreamTemp.write("]");
											writeStreamTemp.end();

											let dataForUpdate  = createReadStream(writeStreamTemp.path),
											destinationForUpdate = createWriteStream(streamUsers.path);
												
											destinationForUpdate.on("close", ()=> this.end());
												
											dataForUpdate.pipe(destinationForUpdate);

										}

									});
								}
								else nega(this);
							} 
							catch (error) {
								console.log(error);
								nega(this);
							}
						}
					break;
					case 'delete':
						{
							if (obRequest.path == "/perfil" && isValidData(obRequest, "verify")) {
								// bloque para eliminar usuarios:
								const credentials = {
									credentialOfUserInCodeTMH: null,
									startedTMH: null
								};

								let isDeleted = false;

								obRequest.headers.cookie.split("; ").forEach(el=> {
									let [key, value] = el.split("=");
									credentials[key] = value;
								});

								let { credentialOfUserInCodeTMH,  startedTMH } = credentials;

								const streamUsers = createReadStream("./serverData/usersTMH.json"),
										writeStreamTemp = createWriteStream("./serverData/dataModifiedActual.json");

								writeStreamTemp.setDefaultEncoding("utf-8");
								writeStreamTemp.write("[\r\n");

									let buildObj = "";
									let open = false;
									let closed = false;
									streamUsers.on("data", bufData => {
										let arrActual = bufData.toString('utf-8').split("");
										for (let charActual of arrActual) {
											if(charActual == "{")
												open = true;
											else if (charActual == "}") 
												closed = true;
											else {}

											if(open) {
												buildObj+= charActual;
												if(closed) {
													open = false;
													closed = false;
													let userActual = JSON.parse(buildObj);

													if (!isDeleted && userActual.code == credentialOfUserInCodeTMH && userActual.timeOfRegistryOfMilliSeconds == startedTMH) {
														isDeleted = true;
														this.write(
															`${obRequest.htWithVersion} 205 Deleted-Account\r\n` +
															"Server: N-S\r\n" +
															"Connection: close\r\n\r\n"
														);
													}
													else
														writeStreamTemp.write( JSON.stringify(userActual)+",\r\n" );

													buildObj = "";
												}
											}

										}
									})
									.on('error', console.error)
									.on('close', ()=> {
										if (!isDeleted) {
											this.write(
												`${obRequest.htWithVersion} 410 Incorrect Data\r\n` +
												"Content-type: text/txt; charset=utf-8\r\n" +
												"Server: N-S\r\n" +
												"Connection: close\r\n\r\n"
											);
											this.end();
											writeStreamTemp.end();
										}
										else {
											writeStreamTemp.write("]");
											writeStreamTemp.end();

											let dataForUpdate  = createReadStream(writeStreamTemp.path),
											destinationForUpdate = createWriteStream(streamUsers.path);
												
											destinationForUpdate.on("close", ()=> this.end());
												
											dataForUpdate.pipe(destinationForUpdate);

										}

									});

								/*End execution*/

							}
							else nega(this);
						}
					break;
					case 'put': 
						{
							if(obRequest.path == '/perfil' && isValidData(obRequest, "verify")) {
									let isReset = false;
									const credentials = {
											credentialOfUserInCodeTMH: null,
											startedTMH: null
										};
										obRequest.headers.cookie.split("; ").forEach(el=> {
											let [key, value] = el.split("=");
											credentials[key] = value;
										});
										
										const streamUsers = createReadStream("./serverData/usersTMH.json"),
										writeStreamTemp = createWriteStream("./serverData/dataModifiedActual.json");

										let { credentialOfUserInCodeTMH,  startedTMH } = credentials;

										writeStreamTemp.setDefaultEncoding("utf-8");
										writeStreamTemp.write("[\r\n");

									let buildObj = "";
									let open = false;
									let closed = false;
									streamUsers.on("data", bufData => {
										let arrActual = bufData.toString('utf-8').split("");
										for (let charActual of arrActual) {
											if(charActual == "{")
												open = true;
											else if (charActual == "}") 
												closed = true;
											else {}

											if(open) {
												buildObj+= charActual;
												if(closed) {
													open = false;
													closed = false;
													let userActual = JSON.parse(buildObj);

													if (!isReset && userActual.code == credentialOfUserInCodeTMH && userActual.timeOfRegistryOfMilliSeconds == startedTMH) {
														isReset = true;
														let valueForReplace = [];
														userActual.arithmetic.split("; ")
														.forEach(elTM=> {
															let [keyTm, valTm] = elTM.split('='); valTm = '0';
															valueForReplace.push(`${keyTm}=${valTm}`);
														});
														userActual.arithmetic = valueForReplace.join("; ");
														// Datos que envío al usuario para que resetee sus puntuaciones.
														this.write(
															`${obRequest.htWithVersion} 208 Reset-Content\r\n` +
															"Content-type: text/text; charset=utf-8\r\n" +
															"Server: N-S\r\n" +
															"Connection: close\r\n\r\n"
														);
														this.write(userActual.arithmetic);
													}
													else {}

													writeStreamTemp.write( JSON.stringify(userActual)+",\r\n" );
													buildObj = "";
												}
											}

										}
									})
									.on('error', console.error)
									.on('close', ()=> {
										if (!isReset) {
											this.write(
												`${obRequest.htWithVersion} 410 Incorrect Data\r\n` +
												"Content-type: text/txt; charset=utf-8\r\n" +
												"Server: N-S\r\n" +
												"Connection: close\r\n\r\n"
											);
											this.write("Al parecer su tiempo de sesión ha expirado");
											this.end();
											writeStreamTemp.end();
										}
										else {
											writeStreamTemp.write("]");
											writeStreamTemp.end();

											let dataForUpdate  = createReadStream(writeStreamTemp.path),
											destinationForUpdate = createWriteStream(streamUsers.path);
												
											destinationForUpdate.on("close", ()=> this.end());
												
											dataForUpdate.pipe(destinationForUpdate);

										}

									});
							}
							else if (posibleTests.indexOf(obRequest.path) !== -1 && isValidData(obRequest, "verify-v2")) {
								const testReference = obRequest.path.replace("/", "");
								let notEnd = false;
								const credentials = {
									credentialOfUserInCodeTMH: null,
									startedTMH: null
								},
									respOfUser = JSON.parse(obRequest.body);

								obRequest.headers.cookie.split("; ").forEach(el=> {
									let [key, value] = el.split("=");
									credentials[key] = value;
								});

								let { credentialOfUserInCodeTMH } = credentials;
								const admition = await isUser(credentials);
								
								if (admition) {
									let positionOfTest = 1;
									let testActual = null;

									const streamTest = createReadStream(`./tests/${testReference}.json`);

									let buildObj = "";
									let open = false;
									let closed = false;

									streamTest.on("data", bufData => {
										let arrActual = bufData.toString('utf-8').split("");
										for (let charActual of arrActual) {
											if(charActual == "{")
												open = true;
											else if (charActual == "}") 
												closed = true;
											else {}

											if(open) {
												buildObj+= charActual;
												if(closed) {
													open = false;
													closed = false;
													
													testActual = JSON.parse(buildObj);

													if(Number.parseInt(respOfUser.testIndex) == positionOfTest) {
														notEnd = true;
														// insertar, obtener y eliminar: Logrado!
														this.write(
															`${obRequest.htWithVersion} 200 continue-test\r\n` +
															"Content-type: application/json; charset=utf-8\r\n" +
															"Connection: close\r\n" +
															"Server: N-S\r\n\r\n"
														);
														streamTest.destroy();
														break;
													}
													else ;

													positionOfTest++;
													buildObj = "";
												}
											}

										}
									})
									.on('error', console.error)
									.on('close', ()=> {
										testActual.assertBefore = responsesActual.get(credentialOfUserInCodeTMH).forCompare == Number.parseInt(respOfUser.value);
										let forCompare = testActual.response;
										delete testActual.response;

										if(notEnd)
											this.write( JSON.stringify(testActual) );
										else  {
											this.write(
												`${obRequest.htWithVersion} 200 end-test\r\n` +
												"Content-type: application/json; charset=utf-8\r\n" +
												"Connection: close\r\n" +
												"Server: N-S\r\n\r\n"
											);
											this.write( JSON.stringify({ assertBefore: testActual.assertBefore }) );
										}
											let point = testActual.assertBefore? responsesActual.get(credentialOfUserInCodeTMH).pointActual + 1 : responsesActual.get(credentialOfUserInCodeTMH).pointActual;

											// bloque para generar usuario:
											const streamUsers = createReadStream("./serverData/usersTMH.json"),
												writeStreamTemp = createWriteStream("./serverData/dataModifiedActual.json");

												writeStreamTemp.setDefaultEncoding("utf-8");
												writeStreamTemp.write("[\r\n");
												
											let buildObj = "";
											let open = false;
											let closed = false;
											streamUsers.on("data", bufData => {
												let arrActual = bufData.toString('utf-8').split("");
												for (let charActual of arrActual) {
													if(charActual == "{")
														open = true;
													else if (charActual == "}") 
														closed = true;
													else {}

													if(open) {
														buildObj+= charActual;
														if(closed) {
															open = false;
															closed = false;
															let userActual = JSON.parse(buildObj);
															if(userActual.code == credentialOfUserInCodeTMH) {
																let newPuntuations = [];
																userActual.arithmetic.split("; ").forEach(el=> {
																	let [key, value] = el.split("=");
																	if(key == testReference)
																		newPuntuations.push(`${key}=${point}`);
																	else
																		newPuntuations.push(`${key}=${value}`);
																});
																userActual.arithmetic = newPuntuations.join("; ");
															}

															writeStreamTemp.write( JSON.stringify(userActual)+",\r\n" );
															buildObj = "";
														}
													}

												}
											})
											.on('error', console.error)
											.on('close', ()=> {
												writeStreamTemp.write("]");
												writeStreamTemp.end();

												let dataForUpdate  = createReadStream(writeStreamTemp.path),
												destinationForUpdate = createWriteStream(streamUsers.path);
													
												destinationForUpdate.on("close", ()=> {
													responsesActual.set(credentialOfUserInCodeTMH, {forCompare, pointActual: point });
													this.end();
												});
													
												dataForUpdate.pipe(destinationForUpdate);
											});

									});
								}
							else
								nega(this);
							}
							else nega(this);
						}
					break;
					default :
						nega(this);
					break;
				}
			}
			else nega(this);
		})
		.on('close', ()=> {

		})
		.on('error', error=> console.log(error.message))
		.on('finish', ()=> {
			// console.log('despached!');
		});
	} catch (error) {
		console.log(error.message);
	}
}

const SERVER = net.createServer(handlerServer);

SERVER.listen(80, 'localhost', function () {
	console.log(`Run Server... http://${this.address().address}`);
});