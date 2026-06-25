CREATE TABLE Usuario (
    idUsuario identity PRIMARY KEY,
    nome varchar(100),
    email varchar(50),
    username varchar(50),
    tipo_acesso_usuario integer
);

CREATE TABLE Evento (
    idEvento identity PRIMARY KEY,
    idUsuario identity,
    longitude numeric,
    latitude numeric,
    dataHora timestamp,
    descricao varchar(100),
    imagem BYTEA,
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE EventoMetereologico (
    idEvento identity PRIMARY KEY,
    categoria_evento_met varchar(30),
    FOREIGN KEY (idEvento) REFERENCES Evento(idEvento)
);

CREATE TABLE EventoAstronomico (
    idEvento identity PRIMARY KEY,
    categoria_evento_astro varchar(30),
    declinacao numeric,
    FOREIGN KEY (idEvento) REFERENCES Evento(idEvento)
);

CREATE TABLE Constelacao (
    idConstelacao identity PRIMARY KEY,
    idUsuario identity,
    descricao varchar(100),
    nome varchar(50),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE CorpoCeleste (
    idCorpoCeleste identity PRIMARY KEY,
    idConstelacao identity NULL,
    idUsuario identity,
    tipo_corpo_celeste varchar(30),
    distancia numeric,
    nome varchar(100),
    descricao varchar(100),
    FOREIGN KEY (idConstelacao) REFERENCES Constelacao(idConstelacao),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE MissaoEspacial (
    idMissaoEspacial identity PRIMARY KEY,
    idUsuario identity,
    nome varchar(50),
    status_missao varchar(30),
    descricao varchar(100),
    agencia varchar(50),
    dataLancamento timestamp,
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE PontoObservacao (
    idPontoObs identity PRIMARY KEY,
    idUsuario identity,
    latitude numeric,
    longitude numeric,
    descricao varchar(100),
    nome varchar(50),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE DadoMetereologico (
    idDadoMetereologico identity PRIMARY KEY,
    idPontoObs identity,
    umidade numeric,
    indiceUV numeric,
    temperatura numeric,
    dataHora timestamp,
    dir_vento varchar(2),
    vel_vento numeric,
    FOREIGN KEY (idPontoObs) REFERENCES PontoObservacao(idPontoObs)
);

CREATE TABLE MaterialEstudo (
    idMaterialEstudo identity PRIMARY KEY,
    idUsuario identity,
    data_lancamento timestamp,
    tipo_arquivo varchar(30),
    autor varchar(100),
    descricao varchar(100),
    titulo varchar(100),
    arquivo BYTEA,
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE FavoritoMaterialUsuario (
    idMaterialEstudo identity,
    idUsuario identity,
    PRIMARY KEY (idMaterialEstudo, idUsuario),
    FOREIGN KEY (idMaterialEstudo) REFERENCES MaterialEstudo(idMaterialEstudo),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE FavoritoConstelacaoUsuario (
    idUsuario identity,
    idConstelacao identity,
    PRIMARY KEY (idUsuario, idConstelacao),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario),
    FOREIGN KEY (idConstelacao) REFERENCES Constelacao(idConstelacao)
);

CREATE TABLE FavoritoCorpoCelesteUsuario (
    idCorpoCeleste identity,
    idUsuario identity,
    PRIMARY KEY (idCorpoCeleste, idUsuario),
    FOREIGN KEY (idCorpoCeleste) REFERENCES CorpoCeleste(idCorpoCeleste),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE FavoritoEventoUsuario (
    idUsuario identity,
    idEvento identity,
    PRIMARY KEY (idUsuario, idEvento),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario),
    FOREIGN KEY (idEvento) REFERENCES Evento(idEvento)
);

CREATE TABLE FavoritoPOUsuario (
    idPontoObs identity,
    idUsuario identity,
    PRIMARY KEY (idPontoObs, idUsuario),
    FOREIGN KEY (idPontoObs) REFERENCES PontoObservacao(idPontoObs),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE FavoritoUsuarioMissao (
    idUsuario identity,
    idMissaoEspacial identity,
    PRIMARY KEY (idUsuario, idMissaoEspacial),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario),
    FOREIGN KEY (idMissaoEspacial) REFERENCES MissaoEspacial(idMissaoEspacial)
);

CREATE TABLE MissaoCorpoCeleste (
    idCorpoCeleste identity,
    idMissaoEspacial identity,
    PRIMARY KEY (idCorpoCeleste, idMissaoEspacial),
    FOREIGN KEY (idCorpoCeleste) REFERENCES CorpoCeleste(idCorpoCeleste),
    FOREIGN KEY (idMissaoEspacial) REFERENCES MissaoEspacial(idMissaoEspacial)
);

CREATE TABLE CorpoCelesteEvento (
    idCorpoCeleste identity,
    idEvento identity,
    PRIMARY KEY (idCorpoCeleste, idEvento),
    FOREIGN KEY (idCorpoCeleste) REFERENCES CorpoCeleste(idCorpoCeleste),
    FOREIGN KEY (idEvento) REFERENCES EventoAstronomico(idEvento)
);

CREATE TABLE UsuarioEventoPO (
    idUsuarioEventoPO identity PRIMARY KEY,
    idEvento identity,
    idUsuario identity,
    idPontoObs identity,

    UNIQUE (idEvento, idUsuario, idPontoObs),

    FOREIGN KEY (idEvento) REFERENCES Evento(idEvento),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario),
    FOREIGN KEY (idPontoObs) REFERENCES PontoObservacao(idPontoObs)
);