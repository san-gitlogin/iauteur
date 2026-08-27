# SQLite course — the CAPTURED artefacts

**Everything below was produced by RUNNING THE TOOL, not by reading its documentation**
(LAW 0m corollary). Each block is a verbatim transcript from this machine. If a beat in the
course shows output, it comes from here, and the recording subsystem re-runs the same
commands live so the footage and this file cannot disagree.

## The binary we teach

| | |
|---|---|
| Taught version | **SQLite 3.53.4** (2026-07-24) |
| Installed at | the session scratchpad — `.../scratchpad/sqlite/sqlite3.exe` |
| The machine's own CLI | 3.36.0 (2021-06-18) — **untouched** |
| Python's bundled engine | 3.37.2 (`python -c "import sqlite3; print(sqlite3.sqlite_version)"`) |

**Why the isolated install matters, measured rather than assumed:** the machine's 3.36.0
does **not** support `STRICT` tables (3.37+). A course written from memory would have taught
`CREATE TABLE … STRICT`, and it would have failed on camera:

```
Error: near line 1: near "STRICT": syntax error      <- 3.36.0
```

On 3.53.4 it works, and its type error is itself the lesson:

```
sqlite> CREATE TABLE s(a INT, b TEXT) STRICT;
sqlite> INSERT INTO s VALUES ('not-an-int', 'x');
Error near line 3: cannot store TEXT value in INT column s.a
```

Also confirmed present on 3.53.4: `.mode box` (rounded borders — they render well at video
scale) and `RETURNING` (3.35+).

---

## ACT I — SQLite is a FILE, not a server

```
$ sqlite3 shop.db
sqlite> .mode box
sqlite> .headers on
sqlite> CREATE TABLE products (
   ...>   id    INTEGER PRIMARY KEY,
   ...>   name  TEXT    NOT NULL,
   ...>   price REAL    NOT NULL
   ...> );
sqlite> INSERT INTO products (name, price) VALUES
   ...>   ('Mechanical keyboard', 89.00),
   ...>   ('27-inch monitor',    240.00),
   ...>   ('Desk lamp',           35.50),
   ...>   ('USB-C hub',           45.00);
sqlite> SELECT * FROM products;
╭────┬─────────────────────┬───────╮
│ id │        name         │ price │
╞════╪═════════════════════╪═══════╡
│  1 │ Mechanical keyboard │  89.0 │
│  2 │ 27-inch monitor     │ 240.0 │
│  3 │ Desk lamp           │  35.5 │
│  4 │ USB-C hub           │  45.0 │
╰────┴─────────────────────┴───────╯
```

**The payoff beat:** the whole database is one ordinary file.

```
$ ls -la shop.db
8192 shop.db
```

Eight kilobytes. No server, no port, no daemon. That is the fact the whole course rests on,
and it is a number on screen rather than a claim.

---

## ACT II — Real querying

### JOIN + aggregate

```
sqlite> CREATE TABLE orders (
   ...>   id         INTEGER PRIMARY KEY,
   ...>   product_id INTEGER NOT NULL REFERENCES products(id),
   ...>   qty        INTEGER NOT NULL
   ...> );
sqlite> INSERT INTO orders (product_id, qty) VALUES (1,2),(2,1),(1,1),(3,4),(4,2),(1,3);
sqlite> SELECT p.name, SUM(o.qty) AS units, ROUND(SUM(o.qty * p.price), 2) AS revenue
   ...> FROM orders o
   ...> JOIN products p ON p.id = o.product_id
   ...> GROUP BY p.name
   ...> ORDER BY revenue DESC;
╭─────────────────────┬───────┬─────────╮
│        name         │ units │ revenue │
╞═════════════════════╪═══════╪═════════╡
│ Mechanical keyboard │     6 │   534.0 │
│ 27-inch monitor     │     1 │   240.0 │
│ Desk lamp           │     4 │   142.0 │
│ USB-C hub           │     2 │    90.0 │
╰─────────────────────┴───────┴─────────╯
```

