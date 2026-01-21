export type FieldType = 'text' | 'date' | 'signature' | 'checkbox';

export type ContractStatus = 'created' | 'approved' | 'sent' | 'signed' | 'locked' | 'revoked';

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface BlueprintField {
  id: string;
  blueprint_id: string;
  field_type: FieldType;
  label: string;
  position_x: number;
  position_y: number;
  created_at: string;
}

export interface Contract {
  id: string;
  name: string;
  blueprint_id: string;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
}

export interface ContractFieldValue {
  id: string;
  contract_id: string;
  blueprint_field_id: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface ContractWithDetails extends Contract {
  blueprint?: Blueprint;
  field_values?: ContractFieldValue[];
}

export interface BlueprintWithFields extends Blueprint {
  fields?: BlueprintField[];
}
