/*
  # Contract Management Platform Schema

  1. New Tables
    - `blueprints`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `blueprint_fields`
      - `id` (uuid, primary key)
      - `blueprint_id` (uuid, foreign key)
      - `field_type` (text, not null) - 'text', 'date', 'signature', 'checkbox'
      - `label` (text, not null)
      - `position_x` (numeric)
      - `position_y` (numeric)
      - `created_at` (timestamptz)
    
    - `contracts`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `blueprint_id` (uuid, foreign key)
      - `status` (text, not null) - 'created', 'approved', 'sent', 'signed', 'locked', 'revoked'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `contract_field_values`
      - `id` (uuid, primary key)
      - `contract_id` (uuid, foreign key)
      - `blueprint_field_id` (uuid, foreign key)
      - `value` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since no auth is required for this assignment)
*/

-- Create blueprints table
CREATE TABLE IF NOT EXISTS blueprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blueprint_fields table
CREATE TABLE IF NOT EXISTS blueprint_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id uuid NOT NULL REFERENCES blueprints(id) ON DELETE CASCADE,
  field_type text NOT NULL CHECK (field_type IN ('text', 'date', 'signature', 'checkbox')),
  label text NOT NULL,
  position_x numeric DEFAULT 0,
  position_y numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  blueprint_id uuid NOT NULL REFERENCES blueprints(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'approved', 'sent', 'signed', 'locked', 'revoked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contract_field_values table
CREATE TABLE IF NOT EXISTS contract_field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  blueprint_field_id uuid NOT NULL REFERENCES blueprint_fields(id) ON DELETE RESTRICT,
  value text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(contract_id, blueprint_field_id)
);

-- Enable RLS
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprint_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_field_values ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required for this demo)
CREATE POLICY "Allow public read access to blueprints"
  ON blueprints FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access to blueprints"
  ON blueprints FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access to blueprints"
  ON blueprints FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to blueprints"
  ON blueprints FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to blueprint_fields"
  ON blueprint_fields FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access to blueprint_fields"
  ON blueprint_fields FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access to blueprint_fields"
  ON blueprint_fields FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to blueprint_fields"
  ON blueprint_fields FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to contracts"
  ON contracts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access to contracts"
  ON contracts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access to contracts"
  ON contracts FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to contracts"
  ON contracts FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to contract_field_values"
  ON contract_field_values FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access to contract_field_values"
  ON contract_field_values FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access to contract_field_values"
  ON contract_field_values FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to contract_field_values"
  ON contract_field_values FOR DELETE
  TO anon
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blueprint_fields_blueprint_id ON blueprint_fields(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_contracts_blueprint_id ON contracts(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contract_field_values_contract_id ON contract_field_values(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_field_values_blueprint_field_id ON contract_field_values(blueprint_field_id);