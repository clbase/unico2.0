/*
  # Add authorized emails

  1. Changes
    - Insert authorized email addresses into allowed_emails table
*/

INSERT INTO allowed_emails (email) VALUES
  ('netinho7260@gmail.com'),
  ('herique15699@gmail.com'),
  ('adriel.ac11@gmail.com'),
  ('hgandini819@gmail.com'),
  ('danielasousa@gmail.com'),
  ('gustavosangaletti_f@hotmail.com'),
  ('arthurluis0304@gmail.com'),
  ('jf36381505@gmail.com'),
  ('pedroh.buenonistal@gmail.com'),
  ('adrianbiel9@gmail.com'),
  ('thyagomod2012@gmail.com'),
  ('ms0926608@gmail.com'),
  ('claudiosantor5@gmail.com'),
  ('matheus.santiago23@hotmail.com'),
  ('souzajunior299@gmail.com'),
  ('expectivaff@gmail.com'),
  ('abdulla.henrique.out@gmail.com'),
  ('marcelo_mj7@hotmail.com'),
  ('kakalisboamarques@gmail.com'),
  ('dedefilho218@gmail.com'),
  ('caionunes1975@gmail.com'),
  ('vinitrindade01@gmail.com'),
  ('marialia121js@gmail.com'),
  ('welington.rdgs@gmail.com'),
  ('murillogarcias6425@gmail.com'),
  ('cauaf@outlook.com'),
  ('felipe.souza.fs1000@gmail.com'),
  ('lucasmaceio123@gmail.com'),
  ('bitulucas74@gmail.com'),
  ('elterdias1999@gmail.com'),
  ('cezinhadois22@gmail.com'),
  ('vivimars121@gmail.com'),
  ('douglasxdd10@gmail.com'),
  ('caikfranbr@gmail.com'),
  ('pysuic@gmail.com'),
  ('antonellienzo80@gmail.com'),
  ('mensalfree@gmail.com')
ON CONFLICT (email) DO NOTHING;