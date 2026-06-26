SELECT
    usuario.nome AS pesquisador,
    COUNT(DISTINCT evento.idevento) AS total_eventos
FROM usuario
JOIN evento
    ON evento.idusuario = usuario.idusuario
LEFT JOIN usuarioeventopo
    ON usuarioeventopo.idevento = evento.idevento
WHERE usuario.tipo_acesso_usuario = 1
GROUP BY
    usuario.idusuario,
    usuario.nome
ORDER BY total_eventos DESC;

SELECT
    eventoastronomico.categoria_evento_astro AS categoria,
    COUNT(DISTINCT evento.idevento) AS total_eventos,
    COUNT(DISTINCT corpocelesteevento.idcorpoceleste) AS corpos_celestes_distintos,
    COUNT(DISTINCT evento.idusuario) AS pesquisadores_envolvidos,
    MIN(evento.datahora) AS primeiro_evento,
    MAX(evento.datahora) AS ultimo_evento
FROM eventoastronomico
JOIN evento
    ON evento.idevento = eventoastronomico.idevento
JOIN usuario
    ON usuario.idusuario = evento.idusuario
LEFT JOIN corpocelesteevento
    ON corpocelesteevento.idevento = eventoastronomico.idevento
WHERE usuario.tipo_acesso_usuario = 1
GROUP BY eventoastronomico.categoria_evento_astro
ORDER BY total_eventos DESC;

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