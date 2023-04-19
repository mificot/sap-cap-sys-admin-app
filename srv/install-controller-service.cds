using { sys.admin as my } from '../db/schema';

service InstallControllerService {
    event RequireSoftwareInstallation : {
        employee_ID: my.Employees:ID;
        software_ID: my.Software:ID;
        hardware_ID: my.Hardware:ID;
    };
}