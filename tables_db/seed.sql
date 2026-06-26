INSERT INTO Usuario (
    idUsuario,
    nome,
    email,
    senha,
    username,
    tipo_acesso_usuario
) VALUES
(1, 'Administrador', 'lunaris@email.com', '12345678', 'admin', 3),
(2, 'Beariz Tartare', 'beastartare@gmail.com', '12345678', 'bea', 1),
(3, 'Rafaela Savaris', 'rafasavaris24@gmail.com', '12345678', 'rafa', 2);

INSERT INTO Constelacao (
    idConstelacao,
    idUsuario,
    descricao,
    nome
) VALUES
(1, 1, 'Constelação visível no hemisfério norte.', 'Órion'),
(2, 1, 'Constelação contendo Alfa Centauri.', 'Centauro');

INSERT INTO CorpoCeleste (
    idCorpoCeleste,
    idConstelacao,
    idUsuario,
    tipo_corpo_celeste,
    distancia,
    nome,
    descricao
) VALUES
(1, 1, 1, 'Nebulosa', 1344, 'Nebulosa de Órion', 'Região de formação estelar'),
(2, 2, 1, 'Estrela', 4.37, 'Alfa Centauri', 'Sistema estelar mais próximo'),
(3, NULL, 1, 'Planeta', 0.0000158, 'Marte', 'Quarto planeta do Sistema Solar');

INSERT INTO PontoObservacao (
    idPontoObs,
    idUsuario,
    latitude,
    longitude,
    descricao,
    nome
) VALUES
(1, 1, -27.5949, -48.5482, 'Observatório principal', 'Observatório Lunaris'),
(2, 1, -23.5505, -46.6333, 'Ponto urbano', 'Centro SP');

INSERT INTO DadoMetereologico (
    idDadoMetereologico,
    idPontoObs,
    umidade,
    indiceUV,
    temperatura,
    dataHora,
    dir_vento,
    vel_vento
) VALUES
(1, 1, 75, 5.2, 22.3, '2026-01-15 20:00:00', 'NE', 12),
(2, 2, 68, 7.5, 28.1, '2026-01-15 20:00:00', 'SE', 8);

INSERT INTO MissaoEspacial (
    idMissaoEspacial,
    idUsuario,
    nome,
    status_missao,
    descricao,
    agencia,
    dataLancamento
) VALUES
(1, 1, 'Apollo 11', 'Concluída',
 'Primeira missão tripulada à Lua',
 'NASA',
 '1969-07-16 13:32:00'),

(2, 1, 'Artemis I', 'Concluída',
 'Teste não tripulado do programa Artemis',
 'NASA',
 '2022-11-16 06:47:00');

INSERT INTO Evento (
    idEvento,
    idUsuario,
    longitude,
    latitude,
    dataHora,
    descricao,
    imagem
) VALUES
(1, 2, -48.5482, -27.5949,
 '2026-03-15 22:00:00',
 'Chuva de meteoros observada',
 NULL),

(2, 2, -46.6333, -23.5505,
 '2026-04-10 21:00:00',
 'Eclipse lunar',
 NULL);

INSERT INTO EventoAstronomico (
    idEvento,
    categoria_evento_astro,
    declinacao
) VALUES
(1, 'Chuva de Meteoros', -5.4),
(2, 'Eclipse Lunar', 12.8);

INSERT INTO MaterialEstudo (
    idMaterialEstudo,
    idUsuario,
    data_lancamento,
    tipo_arquivo,
    autor,
    descricao,
    titulo,
    arquivo
) VALUES
(
    1,
    1,
    '2026-01-01 00:00:00',
    'PDF',
    'Equipe Lunaris',
    'Introdução à astronomia',
    'Astronomia Básica',
    NULL
);

INSERT INTO FavoritoMaterialUsuario VALUES (1, 2);

INSERT INTO FavoritoConstelacaoUsuario VALUES (2, 1);

INSERT INTO FavoritoCorpoCelesteUsuario VALUES (1, 2);

INSERT INTO FavoritoEventoUsuario VALUES (2, 1);

INSERT INTO FavoritoPOUsuario VALUES (1, 2);

INSERT INTO FavoritoUsuarioMissao VALUES (2, 1);

INSERT INTO MissaoCorpoCeleste VALUES (3, 1);

INSERT INTO CorpoCelesteEvento VALUES (1, 1);

INSERT INTO UsuarioEventoPO (
    idUsuarioEventoPO,
    idEvento,
    idUsuario,
    idPontoObs
) VALUES
(1, 1, 2, 1);