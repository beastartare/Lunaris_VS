SELECT
    usuario.nome AS usuario,
    COUNT(DISTINCT favoritomaterialusuario.idmaterialestudo) AS fav_materiais,
    COUNT(DISTINCT favoritoconstelacaousuario.idconstelacao) AS fav_constelacoes,
    COUNT(DISTINCT favoritocorpocelesteusuario.idcorpoceleste) AS fav_corpos_celestes,
    COUNT(DISTINCT favoritoeventousuario.idevento) AS fav_eventos,
    COUNT(DISTINCT favoritopousuario.idpontoobs) AS fav_pontos_obs,
    COUNT(DISTINCT favoritousuariomissao.idmissaoespacial) AS fav_missoes,
    COUNT(DISTINCT favoritomaterialusuario.idmaterialestudo) +
    COUNT(DISTINCT favoritoconstelacaousuario.idconstelacao) +
    COUNT(DISTINCT favoritocorpocelesteusuario.idcorpoceleste) +
    COUNT(DISTINCT favoritoeventousuario.idevento) +
    COUNT(DISTINCT favoritopousuario.idpontoobs) +
    COUNT(DISTINCT favoritousuariomissao.idmissaoespacial) AS total_favoritos
FROM usuario
LEFT JOIN favoritomaterialusuario
    ON favoritomaterialusuario.idusuario = usuario.idusuario
LEFT JOIN favoritoconstelacaousuario
    ON favoritoconstelacaousuario.idusuario = usuario.idusuario
LEFT JOIN favoritocorpocelesteusuario
    ON favoritocorpocelesteusuario.idusuario = usuario.idusuario
LEFT JOIN favoritoeventousuario
    ON favoritoeventousuario.idusuario = usuario.idusuario
LEFT JOIN favoritopousuario
    ON favoritopousuario.idusuario = usuario.idusuario
LEFT JOIN favoritousuariomissao
    ON favoritousuariomissao.idusuario = usuario.idusuario
WHERE usuario.tipo_acesso_usuario != 3
GROUP BY
    usuario.idusuario,
    usuario.nome
ORDER BY total_favoritos DESC
LIMIT 10;

SELECT
    usuario.nome AS pesquisador,
    pontoobservacao.nome AS ponto_observacao,
    COUNT(dadometereologico.iddadometereologico) AS total_medicoes
FROM dadometereologico
JOIN usuario
    ON usuario.idusuario = dadometereologico.idusuario
JOIN pontoobservacao
    ON pontoobservacao.idpontoobs = dadometereologico.idpontoobs
WHERE usuario.tipo_acesso_usuario = 2
GROUP BY
    usuario.nome,
    pontoobservacao.nome
ORDER BY
    total_medicoes DESC
LIMIT 10;

SELECT
    eventoastronomico.categoria_evento_astro AS categoria,
    COUNT(DISTINCT evento.idevento) AS total_eventos,
    COUNT(DISTINCT corpocelesteevento.idcorpoceleste) AS corpos_celestes
FROM eventoastronomico
JOIN evento
    ON evento.idevento = eventoastronomico.idevento
LEFT JOIN corpocelesteevento
    ON corpocelesteevento.idevento = eventoastronomico.idevento
GROUP BY eventoastronomico.categoria_evento_astro
ORDER BY total_eventos DESC;