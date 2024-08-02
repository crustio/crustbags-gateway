require('dotenv').config();
const getEnvOrExit = (key: string, defaultValue: string = "", exit: boolean = true): string => {
    const value = process.env[key];
    const result = value || defaultValue;
    if ((!result || result === "") && exit) {
        console.error(`Required env var '${key}' missing`);
        process.exit(1);
    }
    return result;
}

export const configs = {
    tonStorageUtilUrl: getEnvOrExit("TON_STORAGE_UTILS_URL", "http://localhost:8192"),
    port: getEnvOrExit("PORT", "3000"),
    downloadPath: getEnvOrExit("TON_FILE_DOWNLOAD_PATH", "downloads"),
    storageMountPath: getEnvOrExit("TON_FILE_MOUNT_PATH", "/root"),
}
