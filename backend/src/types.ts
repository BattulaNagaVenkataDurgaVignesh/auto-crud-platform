export type FieldDef = {
    name: string;
    type: "string" | "number" | "boolean" | "date" | string;
    required?: boolean;
    default?: any;
    unique?: boolean;
    relation?: string | null;
  };
  
  export type ModelDef = {
    name: string; // e.g., "Employee"
    tableName?: string;
    fields: FieldDef[];
    ownerField?: string | null;
    rbac?: { [role: string]: string[] }; // e.g., { Admin: ["all"], Viewer: ["read"] }
  };
  