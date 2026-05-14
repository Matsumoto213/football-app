# Football App

推しサッカーチーム・推し選手のスタッツ閲覧アプリ。

お気に入りのチームを登録し、試合結果・過去試合・選手スタッツを確認できる。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js（App Router） ※ Phase 2 以降 |
| バックエンド | AWS Lambda（Node.js 20） + API Gateway |
| IaC | AWS SAM |
| 外部API | [API-FOOTBALL v3](https://www.api-football.com/) |
| お気に入り保存 | localStorage（将来: DynamoDB） |

---

## 必要な環境

- Node.js 16 以上
- npm 8 以上
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

起動すると以下が表示される。

```
Football App Backend: http://localhost:3001

  GET /teams/search?q={チーム名}
  GET /teams/{teamId}
  GET /teams/{teamId}/fixtures?type=past|upcoming|recent
  GET /teams/{teamId}/players
  GET /fixtures/{fixtureId}
  GET /fixtures/{fixtureId}/lineups
  GET /players/{playerId}?season={year}
  GET /players/{playerId}/stats?season={year}
```

---

## 環境変数

| 変数名 | 必須 | 説明 |
|---|---|---|
| `API_FOOTBALL_KEY` | ✅ | API-FOOTBALL の APIキー |
| `PORT` | - | ローカルサーバーのポート番号（デフォルト: 3001） |

---

## API エンドポイント

### チーム・試合系

| メソッド | パス | 説明 | パラメータ |
|---|---|---|---|
| GET | `/teams/search` | チーム検索 | `q`（3文字以上） |
| GET | `/teams/{teamId}` | チーム基本情報 | - |
| GET | `/teams/{teamId}/fixtures` | 試合一覧 | `type=past\|upcoming\|recent` |
| GET | `/teams/{teamId}/players` | チーム内選手一覧 | - |

### 試合詳細・選手系

| メソッド | パス | 説明 | パラメータ |
|---|---|---|---|
| GET | `/fixtures/{fixtureId}` | 試合詳細 | - |
| GET | `/fixtures/{fixtureId}/lineups` | 出場選手・スタッツ | - |
| GET | `/players/{playerId}` | 選手プロフィール | `season`（任意、省略時は自動判定） |
| GET | `/players/{playerId}/stats` | 選手シーズンスタッツ | `season`（任意、省略時は自動判定） |

### レスポンス形式

```json
// 成功
{ "success": true, "data": { ... }, "error": null }

// エラー
{ "success": false, "data": null, "error": { "code": "BAD_REQUEST", "message": "..." } }
```

### 動作確認例

```bash
# Arsenal を検索（teamId: 42）
curl "http://localhost:3001/teams/search?q=Arsenal"

# チーム詳細
curl "http://localhost:3001/teams/42"

# 過去10試合
curl "http://localhost:3001/teams/42/fixtures?type=past"

# 今後10試合
curl "http://localhost:3001/teams/42/fixtures?type=upcoming"

# 選手一覧
curl "http://localhost:3001/teams/42/players"

# 試合詳細（fixtureId は fixtures 一覧から取得）
curl "http://localhost:3001/fixtures/1035084"

# 試合の出場選手・スタッツ
curl "http://localhost:3001/fixtures/1035084/lineups"

# 選手プロフィール（season 省略時は自動判定）
curl "http://localhost:3001/players/285"
curl "http://localhost:3001/players/285?season=2024"

# 選手シーズンスタッツ
curl "http://localhost:3001/players/285/stats"
curl "http://localhost:3001/players/285/stats?season=2024"
```

---

## 注意事項

- API-FOOTBALL の無料プランは **100リクエスト/日** の制限あり
- `.env` は `.gitignore` 済み。APIキーをコミットしないこと
- `.env.example` はプレースホルダーのみ記載すること
