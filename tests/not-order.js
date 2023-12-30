import { createReadStream, createWriteStream } from 'node:fs';

function NotOrder (fileReference) {
return new Promise ((resolve, reject)=> {
	try {
			const streamTest = createReadStream(fileReference);
			const streamTestDesord = createWriteStream("./desord.json");

			streamTestDesord.setDefaultEncoding('utf-8');

			streamTestDesord.write("[\r\n");

			let origin = [];
			let desord = [];

			let testActual = null;

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
							origin.push(testActual);
							buildObj = "";
						}
					}
				}
			}).on('error', console.error)
			.on('close', ()=> {
				let maxElements = origin.length;
				for (let i = 0; i < maxElements; i++) {
					let ref = Math.ceil( Math.random()*(origin.length-1) );
					desord[i] = origin[ref];
					origin = origin.filter((thisArg, index)=> index !== ref);
				}
				let arrActual = JSON.stringify(desord).split("");
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

							streamTestDesord.write(buildObj+",\r\n");
							buildObj = "";
						}
					}
				}
				streamTestDesord.write("]");
				streamTestDesord.end();

				streamTestDesord.on("close", ()=> {
					let destForUpdate = createWriteStream(streamTest.path),
						desordOrigin = createReadStream(streamTestDesord.path);

					destForUpdate.on("unpipe", ()=> resolve("Listo"));

					desordOrigin.pipe(destForUpdate);
				})
			});	
	}
	catch (error) {
		reject(error);
	}
});
}

console.log(await NotOrder("./arithmetic-operations.json"));