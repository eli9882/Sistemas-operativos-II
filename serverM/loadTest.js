const http = require('http');

const numberOfRequests = 1000; // Número de solicitudes a realizar
const concurrency = 100; // Número de solicitudes concurrentes

function sendRequest() {
  return new Promise((resolve, reject) => {
    const req = http.request('http://localhost:3002/', (res) => {
      res.on('data', () => {}); // Consumir datos para evitar el bloqueo
      res.on('end', () => resolve());
    });
    req.on('error', reject);
    req.end();
  });
}

async function loadTest() {
  let activeRequests = 0;
  let completedRequests = 0;

  const start = Date.now();

  function createRequest() {
    activeRequests++;
    sendRequest().then(() => {
      activeRequests--;
      completedRequests++;
      if (completedRequests < numberOfRequests) {
        createRequest();
      }
    });
  }

  for (let i = 0; i < concurrency; i++) {
    createRequest();
  }

  while (completedRequests < numberOfRequests) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`Prueba completada en ${Date.now() - start} ms`);
}

loadTest();
