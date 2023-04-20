using { managed } from '@sap/cds/common';

namespace sys.admin;

entity Employees: managed {
    key ID: Integer;
    name: String;
    roles: Association to many Employee_Roles;
}

entity Roles: managed {
    key ID: Integer;
    name: String;
}

@cds.autoexpose
entity Employee_Roles: managed {
    employee: Association to Employees @assert.integrity;
    role: Association to Roles @assert.integrity;
}

entity Hardware {
    key ID: Integer;
    name: String;
    @mandatory type: Hardware_Type;
    @readonly assigned_to: Association to Employees;
}

type Hardware_Type : String enum {
    Monitor; Workstation; Phone;
}

entity Software: managed {
    key ID: Integer;
    name: String;
}

entity Employee_Software {
    employee: Association to Employees @assert.target;
    software: Association to Software @assert.target;
    hardware: Association to Hardware @assert.target;
}

entity Role_Software {
    role: Association to Software;
    software: Association to Software;
    hardware_type: Hardware_Type;
}