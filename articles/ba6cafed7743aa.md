---
title: "Vue CLIを使用したVueプロジェクトの最初期セットアップ"
emoji: "💭"
type: "tech"
topics:
  - "vuejs"
  - "eslint"
  - "prettier"
  - "normalizcss"
published: true
published_at: "2025-07-04 11:18"
---

:::message
この記事は Qiita に2022年2月に投稿した内容の移行版です。
:::

## 概要

現在個人開発プロジェクトとして「IT育成カリキュラム(仮)」の構成を検討しています。
本プロジェクトの概要については[こちらの記事](https://note.com/npower_creative/n/n48dc5182423b)を合わせてご覧ください。
その中で技術選定をしている途中ではありますが、ある程度固まってきたので備忘も兼ねて最初期のセットアップについてシェアしようと思います。

### 使用技術

- [Vue 3.x](https://jp.vuejs.org/index.html)
- [Vue CLI](https://cli.vuejs.org/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [normalize.css](https://necolas.github.io/normalize.css/)

プロジェクトのベースにVue 3.x、テンプレート構築にVue CLIを採用。
フォーマットツールでESLintとPrettierを採用しています。
選定基準は過去プロジェクトでの使用経験があり、感覚的に慣れているというシンプルな理由です。


### 参考文献

- https://reffect.co.jp/vue/eslint#eslintrcjs
- https://stackoverflow.com/questions/71205264/component-name-temp-should-always-be-multi-word-vue-multi-word-component-names
- https://eslint.vuejs.org/rules/multi-word-component-names.html


## 設定手順
node.js、npm or yarnがインストールされている前提で、Vue CLIをインストールします。
（今回はnpmコマンドベースで記載します）

```bash
npm install -g @vue/cli
```
インストールできているか確認、バージョンを参照します。
```bash
vue --version
```

ここまでできていたらプロジェクトを管理するフォルダに移動し、下記を実行します。
```
vue create [プロジェクト名]
```

ここからはVUE CLIのセットアップに移ります。
今回下記のように設定を行いました。
![スクリーンショット 2022-02-24 16.35.33.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/76115/1ac81cea-afee-a6d3-dd2c-118f3972bc5c.png)
→自身である程度カスタムしてみたかったため、一番下を選択

![スクリーンショット 2022-02-24 16.35.43.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/76115/1b121a49-8fd9-5dfa-401a-4b0a5b2a6dec.png)
→画面内リンクやフォーマッターを利用するため「Babel」「Router」「Vuex」「Linter / Formatter」を選択

![スクリーンショット 2022-02-24 16.35.51.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/76115/24e57c94-b3c0-c832-156a-a383b1840230.png)
プロジェクトのベースバージョンは「3.x」

![スクリーンショット 2022-02-24 16.36.06.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/76115/f4d2e2b0-d2fe-a7e8-d3a1-9de3aac11e90.png)
→あまり理由はないんですがヒストリーモードは「なし」

![スクリーンショット 2022-02-24 16.36.14.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/76115/0eee7534-62f7-746e-713b-1ed722fc9dd7.png)
→フォーマットの設定は「Prettier」

![スクリーンショット 2022-02-24 16.36.41.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/76115/42076cba-6f2a-e820-ec75-222fe2adb534.png)
→Lintのタイミングは作業時よりも任意のタイミングで行いたいため「on commit」時に設定

![スクリーンショット 2022-02-24 16.36.49.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/76115/86e1bb35-2a81-7e09-d3d6-03e4375e55cf.png)
→Babel等各種ライブラリの設定方法。package.jsonは使いません。

ここまでうまくいけばプロジェクトが作成され、`npm run serve`または`yarn serve`コマンドで
http://localhost:8080/　
にローカルアプリが出力されるようになります。（デフォルトの場合）


## スタイルシートの設定手順

最初のセットアップ時、デフォルトでは次のように記述されています。

```src/App.vue
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
```

シンプルな構成ならこのままでも構わないですが、規模が大きくなるにつれて管理が大変になってくるのでcss部分は分けたいと思います。
今回sassベースで作りたいので、下記パッケージを導入しました。
- [node-sass](https://www.npmjs.com/package/node-sass)
- [sass-loader](https://www.npmjs.com/package/sass-loader)

```bash
# node-sass
npm install node-sass

# sass-loader
npm install sass-loader sass webpack --save-dev
```

次に上記を任意のscssに移行します。
`src/assets/css/style.scss` にした場合、合わせて`main.js`に下記記載します。

```src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

// 下記を追加
import "@/assets/css/style.scss";

createApp(App).use(store).use(router).mount("#app");
```

さらに「[normalize.css](https://www.npmjs.com/package/normalize.css)」も使いたいので、パッケージからインストールしました。
```bash
npm install --save normalize.css
```

こちらもmain.jsに追記し、最終的には以下の形になります。
```src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

// 下記を追加
import "normalize.css/normalize.css";
import "@/assets/css/style.scss";

createApp(App).use(store).use(router).mount("#app");

```

## Lint / Prettierのテスティング手順

今回テスティングツールにPrettierを採用していますが、`.eslintrc.js`に追記することで任意のルール設定を行うことができます。
例えば「タブ２文字」「シングルクオートなし（＝ダブルクオート）」「セミコロンあり」としたい場合は次のような記述になります。
```.eslintrc.js
rules: {
　　：
    // 追加分
    "prettier/prettier": [
      "error",
      {
        tabWidth: 2,
        singleQuote: false,
        semi: true,
      },
    ],
  },
```

この状態で一度Lintコマンドを実行してみましょう。
```bash
npm run lint --fix
```

自分はここまでで「Login」というコンポーネントを追加し検証していたのですが、このようなエラーが出ていました。
```bash
1:1  error  Component name "Login" should always be multi-word  vue/multi-word-component-names
```

これはプラグイン「[multi-word-component-names](https://eslint.vuejs.org/rules/multi-word-component-names.html)」によるもので、単独語はコンポーネント名に使えないというものでしたが、自由度を高めたいため公式ドキュメントで参照したignoreリストを追記してコンポーネントと連携させることで解消できました。

```javascript:src/views/Login.vue
<script>
export default {
  name: "Login",
};
</script>
```

```.eslintrc.js
rules: {
　　：
    // 追加分
    "vue/multi-word-component-names": [
      "error",
      {
        // multi-wordでなくても問題ないコンポーネント名を追加していく
        ignores: ["Login"],
      },
    ],
  },
```




