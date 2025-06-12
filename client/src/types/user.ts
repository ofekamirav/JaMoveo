import { Instrument } from './instrument';

export interface User {
  _id: string; 
  name: string;
  email: string;
  instrument: Instrument; 
  role: 'player' | 'admin';
}