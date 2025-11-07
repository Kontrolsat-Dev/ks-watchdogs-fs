app  
├─ api  
│ ├─ v1  
│ │ ├─ alerts.py  
│ │ ├─ auth.py  
│ │ ├─ health.py  
│ │ ├─ home.py  
│ │ ├─ kpi.py  
│ │ ├─ prestashop.py  
│ │ ├─ runs.py  
│ │ ├─ tools.py  
│ │ └─ **init**.py  
│ └─ **init**.py  
├─ core  
│ ├─ config.py  
│ ├─ db.py  
│ ├─ deps.py  
│ ├─ logging.py  
│ ├─ middleware.py  
│ └─ **init**.py  
├─ domains  
│ ├─ kpi  
│ │ ├─ employees  
│ │ │ ├─ mappers.py  
│ │ │ ├─ types.py  
│ │ │ └─ **init**.py  
│ │ └─ **init**.py  
│ ├─ prestashop  
│ │ ├─ carts  
│ │ │ ├─ mappers.py  
│ │ │ ├─ rules.py  
│ │ │ ├─ types.py  
│ │ │ └─ **init**.py  
│ │ ├─ eol  
│ │ │ ├─ mappers.py  
│ │ │ ├─ rules.py  
│ │ │ ├─ types.py  
│ │ │ └─ **init**.py  
│ │ ├─ orders  
│ │ │ ├─ mappers.py  
│ │ │ ├─ rules.py  
│ │ │ ├─ types.py  
│ │ │ └─ **init**.py  
│ │ ├─ pagespeed  
│ │ │ ├─ mappers.py  
│ │ │ ├─ rules.py  
│ │ │ ├─ types.py  
│ │ │ └─ **init**.py  
│ │ ├─ payments  
│ │ │ ├─ mappers.py  
│ │ │ ├─ rules.py  
│ │ │ ├─ types.py  
│ │ │ └─ **init**.py  
│ │ └─ **init**.py  
│ ├─ tools  
│ │ ├─ gc  
│ │ │ └─ **init**.py  
│ │ ├─ patife  
│ │ │ ├─ mappers.py  
│ │ │ ├─ types.py  
│ │ │ └─ **init**.py  
│ │ ├─ pda  
│ │ │ ├─ mappers.py  
│ │ │ ├─ types.py  
│ │ │ └─ **init**.py  
│ │ ├─ policia  
│ │ │ └─ **init**.py  
│ │ └─ **init**.py  
│ └─ **init**.py  
├─ external  
│ ├─ patife_client.py  
│ ├─ pda_client.py  
│ ├─ prestashop_client.py  
│ └─ **init**.py  
├─ helpers  
│ ├─ formatters.py  
│ └─ **init**.py  
├─ models  
│ ├─ kpi.py  
│ ├─ patife.py  
│ ├─ prestashop.py  
│ ├─ runs.py  
│ └─ **init**.py  
├─ repos  
│ ├─ kpi  
│ │ ├─ reports_read.py  
│ │ ├─ reports_write.py  
│ │ └─ **init**.py  
│ ├─ prestashop  
│ │ ├─ carts_read.py  
│ │ ├─ carts_write.py  
│ │ ├─ eol_read.py  
│ │ ├─ eol_write.py  
│ │ ├─ ingest_pagespeed.py  
│ │ ├─ orders_read.py  
│ │ ├─ orders_write.py  
│ │ ├─ pagespeed_read.py  
│ │ ├─ pagespeed_write.py  
│ │ ├─ payments_read.py  
│ │ ├─ payments_write.py  
│ │ └─ **init**.py  
│ ├─ runs  
│ │ ├─ read.py  
│ │ ├─ write.py  
│ │ └─ **init**.py  
│ ├─ shared  
│ │ └─ **init**.py  
│ ├─ tools  
│ │ ├─ patife_healthz_read.py  
│ │ ├─ patife_healthz_write.py  
│ │ └─ **init**.py  
│ └─ **init**.py  
├─ schemas  
│ ├─ alerts.py  
│ ├─ auth.py  
│ ├─ common.py  
│ ├─ health.py  
│ ├─ home.py  
│ ├─ kpi.py  
│ ├─ prestashop.py  
│ ├─ runs.py  
│ ├─ tools.py  
│ └─ **init**.py  
├─ services  
│ ├─ commands  
│ │ ├─ auth  
│ │ │ ├─ login.py  
│ │ │ └─ **init**.py  
│ │ ├─ kpi  
│ │ │ ├─ report_generate.py  
│ │ │ └─ **init**.py  
│ │ ├─ patife  
│ │ │ ├─ ingest_healthz.py  
│ │ │ └─ **init**.py  
│ │ ├─ prestashop  
│ │ │ ├─ ingest_carts_stale.py  
│ │ │ ├─ ingest_eol.py  
│ │ │ ├─ ingest_orders_delayed.py  
│ │ │ ├─ ingest_pagespeed.py  
│ │ │ ├─ ingest_payments.py  
│ │ │ └─ **init**.py  
│ │ └─ **init**.py  
│ ├─ queries  
│ │ ├─ carts  
│ │ │ ├─ summary.py  
│ │ │ └─ **init**.py  
│ │ ├─ eol  
│ │ │ ├─ summary.py  
│ │ │ └─ **init**.py  
│ │ ├─ home  
│ │ │ ├─ summary.py  
│ │ │ └─ **init**.py  
│ │ ├─ orders_delayed  
│ │ │ ├─ summary.py  
│ │ │ └─ **init**.py  
│ │ ├─ pagespeed  
│ │ │ ├─ summary.py  
│ │ │ └─ **init**.py  
│ │ ├─ payments  
│ │ │ ├─ summary.py  
│ │ │ └─ **init**.py  
│ │ ├─ runs  
│ │ │ ├─ runs.py  
│ │ │ ├─ summary.py  
│ │ │ └─ **init**.py  
│ │ ├─ tools  
│ │ │ ├─ patife_query_service.py  
│ │ │ ├─ pda_query_service.py  
│ │ │ └─ **init**.py  
│ │ └─ **init**.py  
│ ├─ read  
│ │ ├─ alets  
│ │ │ ├─ alerts_query.py  
│ │ │ └─ **init**.py  
│ │ ├─ kpi  
│ │ │ ├─ kpi_query.py  
│ │ │ └─ **init**.py  
│ │ ├─ prestashop  
│ │ │ ├─ prestashop_query.py  
│ │ │ └─ **init**.py  
│ │ └─ **init**.py  
│ └─ **init**.py  
├─ shared  
│ ├─ jwt.py  
│ ├─ status.py  
│ └─ **init**.py  
└─ **init**.py
