# Incident Management Dashboard

Gerçek zamanlı incident yönetim paneli case çalışması. Proje, farklı backend servislerinden gelen incident kayıtlarını merkezi olarak oluşturmak, listelemek, güncellemek, silmek ve arayüzde anlık takip etmek için hazırlanmıştır.

## Proje Yapısı

```text
backend/
  prisma/
    migrations/
    seed.ts
  scripts/
    incident-simulator.ts
    data/
  src/
    common/
    config/
    database/
    modules/
      ai/
      incidents/
      realtime/
      services/

frontend/
  src/
    components/
    features/
      incidents/
      services/
    pages/

postman/
  incident-management.postman_collection.json
```

## Kullanılan Teknolojiler

Backend:
- NestJS
- PostgreSQL
- Prisma ORM
- Socket.IO
- Swagger / OpenAPI
- @nestjs/config
- class-validator / class-transformer
- Jest
- Google Gemini AI SDK

Frontend:
- React
- Vite
- TypeScript
- TailwindCSS
- Socket.IO Client
- Vitest
- lucide-react

DevOps / Yardımcı Araçlar:
- Docker Compose
- Postman collection
- Seed script
- Incident simulator script

## Kurulum Seçenekleri

Projeyi iki ana şekilde çalıştırabilirsiniz:
- Lokal kurulum: Backend ve frontend lokal Node.js ile çalışır. PostgreSQL isterseniz Docker ile, isterseniz bilgisayarınızdaki lokal PostgreSQL ile çalıştırılabilir.
- Docker ile kurulum: Backend, PostgreSQL ve frontend Nginx container olarak çalışır.

## 1. Lokal Kurulum

Bu yöntemde backend NestJS ve frontend Vite lokal Node.js process'i olarak çalışır.

### 1. Repository'yi hazırla

```bash
git clone <repository-url>
cd incident-management
```

### 2. PostgreSQL'i hazırla

Bu adım için iki seçenek vardır.

Seçenek A: PostgreSQL'i Docker ile başlatmak:

```bash
docker compose up -d
```

Varsayılan PostgreSQL bilgileri:

```text
Host: localhost
Port: 5432
Database: incidents
User: postgres
Password: postgres
```

Seçenek B: Lokal PostgreSQL kullanmak:

Bilgisayarınızda PostgreSQL kuruluysa `incidents` adında bir database oluşturun ve `backend/.env` içindeki `DATABASE_URL` değerini kendi lokal PostgreSQL bilgilerinize göre ayarlayın.

Örnek:

```text
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/incidents?schema=public"
```

### 3. Backend ortam değişkenlerini oluştur

```bash
cd backend
cp .env.example .env
```

Örnek `.env`:

```text
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/incidents?schema=public"
PORT=3001
FRONTEND_ORIGIN="http://localhost:3000"
GEMINI_API_KEY=""
GOOGLE_AI_MODEL="gemini-2.5-flash"
```

AI özelliklerini gerçek Gemini API ile kullanmak için `GEMINI_API_KEY` verilmelidir. API key yoksa sistem deterministic fallback öneriler/özetler üretir; bu sayede temel akışlar çalışmaya devam eder.

### 4. Backend dependency, migration ve seed

```bash
npm install
npm run prisma:generate
npm run prisma:deploy
npm run seed
```

Gelişim sırasında yeni migration oluşturmak için:

```bash
npm run prisma:migrate -- --name migration_name
```

Mevcut migration'ları başka ortamda uygulamak için:

```bash
npm run prisma:deploy
```

### 5. Backend'i çalıştır

```bash
npm run dev
```

Backend varsayılan olarak `http://localhost:3001` üzerinde çalışır.

Swagger dokümanı:

```text
http://localhost:3001/api-docs
```

### 6. Frontend ortam değişkenlerini oluştur

Yeni terminalde:

```bash
cd frontend
cp .env.example .env
```

Örnek `.env`:

```text
VITE_API_URL="http://localhost:3001"
VITE_SOCKET_URL="http://localhost:3001"
```

### 7. Frontend'i çalıştır

```bash
npm install
npm run dev
```

Frontend `http://localhost:3000`, backend `http://localhost:3001` üzerinde çalışır.

## 2. Docker ile Kurulum ve Çalıştırma

Bu yöntem tüm stack'i container olarak ayağa kaldırır. Frontend Nginx ile servis edilir; backend container başlarken migration ve seed işlemlerini otomatik uygular.

