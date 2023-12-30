# Anully

Cuando se elabora un servidor de red mediante *net.createServer(handlerServer)* se
necesita procesar de alguna manera las cabezeras y el cuerpo que se reciben en el *Strema Duplex* que la representa, y que es porsupuesto *socket* el argumento principal de la función *handlerServer*. **Anully** Tiene como misión procesar los
datos de este *Stream Duplex* y convertirlo en un objeto *reqObject* para ser
mejor manejado.

He aquí demostración:

```javascript
import net from 'node:net';
import anully from 'anully';

function handler (socket) {
    socket.on('data', eventArg=> {
        console.log(eventArg); 
        // is Buffer.

        console.log( anully(eventArg) );
        // {
        //     method: 'GET',
        //     path: '/',
        //     htWithVersion: 'HTTP/1.1',
        //     headers: {
        //       host: 'localhost',
        //       connection: 'keep-alive',
        //       'cache-control': 'max-age=0',
        //       'sec-ch-ua': { 'Google Chrome': 'v119', Chromium: 'v119', 'Not?A_Brand': 'v24' },
        //       'sec-ch-ua-mobile': '?0',
        //       'upgrade-insecure-requests': '1',
        //       'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        //       accept: [
        //         'text/html',
        //         'application/xhtml+xml',
        //         'application/xml;q=0.9',
        //         'image/avif',
        //         'image/webp',
        //         'image/apng',
        //         '*/*;q=0.8',
        //         'application/signed-exchange;v=b3;q=0.7'
        //       ],
        //       'sec-fetch-site': 'none',
        //       'sec-fetch-mode': 'navigate',
        //       'sec-fetch-user': '?1',
        //       'sec-fetch-dest': 'document',
        //       'accept-encoding': [ 'gzip', ' deflate', ' br' ],
        //       'accept-language': [ 'es-US', 'es-419;q=0.9', 'es;q=0.8' ]
        //     },
        //     body: '\n\r\n',
        //     'sec-ch-ua-platform': 'Windows'
        //   }

        console.log(anully);
    });
}
const SERVER = net.createServer(handler);

SERVER.listen(80, 'localhost', function () {
    console.log(`http:${this.address().address}`);
});
```
La interfaz Anully es una función que procesa el buffer del
*Stream Duplex socket* y luego retorna un objeto *obRequest*
para ser mas cómodo la lectura de este.

Nota retornará *false* solo si no recibe un buffer procesable.