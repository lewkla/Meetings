export interface Resource {
  id: number;
  name: string;
  type: 'room' | 'equipment';
  capacity?: number;
}
