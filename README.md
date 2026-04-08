# LiftFlow セットアップ手順書

このREADMEは、**他の人がこのアプリを自分の環境で動かすための手順**をまとめたものです。  
前提として、相手は GitHub / Vercel / Google Cloud の基本操作がある程度わかる想定です。

---

# 1. このアプリの構成

このアプリは、ざっくり以下の3層で動いています。

## フロント
- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/constants.js`
- `js/helpers.js`
- `js/drive.js`
- `js/ai.js`
- `js/sampleData.js`

## API
- `api/_utils.js`
- `api/ai/training-plan.js`
- `api/ai/recovery-plan.js`
- `api/drive/auth.js`
- `api/drive/callback.js`
- `api/drive/profile/load.js`
- `api/drive/profile/save.js`
- `api/drive/records/load.js`
- `api/drive/records/save.js`
- `api/drive/sleeping/load.js`
- `api/drive/sleeping/save.js`

## 保存先
Google Drive 上に以下の JSON を保存します。
- `profile.json`
- `records.json`
- `sleeping.json`

---

# 2. 相手が自分の環境で使うために必要なもの

最低限必要なのは以下です。

- GitHub アカウント
- Vercel アカウント
- Google アカウント
- Google Cloud Console の利用権限
- Gemini API キー
- このリポジトリ一式

---

# 3. 何を自分用に変えればよいか

このアプリを別の人が自分で使うには、**コードを大きく変える必要はなく、主に「認証情報」と「デプロイ先」を自分用に変える**必要があります。

変えるべきものは以下です。

## 必須
- Vercel のデプロイ先
- Google OAuth の Client ID / Client Secret
- Google OAuth の Redirect URI
- Gemini API キー

## 場合によって必要
- `GOOGLE_API_KEY` ではなく `GEMINI_API_KEY` を使うかどうか
- カスタムドメインを使うなら Redirect URI もそれに合わせる
- OpenAI を使う設計に戻すなら `OPENAI_API_KEY` も必要

---

# 4. 一番安全な導入方法

## 手順の全体像
1. GitHub に自分のコピーを作る
2. Vercel にその GitHub リポジトリを読み込ませる
3. Google Cloud で OAuth クライアントを作る
4. Gemini API キーを発行する
5. Vercel の環境変数を設定する
6. デプロイする
7. Drive Sync を実行して使い始める

---

# 5. GitHub 側の作業

## 5-1. リポジトリを自分の GitHub に置く
以下のどちらかでよいです。

### 方法A
この zip を展開して、新しい GitHub リポジトリを作って push する

### 方法B
既存リポジトリを fork する

---

# 6. Vercel 側の作業

## 6-1. プロジェクトを作る
1. Vercel にログイン
2. `Add New Project`
3. 自分の GitHub リポジトリを選ぶ
4. Framework preset は自動判定に任せてよい
5. Root はリポジトリ直下

## 6-2. デプロイ後に確認する URL
Vercel で発行される URL は例えば以下です。

```text
https://your-project-name.vercel.app
```

この URL は後で Google OAuth の Redirect URI に使います。

---

# 7. Google Cloud 側の作業

## 7-1. プロジェクトを作る
Google Cloud Console で新規プロジェクトを作成

## 7-2. 必要な API を有効化
最低限これを有効化します。

- Google Drive API

## 7-3. OAuth 同意画面を作る
Google Auth Platform または OAuth consent screen で設定します。

必要最低限でよいです。
- アプリ名
- メールアドレス
- テストユーザー（必要なら自分のGoogleアカウント）

## 7-4. OAuth Client ID を作る
種別は **Web application** にします。

### Authorized redirect URI
ここが重要です。  
以下を登録します。

```text
https://YOUR-VERCEL-DOMAIN/api/drive/callback
```

例:
```text
https://your-project-name.vercel.app/api/drive/callback
```

カスタムドメインを使う場合は、そのドメインに合わせてください。

## 7-5. Client ID / Client Secret を控える
あとで Vercel の環境変数に入れます。

---

# 8. Gemini API 側の作業

## 8-1. API キーを作る
Google AI Studio などで Gemini API キーを作成します。

このコードでは `api/_utils.js` 内で、以下のどちらかが読まれます。

- `GEMINI_API_KEY`
- `GOOGLE_API_KEY`

なので、通常は `GEMINI_API_KEY` を設定すれば十分です。

---

# 9. Vercel に設定する環境変数

Vercel の Project Settings → Environment Variables で、以下を設定します。

## 必須
```text
GOOGLE_CLIENT_ID=xxxxxxxxxxxx
GOOGLE_CLIENT_SECRET=xxxxxxxxxxxx
GOOGLE_REDIRECT_URI=https://YOUR-VERCEL-DOMAIN/api/drive/callback
GEMINI_API_KEY=xxxxxxxxxxxx
```

## 互換用
もし `GEMINI_API_KEY` ではなく `GOOGLE_API_KEY` を使うなら:

```text
GOOGLE_API_KEY=xxxxxxxxxxxx
```

## 任意
`api/_utils.js` には `OPENAI_API_KEY` を読む関数も残っています。  
ただし、現状の `training-plan.js` / `recovery-plan.js` は Gemini を使っているので、**今の構成なら必須ではありません**。

---

# 10. コード上で重要な確認ポイント

## 10-1. `js/constants.js`
ここで API エンドポイントが定義されています。

以下が入っている必要があります。

```javascript
window.DRIVE_ENDPOINTS = {
  auth: '/api/drive/auth',
  callback: '/api/drive/callback',
  loadProfile: '/api/drive/profile/load',
  saveProfile: '/api/drive/profile/save',
  loadRecords: '/api/drive/records/load',
  saveRecords: '/api/drive/records/save',
  loadSleeping: '/api/drive/sleeping/load',
  saveSleeping: '/api/drive/sleeping/save'
};
```

## 10-2. `js/drive.js`
ここで sleeping API を呼ぶ関数が必要です。

- `saveSleeping`
- `loadSleeping`

## 10-3. `api/drive/sleeping/`
このディレクトリが存在し、以下の2ファイルがある必要があります。

```text
api/drive/sleeping/load.js
api/drive/sleeping/save.js
```

---

# 11. デプロイ後の初回確認

## 11-1. サイトを開く
Vercel の URL にアクセス

## 11-2. Initial Setup
右上の設定ボタンから Initial Setup を開き、プロフィールを保存

## 11-3. Drive Sync
Drive Sync を押す  
→ Google 認証画面に飛ぶ  
→ 認可後、アプリに戻る

## 11-4. Google Drive 上に JSON が作られるか確認
使い始めると以下が Drive 上に作成・更新されます。

- `profile.json`
- `records.json`
- `sleeping.json`

---

# 12. このアプリのデータの流れ

## トレーニング
- Workout で入力
- `records.json` に保存

## 睡眠
- Recovery > Sleeping で入力
- `sleeping.json` に保存

## プロフィール
- Initial Setup で入力
- `profile.json` に保存

---

# 13. よくある詰まりポイント

## 13-1. Drive Sync 後に古い画面に戻る
原因候補:
- Vercel の Production が古い
- callback の redirect が古いデプロイ先に向いている
- ブラウザキャッシュ

確認点:
- 最新デプロイが Production に promote されているか
- `api/drive/callback.js` の redirect 後の遷移先が正しいか
- `GOOGLE_REDIRECT_URI` が今の本番ドメインになっているか

## 13-2. Drive Sync はできるが JSON が保存されない
確認点:
- `api/drive/sleeping/load.js`
- `api/drive/sleeping/save.js`
- `api/drive/records/load.js`
- `api/drive/records/save.js`
- `js/drive.js`
- `js/constants.js`

の整合性

## 13-3. AI が 429 で落ちる
原因:
- Gemini API の無料枠超過

対処:
- しばらく待つ
- APIキーやプランを見直す
- 呼び出し回数を減らす

## 13-4. 起床ボタンが保存されない
仕様です。  
未完了の `入眠` 記録がないと `起床` は単独記録できません。

---

# 14. ディレクトリ構成の完成形

```text
bodymaking/
├─ index.html
├─ package.json
├─ css/
│  └─ styles.css
├─ js/
│  ├─ ai.js
│  ├─ app.js
│  ├─ constants.js
│  ├─ drive.js
│  ├─ helpers.js
│  └─ sampleData.js
├─ api/
│  ├─ _utils.js
│  ├─ ai/
│  │  ├─ training-plan.js
│  │  └─ recovery-plan.js
│  └─ drive/
│     ├─ auth.js
│     ├─ callback.js
│     ├─ profile/
│     │  ├─ load.js
│     │  └─ save.js
│     ├─ records/
│     │  ├─ load.js
│     │  └─ save.js
│     └─ sleeping/
│        ├─ load.js
│        └─ save.js
```

---

# 15. 相手に最低限伝えるべきこと

このアプリを自分の環境で使うために必要なのは、実質この4点です。

1. **自分の Vercel にデプロイする**
2. **自分の Google OAuth を作る**
3. **自分の Redirect URI を入れる**
4. **自分の Gemini API キーを入れる**

コード自体を大きく書き換える必要はありません。  
**認証情報とデプロイ先を自分用に差し替えれば使える**、というのが本質です。

---

# 16. 一番短い引き継ぎ文

相手に短く伝えるならこれです。

```text
このアプリは Vercel + Google Drive OAuth + Gemini API で動いています。
自分で使うには、GitHub の repo を自分の Vercel に載せて、
Google Cloud で OAuth Client を作り、
Redirect URI を https://自分のドメイン/api/drive/callback に設定し、
Vercel の環境変数に
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
GEMINI_API_KEY
を入れれば使えます。
Drive Sync 後に profile.json / records.json / sleeping.json が Google Drive に保存されます。
```
