FROM nginx:latest

COPY nginx.conf /etc/nginx/nginx.conf
COPY app_unavailable.html /usr/share/nginx/html/app_unavailable.html

# Validate nginx configuration
RUN nginx -t

EXPOSE 80 443
RUN mkdir -p /etc/nginx/conf.d

CMD ["nginx", "-g", "daemon off;"]