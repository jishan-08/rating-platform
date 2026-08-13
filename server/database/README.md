# Rating Platform database schema

`migrations/001_initial_schema.sql` creates the `rating_platform` database and its initial tables. It is schema-only and does not add demo data.

## Tables and relationships

- `users` contains every account. Each user has a required name, unique email, password hash, address, and one of the `ADMIN`, `USER`, or `STORE_OWNER` roles.
- `stores` contains stores. `owner_id` references `users.id`; application logic will ensure that the referenced user has the `STORE_OWNER` role. An owner may be associated with multiple stores.
- `ratings` records a user's 1-5 rating of a store. `user_id` references `users.id` and `store_id` references `stores.id`.

`UNIQUE (user_id, store_id)` permits at most one rating from a given user for a given store. Updating that row changes the user's rating without creating a duplicate.

Average ratings are deliberately not stored in `stores`. They are derived from the current `ratings` rows (for example, with `AVG(rating)`), which prevents a redundant value from becoming inconsistent.

## Constraints and delete behavior

- User names are trimmed for validation and must contain 2-60 characters. User and store addresses are required and limited to 400 characters.
- The `users.role` check accepts only `ADMIN`, `USER`, and `STORE_OWNER`.
- `ratings.rating` is constrained to integers from 1 through 5.
- Passwords have a `password_hash` field only; plaintext passwords are never part of the schema.
- A store owner cannot be deleted while stores still reference that account (`RESTRICT`). Deleting a user otherwise removes their ratings, and deleting a store removes its ratings (`CASCADE`), so ratings cannot be orphaned. Referenced identifiers cascade on update.

## Indexes

- `users.name` supports name searches; `users.role` supports role-based administration. The unique constraint on `users.email` supplies the email index, so a duplicate index is unnecessary.
- `stores.name`, `stores.email`, and `stores.address` support the planned store search fields. `stores.owner_id` supports owner lookups and the foreign key.
- The unique `(user_id, store_id)` index supports `ratings.user_id` because `user_id` is its leftmost column. `ratings.store_id` has its own index for store-rating lookups and its foreign key.
