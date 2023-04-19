import * as cds from '@sap/cds';
import type { Service } from '@sap/cds/apis/services';

export default async function createEmployeesService(service: Service) {
    const db = await cds.connect.to('db');

    const { Employee_Roles } = db.entities;

    service.on('assignRole', async (req) => {
        const { employee_ID, role_ID } = req.data;

        const existingEmployeeRole = await SELECT.one.from(Employee_Roles).where({
            employee_ID,
            role_ID
        });

        if (existingEmployeeRole) {
            return req.reject(409, 'Employee already has this role');
        }

        await INSERT.into(Employee_Roles).entries({
            employee_ID,
            role_ID
        });

        service.emit('EmployeeRoleAssigned', {
            employee_ID,
            role_ID
        }).catch(console.error)
    });
}