{% docs __overview__ %}

# BEDAP Data Platform Lineage

Welcome to the data dictionary and lineage graph for the **Beneficiary Experience Data Analytics Platform (BEDAP)**. 

This dbt pipeline transforms raw synthetic claims and account activity into production-ready data marts that power the authenticated Medicare.gov user experience.

### Architectural Layers
- **Seeds (Gray)**: Raw synthetic source files.
- **Staging (Blue)**: Standardized and casted dimensions and facts.
- **Intermediate (Orange)**: Aggregated behavioral and financial rollups at the beneficiary grain.
- **Marts (Green)**: Final business logic layer serving as a Backend-for-Frontend (BFF).

To explore, click the **green lineage icon** in the bottom right corner of the screen!

{% enddocs %}
