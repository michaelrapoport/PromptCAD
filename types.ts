export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export interface ComponentConfig {
  x: number;
  y: number;
  rotate?: number;
  label?: string;
}

export type ComponentType = 
  | 'resistor' | 'capacitor' | 'inductor' | 'diode' | 'led'
  | 'source_v' | 'source_i' | 'gnd' 
  | 'opamp' 
  | 'transistor_npn' | 'transistor_pnp' 
  | 'mosfet_n' | 'mosfet_p'
  | 'gate_and' | 'gate_or' | 'gate_not' | 'gate_nand' | 'gate_nor' | 'gate_xor'
  | 'arduino_uno' | 'stepper_motor' | 'driver_stepper' | 'antenna' | 'ic_555';

export interface PinPosition {
  x: number;
  y: number;
}

export interface ComponentInstance {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  rotation: number;
  pins: Record<string, PinPosition>;
}