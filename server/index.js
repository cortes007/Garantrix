const express = require('express');
const app = express();
const PORT = 3001; // Usamos el 3001 para no chocar con React

app.get('/', (req, res) => {
  res.send('¡Servidor funcionando correctamente al 100%!');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});