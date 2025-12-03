import sqlite3

# Check both possible database locations
db_paths = ['refit_energy_data.db', 'instance/refit_energy_data.db']

for db_path in db_paths:
    print(f"\n=== Checking {db_path} ===")
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"Tables: {tables}")

        # Count Aggregate records if table exists
        if ('energy_readings',) in tables:
            cursor.execute("SELECT COUNT(*) FROM energy_readings WHERE meter_id='Aggregate'")
            count = cursor.fetchone()[0]
            print(f"✓ Aggregate records: {count}")
        else:
            print("✗ No energy_readings table")

        conn.close()
    except Exception as e:
        print(f"✗ Error: {e}")
