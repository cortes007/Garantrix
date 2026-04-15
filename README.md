# Garantrix - Proyecto Fullstack
Este es el proyecto final para la asignatura de **Emprendimiento**. Es una solución Fullstack que utiliza **React (Vite)** para el frontend y **Node.js (Express)** para el backend.

---

## Requisitos Previos
Para que el proyecto funcione correctamente (especialmente por las librerías de Vite 6), es obligatorio cumplir con estas versiones:

* **Node.js:** Versión **22.12.0 LTS** o superior (¡Importante!).
* **Git:** Instalado.
* **NPM:** Incluido con Node.js.

---

## Instalación y Configuración Inicial

Si acabas de clonar el repositorio, ejecuta estos comandos en orden:

### 1. Clonar y entrar al proyecto

git clone [https://github.com/cortes007/Garantrix.git](https://github.com/cortes007/Garantrix.git)
cd Garantrix

### 2. Configurar el Servidor (Backend)

1. cd server
2. npm install

**para ejecutar el server:**

1. cd server
2. npm run dev

**Nota:** si el comando no da instalar lo siguiente dentro de "server": npm install nodemon --save-dev

El servidor usa Nodemon, por lo que se reiniciará automáticamente al guardar cambios.
URL: http://localhost:3001

### 3. Configurar el Cliente (Frontend)

1. cd client
2. npm install

**Para ejecutar el Front:**

1. cd client
2. npm run dev

## Estructura de carpetas

/client: Contiene el frontend desarrollado con React + Vite.

/server: Contiene el backend desarrollado con Node.js + Express.

package.json: Existen archivos de configuración independientes en cada carpeta.