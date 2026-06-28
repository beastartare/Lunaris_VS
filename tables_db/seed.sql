
DECLARE
  id_admin UUID;
  id_bea   UUID;
  id_rafa  UUID;
BEGIN
  id_admin := gen_random_uuid();
  id_bea   := gen_random_uuid();
  id_rafa  := gen_random_uuid();

  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    role, aud, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES
  (id_admin, '00000000-0000-0000-0000-000000000000', 'lunaris@email.com',
   extensions.crypt('admin123', extensions.gen_salt('bf')),
   now(), 'authenticated', 'authenticated', now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
  (id_bea, '00000000-0000-0000-0000-000000000000', 'beastartare@gmail.com',
   extensions.crypt('123456', extensions.gen_salt('bf')),
   now(), 'authenticated', 'authenticated', now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
  (id_rafa, '00000000-0000-0000-0000-000000000000', 'rafasavaris24@gmail.com',
   extensions.crypt('123456', extensions.gen_salt('bf')),
   now(), 'authenticated', 'authenticated', now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', '');

  INSERT INTO Usuario (idUsuario, id, nome, email, username, tipo_acesso_usuario) VALUES
  (1, id_admin, 'Administrador',   'lunaris@email.com',       'admin', 3),
  (2, id_bea,   'Beariz Tartare',  'beastartare@gmail.com',   'bea',   1),
  (3, id_rafa,  'Rafaela Savaris', 'rafasavaris24@gmail.com', 'rafa',  2);

  INSERT INTO Constelacao (idConstelacao, idUsuario, descricao, nome) VALUES
  (1, 1, 'Constelação visível no hemisfério norte.', 'Órion'),
  (2, 1, 'Constelação contendo Alfa Centauri.', 'Centauro');

  INSERT INTO CorpoCeleste (idCorpoCeleste, idConstelacao, idUsuario, tipo_corpo_celeste, distancia, nome, descricao) VALUES
  (1, 1, 1, 'Nebulosa', 1344, 'Nebulosa de Órion', 'Região de formação estelar'),
  (2, 2, 1, 'Estrela', 4.37, 'Alfa Centauri', 'Sistema estelar mais próximo'),
  (3, NULL, 1, 'Planeta', 0.0000158, 'Marte', 'Quarto planeta do Sistema Solar');

  INSERT INTO PontoObservacao (idPontoObs, idUsuario, latitude, longitude, descricao, nome) VALUES
  (1, 1, -27.5949, -48.5482, 'Observatório principal', 'Observatório Lunaris'),
  (2, 1, -23.5505, -46.6333, 'Ponto urbano', 'Centro SP');

  INSERT INTO DadoMetereologico (idDadoMetereologico, idPontoObs, idUsuario, umidade, indiceUV, temperatura, dataHora, dir_vento, vel_vento) VALUES
  (1, 1, 3, 75, 5.2, 22.3, '2026-01-15 20:00:00', 'NE', 12),
  (2, 2, 3, 68, 7.5, 28.1, '2026-01-15 20:00:00', 'SE', 8);

  INSERT INTO MissaoEspacial (idMissaoEspacial, idUsuario, nome, status_missao, descricao, agencia, dataLancamento) VALUES
  (1, 1, 'Apollo 11', 'Concluída', 'Primeira missão tripulada à Lua', 'NASA', '1969-07-16 13:32:00'),
  (2, 1, 'Artemis I', 'Concluída', 'Teste não tripulado do programa Artemis', 'NASA', '2022-11-16 06:47:00');

  INSERT INTO Evento (idEvento, idUsuario, longitude, latitude, dataHora, descricao, imagem) VALUES
  (1, 1, -48.5482, -27.5949, '2026-03-15 22:00:00', 'Chuva de meteoros observada', NULL),
  (2, 2, -46.6333, -23.5505, '2026-04-10 21:00:00', 'Eclipse lunar', NULL);

  INSERT INTO EventoAstronomico (idEvento, categoria_evento_astro, declinacao) VALUES
  (1, 'Chuva de Meteoros', -5.4),
  (2, 'Eclipse Lunar', 12.8);

  INSERT INTO MaterialEstudo (idMaterialEstudo, idUsuario, data_lancamento, tipo_arquivo, autor, descricao, titulo, arquivo) VALUES
  (1, 1, '2026-01-01 00:00:00', 'PDF', 'Equipe Lunaris', 'Introdução à astronomia', 'Astronomia Básica', NULL);

  INSERT INTO FavoritoMaterialUsuario VALUES (1, 2);
  INSERT INTO FavoritoConstelacaoUsuario VALUES (2, 1);
  INSERT INTO FavoritoCorpoCelesteUsuario VALUES (1, 2);
  INSERT INTO FavoritoEventoUsuario VALUES (2, 1);
  INSERT INTO FavoritoPOUsuario VALUES (1, 2);
  INSERT INTO FavoritoUsuarioMissao VALUES (2, 1);
  INSERT INTO MissaoCorpoCeleste VALUES (3, 1);
  INSERT INTO CorpoCelesteEvento VALUES (1, 1);
  INSERT INTO UsuarioEventoPO (idUsuarioEventoPO, idEvento, idUsuario, idPontoObs) VALUES (1, 1, 2, 1);

  PERFORM setval(pg_get_serial_sequence('usuario',           'idusuario'),          (SELECT MAX(idusuario)           FROM usuario));
  PERFORM setval(pg_get_serial_sequence('evento',            'idevento'),           (SELECT MAX(idevento)            FROM evento));
  PERFORM setval(pg_get_serial_sequence('constelacao',       'idconstelacao'),      (SELECT MAX(idconstelacao)       FROM constelacao));
  PERFORM setval(pg_get_serial_sequence('corpoceleste',      'idcorpoceleste'),     (SELECT MAX(idcorpoceleste)      FROM corpoceleste));
  PERFORM setval(pg_get_serial_sequence('missaoespacial',    'idmissaoespacial'),   (SELECT MAX(idmissaoespacial)    FROM missaoespacial));
  PERFORM setval(pg_get_serial_sequence('pontoobservacao',   'idpontoobs'),         (SELECT MAX(idpontoobs)          FROM pontoobservacao));
  PERFORM setval(pg_get_serial_sequence('dadometereologico', 'iddadometereologico'),(SELECT MAX(iddadometereologico) FROM dadometereologico));
  PERFORM setval(pg_get_serial_sequence('materialestudo',    'idmaterialestudo'),   (SELECT MAX(idmaterialestudo)    FROM materialestudo));
  PERFORM setval(pg_get_serial_sequence('usuarioeventopo',   'idusuarioeventopo'),  (SELECT MAX(idusuarioeventopo)   FROM usuarioeventopo));
END;
