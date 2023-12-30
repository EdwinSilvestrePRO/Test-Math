export default function requestParser (socketData) {
	try {
		let stringRequest = socketData.toString('utf-8');
		let lastOfHeader = stringRequest.indexOf("\r\n\r\n", 3);
		
		if(lastOfHeader < 3) return false;
	
		const body = stringRequest.split("").filter((el, index)=> index > lastOfHeader).join('');
		stringRequest = stringRequest.split("").filter((el, index)=> index < lastOfHeader).join('');
	
	
		let obRequest = {
			method: '',
			path: '/',
			htWithVersion: '',
			headers: {},
			body
		};
		let isFirst = true;
		for (let line of stringRequest.split("\r\n")) {
			if(isFirst) {
				let spaceIndex = line.indexOf(" ");
				obRequest.method = line.split('').filter((el, index)=> index < spaceIndex).join('');
				line = line.replace(obRequest.method, "").trim();
				spaceIndex = line.indexOf(" ");
				obRequest.path = line.split('').filter((el, index)=> index < spaceIndex).join('');
				line = line.replace(obRequest.path, "").trim();
				obRequest.htWithVersion = line;
				isFirst = false;
			}
			else {
				let twoPointIndex = line.indexOf(":");
				let key = line.split('').filter((el, index)=> index < twoPointIndex).join('');
				line = line.replace(key+":", "").trim();
	
				if((/accept/i).test(key)) obRequest.headers[key.toLowerCase()] = line.split(',');
				else if (key.toLowerCase() == 'sec-ch-ua') {
					line = "{" + line.replaceAll(';v="', ":\"v") + "}";
					obRequest.headers[key.toLowerCase()] = JSON.parse(line);
				}
				else if (key.toLowerCase() == 'sec-ch-ua-platform') obRequest[key.toLowerCase()] = line.replaceAll("\"", "");
				
				else obRequest.headers[key.toLowerCase()] = line;
			}
	
		}
		return obRequest;
	} catch (error) {
		return false;
	}
}