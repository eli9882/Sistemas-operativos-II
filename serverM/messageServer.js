const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 3002;

// Seguridad con Helmet
app.use(helmet());

// Limitar el número de solicitudes para prevenir ataques DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // Límite de 100 solicitudes por IP
});
app.use(limiter);

app.get('/', (req, res) => {
  res.send('Servidor en funcionamiento');
});


const server = app.listen(port, () => {
  console.log(`Servidor de mensajería escuchando en http://localhost:${port}`);
});

// Configuración del WebSocket
const wss = new WebSocket.Server({ server, clientTracking: true });

// Manejo de nuevas conexiones
wss.on('connection', ws => {
  console.log('Cliente conectado');

  // Enviar un mensaje de bienvenida al nuevo cliente
  ws.send('Bienvenido al servidor de WebSocket');

  // Manejar mensajes recibidos del cliente
  ws.on('message', message => {
    console.log(`Mensaje recibido del cliente: ${message}`);

    // Enviar el mensaje a todos los clientes conectados, excepto al que lo envió
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    // Confirmar al cliente que su mensaje fue recibido por todos
    ws.send('Tu mensaje fue enviado a todos los clientes.');
  });

  // Manejar la desconexión del cliente
  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

// Manejo de errores en el servidor WebSocket
wss.on('error', (err) => {
  console.error('Error en WebSocket:', err);
});
