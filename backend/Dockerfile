# syntax=docker/dockerfile:1
#FROM node:18-alpine AS frontend-builder
#WORKDIR /app/frontend
#
#COPY static/ ./static/
#COPY package.json . 
#COPY tsconfig.json .
#RUN npm install\
#        && npm install typescript -g
#COPY static/script/ ./static/script/
#RUN npx tsc

#FROM python:3.9 AS backend
#WORKDIR /app/backend
#
#COPY requirements.txt ./
#RUN pip3 install -r requirements.txt
#
#COPY . .
#
#COPY app.py ./
#COPY --from=frontend-builder /app/frontend/static /app/backend/static
#
#EXPOSE 5001
#ENV FLASK_APP=app.py
#CMD ["python3", "./app.py"]


FROM python:3.10 AS backend
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5001
ENV FLASK_APP=app.py
CMD ["python", "app.py"]