DOCKER_IMAGE=reqtostory
CONTAINER_NAME=reqtostory-container
PORT=5001

build:
	docker build -t $(DOCKER_IMAGE) .

run:
	-docker rm -f $(CONTAINER_NAME) 2>/dev/null || true
	docker run -p $(PORT):$(PORT) --name $(CONTAINER_NAME) $(DOCKER_IMAGE)

stop:
	docker stop $(CONTAINER_NAME)

rm-container:
	docker rm $(CONTAINER_NAME)
	docker rmi $(DOCKER_IMAGE):latest

logs:
	docker logs $(CONTAINER_NAME)

clean: stop rm-container

rebuild: clean build run