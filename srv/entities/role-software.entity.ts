import { HardwareType } from "./hardware.entity";

export interface RoleSoftware {
    role_ID: number;
    software_ID: number;
    hardware_type: HardwareType;
}
