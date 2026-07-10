# Aprendizaje por Refuerzo para la Detección de Anomalías
Estudiante: David Baez

## Descripción

Se desarrolla una aplicacion web mediante HTML, CSS y JavaScript con el fin de facilitar el aprendizaje y entendimeinto del algoritmos de aprendizaje por refuerzo. Se implementa y explica el funcionamiento de Q-Learning, un algoritmo de aprendizaje por refuerzo que permite a un agente aprender a tomar decisiones óptimas en un entorno determinado.

## Ejecución

Para ejecutar la aplicacion se debe tener instalado Docker y Docker Compose. Luego, se debe ejecutar el siguiente comando:

```bash
docker-compose up -d
```
Y se debe ingresar a la pagina:

http://localhost:3004

Si no desea ejecutar el programa puede ingresar a:

https://davidbaezproyecto.defocuss.duckdns.org/

## Estructura del Proyecto

```text
├── index.html            # Archivo principal de la aplicación web y estructura
├── styles.css            # Estilos y diseño visual de la interfaz
├── script.js             # Lógica del algoritmo Q-Learning y la simulación
├── images/               # Directorio de recursos gráficos y diagramas
├── requerimientos.md     # Documento con la descripción original de la tarea
├── Dockerfile            # Configuración para empaquetar la app usando Nginx
└── docker-compose.yml    # Configuración para levantar la app con Docker Compose
