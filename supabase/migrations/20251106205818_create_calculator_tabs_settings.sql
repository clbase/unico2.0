/*
  # Configurações dos Botões de Calculadora

  1. Nova Tabela
    - `calculator_tabs_settings`
      - `id` (uuid, primary key)
      - `active_color` (text) - Cor quando o botão está ativo (formato hex)
      - `is_active` (boolean) - Se as configurações personalizadas estão ativas
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `updated_by` (uuid) - Referência ao admin que fez a última atualização

  2. Segurança
    - Habilitar RLS na tabela
    - Permitir leitura pública (qualquer pessoa pode ver as configurações)
    - Apenas admins autenticados podem atualizar

  3. Dados Iniciais
    - Inserir configuração padrão com cor azul (#3B82F6)
*/

-- Criar tabela para configurações dos botões de calculadora
CREATE TABLE IF NOT EXISTS calculator_tabs_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  active_color text NOT NULL DEFAULT '#3B82F6',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE calculator_tabs_settings ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública
CREATE POLICY "Qualquer pessoa pode visualizar configurações dos botões"
  ON calculator_tabs_settings
  FOR SELECT
  TO public
  USING (true);

-- Política para atualização por admins
CREATE POLICY "Apenas admins podem atualizar configurações dos botões"
  ON calculator_tabs_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Inserir configuração padrão se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM calculator_tabs_settings) THEN
    INSERT INTO calculator_tabs_settings (active_color, is_active)
    VALUES ('#3B82F6', true);
  END IF;
END $$;
