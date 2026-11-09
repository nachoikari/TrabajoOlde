# Pegasus en debate · Partida en vivo

Actividad de Informática y Sociedad para una clase de hasta 60 participantes. Conserva las diez preguntas, pistas, explicaciones y referencias de la actividad original.

## Publicar en Netlify

1. Usá este repositorio como origen del sitio. `netlify.toml` y `package.json` ya están en la raíz.
2. En Netlify, elegí **Add new project → Import an existing project**, conectá GitHub y seleccioná el repositorio. Dejá el comando de compilación vacío. La configuración ya indica `public` como carpeta de publicación y `netlify/functions` como carpeta de funciones.
3. Agregá la variable de entorno `HOST_START_CODE` en Netlify con el PIN privado que vas a usar. Debe tener entre 8 y 128 caracteres y estar disponible para **Functions** en producción. Guardala en Netlify y mantenela fuera del repositorio.
4. Publicá el proyecto. Si agregaste la variable después del primer despliegue, ejecutá un nuevo despliegue. Abrí el enlace `https://…netlify.app` para verificar que podés crear una sala y unirte desde otro navegador.

El proyecto usa Netlify Functions y Netlify Blobs del mismo sitio para compartir el estado de la partida. La publicación requiere que Netlify despliegue la función `room`, además de los archivos de `public`. Si usás la CLI, vinculá el proyecto y ejecutá `npm ci` y `npx netlify-cli deploy --prod` desde la raíz.

- [Despliegue desde un repositorio](https://docs.netlify.com/build/git-workflows/repo-permissions-linking/)
- [Variables de entorno de Netlify Functions](https://docs.netlify.com/build/functions/environment-variables/)
- [Despliegue con la CLI de Netlify](https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/#manual-deploys)

## Facilitar una partida

1. Abrí el sitio, escribí tu PIN privado y seleccioná **Crear sala**.
2. Compartí con el grupo el código de seis dígitos o el enlace que genera la sala. Cada participante escribe un nombre o apodo y queda en espera. Compartí únicamente el código de sala.
3. Seleccioná **Iniciar partida** cuando el grupo esté listo. Cada pregunta tiene 30 segundos. La respuesta correcta y su explicación se revelan cuando todos responden o se acaba el tiempo. Después, seleccioná **Siguiente pregunta**.
4. Después de la última pregunta, seleccioná **Ver resultados**. Podés descargar el CSV con la clasificación, los puntajes y el número de preguntas respondidas.

Cada acierto suma entre 100 y 1000 puntos según el tiempo registrado por el servidor. Las respuestas incorrectas, tardías o en blanco valen cero. Los puntajes iguales comparten puesto. Las pistas están disponibles durante la pregunta. El modo individual sigue disponible en el sitio y contiene las mismas preguntas y explicaciones, así que el juego está pensado como actividad de clase.

Una vez iniciada la partida, se cierra el ingreso de jugadores nuevos. Recargar en la misma pestaña recupera la sesión. Conservá abierta la pestaña del anfitrión hasta descargar los resultados. El acceso a la sala vence ocho horas después de crearla. Los datos se guardan en el almacén `pegasus-live-rooms` del proyecto en Netlify.

## Probar en tu equipo

Con Node.js 22 o posterior, abrí una terminal en la carpeta del proyecto. Iniciá el servidor local con un PIN de prueba.

**PowerShell**

```powershell
$env:HOST_START_CODE = "pegasus-local-2026"
npm start
```

**Bash**

```bash
HOST_START_CODE=pegasus-local-2026 npm start
```

Abrí [http://localhost:8888](http://localhost:8888) como anfitrión y en una ventana privada como participante. El servidor local guarda las salas en memoria mientras está en ejecución.
