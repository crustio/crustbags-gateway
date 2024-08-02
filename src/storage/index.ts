import axios, {AxiosError} from 'axios';
import {configs} from "../config";
import { existsSync } from "fs";

export type FilesItem = {
    index: number;
    name: string;
    size: number;
};

export type PeersItem = {
    addr: string;
    id: string;
    upload_speed: number;
    download_speed: number;
};

export type BagDetail = {
    bag_id: string;
    description: string;
    downloaded: number;
    size: number;
    download_speed: number;
    upload_speed: number;
    files_count: number;
    dir_name: string;
    completed: boolean;
    header_loaded: boolean;
    info_loaded: boolean;
    active: boolean;
    seeding: boolean;
    piece_size: number;
    bag_size: number;
    merkle_hash: string;
    path: string;
    files: FilesItem[];
    peers: PeersItem[];
};

export async function getStorageInfo(bagId: string): Promise<BagDetail|null> {
    try {
        const res = await axios.get(`${configs.tonStorageUtilUrl}/api/v1/details?bag_id=${bagId}`);
        const detail = res.data as BagDetail;
        if (!fileDownloadSuccess(detail)) {
            // download child files
            await downloadChildTonBag(bagId);
            return null;
        }
        return res.data as BagDetail;
    } catch (e) {
        if (e instanceof AxiosError) {
            if (e.response) {
                if (e.response.status === 404 && e.response.data.ok === false) {
                    // download meta
                    await addTonBag({
                        bag_id: bagId
                    });
                    return null;
                }
            }
            throw e;
        }
    }
}

export function getRealPath(path: string): string {
    if (path.startsWith("/")) {
        return path;
    } else {
        return `${configs.storageMountPath}/${path}`;
    }
}

async function addTonBag({
                                    bag_id,
                                    path = configs.downloadPath,
                                    files = [],
                                    donwload_all = false,
                                }: {
    bag_id: string;
    path?: string;
    files?: number[];
    donwload_all?: boolean;
}) {
    return fetch(`${configs.tonStorageUtilUrl}/api/v1/add`, {
        method: "POST",
        body: JSON.stringify({
            bag_id,
            path,
            files,
            donwload_all,
        }),
    }).catch(e => {
        console.error(`Call storage api failed: ${e}`);
    })
}


async function downloadChildTonBag(bag_id: string) {
    const bd = await getStorageInfo(bag_id);
    if (bd != null && bd.header_loaded) {
        await addTonBag({ bag_id, files: bd.files.map((f) => f.index), donwload_all: true }).catch(e => {
            console.error(`Call storage api failed: ${e}`);
        });
    }
}

function fileDownloadSuccess(detail: BagDetail): boolean {
    if (detail.completed && detail.downloaded > 0 && detail.downloaded === detail.size) {
        const file = detail.files[0];
        const filePath = getRealPath(`${detail.path}/${detail.dir_name}${file.name}`);
        return existsSync(filePath);
    }
    return false;
}
