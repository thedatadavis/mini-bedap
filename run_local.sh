#!/bin/bash
set -e

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}🚀 BEDAP Local Pipeline & UI Runner${NC}"
echo -e "${BLUE}======================================================${NC}\n"

# 1. Run the dbt pipeline
echo -e "${YELLOW}[1/4] Running dbt Pipeline (Mocking Argo Workflow)...${NC}"
cd bedap-dbt

echo "  -> Seeding raw CSVs into DuckDB..."
dbt seed --profiles-dir .

echo "  -> Running staging and intermediate models..."
dbt run --select staging intermediate --profiles-dir .

echo "  -> Running mart models..."
dbt run --select marts --profiles-dir .

echo "  -> Running all data quality tests (Circuit Breakers)..."
dbt test --profiles-dir .

echo "  -> Generating dbt documentation..."
dbt docs generate --profiles-dir .

cd ..
echo -e "${GREEN}✅ dbt pipeline complete!${NC}\n"

# 2. Export dbt docs to the UI folder
echo -e "${YELLOW}[2/4] Moving dbt docs to static hosting folder...${NC}"
mkdir -p bedap-ui/public/docs
cp bedap-dbt/target/index.html bedap-ui/public/docs/
cp bedap-dbt/target/manifest.json bedap-ui/public/docs/
cp bedap-dbt/target/catalog.json bedap-ui/public/docs/
echo -e "${GREEN}✅ Docs moved!${NC}\n"

# 3. Export flat JSON for the React app
echo -e "${YELLOW}[3/4] Exporting Backend-for-Frontend (BFF) JSON API...${NC}"
cd bedap-dbt

# Using python -c to run the duckdb package directly
python -c "
import duckdb
con = duckdb.connect('bedap_mock.duckdb')
con.execute(\"COPY (SELECT * FROM medicare__beneficiary_profile) TO '../bedap-ui/public/data/beneficiaries.json' (FORMAT JSON, ARRAY TRUE)\")
con.execute(\"COPY (SELECT * FROM medicare__claim_detail) TO '../bedap-ui/public/data/claims.json' (FORMAT JSON, ARRAY TRUE)\")
con.execute(\"COPY (SELECT * FROM medicare__engagement_log) TO '../bedap-ui/public/data/events.json' (FORMAT JSON, ARRAY TRUE)\")
con.close()
"

cd ..
echo -e "${GREEN}✅ Flat API exported!${NC}\n"

# 4. Launch the UI
echo -e "${YELLOW}[4/4] Launching the Medicare.gov BEDAP React App...${NC}"
cd bedap-ui
echo -e "${BLUE}The UI will start at http://localhost:5173. To stop, press Ctrl+C.${NC}"
npm run dev
