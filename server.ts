import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_DIR = path.join(__dirname, "data");
const readJson = (file: string) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
const writeJson = (file: string, data: any) => fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));

// --------------------
// CRUD Helper Functions
// --------------------
const setupCRUD = (resourceName: string) => {
  const fileName = `${resourceName}.json`;

  app.get(`/${resourceName}`, (req:any, res:any) => res.json(readJson(fileName)));

  app.post(`/${resourceName}`, (req, res) => {
    const data = readJson(fileName);
    const newItem = { id: `${resourceName[0]}${Date.now()}`, ...req.body };
    data.push(newItem);
    writeJson(fileName, data);
    res.status(201).json(newItem);
  });

  app.put(`/${resourceName}/:id`, (req:any, res:any) => {
    const data = readJson(fileName);
    const index = data.findIndex((d: any) => d.id === req.params.id);
    if (index === -1) return res.status(404).send(`${resourceName} not found`);
    data[index] = { ...data[index], ...req.body };
    writeJson(fileName, data);
    res.json(data[index]);
  });

  app.delete(`/${resourceName}/:id`, (req, res) => {
    let data = readJson(fileName);
    data = data.filter((d: any) => d.id !== req.params.id);
    writeJson(fileName, data);
    res.status(204).send();
  });
};

// Resource CRUD
["patients", "conditions", "encounters"].forEach(setupCRUD);

app.listen(3001, () => console.log("Backend running on http://localhost:3001"));
