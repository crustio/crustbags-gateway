import * as express from 'express';
import {getRealPath, getStorageInfo} from "./storage";
require('express-async-errors');
import { existsSync } from "fs";
import {configs} from "./config";
const app = express();

const regex = /^[A-Za-z0-9]{64}$/

const badRequestResponse = {"statusCode":400,"error":"Bad Request","message":"Torrent is not ready yet"}

function badRequest(res: any) {
    return res.status(400).json(badRequestResponse);
}

app.get('/gateway/:bagId', async (req: any, res: any) => {
    const bagId = req.params.bagId;
    if (!regex.test(bagId)) {
        return badRequest(res);
    }
    // call tonutils-storage
    const detail = await getStorageInfo(bagId);
    if (detail != null) {
        const path = getRealPath(`${detail.path}/${detail.dir_name}${detail.files[0].name}`)
        return existsSync(path) ? res.download(path, detail.files[0].name) : badRequest(res);
    }
    return badRequest(res);
});

app.get('/gateway/:bagId/*', async (req: any, res: any) => {
    const bagId = req.params.bagId;
    const fileName = req.params[0];
    if (!regex.test(bagId)) {
        return badRequest(res);
    }
    // call tonutils-storage
    const detail = await getStorageInfo(bagId);
    if (detail != null) {
        for (const f of detail.files) {
            if (f.name === fileName || f.name.endsWith(fileName)) {
                const path = getRealPath(`${detail.path}/${detail.dir_name}${f.name}`)
                return existsSync(path) ? res.download(path) : badRequest(res);
            }
        }
    }
    return badRequest(res);
});
app.use((err: any, req: any, res: any, next: any) => {
    console.error(`Server stack: ${err.stack} \n msg: ${err.message}`)
    res.status(500).json({error: 'server error'});
});
console.log(`Server start on: ${configs.port}`);
app.listen(configs.port);



