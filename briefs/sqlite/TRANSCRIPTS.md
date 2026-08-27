# sqlite — the transcripts, as recorded

**GENERATED FILE — do not edit.** `node scripts/gen-captures.mjs sqlite sqlite-act1 sqlite-act2 sqlite-act3`.

Every line below was read back off a real terminal by the recording runner. Nothing
here was typed from memory or from documentation: if a command is in this file, it ran
on a real machine and printed exactly this (LAW 0m).

## sqlite-act1

Recorded from `demos/sqlite-act1.json` — 12 steps.

### `version` — *the version we teach*

```console
$ sq -version
3.53.4 2026-07-24 19:02:57 bf7c7f30031888f4e796e429ab3978879485813aaca6f641c7b33e4e09459bcc (64-bit)
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `ver`.

### `open-schema` — *four lines of table*

Opens `(a file)` in the editor.

Callout targets measured on screen: `strict`, `notnull`.

### `create` — *make the table*

```console
$ sq shop.db ".read schema.sql"
```

exit **0** · truth: `read-back`

### `strict-error` — *what STRICT actually buys you*

```console
$ sq shop.db "INSERT INTO products (name, price) VALUES ('Broken', 'not-a-number');"
Error in 2nd command line argument: cannot store TEXT value in REAL column products.price
```

exit **1**  — this step FAILS on purpose; the lesson is the error. · truth: `read-back`

Callout targets measured on screen: `err`.

### `insert` — *put four rows in*

```console
$ sq shop.db ".read seed.sql"
```

exit **0** · truth: `read-back`

### `select` — *read them back*

```console
$ sq shop.db -box -header "SELECT * FROM products;"
╭────┬─────────────────────┬───────╮
│ id │        name         │ price │
╞════╪═════════════════════╪═══════╡
│  1 │ Mechanical keyboard │  89.0 │
│  2 │ 27-inch monitor     │ 240.0 │
│  3 │ Desk lamp           │  35.5 │
│  4 │ USB-C hub           │  45.0 │
╰────┴─────────────────────┴───────╯
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `kb`, `mon`.

### `where` — *only some of them*

```console
$ sq shop.db -box -header "SELECT name, price FROM products WHERE price < 60;"
╭───────────┬───────╮
│   name    │ price │
╞═══════════╪═══════╡
│ Desk lamp │  35.5 │
│ USB-C hub │  45.0 │
╰───────────┴───────╯
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `cheap`.

### `order` — *and in an order you choose*

```console
$ sq shop.db -box -header "SELECT name, price FROM products ORDER BY price DESC LIMIT 3;"
╭─────────────────────┬───────╮
│        name         │ price │
╞═════════════════════╪═══════╡
│ 27-inch monitor     │ 240.0 │
│ Mechanical keyboard │  89.0 │
│ USB-C hub           │  45.0 │
╰─────────────────────┴───────╯
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `top`.

### `update` — *change one, and see what changed*

```console
$ sq shop.db -box -header "UPDATE products SET price = 79.00 WHERE name = 'Mechanical keyboard' RETURNING name, price;"
╭─────────────────────┬───────╮
│        name         │ price │
╞═════════════════════╪═══════╡
│ Mechanical keyboard │  79.0 │
╰─────────────────────┴───────╯
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `newprice`.

### `delete` — *and take one away*

```console
$ sq shop.db -box -header "DELETE FROM products WHERE name = 'Desk lamp'; SELECT changes() AS rows_deleted;"
╭──────────────╮
│ rows_deleted │
╞══════════════╡
│            1 │
╰──────────────╯
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `n`.

### `schema` — *the database describing itself*

```console
$ sq shop.db ".schema products"
CREATE TABLE products (
  id    INTEGER PRIMARY KEY,
  name  TEXT    NOT NULL,
  price REAL    NOT NULL
) STRICT;
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `sch`.

### `just-a-file` — *it is only a file*

```console
$ Get-Item shop.db | Select-Object Name, Length
Name    Length
----    ------
shop.db   8192
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `file`.

## sqlite-act2

Recorded from `demos/sqlite-act2.json` — 9 steps.

### `add-orders` — *add a second table*

```console
$ sq shop.db ".read orders.sql"
```

exit **0** · truth: `read-back`

### `open-revenue` — *the join*

Opens `(a file)` in the editor.

Callout targets measured on screen: `joinline`.

### `revenue` — *revenue per product*

