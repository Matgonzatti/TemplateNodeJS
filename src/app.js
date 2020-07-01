const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateId(request, response, next) {
  const { id }= request.params;

  if (!isUuid(id)){
      return response.status(400).json({error: 'Invalid ID.'});
  }

  return next();
}

app.use('/repositories/:id', validateId);

app.get("/repositories", (request, response) => {
  const {title} = request.query;

  const ret = title ? repositories.filter(repo => repo.title.toUpperCase().includes(title.toUpperCase())) : repositories;

  return response.json(ret);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {id: uuid(), title, url, likes: 0, techs};

  repositories.push(repository);

  return response.status(201).json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repository = repositories.find(repo => repo.id == id);

  if (repository === undefined) {
    return response.status(400).json({ error: 'Repository not found.'});
  }

  const newRepository = { id, title, url, techs, likes: repository.likes };

  repositories.forEach((element, index) => {
    if(element.id === newRepository.id) {
      repositories[index] = newRepository;

      return response.json(newRepository);
    }
  });
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repo => repo.id == id);

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found.'});
  }

  repositories.splice(repositoryIndex, 1);
  
  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repository = repositories.find(repo => repo.id == id);

  if (repository === undefined) {
    return response.status(400).json({ error: 'Repository not found.'});
  }

  const newRepository = {
    id, title: repository.title, url: repository.url, techs: repository.techs, likes: repository.likes + 1
  };

  repositories.forEach((element, index) => {
    if(element.id === newRepository.id) {
      repositories[index] = newRepository;

      return response.json(newRepository);
    }
  });
});

module.exports = app;
