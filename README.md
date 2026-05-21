# Football App

推しサッカーチーム・推し選手のスタッツ閲覧アプリ。

お気に入りのチームを登録し、試合結果・過去試合・選手スタッツを確認できる。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js 16（App Router） |
| バックエンド | AWS Lambda（Node.js 20） + API Gateway |
| IaC | AWS SAM |
| 外部API | [API-FOOTBALL v3](https://www.api-football.com/) |
| お気に入り保存 | localStorage（将来: DynamoDB） |

---

## 必要な環境

- Node.js **20** 以上（nvm 推奨）
- npm 10 以上
- API-FOOTBALL の APIキー（[登録はこちら](https://www.api-football.com/)）

---

## バックエンド ローカル起動

### 1. 依存パッケージをインストール

```bash
cd backend
npm install
```

### 2. 環境変数を設定

```bash
cp .env.example .env
```

`.env` を開き、APIキーを入力する。

```env
API_FOOTBALL_KEY=your-api-football-key-here
PORT=3001
```

### 3. 開発サーバーを起動

```bash
npm run dev
```

起動すると `http://localhost:3001` でリクエストを受け付ける。

---

## フロントエンド ローカル起動

```bash
cd frontend
npm install
npm run dev
```

`http://localhost:3000` でアクセスできる。  
バックエンドを先に起動しておく必要がある。

> **Node.js バージョン注意**: Next.js 16 には Node.js 20 が必要。  
> nvm を使う場合: `nvm use 20`

---

## 環境変数

### バックエンド（`backend/.env`）

| 変数名 | 必須 | 説明 |
|---|---|---|
| `API_FOOTBALL_KEY` | ✅ | API-FOOTBALL の APIキー |
| `PORT` | - | ローカルサーバーのポート番号（デフォルト: 3001） |

### フロントエンド（`frontend/.env.local`）

| 変数名 | 必須 | 説明 |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | - | バックエンドのURL（デフォルト: `http://localhost:3001`） |

---

## API エンドポイント

### チーム・リーグ系

| メソッド | パス | 説明 | パラメータ |
|---|---|---|---|
| GET | `/teams/search` | チーム検索 | `q`（3文字以上） |
| GET | `/teams/{teamId}` | チーム基本情報 | - |
| GET | `/teams/{teamId}/fixtures` | 試合一覧 | `type=past\|upcoming\|recent` |
| GET | `/teams/{teamId}/players` | チーム内選手一覧 | - |
| GET | `/leagues/{leagueId}/teams` | リーグのチーム一覧 | `season`（任意） |

### 試合系

| メソッド | パス | 説明 | パラメータ |
|---|---|---|---|
| GET | `/fixtures/{fixtureId}` | 試合詳細 | - |
| GET | `/fixtures/{fixtureId}/stats` | 試合スタッツ（支配率・シュート数など） | - |
| GET | `/fixtures/{fixtureId}/lineups` | 出場選手・個人スタッツ | - |
| GET | `/fixtures/{fixtureId}/formation` | フォーメーション・ピッチ上の座標 | - |

### 選手系

| メソッド | パス | 説明 | パラメータ |
|---|---|---|---|
| GET | `/players/{playerId}` | 選手プロフィール | `season`（任意、省略時は自動判定） |
| GET | `/players/{playerId}/stats` | 選手シーズンスタッツ | `season`（任意、省略時は自動判定） |

### レスポンス形式

```json
// 成功
{ "success": true, "data": { ... }, "error": null }

// エラー
{ "success": false, "data": null, "error": { "code": "BAD_REQUEST", "message": "..." } }
```

---

## 動作確認例

```bash
# チーム詳細（Arsenal: teamId=42）
curl "http://localhost:3001/teams/42"

# リーグのチーム一覧（Premier League: leagueId=39）
curl "http://localhost:3001/leagues/39/teams"

# 過去10試合
curl "http://localhost:3001/teams/42/fixtures?type=past"

# 試合詳細（fixtureId は fixtures 一覧から取得）
curl "http://localhost:3001/fixtures/1035084"

# 試合スタッツ
curl "http://localhost:3001/fixtures/1035084/stats"

# 出場選手・個人スタッツ
curl "http://localhost:3001/fixtures/1035084/lineups"

# フォーメーション・ピッチ座標
curl "http://localhost:3001/fixtures/1035084/formation"

# 選手プロフィール
curl "http://localhost:3001/players/285"
curl "http://localhost:3001/players/285?season=2024"

# 選手シーズンスタッツ
curl "http://localhost:3001/players/285/stats"
```

---

## 注意事項

- API-FOOTBALL の無料プランは **100リクエスト/日** の制限あり
- 無料プランで利用可能なシーズンは **2022〜2024**（2025以降は有料）
- `.env` は `.gitignore` 済み。APIキーをコミットしないこと
- `.env.example` はプレースホルダーのみ記載すること
