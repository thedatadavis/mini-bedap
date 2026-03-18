#!/bin/bash
echo "📤 Exporting mart tables to JSON API..."
cd bedap-dbt
# Export directly from DuckDB to the Vite public folder
duckdb bedap_mock.duckdb -c "COPY (SELECT * FROM medicare__beneficiary_profile) TO '../bedap-ui/public/data/beneficiaries.json' (FORMAT JSON, ARRAY TRUE);"
duckdb bedap_mock.duckdb -c "COPY (SELECT * FROM medicare__claim_detail) TO '../bedap-ui/public/data/claims.json' (FORMAT JSON, ARRAY TRUE);"
duckdb bedap_mock.duckdb -c "COPY (SELECT * FROM medicare__engagement_log) TO '../bedap-ui/public/data/events.json' (FORMAT JSON, ARRAY TRUE);"
echo "✅ Export complete!"