Root dizinde:

```bash
./scripts/docker-stack.sh up
```

Bu komut sırasıyla:
- `backend/docker-compose.yml` ile PostgreSQL ve NestJS backend servislerini başlatır.
- `frontend/docker-compose.yml` ile Vite build çıktısını Nginx üzerinden servis eder.

Varsayılan adresler:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:3001
Swagger:  http://localhost:3001/api-docs
Postgres host port: 5433
```

PostgreSQL container içinde yine `5432` portunda çalışır; host tarafında varsayılan `5433` kullanılmasının sebebi lokal geliştirme için açılan PostgreSQL'in `5432` portuyla çakışmamaktır.

Script komutları:

```bash
./scripts/docker-stack.sh up
./scripts/docker-stack.sh down
./scripts/docker-stack.sh restart
./scripts/docker-stack.sh logs
./scripts/docker-stack.sh ps
./scripts/docker-stack.sh build
```

Sadece backend ve veritabanı için:

```bash
cd backend
docker compose up -d --build
```

Sadece frontend Nginx container'ı için:

```bash
cd frontend
docker compose up -d --build
```

Frontend Docker build arg'leri:

```text
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
FRONTEND_PORT=3000
```

Backend Docker environment değerleri:

```text
BACKEND_PORT=3001
POSTGRES_PORT=5433
GEMINI_API_KEY=
GOOGLE_AI_MODEL=gemini-2.5-flash
```

Backend container başlarken `prisma migrate deploy` ve `prisma db seed` çalıştırır, ardından production NestJS uygulamasını başlatır.

Docker stack'i kapatmak için:

```bash
./scripts/docker-stack.sh down
```

## 3. Simulator Çalıştırma

Simulator, backend API üzerinden belirli aralıklarla incident oluşturur. Gerçek zamanlı UI senkronizasyonunu test etmek için kullanılabilir.

Ön koşullar:
- Backend çalışıyor olmalı.
- Database migration ve seed uygulanmış olmalı.

Backend klasöründe:

```bash
cd backend
npm run simulate
```

Simulator verileri:

```text
backend/scripts/data/incident-simulator-data.json
```

Simulator kayıtlı servis listesini API'den alır ve incident oluştururken `serviceId` kullanır.

## 4. Scriptler ve Komutlar

Backend:

```bash
npm run dev              # NestJS watch mode
npm run build            # Backend build
npm run start:prod       # dist/main.js çalıştırır
npm run prisma:generate  # Prisma Client üretir
npm run prisma:migrate   # Geliştirme migration'ı oluşturur ve uygular
npm run prisma:deploy    # Var olan migration'ları uygular
npm run seed             # Seed datayı uygular
npm test                 # Backend unit testleri
npm run test:e2e         # PostgreSQL kullanan backend e2e testleri
npm run simulate         # Simulatoru başlatır
```

Frontend:

```bash
npm run dev      # Vite dev server
npm run build    # Production build
npm run preview  # Build preview
npm test         # Frontend testleri
```

## API Özeti

Incident endpointleri:

```text
GET    /incidents/stats
GET    /incidents?page=1&limit=10&status=open&severity=high&serviceId=<id>
GET    /incidents/:id
POST   /incidents
PATCH  /incidents/:id
DELETE /incidents/:id
POST   /incidents/ai-suggest
POST   /incidents/:id/ai-summary
```

Service endpointleri:

```text
GET    /services
GET    /services/:id
POST   /services
PATCH  /services/:id
DELETE /services/:id
```

Response formatı:

Başarılı response:

```json
{
  "status": true,
  "message": "Incident created successfully",
  "data": {}
}
```

Hata response:

```json
{
  "status": false,
  "message": "Validation failed"
}
```

## Veri Modeli

Incident:
- `id`
- `title`
- `description`
- `serviceId`
- `service`
- `severity`: `low`, `medium`, `high`, `critical`
- `status`: `open`, `investigating`, `resolved`
- `summary`: AI tarafından üretilen opsiyonel özet
- `createdAt`
- `updatedAt`
- `deletedAt`

Incident oluşturma API'si UI tarafında tercih edilen `serviceId` alanını kabul eder. Case dokümanındaki örnek request ile uyumlu kalmak için `service: "Payment API"` gibi kayıtlı servis adı gönderilmesi de desteklenir; backend bu servis adını ilgili `serviceId` değerine çözer.

Service:
- `id`
- `name`
- `description`
- `isActive`
- `createdAt`
- `updatedAt`

AuditLog:
- Incident üzerindeki status, severity, description, service ve summary değişikliklerini tutar.

## Mimari Yaklaşım

Backend feature-based ve feature içinde katmanlı bir yapıyla organize edildi:

```text
modules/
  incidents/
    application/
    domain/
    infrastructure/
    presentation/
