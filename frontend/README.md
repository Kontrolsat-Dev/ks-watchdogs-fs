src  
├─ api  
│ ├─ gc  
│ ├─ policia  
│ └─ prestashop  
│ ├─ config.ts  
│ ├─ service.ts  
│ └─ types.ts  
├─ assets  
│ └─ react.svg  
├─ components  
│ ├─ data  
│ │ └─ StatCard.tsx  
│ ├─ feedback  
│ │ ├─ StatusBadge.tsx  
│ │ └─ StatusDot.tsx  
│ └─ ui  
│ ├─ badge.tsx  
│ ├─ button.tsx  
│ ├─ card.tsx  
│ ├─ separator.tsx  
│ ├─ skeleton.tsx  
│ └─ table.tsx  
├─ features  
│ ├─ alerts  
│ │ ├─ components  
│ │ │ └─ AlertsList.tsx  
│ ├─ home  
│ │ ├─ components  
│ │ │ └─ skeleton-card.tsx  
│ │ └─ index.tsx  
│ ├─ orders  
│ │ ├─ components  
│ │ │ └─ DelayedOrdersTable.tsx  
│ │ └─ pages  
│ │ ├─ delayed-detail.tsx  
│ │ └─ delayed-list.tsx  
│ ├─ payments  
│ │ ├─ components  
│ │ │ └─ PaymentsTable.tsx  
│ │ ├─ index.tsx  
│ ├─ products  
│ │ ├─ components  
│ │ │ └─ EolProductsTable.tsx  
│ │ ├─ pages  
│ │ │ └─ eol-list.tsx  
│ ├─ runs  
│ │ ├─ components  
│ │ │ └─ ActivityList.tsx  
├─ layout  
│ ├─ AppShell.tsx  
│ └─ Topbar.tsx  
├─ lib  
│ ├─ env.ts  
│ ├─ http.ts  
│ ├─ paths.ts  
│ └─ utils.ts  
├─ providers  
│ ├─ query-client.tsx  
│ ├─ theme-provider.tsx  
│ └─ toaster-provider.tsx  
├─ types  
│ └─ global.ts  
├─ index.css  
├─ main.tsx  
└─ router.tsx

```
frontend
├─ .env
├─ components.json
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  ├─ favicon.png
│  └─ logo.png
├─ README.md
├─ src
│  ├─ api
│  │  ├─ prestashop
│  │  │  ├─ index.ts
│  │  │  ├─ service.ts
│  │  │  └─ types.ts
│  │  └─ system
│  │     ├─ index.ts
│  │     ├─ service.ts
│  │     └─ types.ts
│  ├─ app.tsx
│  ├─ assets
│  │  └─ react.svg
│  ├─ components
│  │  ├─ data
│  │  │  └─ StatCard.tsx
│  │  ├─ feedback
│  │  │  ├─ StatusBadge.tsx
│  │  │  └─ StatusDot.tsx
│  │  └─ ui
│  │     ├─ badge.tsx
│  │     ├─ button.tsx
│  │     ├─ card.tsx
│  │     ├─ input.tsx
│  │     ├─ separator.tsx
│  │     ├─ skeleton.tsx
│  │     ├─ table.tsx
│  │     └─ tooltip.tsx
│  ├─ constants
│  │  └─ endpoints.ts
│  ├─ features
│  │  ├─ home
│  │  │  └─ index.tsx
│  │  └─ system
│  │     └─ healthz
│  │        └─ queries.ts
│  ├─ index.css
│  ├─ layout
│  │  ├─ AppLayout.tsx
│  │  ├─ Sidebar.tsx
│  │  └─ Topbar.tsx
│  ├─ lib
│  │  ├─ http-client.ts
│  │  └─ utils.ts
│  ├─ main.tsx
│  ├─ providers
│  │  ├─ query-client.tsx
│  │  ├─ theme-provider.tsx
│  │  └─ toaster-provider.tsx
│  └─ types
│     └─ global.ts
├─ TODO.md
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts

```