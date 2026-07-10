# Se utiliza una imagen de nginx
FROM nginx:alpine

# Se copian los archivos del proyecto al directorio raíz de Nginx
COPY . /usr/share/nginx/html

# Se expone el puerto 80 (Nginx por defecto)
EXPOSE 80