```

Bu tercih, NestJS'in module yapısına uyumlu kalırken controller, service, repository, DTO ve domain sorumluluklarını ayırmak için yapıldı.

Temel kararlar:
- HTTP request önce validation pipe'tan geçer.
- Controller yalnızca request/response sınırında kalır.
- Application service iş kurallarını yönetir.
- Repository Prisma erişimini soyutlar.
- Realtime event sadece database işlemi başarılı olduktan sonra yayılır.
- Socket.IO backend içinde ayrı bir realtime module olarak konumlandırıldı.
- Incident oluştururken serbest service text yerine kayıtlı `Service` tablosundan `serviceId` seçilir.
- Silme işlemi soft delete olarak uygulanır.
- AI summary ilk oluşturulduğunda DB'ye kaydedilir; sonraki açılışta kayıtlı özet gösterilir, istenirse yeniden üretilebilir.

## Frontend Yaklaşımı

Frontend feature-based organize edildi. Incident ile ilgili API, type, hook, component ve realtime kodları `features/incidents` altında tutuldu.

UI davranışları:
- Dashboard metrik kartları
- Service, status ve severity filtreleri
- Pagination metadata ile sayfalama
- Loading, error ve empty state
- Realtime bağlantı durumu
- Yeni incident ve güncellemeler için toast bildirimleri
- Yeni gelen kayıtlarda animasyon
- Status action butonları
- Record action butonları
- Incident detay popup'ı
- Audit log popup'ı
- AI summary popup'ı

## Realtime Davranışı

Socket.IO eventleri:

```text
incident.created
incident.updated
incident.deleted
```

Frontend reconnect mekanizması açıktır. Socket bağlantısı koptuğunda UI bağlantı durumunu gösterir; yeniden bağlanınca liste ve metrikler tekrar senkronize edilir.

## AI Özellikleri

AI entegrasyonu opsiyonel case maddesi için eklendi.

Desteklenen özellikler:
- Title ve description üzerinden severity önerisi
- Kayıtlı servisler arasından service önerisi
- Uzun description için AI summary üretimi
- Summary'nin DB'ye kaydedilmesi
- İstenirse summary'nin yeniden üretilmesi

API key yoksa fallback algoritma çalışır. Bu, projeyi değerlendiren kişinin API key vermeden de akışları test edebilmesini sağlar.

## Varsayımlar

- Incident'lar sisteme HTTP API üzerinden gelir; realtime taraf UI senkronizasyonu içindir.
- Service değeri serbest text yerine kayıtlı servis listesinden seçilir.
- Service silme işlemi fiziksel silme değil deactivate olarak ele alınır.
- Incident silme soft delete olarak uygulanır.
- Seed script idempotent çalışır; aynı seed tekrar çalıştığında duplicate servis/incident oluşturmaz.
- AI entegrasyonu opsiyoneldir; API key olmadığında uygulama tamamen durmaz.
- Authentication/authorization case kapsamında belirtilmediği için eklenmedi.

## Test

Backend:

```bash
cd backend
npm test
```

Frontend:

```bash
cd frontend
npm test
```

Son kontrol durumunda:
- Backend testleri: 7 passed
- Backend e2e testleri: 5 passed
- Frontend testleri: 2 passed
- Backend build: başarılı
- Frontend build: başarılı

## Postman

Postman collection:

```text
postman/incident-management.postman_collection.json
```

Collection içinde incident, service, AI ve stats endpointleri için örnek requestler bulunur.

## Daha Fazla Zaman Olsaydı

- Authentication ve role-based authorization eklenirdi.
- Daha kapsamlı integration testleri yazılırdı.
- Incident timeline UI'i daha gelişmiş hale getirilirdi.
- Service management için ayrı bir frontend sayfası eklenirdi.
- Production deployment için Dockerfile ve compose profilleri eklenirdi.
- WebSocket eventleri için e2e testleri eklenirdi.
- AI prompt ve model seçimi için config paneli eklenirdi.
- Audit log için filtreleme ve export özelliği eklenirdi.
