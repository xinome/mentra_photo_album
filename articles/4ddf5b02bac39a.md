---
title: "Django REST framework(DRF)を使ったAPIサーバーとReactとのデータ連携"
emoji: "⛳"
type: "tech"
topics:
  - "django"
  - "javascript"
  - "python"
  - "react"
  - "drf"
published: true
published_at: "2025-07-07 19:00"
---

:::message
この記事は Qiita に2024年2月に投稿した内容を、再編集したものです。
:::

## 概要

今回はDjango REST frameworkを使用し、Django-adminで設計されたデータの取得とフロント側での表示を実装します。


### 実装機能

- [Django REST framework(DRF)](https://www.django-rest-framework.org/)の導入
- Django管理画面で実装したデータの取得


| 項番 | 記事 |
| :--- | :--- |
| 1 | [React + Django + CORSを使ったフロントエンド / バックエンドのデータ連携](https://zenn.dev/xinome/articles/6025914fbe07f3) |
| 2 | [Django 管理画面のカスタマイズ](https://zenn.dev/xinome/articles/1dac5d48c25fe7) |
| 3 | Django REST framework(DRF)を使ったAPIサーバーとReactとのデータ連携（本記事） |
| 4 | Django REST frameworkのserializersを使った外部キーモデルの参照（後日公開） |
| 5 | React + Redux / Redux Toolkitを使った非同期通信の検証（後日公開） |
| 6 | APIをテストツール「Postman」を使ったDjangoとのCRUD機能実装(設計編)（後日公開） |
| 7 | APIをテストツール「Postman」を使ったDjangoとのCRUD機能実装(実装編)（後日公開） |

### 参考文献

https://www.django-rest-framework.org/community/release-notes/

https://docs.djangoproject.com/ja/5.0/topics/install/

https://qiita.com/Bashi50/items/203505440049d759b694



## フォルダ構成

今回使用しているものをメインに抜粋

- バックエンド(Python / Django)

```
[Djangoプロジェクト]
├── [Djangoプロジェクト_meta]
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── [Djangoアプリ]
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── tests.py
│   ├── urls.py
│   ├── serializers.py  # 新規追加
│   └── views.py
├── db.sqlite3
└── manage.py
```



## 実装方法

### Tips

本題に入る前に、セットアップ部分のコマンドを記載。（実装時に発生したので備忘）
Django, DRFのバージョンがマッチしていないとサーバー起動時にエラーが起こる場合があります。

```bash
# Djangoのインストール
python -m pip install Django

# Djangoのバージョン確認
python -m django --version

# Django REST frameworkのインストール
pip install djangorestframework

# Django REST frameworkのバージョン確認
pip show djangorestframework

# Django REST frameworkのアップグレード
pip install -U djangorestframework

```

### バックエンド

DRFをインストールしたタイミングでプロジェクトファイルのsettings.pyにも追記しておきます。

```python:project/settings.py
INSTALLED_APPS = [
    'django.contrib.admin',
      :
    'rest_framework',  # REST frameworkを使うために追加
]
```

`app/admin.py` 、 `app/models.py` はこれまでに実装済みのものをそのまま使います。
データの加工や、形式の正誤をチェックするための `app/serializers.py` を新規作成します。

```python:app/serializers.py
from rest_framework import serializers
from .models import ProjectTopics

class ProjectTopicsSerializer(serializers.ModelSerializer):
  class Meta:
    model = ProjectTopics
    fields = ('id', 'date', 'content', 'created_at', 'updated_at')
```

Django管理画面で実装したモデル `ProjectTopics` を継承し、データとして受け渡すための項目を `fields` で指定します。
今回は抽象クラスを含めた全項目を指定していますが、本来は必要なものだけの記載で大丈夫かと思います。
（そもそも現段階では不要かも）

```python:app/views.py
from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import viewsets

# Model, Serializerをインポートする
from .serializers import ProjectTopicsSerializer
from .models import ProjectTopics

# Create your views here.

def project_topics(request):
  # data = [
  #   {
  #     "id": 1,
  #     "date": "2022-10-01",
  #     "content": "[プロジェクト]「プロジェクト名1」デプロイされました。"
  #   },
  #   {
  #     "id": 2,
  #     "date": "2022-10-02",
  #     "content": "[プロジェクト]「プロジェクト名2」デプロイされました。"
  #   },
  #   {
  #     "id": 3,
  #     "date": "2022-10-03",
  #     "content": "[プロジェクト]「プロジェクト名3」デプロイされました。"
  #   },
  #     :

  queryset = ProjectTopics.objects.all()
  serializer_class = ProjectTopicsSerializer(queryset, many=True)
  data = serializer_class.data

  return JsonResponse(data, safe=False)
```

`views.py` ではmodels, serializersで定義したClassをそれぞれインポートし、 `JsonResponse` を使ってJSONデータとしてreturnします。
`queryset` で全データを取得するクエリ、 `serializer_class` で取得するデータの整理を行うといった形でしょうか。

その他のクエリ指定は公式リファレンスからも参照できます。

https://docs.djangoproject.com/ja/5.0/topics/db/queries/#retrieving-objects



### フロントエンド

React側も[前回の記事](https://qiita.com/xinome/items/8319a7f85424bd6e62de)で実装したもので構いません。
`project/urls.py` 、 `app/urls.py` の設定値でURLが実装されるので、ブラウザでの直打ちや `Axios.get` で取得できていれば大丈夫かと思います。


## 実装レビュー
![スクリーンショット 2024-01-10 13.44.10.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/76115/2ff3f134-21f0-10dc-3c42-7952d56e6274.png)

こちらも見た目上はほぼ変わりませんが、生身のJSONデータに近い形から本来のアプリに近い形で参照できるようになりました。

- django-adminでの設計データを取得
- models.py, serializers.pyで取得データの整理
- DjangoとReactのデータ連携（JSON形式）

