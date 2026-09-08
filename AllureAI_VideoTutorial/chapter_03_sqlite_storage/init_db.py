"""
init_db.py

Creates tutorial.db from schema.sql, and prints back exactly what got
created, so we can SEE the plan turned into a real database rather
than just trusting it worked.

Usage:
    python init_db.py
    python init_db.py --db-path some_other_name.db
"""
import argparse
import sqlite3
from pathlib import Path

SCHEMA_FILE = Path(__file__).parent / "schema.sql"


def init_db(db_path: Path) -> None:
    schema_sql = SCHEMA_FILE.read_text(encoding="utf-8")

    connection = sqlite3.connect(db_path)
    try:
        connection.executescript(schema_sql)
        connection.commit()
    finally:
        connection.close()

    print(f"Database created at: {db_path.resolve()}")


def describe_db(db_path: Path) -> None:
    """Print every table and every column, straight from SQLite itself."""
    connection = sqlite3.connect(db_path)
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        table_names = [row[0] for row in cursor.fetchall()]

        for table_name in table_names:
            print(f"\nTable: {table_name}")
            cursor.execute(f"PRAGMA table_info({table_name})")
            for _, column_name, column_type, not_null, _, is_primary_key in cursor.fetchall():
                flags = []
                if is_primary_key:
                    flags.append("PRIMARY KEY")
                if not_null:
                    flags.append("NOT NULL")
                flag_text = f"  [{', '.join(flags)}]" if flags else ""
                print(f"  - {column_name:<16} {column_type:<10}{flag_text}")
    finally:
        connection.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db-path", type=Path, default=Path("tutorial.db"))
    args = parser.parse_args()

    init_db(args.db_path)
    describe_db(args.db_path)


if __name__ == "__main__":
    main()
