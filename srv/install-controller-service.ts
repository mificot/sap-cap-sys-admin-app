import * as cds from '@sap/cds';
import type {Service} from "@sap/cds/apis/services";

export default async function createInstallControllerService(service: Service) {
    const EmployeesService = await cds.connect.to('EmployeesService');
    const InventoryService = await cds.connect.to('InventoryService');
    const db = await cds.connect.to('db');

    const { Employee_Roles, Hardware, Role_Software } = db.entities;

    const getEmployeeRoles = async (employee_ID: number) => {
        const employeeRoles = await SELECT.from(Employee_Roles).where({
            employee_ID
        });

        return employeeRoles.map(({ role_ID }: any) => role_ID);
    }

    const getHardwareType = async (hardware_ID: number) => {
        const hardwareItem = await SELECT.one.from(Hardware).where({
            ID: hardware_ID
        });

        return hardwareItem.type;
    }

    const getEmployeeHardware = async (employee_ID: number) => {
        return await SELECT.from(Hardware).where({
            assigned_to_ID: employee_ID
        });
    }

    const getSoftwareToInstallByHardwareTypeAndRoles = async (hardwareType: string, roles: number[]): Promise<any[]> => {
        return await SELECT.from(Role_Software).where({
            hardware_type: hardwareType,
            role_ID: roles
        })
    }

    const emitSoftwareInstallationFor = async (employee_ID: number, hardware_ID: number, softwareToInstall: any[]) => {
        for (const { software_ID } of softwareToInstall) {
            await service.emit('RequiredSoftwareInstallation', {
                employee_ID,
                hardware_ID,
                software_ID
            })
        }
    }


    InventoryService.on('HardwareAssigned', async (event) => {
       const { hardware_ID, employee_ID } = event.data;
       const [hardwareType, employeeRoles] = await Promise.all([getHardwareType(hardware_ID), getEmployeeRoles(employee_ID)]);
       const softwareToInstall = await getSoftwareToInstallByHardwareTypeAndRoles(hardwareType, employeeRoles)
       await emitSoftwareInstallationFor(employee_ID, hardware_ID, softwareToInstall);
    });

    EmployeesService.on('EmployeeRoleAssigned', async (event) => {
        const { role_ID, employee_ID } = event.data;
        const employeeHardware = await getEmployeeHardware(employee_ID);

        for (const { ID: hardware_ID, type: hardwareType } of employeeHardware) {
            const softwareToInstall = await getSoftwareToInstallByHardwareTypeAndRoles(hardwareType, [role_ID]);
            await emitSoftwareInstallationFor(employee_ID, hardware_ID, softwareToInstall);
        }
    });
}