# DuckLog

팬덤/취미 기록 및 실물 책 출판 주문 웹앱.

- **Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, PostgreSQL 15

## 1. 실행 준비

- Docker, Docker Compose가 설치되어 있어야 합니다.

## 2. 실행 방법 (Docker)

```bash
# 저장소 클론
git clone <repo-url>
cd DuckLog

# 환경변수 준비 (필요한 경우)
cp .env.example .env

# 실행
docker-compose up

# 접속
http://localhost:3000
```

첫 실행 시 `app` 컨테이너 빌드, Postgres 기동, Prisma 마이그레이션 적용, Next.js dev 서버 시작까지 한 번에 진행됩니다. 이후 실행은 `docker-compose up`만으로 충분합니다(코드가 바뀐 경우에만 `docker-compose up --build` 필요).

## 3. 포트 변경

기본 포트는 App `3000`, DB `5432`입니다. 둘 중 하나가 이미 사용 중이라면 다음 중 한 가지 방법으로 바꿀 수 있습니다.

**방법 A — 환경변수(.env)로 변경 (권장, `docker-compose.yml` 수정 불필요)**

```bash
# .env
APP_PORT=4000
DB_PORT=5433
```

```bash
docker-compose up
# http://localhost:4000 으로 접속
```

**방법 B — `docker-compose.yml` 직접 수정**

```yaml
app:
  ports:
    - "4000:3000"   # 좌측 숫자만 원하는 호스트 포트로 변경
```

> 컨테이너 내부 포트(콜론 우측, `3000`/`5432`)는 그대로 두세요. 호스트에 노출되는 포트(콜론 좌측)만 바꾸면 됩니다.

## 4. 종료

```bash
docker-compose down
```

DB 데이터까지 삭제하려면:

```bash
docker-compose down -v
```
