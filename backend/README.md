
```
backend
├─ app
│  ├─ api
│  │  ├─ v1
│  │  │  ├─ alerts.py
│  │  │  ├─ health.py
│  │  │  ├─ kpi.py
│  │  │  ├─ prestashop.py
│  │  │  ├─ runs.py
│  │  │  └─ __init__.py
│  │  └─ __init__.py
│  ├─ core
│  │  ├─ config.py
│  │  ├─ db.py
│  │  ├─ logging.py
│  │  ├─ middleware.py
│  │  └─ __init__.py
│  ├─ domains
│  │  ├─ kpi
│  │  │  ├─ employees
│  │  │  │  ├─ mappers.py
│  │  │  │  ├─ types.py
│  │  │  │  └─ __init__.py
│  │  │  └─ __init__.py
│  │  ├─ prestashop
│  │  │  ├─ carts
│  │  │  │  ├─ mappers.py
│  │  │  │  ├─ rules.py
│  │  │  │  ├─ types.py
│  │  │  │  └─ __init__.py
│  │  │  ├─ eol
│  │  │  │  ├─ mappers.py
│  │  │  │  ├─ rules.py
│  │  │  │  ├─ types.py
│  │  │  │  └─ __init__.py
│  │  │  ├─ orders
│  │  │  │  ├─ mappers.py
│  │  │  │  ├─ rules.py
│  │  │  │  ├─ types.py
│  │  │  │  └─ __init__.py
│  │  │  ├─ pagespeed
│  │  │  │  ├─ mappers.py
│  │  │  │  ├─ rules.py
│  │  │  │  ├─ types.py
│  │  │  │  └─ __init__.py
│  │  │  ├─ payments
│  │  │  │  ├─ mappers.py
│  │  │  │  ├─ rules.py
│  │  │  │  ├─ types.py
│  │  │  │  └─ __init__.py
│  │  │  └─ __init__.py
│  │  └─ __init__.py
│  ├─ external
│  │  ├─ prestashop_client.py
│  │  └─ __init__.py
│  ├─ helpers
│  │  ├─ formatters.py
│  │  └─ __init__.py
│  ├─ models
│  │  ├─ kpi.py
│  │  ├─ prestashop.py
│  │  ├─ runs.py
│  │  └─ __init__.py
│  ├─ repos
│  │  ├─ kpi
│  │  │  ├─ reports_read.py
│  │  │  ├─ reports_write.py
│  │  │  └─ __init__.py
│  │  ├─ prestashop
│  │  │  ├─ carts_read.py
│  │  │  ├─ carts_write.py
│  │  │  ├─ eol_read.py
│  │  │  ├─ eol_write.py
│  │  │  ├─ ingest_pagespeed.py
│  │  │  ├─ orders_read.py
│  │  │  ├─ orders_write.py
│  │  │  ├─ pagespeed_read.py
│  │  │  ├─ pagespeed_write.py
│  │  │  ├─ payments_read.py
│  │  │  ├─ payments_write.py
│  │  │  └─ __init__.py
│  │  ├─ runs
│  │  │  ├─ read.py
│  │  │  ├─ write.py
│  │  │  └─ __init__.py
│  │  ├─ shared
│  │  │  └─ __init__.py
│  │  └─ __init__.py
│  ├─ schemas
│  │  ├─ alerts.py
│  │  ├─ health.py
│  │  ├─ kpi.py
│  │  ├─ prestashop.py
│  │  ├─ runs.py
│  │  └─ __init__.py
│  ├─ services
│  │  ├─ commands
│  │  │  ├─ kpi
│  │  │  │  ├─ report_generate.py
│  │  │  │  └─ __init__.py
│  │  │  ├─ prestashop
│  │  │  │  ├─ ingest_carts_stale.py
│  │  │  │  ├─ ingest_eol.py
│  │  │  │  ├─ ingest_orders_delayed.py
│  │  │  │  ├─ ingest_pagespeed.py
│  │  │  │  ├─ ingest_payments.py
│  │  │  │  └─ __init__.py
│  │  │  └─ __init__.py
│  │  ├─ queries
│  │  │  ├─ runs.py
│  │  │  └─ __init__.py
│  │  ├─ read
│  │  │  ├─ alerts_query.py
│  │  │  ├─ kpi_query.py
│  │  │  ├─ prestashop_query.py
│  │  │  └─ __init__.py
│  │  └─ __init__.py
│  ├─ shared
│  │  ├─ status.py
│  │  └─ __init__.py
│  └─ __init__.py
├─ apps
│  ├─ api_main.py
│  ├─ worker_main.py
│  └─ __init__.py
├─ database
├─ Makefile
├─ README.md
├─ requirements.txt
└─ workers
   ├─ jobs
   │  ├─ prestashop
   │  │  ├─ prestashop_carts_stale.py
   │  │  ├─ prestashop_eol.py
   │  │  ├─ prestashop_orders_delayed.py
   │  │  ├─ prestashop_pagespeed.py
   │  │  ├─ prestashop_payments.py
   │  │  └─ __init__.py
   │  └─ __init__.py
   ├─ scheduler.py
   └─ __init__.py

```
```
backend
├─ app
│  ├─ api
│  │  ├─ v1
│  │  │  ├─ alerts.py
│  │  │  ├─ health.py
│  │  │  ├─ kpi.py
│  │  │  ├─ prestashop.py
│  │  │  ├─ runs.py
│  │  │  └─ __init__.py
│  │  └─ __init__.py
│  ├─ core
│  │  ├─ config.py
│  │  ├─ db.py
│  │  ├─ logging.py
│  │  ├─ middleware.py
│  │  └─ __init__.py
│  ├─ domains
│  │  ├─ kpi
│  │  │  ├─ employees
│  │  │  │  ├─ mappers.py
│  │  │  │  ├─ types.py
│  │  │  │  └─ __init__.py
│  │  │  └─ __init__.py
│  │  ├─ prestashop
│  │  │  ├─ carts
│  │  │  │  ├─ mappers.py
│  │  │  │  ├─ rules.py
│  │  │  │  ├─ types.py
│  │  │  │  └─ __init__.py
│  │  │  ├─ eol
│  │  │  │  ├─ mappers.py
│  │  │  │  ├─ rules.py
│  │  │  │  ├─ types.py
│  │  │  │  └─ __init__.py
│  │  │  ├─ orders
│  │  │  │  ├─ mappers.py
│  │  │  │  ├─ rules.py
│  │  │  │  ├─ types.py
│  │  │  │  └─ __init__.py
│  │  │  ├─ pagespeed
│  │  │  │  ├─ mappers.py
│  │  │  │  ├─ rules.py
│  │  │  │  ├─ types.py
│  │  │  │  └─ __init__.py
│  │  │  ├─ payments
│  │  │  │  ├─ mappers.py
│  │  │  │  ├─ rules.py
│  │  │  │  ├─ types.py
│  │  │  │  └─ __init__.py
│  │  │  └─ __init__.py
│  │  └─ __init__.py
│  ├─ external
│  │  ├─ prestashop_client.py
│  │  └─ __init__.py
│  ├─ helpers
│  │  ├─ formatters.py
│  │  └─ __init__.py
│  ├─ models
│  │  ├─ kpi.py
│  │  ├─ prestashop.py
│  │  ├─ runs.py
│  │  └─ __init__.py
│  ├─ repos
│  │  ├─ kpi
│  │  │  ├─ reports_read.py
│  │  │  ├─ reports_write.py
│  │  │  └─ __init__.py
│  │  ├─ prestashop
│  │  │  ├─ carts_read.py
│  │  │  ├─ carts_write.py
│  │  │  ├─ eol_read.py
│  │  │  ├─ eol_write.py
│  │  │  ├─ ingest_pagespeed.py
│  │  │  ├─ orders_read.py
│  │  │  ├─ orders_write.py
│  │  │  ├─ pagespeed_read.py
│  │  │  ├─ pagespeed_write.py
│  │  │  ├─ payments_read.py
│  │  │  ├─ payments_write.py
│  │  │  └─ __init__.py
│  │  ├─ runs
│  │  │  ├─ read.py
│  │  │  ├─ write.py
│  │  │  └─ __init__.py
│  │  ├─ shared
│  │  │  └─ __init__.py
│  │  └─ __init__.py
│  ├─ schemas
│  │  ├─ alerts.py
│  │  ├─ health.py
│  │  ├─ kpi.py
│  │  ├─ prestashop.py
│  │  ├─ runs.py
│  │  └─ __init__.py
│  ├─ services
│  │  ├─ commands
│  │  │  ├─ kpi
│  │  │  │  ├─ report_generate.py
│  │  │  │  └─ __init__.py
│  │  │  ├─ prestashop
│  │  │  │  ├─ ingest_carts_stale.py
│  │  │  │  ├─ ingest_eol.py
│  │  │  │  ├─ ingest_orders_delayed.py
│  │  │  │  ├─ ingest_pagespeed.py
│  │  │  │  ├─ ingest_payments.py
│  │  │  │  └─ __init__.py
│  │  │  └─ __init__.py
│  │  ├─ queries
│  │  │  ├─ runs.py
│  │  │  └─ __init__.py
│  │  ├─ read
│  │  │  ├─ alerts_query.py
│  │  │  ├─ kpi_query.py
│  │  │  ├─ prestashop_query.py
│  │  │  └─ __init__.py
│  │  └─ __init__.py
│  ├─ shared
│  │  ├─ status.py
│  │  └─ __init__.py
│  └─ __init__.py
├─ apps
│  ├─ api_main.py
│  ├─ worker_main.py
│  └─ __init__.py
├─ database
├─ Makefile
├─ README.md
├─ requirements.txt
└─ workers
   ├─ jobs
   │  ├─ prestashop
   │  │  ├─ prestashop_carts_stale.py
   │  │  ├─ prestashop_eol.py
   │  │  ├─ prestashop_orders_delayed.py
   │  │  ├─ prestashop_pagespeed.py
   │  │  ├─ prestashop_payments.py
   │  │  └─ __init__.py
   │  └─ __init__.py
   ├─ scheduler.py
   └─ __init__.py

```