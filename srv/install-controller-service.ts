import * as cds from '@sap/cds';
import type {Service} from "@sap/cds/apis/services";
import { HardwareAssignedPayload } from "./typings/hardware-assigned-payload";
import { EmployeeRoleAssignedPayload } from "./typings/employee-role-assigned-payload";
import { EmployeeRole } from "./entities/employee-role.entity";
import { Hardware } from "./entities/hardware.entity";
import { RoleSoftware } from "./entities/role-software.entity";
import { RequiredSoftwareInstallationPayload } from "./typings/required-software-installation-payload";

export default async function createInstallControllerService(service: Service) {
    const EmployeesService = await cds.connect.to('EmployeesService');
    const InventoryService = await cds.connect.to('InventoryService');
    const db = await cds.connect.to('db');

    const { Employee_Roles, Hardware, Role_Software } = db.entities;

    const getEmployeeRoles = async (employee_ID: number) => {
        const employeeRoles: Pick<EmployeeRole, 'role_ID'>[] = await SELECT.from(Employee_Roles).columns('role_ID').where({
            employee_ID
        });

        return employeeRoles.map(({ role_ID }) => role_ID);
    }

    const getHardwareType = async (hardware_ID: number) => {
        const hardwareItem: Pick<Hardware, 'type'> = await SELECT.one.from(Hardware).columns('type').where({
            ID: hardware_ID
        });

        return hardwareItem.type;
    }

    const getEmployeeHardware = async (employee_ID: number) => {
        return await SELECT.from(Hardware).columns('type', 'ID').where({
            assigned_to_ID: employee_ID
        }) as Promise<Pick<Hardware, 'type' | 'ID'>[]>;
    }

    const getSoftwareToInstallByHardwareTypeAndRoles = async (hardwareType: string, roles: number[]) => {
        return await SELECT.from(Role_Software).where({
            hardware_type: hardwareType,
            role_ID: roles
        }) as Promise<Pick<RoleSoftware, 'software_ID'>[]>;
    }

    const emitSoftwareInstallationFor = async (employee_ID: number, hardware_ID: number, softwareToInstall: Pick<RoleSoftware, 'software_ID'>[]) => {
        for (const { software_ID } of softwareToInstall) {
            await service.emit('RequiredSoftwareInstallation', {
                employee_ID,
                hardware_ID,
                software_ID
            } as RequiredSoftwareInstallationPayload)
        }
    }


    InventoryService.on('HardwareAssigned', async (event) => {
       const { hardware_ID, employee_ID } = event.data as HardwareAssignedPayload;
       const [hardwareType, employeeRoles] = await Promise.all([getHardwareType(hardware_ID), getEmployeeRoles(employee_ID)]);
       const softwareToInstall = await getSoftwareToInstallByHardwareTypeAndRoles(hardwareType, employeeRoles)
       await emitSoftwareInstallationFor(employee_ID, hardware_ID, softwareToInstall);
    });

    EmployeesService.on('EmployeeRoleAssigned', async (event) => {
        const { role_ID, employee_ID } = event.data as EmployeeRoleAssignedPayload;
        const employeeHardware = await getEmployeeHardware(employee_ID);

        for (const { ID: hardware_ID, type: hardwareType } of employeeHardware) {
            const softwareToInstall = await getSoftwareToInstallByHardwareTypeAndRoles(hardwareType, [role_ID]);
            await emitSoftwareInstallationFor(employee_ID, hardware_ID, softwareToInstall);
        }
    });
}