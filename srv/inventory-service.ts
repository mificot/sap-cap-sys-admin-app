import * as cds from '@sap/cds';
import type { Service } from '@sap/cds/apis/services';
import { AssignHardwareBody } from "./typings/assign-hardware-body";
import { Hardware } from "./entities/hardware.entity";
import { HardwareAssignedPayload } from "./typings/hardware-assigned-payload";

export default async function createEmployeesService(service: Service) {
    const db = await cds.connect.to('db');

    const { Hardware } = db.entities;

    service.on('assignHardware', async (req) => {
        const { hardware_ID, employee_ID } = req.data as AssignHardwareBody;

        const hardwareItem: Hardware = await SELECT.one.from(Hardware).where({ ID: hardware_ID });


        if (hardwareItem.assigned_to_ID) {
            return req.reject(400, 'This hardware is assigned to another employee.');
        }

        await UPDATE.entity(Hardware)
            .with({
                assigned_to_ID: employee_ID
            })
            .where({
                ID: hardware_ID
            });


        service.emit('HardwareAssigned', {
            employee_ID,
            hardware_ID
        } as HardwareAssignedPayload).catch(console.error);

    });
}