using { sys.admin as my } from '../db/schema';

service InventoryService {
    @insertonly
    entity Hardware as projection on my.Hardware;

    @readonly
    entity AvailableHardware as SELECT from my.Hardware { ID, name, type } WHERE NOT EXISTS assigned_to;

    @readonly
    entity AssignedHardware as SELECT from my.Hardware WHERE EXISTS assigned_to;

    action assignHardware(hardware_ID: my.Hardware:ID, employee_ID: my.Employees:ID);

    event HardwareAssigned : {
        hardware_ID: my.Hardware:ID;
        employee_ID: my.Employees:ID;
    }
}