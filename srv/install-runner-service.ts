import { Worker } from 'node:worker_threads';
import { join } from 'node:path';
import * as cds from "@sap/cds";
import type { Service } from "@sap/cds/apis/services";

const WORKER_PATH = join(__dirname, './install-worker.mjs');

function installSoftware(software_ID: number, hardware_ID: number, employee_ID: number) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(WORKER_PATH, {
            workerData: {
                software_ID,
                hardware_ID,
                employee_ID
            }
        });
        worker.on('message', console.log);
        worker.on('error', reject);
        worker.on('exit', resolve);
    })
}

export default async function createInstallRunnerService(service: Service) {
    const InstallControllerService = await cds.connect.to('InstallControllerService');
    const db = await cds.connect.to('db');

    const { Employee_Software } = db.entities;


    InstallControllerService.on('RequiredSoftwareInstallation', async (event) => {
        const { software_ID, hardware_ID, employee_ID } = event.data;
        await installSoftware(software_ID, hardware_ID, employee_ID);
        await INSERT.into(Employee_Software).entries({
            software_ID,
            hardware_ID,
            employee_ID
        })
    })
}