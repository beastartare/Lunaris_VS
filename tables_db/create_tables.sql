CREATE TABLE Usuario (
    idUsuario integer PRIMARY KEY,
    nome varchar(100),
    email varchar(50),
    senha varchar(255),
    username varchar(50),
    tipo_acesso_usuario integer
);

CREATE TABLE Evento (
    idEvento integer PRIMARY KEY,
    idUsuario integer,
    longitude numeric,
    latitude numeric,
    dataHora timestamp,
    descricao varchar(100),
    imagem BYTEA,
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE EventoMetereologico (
    idEvento integer PRIMARY KEY,
    categoria_evento_met varchar(30),
    FOREIGN KEY (idEvento) REFERENCES Evento(idEvento)
);

CREATE TABLE EventoAstronomico (
    idEvento integer PRIMARY KEY,
    categoria_evento_astro varchar(30),
    declinacao numeric,
    FOREIGN KEY (idEvento) REFERENCES Evento(idEvento)
);

CREATE TABLE Constelacao (
    idConstelacao integer PRIMARY KEY,
    idUsuario integer,
    descricao varchar(100),
    nome varchar(50),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE CorpoCeleste (
    idCorpoCeleste integer PRIMARY KEY,
    idConstelacao integer NULL,
    idUsuario integer,
    tipo_corpo_celeste varchar(30),
    distancia numeric,
    nome varchar(100),
    descricao varchar(100),
    FOREIGN KEY (idConstelacao) REFERENCES Constelacao(idConstelacao),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE MissaoEspacial (
    idMissaoEspacial integer PRIMARY KEY,
    idUsuario integer,
    nome varchar(50),
    status_missao varchar(30),
    descricao varchar(100),
    agencia varchar(50),
    dataLancamento timestamp,
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE PontoObservacao (
    idPontoObs integer PRIMARY KEY,
    idUsuario integer,
    latitude numeric,
    longitude numeric,
    descricao varchar(100),
    nome varchar(50),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE DadoMetereologico (
    idDadoMetereologico integer PRIMARY KEY,
    idPontoObs integer,
    umidade numeric,
    indiceUV numeric,
    temperatura numeric,
    dataHora timestamp,
    dir_vento varchar(2),
    vel_vento numeric,
    FOREIGN KEY (idPontoObs) REFERENCES PontoObservacao(idPontoObs)
);

CREATE TABLE MaterialEstudo (
    idMaterialEstudo integer PRIMARY KEY,
    idUsuario integer,
    data_lancamento timestamp,
    tipo_arquivo varchar(30),
    autor varchar(100),
    descricao varchar(100),
    titulo varchar(100),
    arquivo BYTEA,
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE FavoritoMaterialUsuario (
    idMaterialEstudo integer,
    idUsuario integer,
    PRIMARY KEY (idMaterialEstudo, idUsuario),
    FOREIGN KEY (idMaterialEstudo) REFERENCES MaterialEstudo(idMaterialEstudo),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE FavoritoConstelacaoUsuario (
    idUsuario integer,
    idConstelacao integer,
    PRIMARY KEY (idUsuario, idConstelacao),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario),
    FOREIGN KEY (idConstelacao) REFERENCES Constelacao(idConstelacao)
);

CREATE TABLE FavoritoCorpoCelesteUsuario (
    idCorpoCeleste integer,
    idUsuario integer,
    PRIMARY KEY (idCorpoCeleste, idUsuario),
    FOREIGN KEY (idCorpoCeleste) REFERENCES CorpoCeleste(idCorpoCeleste),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE FavoritoEventoUsuario (
    idUsuario integer,
    idEvento integer,
    PRIMARY KEY (idUsuario, idEvento),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario),
    FOREIGN KEY (idEvento) REFERENCES Evento(idEvento)
);

CREATE TABLE FavoritoPOUsuario (
    idPontoObs integer,
    idUsuario integer,
    PRIMARY KEY (idPontoObs, idUsuario),
    FOREIGN KEY (idPontoObs) REFERENCES PontoObservacao(idPontoObs),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE FavoritoUsuarioMissao (
    idUsuario integer,
    idMissaoEspacial integer,
    PRIMARY KEY (idUsuario, idMissaoEspacial),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario),
    FOREIGN KEY (idMissaoEspacial) REFERENCES MissaoEspacial(idMissaoEspacial)
);

CREATE TABLE MissaoCorpoCeleste (
    idCorpoCeleste integer,
    idMissaoEspacial integer,
    PRIMARY KEY (idCorpoCeleste, idMissaoEspacial),
    FOREIGN KEY (idCorpoCeleste) REFERENCES CorpoCeleste(idCorpoCeleste),
    FOREIGN KEY (idMissaoEspacial) REFERENCES MissaoEspacial(idMissaoEspacial)
);

CREATE TABLE CorpoCelesteEvento (
    idCorpoCeleste integer,
    idEvento integer,
    PRIMARY KEY (idCorpoCeleste, idEvento),
    FOREIGN KEY (idCorpoCeleste) REFERENCES CorpoCeleste(idCorpoCeleste),
    FOREIGN KEY (idEvento) REFERENCES EventoAstronomico(idEvento)
);

CREATE TABLE UsuarioEventoPO (
    idUsuarioEventoPO integer PRIMARY KEY,
    idEvento integer,
    idUsuario integer,
    idPontoObs integer,

    UNIQUE (idEvento, idUsuario, idPontoObs),

    FOREIGN KEY (idEvento) REFERENCES Evento(idEvento),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario),
    FOREIGN KEY (idPontoObs) REFERENCES PontoObservacao(idPontoObs)
);