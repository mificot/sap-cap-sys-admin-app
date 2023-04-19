import { parentPort, workerData } from 'node:worker_threads';

setTimeout(() => {
    const { software_ID, hardware_ID, employee_ID } = workerData;
    parentPort.postMessage(`Software (ID:${software_ID}) was installed on employee(ID:${employee_ID}) hardware(ID:${hardware_ID})`);
}, 5000);