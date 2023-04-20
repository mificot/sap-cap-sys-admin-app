export type HardwareType = 'Monitor' | 'Workstation' | 'Phone';

export interface Hardware {
    ID: number;
    name: string;
    type: HardwareType;
    assigned_to_ID: number;
}
