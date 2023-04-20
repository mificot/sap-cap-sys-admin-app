using { sys.admin as my } from '../db/schema';

service EmployeesService @(path: '/registry') {
    entity Roles as projection on my.Roles { ID, name };

    @readonly
    @cds.redirection.target: false
    entity ListOfEmployees as projection on my.Employees { ID, name, createdAt, modifiedAt };
    extend ListOfEmployees with columns {
        roles: Association to many my.Employee_Roles on roles.employee = $self
    };

    @insertonly
    entity Employees as projection on my.Employees;

    action assignRole(employee_ID: my.Employees:ID, role_ID: Roles:ID);

    event EmployeeRoleAssigned : {
        employee_ID: my.Employees:ID;
        role_ID: Roles:ID;
    };
}