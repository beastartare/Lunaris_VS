CREATE OR REPLACE FUNCTION get_variacao_temperatura()
RETURNS TABLE (
  ponto_observacao text,
  responsavel text,
  temp_minima numeric,
  temp_maxima numeric,
  variacao_temp numeric,
  temp_media numeric,
  total_medicoes bigint
) AS $$
  SELECT
    po.nome,
    u.nome,
    ROUND(MIN(dm.temperatura), 1),
    ROUND(MAX(dm.temperatura), 1),
    ROUND(MAX(dm.temperatura) - MIN(dm.temperatura), 1),
    ROUND(AVG(dm.temperatura), 1),
    COUNT(dm.iddadometereologico)
  FROM pontoobservacao po
  JOIN usuario u            ON u.idusuario   = po.idusuario
  JOIN dadometereologico dm ON dm.idpontoobs = po.idpontoobs
  GROUP BY po.idpontoobs, po.nome, u.idusuario, u.nome
  HAVING COUNT(dm.iddadometereologico) > 1
  ORDER BY 5 DESC;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_eventos_astro_categoria()
RETURNS TABLE (
  categoria text,
  total_eventos bigint,
  corpos_celestes_distintos bigint,
  pesquisadores_envolvidos bigint,
  primeiro_evento timestamptz,
  ultimo_evento timestamptz
) AS $$
  SELECT
    ea.categoria_evento_astro,
    COUNT(DISTINCT e.idevento),
    COUNT(DISTINCT cce.idcorpoceleste),
    COUNT(DISTINCT e.idusuario),
    MIN(e.datahora),
    MAX(e.datahora)
  FROM eventoastronomico ea
  JOIN evento e                    ON e.idevento    = ea.idevento
  JOIN usuario u                   ON u.idusuario   = e.idusuario
  LEFT JOIN corpocelesteevento cce ON cce.idevento  = ea.idevento
  WHERE u.tipo_acesso_usuario = 1
  GROUP BY ea.categoria_evento_astro
  ORDER BY 2 DESC;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_ranking_favoritos()
RETURNS TABLE (
  usuario text,
  fav_materiais bigint,
  fav_constelacoes bigint,
  fav_corpos_celestes bigint,
  fav_eventos bigint,
  fav_pontos_obs bigint,
  fav_missoes bigint,
  total_favoritos bigint
) AS $$
  SELECT
    u.nome,
    COUNT(DISTINCT fmu.idmaterialestudo),
    COUNT(DISTINCT fcu.idconstelacao),
    COUNT(DISTINCT fccu.idcorpoceleste),
    COUNT(DISTINCT feu.idevento),
    COUNT(DISTINCT fpou.idpontoobs),
    COUNT(DISTINCT fum.idmissaoespacial),
    COUNT(DISTINCT fmu.idmaterialestudo) +
    COUNT(DISTINCT fcu.idconstelacao)    +
    COUNT(DISTINCT fccu.idcorpoceleste)  +
    COUNT(DISTINCT feu.idevento)         +
    COUNT(DISTINCT fpou.idpontoobs)      +
    COUNT(DISTINCT fum.idmissaoespacial)
  FROM usuario u
  LEFT JOIN favoritomaterialusuario     fmu  ON fmu.idusuario  = u.idusuario
  LEFT JOIN favoritoconstelacaousuario  fcu  ON fcu.idusuario  = u.idusuario
  LEFT JOIN favoritocorpocelesteusuario fccu ON fccu.idusuario = u.idusuario
  LEFT JOIN favoritoeventousuario       feu  ON feu.idusuario  = u.idusuario
  LEFT JOIN favoritopousuario           fpou ON fpou.idusuario = u.idusuario
  LEFT JOIN favoritousuariomissao       fum  ON fum.idusuario  = u.idusuario
  WHERE u.tipo_acesso_usuario != 3
  GROUP BY u.idusuario, u.nome
  ORDER BY 8 DESC;
$$ LANGUAGE sql STABLE;