```console
$ sq shop.db -box -header ".read revenue.sql"
╭─────────────────────┬───────┬─────────╮
│        name         │ units │ revenue │
╞═════════════════════╪═══════╪═════════╡
│ Mechanical keyboard │     6 │   534.0 │
│ 27-inch monitor     │     1 │   240.0 │
│ Desk lamp           │     4 │   142.0 │
│ USB-C hub           │     2 │    90.0 │
╰─────────────────────┴───────┴─────────╯
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `top`, `rev`.

### `aggregate` — *the whole table, as three numbers*

```console
$ sq shop.db -box -header "SELECT COUNT(*) AS orders, SUM(qty) AS units, ROUND(AVG(qty),2) AS avg_qty FROM orders;"
╭────────┬───────┬─────────╮
│ orders │ units │ avg_qty │
╞════════╪═══════╪═════════╡
│      6 │    13 │    2.17 │
╰────────┴───────┴─────────╯
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `units`, `avg`.

### `having` — *filtering the GROUPS, not the rows*

```console
$ sq shop.db -box -header "SELECT product_id, SUM(qty) AS units FROM orders GROUP BY product_id HAVING SUM(qty) > 2;"
╭────────────┬───────╮
│ product_id │ units │
╞════════════╪═══════╡
│          1 │     6 │
│          3 │     4 │
╰────────────┴───────╯
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `kept`.

### `null` — *NULL is not empty, and not zero*

```console
$ sq shop.db -box -header "SELECT name, note, note = '' AS is_empty, note IS NULL AS is_null FROM products LIMIT 2;"
╭─────────────────────┬──────┬──────────┬─────────╮
│        name         │ note │ is_empty │ is_null │
╞═════════════════════╪══════╪══════════╪═════════╡
│ Mechanical keyboard │      │          │       1 │
│ 27-inch monitor     │      │          │       1 │
╰─────────────────────┴──────┴──────────┴─────────╯
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `blank`, `isnull`.

### `plan-before` — *how does it find them?*

```console
$ sq shop.db "EXPLAIN QUERY PLAN SELECT * FROM orders WHERE product_id = 1;"
QUERY PLAN
`--SCAN orders
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `scan`.

### `index` — *add an index*

```console
$ sq shop.db "CREATE INDEX idx_orders_product ON orders(product_id);"
```

exit **0** · truth: `read-back`

### `plan-after` — *the same query, again*

```console
$ sq shop.db "EXPLAIN QUERY PLAN SELECT * FROM orders WHERE product_id = 1;"
QUERY PLAN
`--SEARCH orders USING INDEX idx_orders_product (product_id=?)
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `search`.

## sqlite-act3

Recorded from `demos/sqlite-act3.json` — 10 steps.

### `open-read` — *the same file, from Python*

Opens `(a file)` in the editor.

Callout targets measured on screen: `connect`.

### `run-read` — *no export, no migration*

```console
$ python read_it.py
27-inch monitor         240.00
Mechanical keyboard      89.00
USB-C hub                45.00
Desk lamp                35.50
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `firstrow`.

### `open-rowfac` — *columns by name, not by number*

Opens `(a file)` in the editor.

Callout targets measured on screen: `rf`.

### `run-rowfac` — *row[1] versus row["name"]*

```console
$ python row_factory.py
by index: 27-inch monitor
by name : 27-inch monitor costs 240.0
columns : ['id', 'name', 'price']
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `byidx`, `byname`.

### `open-params` — *two ways to ask the same question*

Opens `(a file)` in the editor.

Callout targets measured on screen: `safe`, `unsafe`.

### `run-params` — *one row, or the whole table*

```console
$ python params.py
safe   -> ('USB-C hub', 45.0)
unsafe -> 4 rows came back:
           ('Mechanical keyboard', 89.0)
           ('27-inch monitor', 240.0)
           ('Desk lamp', 35.5)
           ('USB-C hub', 45.0)
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `one`, `all`.

### `run-many` — *three rows, one call*

```console
$ python many.py
inserted: 3 rows in one call
total now: 7
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `many`.

### `run-write` — *and the commit that makes it real*

```console
$ python write_it.py
new row id: 8
rows now: 8
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `count`.

### `open-rollback` — *the undo you did not know you had*

Opens `(a file)` in the editor.

Callout targets measured on screen: `rb`.

### `run-rollback` — *deleted everything, then took it back*

```console
$ python rollback.py
after delete, this connection sees: 0
after rollback: 8 (was 8 before)
```

exit **0** · truth: `read-back`

Callout targets measured on screen: `gone`, `back`.

---

**31 steps** across 3 recording(s); 1 of them exit non-zero on purpose.

Recordings are gitignored and stay local (decision D4). Regenerate the footage with
`npm run record -- demos/sqlite-act1.json`, `npm run record -- demos/sqlite-act2.json`, `npm run record -- demos/sqlite-act3.json`, then re-run
this script.