### The index lesson — two lines, and the difference is the whole point

```
sqlite> EXPLAIN QUERY PLAN SELECT * FROM orders WHERE product_id = 1;
QUERY PLAN
`--SCAN orders

sqlite> CREATE INDEX idx_orders_product ON orders(product_id);
sqlite> EXPLAIN QUERY PLAN SELECT * FROM orders WHERE product_id = 1;
QUERY PLAN
`--SEARCH orders USING INDEX idx_orders_product (product_id=?)
```

**SCAN → SEARCH.** This is the best visual payoff in the course: one line of output changes
one word, and that word is the entire concept. It is a natural target for a neon highlight
on the changed token.

---

## ACT III — The same file, from Python

Captured on this machine with **Python 3.10.4**, whose bundled engine is **sqlite 3.37.2** — a
different build from the 3.53.4 CLI above, reading the very same file. That is the lesson, not a
mismatch to hide.

### Python reads what the CLI wrote — `read_it.py`

```python
import sqlite3

con = sqlite3.connect("shop.db")
cur = con.cursor()

for name, price in cur.execute("SELECT name, price FROM products ORDER BY price DESC"):
    print(f"{name:<22}{price:>8.2f}")

con.close()
```

```
27-inch monitor         240.00
Mechanical keyboard      89.00
USB-C hub                45.00
Desk lamp                35.50
```

**Continuity beat:** this is the *same file* the shell created a few minutes earlier. Nothing was
exported, nothing was migrated.

### Parameters vs. the injection trap — `params.py`, the strongest beat in Act III

```python
wanted = "USB-C hub"
cur.execute("SELECT name, price FROM products WHERE name = ?", (wanted,))
print("safe   ->", cur.fetchone())

evil = "' OR 1=1 --"
cur.execute(f"SELECT name, price FROM products WHERE name = '{evil}'")
rows = cur.fetchall()
print("unsafe ->", len(rows), "rows came back:")
for r in rows:
    print("          ", r)
```

```
safe   -> ('USB-C hub', 45.0)
unsafe -> 4 rows came back:
           ('Mechanical keyboard', 89.0)
           ('27-inch monitor', 240.0)
           ('Desk lamp', 35.5)
           ('USB-C hub', 45.0)
```

One row versus **the entire table**. The lesson does not need a diagram — the two outputs beside
each other ARE the lesson.

**Why the rows print one per line, and why that is a CAPTURE decision rather than a style one:**
the first draft printed the whole list on a single `unsafe -> [...]` line. At 1600px that line
wraps across two xterm rows, and a callout rectangle is measured from ONE row element — so the
payoff could not have been highlighted. Printing a row per line keeps every line short enough to
mark, and stacking four rows under a single safe result is the better picture anyway.

### Writing, and the commit that decides whether it happened — `write_it.py`

```python
cur.execute("INSERT INTO products (name, price) VALUES (?, ?)", ("Webcam", 59.0))
print("new row id:", cur.lastrowid)

con.commit()
print("rows now:", cur.execute("SELECT COUNT(*) FROM products").fetchone()[0])
```

```
new row id: 5
rows now: 5
```

---

## What was RECORDED from these captures

Three demo scripts, fifteen steps, every one verified by reading the text back off the screen.
The recordings themselves are gitignored (D4 — captures stay local); the demo scripts regenerate
them.

| Demo | Steps | Covers |
|---|---|---|
| `demos/sqlite-act1.json` | 4 | version · create · select · **the file is 8192 bytes** |
| `demos/sqlite-act2.json` | 6 | second table · the JOIN · revenue · **SCAN → SEARCH** |
| `demos/sqlite-act3.json` | 5 | connect · read · **safe vs. injected** · commit |

Regenerate any of them with `npm run record -- demos/sqlite-act<N>.json`.

## Identity check (LAW 0m corollary 2, and this repo is PUBLIC)

No name, email, hostname or absolute path appears in any transcript above. The recording
prompt is primed to show only the workspace folder leaf (`PS shop>`), so a capture cannot
put a home directory on screen either.
