export interface Team {
  id: number;
  name: string;
  allowed_classes: string[];
}

export interface TeamCreate {
  name: string;
  allowed_classes: string[];
}
export interface TeamUpdate {
  name?: string;
  allowed_classes?: string[];
}
