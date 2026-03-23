# AI Context Index

Questa cartella contiene il contesto condiviso del progetto.
Non e un planning operativo: serve a descrivere dominio, prodotto, regole e vincoli.

## Ordine di lettura consigliato

1. `product.md`
2. `domain_rules.md`
3. `roles_permissions.md`
4. `user_flows.md`
5. `db.md`
6. `prisma_model.md`
7. `technical_baseline.md`
8. `open_questions.md`
9. `open_questions/decisioni_core.md`

## Documenti

### `product.md`

Visione del prodotto, obiettivi MVP, perimetro e glossario minimo.

### `domain_rules.md`

Regole funzionali certe derivate dal dominio e dal modello dati.

### `roles_permissions.md`

Attori del sistema e relative responsabilita.

### `user_flows.md`

Flussi applicativi principali lato utente e lato admin.

### `db.md`

Descrizione del dominio dati ad alto livello.

### `prisma_model.md`

Schema Prisma baseline da considerare come riferimento tecnico del database.

### `technical_baseline.md`

Stack corrente, principi architetturali e confini iniziali dell'applicazione.

### `open_questions.md`

Decisioni ancora aperte che andranno chiuse prima del planning dettagliato.

### `open_questions/decisioni_core.md`

Questionario esteso da compilare per chiudere le 5 decisioni principali che bloccano il planning.

## Nota

Quando aggiorniamo il dominio o il perimetro funzionale, questi file vanno aggiornati prima del planning e prima di scrivere feature complesse.
