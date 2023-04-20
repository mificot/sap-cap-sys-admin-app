import * as cds from '@sap/cds';
import type { Service } from '@sap/cds/apis/services';
import { AssignRoleBody } from "./typings/assign-role-body";
import { EmployeeRole } from "./entities/employee-role.entity";
import { EmployeeRoleAssignedPayload } from "./typings/employee-role-assigned-payload";

export default async function createEmployeesService(service: Service) {
    const db = await cds.connect.to('db');

    const { Employee_Roles } = db.entities;

    service.on('assignRole', async (req) => {
        const { employee_ID, role_ID } = req.data as AssignRoleBody;

        const existingEmployeeRole: EmployeeRole = await SELECT.one.from(Employee_Roles).where({
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
        } as EmployeeRoleAssignedPayload).catch(console.error)
    });
}