
```
Watchdogs
├─ app
│  ├─ api
│  │  ├─ v1
│  │  │  ├─ prestashop.py
│  │  │  └─ __init__.py
│  │  └─ __init__.py
│  ├─ core
│  │  ├─ config.py
│  │  ├─ db.py
│  │  ├─ logging.py
│  │  ├─ middleware.py
│  │  └─ __init__.py
│  ├─ domains
│  │  ├─ prestashop
│  │  │  ├─ mappers.py
│  │  │  ├─ rules.py
│  │  │  ├─ types.py
│  │  │  └─ __init__.py
│  │  └─ __init__.py
│  ├─ external
│  │  ├─ prestashop_client.py
│  │  └─ __init__.py
│  ├─ models
│  │  ├─ prestashop.py
│  │  ├─ runs.py
│  │  └─ __init__.py
│  ├─ repos
│  │  ├─ prestashop
│  │  │  ├─ payments_read.py
│  │  │  ├─ payments_write.py
│  │  │  └─ __init__.py
│  │  ├─ shared
│  │  │  └─ runs_write.py
│  │  └─ __init__.py
│  ├─ schemas
│  │  ├─ prestashop.py
│  │  └─ __init__.py
│  ├─ services
│  │  ├─ commands
│  │  │  └─ prestashop
│  │  │     └─ ingest_payments.py
│  │  ├─ read
│  │  │  ├─ prestashop_query.py
│  │  │  └─ __init__.py
│  │  └─ __init__.py
│  └─ __init__.py
├─ apps
│  ├─ api_main.py
│  ├─ worker_main.py
│  └─ __init__.py
├─ database
│  └─ database.sqlite
├─ logs
├─ Makefile
├─ README.md
├─ requirements.txt
└─ workers
   ├─ jobs
   │  ├─ prestashop_payments.py
   │  └─ __init__.py
   ├─ scheduler.py
   └─ __init__.py

```