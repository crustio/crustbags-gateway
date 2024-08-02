import axios, {AxiosError} from 'axios';
import {configs} from "../config";

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
        if (res.data.ok === false) {
            return null;
        }
        return res.data as BagDetail;
    } catch (e) {
        if (e instanceof AxiosError) {
            if (e.response) {
                if (e.response.status === 404 && e.response.data.ok === false) {
                    // download file
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
