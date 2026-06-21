-- Usuário pode ver seu próprio perfil

create policy "Usuario pode ler o proprio perfil"
on public."Usuario"
for select
using (
    auth.uid() = id
);

-- Usuário pode inserir seu próprio perfil

create policy "Usuario pode criar o proprio perfil"
on public."Usuario"
for insert
with check (
    auth.uid() = id
);

-- Usuário pode atualizar seu próprio perfil

create policy "Usuario pode atualizar o proprio perfil"
on public."Usuario"
for update
using (
    auth.uid() = id
);