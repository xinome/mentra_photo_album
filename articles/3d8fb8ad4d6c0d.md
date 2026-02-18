---
title: "APIをテストツール「Postman」を使ったDjangoとのCRUD機能実装(実装編)"
emoji: "📮"
type: "tech"
topics:
  - "django"
  - "python"
  - "react"
  - "redux"
  - "drf"
published: true
published_at: "2025-07-11 19:00"
---

:::message
この記事は Qiita に2024年2月に投稿した内容を、再編集したものです。
:::

## 概要

今回は新しい画面機能を作成し、「Postman」と並行してフロント / バック間のデータ挙動の可視化と構成の実装について書いていきます。


### 実装機能

今回実装していくのは、ちょっとしたコツや記事を[ナレッジベース](https://www.stock-app.info/media/knowledge-database/)風にまとめる「Tips」というコンテンツです。

- Django REST Framework（DRF）を使ったAPI連携、CRUD機能
    - 外部キーを参照したCRUD機能
    - パラメータの利用
- パラメータを参照したReact routerでのルーティング


| 項番 | 記事 |
| :--- | :--- |
| 1 | [React + Django + CORSを使ったフロントエンド / バックエンドのデータ連携](https://zenn.dev/xinome/articles/6025914fbe07f3) |
| 2 | [Django 管理画面のカスタマイズ](https://zenn.dev/xinome/articles/1dac5d48c25fe7) |
| 3 | [Django REST framework(DRF)を使ったAPIサーバーとReactとのデータ連携](https://zenn.dev/xinome/articles/4ddf5b02bac39a) |
| 4 | [Django REST frameworkのserializersを使った外部キーモデルの参照](https://zenn.dev/xinome/articles/8fe337a7a6cd08) |
| 5 | [React + Redux / Redux Toolkitを使った非同期通信の検証](https://zenn.dev/xinome/articles/7270df53cc4843) |
| 6 | [APIをテストツール「Postman」を使ったDjangoとのCRUD機能実装(設計編)](https://zenn.dev/xinome/articles/465641fa7325a1) |
| 7 | APIをテストツール「Postman」を使ったDjangoとのCRUD機能実装(実装編)（本記事） |



## フォルダ構成

今回使用しているものをメインに抜粋

- バックエンド(Python / Django)

```
.
├── backend_django
│   └── settings.py
├── django_app
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
```

- フロントエンド(React / Redux)


```
.
├── features
│   ├── tips
│   │   ├── tipsCategorizeSlice.js
│   │   ├── tipsDetailSlice.js
│   │   ├── tipsEditSlice.js
│   │   └── tipsSlice.js
├── pages
│   ├── tips
│   │   ├── TipsCategorize.js
│   │   ├── TipsCreate.js
│   │   ├── TipsDetail.js
│   │   ├── TipsEdit.js
│   │   └── TipsIndex.js
│   └── DashBoard.js
└── store
    └── index.js
```



## 実装方法

### バックエンド

先に構成イメージとしてurlパターンをシェア。次のような構成です。
- tips/create/: Tips作成
- tips/update/: Tips編集・更新
- tips/delete/: Tips削除
- それ以外: Tips一覧、カテゴリー別一覧、Tips詳細


```python:app/urls.py
from django.urls import path, include
from . import views

urlpatterns = [
      :
    path("tips/", views.tips_contents, name="tips_contents"),
    path("tips/create/", views.tips_contents_create.as_view(), name="tips_contents_create"),
    path("tips/update/<int:pk>", views.tips_contents_update.as_view(), name="tips_contents_update"),
    path("tips/delete/<int:pk>", views.tips_contents_delete.as_view(), name="tips_contents_delete"),
    
    path("tips/<category_path>/", views.tips_category, name="tips_category"),
    path("tips/<category_path>/<int:pk>", views.tips_contents_detail, name="tips_contents_detail"),
]
```

- 前回のおさらい

> 関数ベースの場合は `views.関数名` 、クラスベースの場合は `views.クラス名.as_view()` と指定します。

汎用性も考えると全てクラスベースに統一する方がいいのですが、今回は検証も兼ねて以下の構成としています。

- Readのみ: 関数ベースView
- Read以外を含む: クラスベースView

また作成エンドポイント以外はパスパラメータとして `category_path` 、 `pk` を設定しています。
ここで注意点なのがpathの記載順で、ほぼ他の言語とも変わりませんが **記載した順に適用される** ということを抑えておいた方がいいです。
例えば `tips/<category_path>/` が `tips/create/` より先に記述されていた場合、 `tips/create/` エンドポイントにアクセスすると `tips/<category_path>/` として処理されてしまうため、構成の違い等でエラーが発生することになります。
固定の文字列になっているエンドポイントは順序を先に持ってくるようにしましょう。



```python:app/views.py
from django.shortcuts import render
from django.http import JsonResponse

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.decorators import api_view

# Tips: 1件のみ取得
def tips_contents_detail(request, category_path, pk):

  print("category_path: ", category_path)
  print("pk: ", pk)
  
  queryset = TipsContents.objects.get(category__tips_path=category_path, id=pk)
  serializer_class = TipsContentsSerializer(queryset)
  data = serializer_class.data

  return JsonResponse(data, safe=False)

# Tips: 新規作成
@method_decorator(csrf_exempt, name='dispatch')
class tips_contents_create(APIView):

  # GET: 確認用
  def get(self, request):
    queryset = TipsContents.objects.all()
    serializer_class = TipsContentsSerializer(queryset, many=True)

    data = serializer_class.data

    return JsonResponse(data, safe=False)

  # POST: 実行
  def post(self, request):

    print("request: ", request)
    print("request.data: ", request.data)

    serializer_class = TipsContentsSerializer(data=request.data)
    if serializer_class.is_valid():
      serializer_class.save()
      return JsonResponse(serializer_class.data, status=201)

    return JsonResponse(serializer_class.errors, status=400)

# Tips: 更新
@method_decorator(csrf_exempt, name='dispatch')
class tips_contents_update(APIView):

  # GET: 編集時に参照
  def get(self, request, pk):

    # 1件のみ取得
    queryset = TipsContents.objects.get(id=pk)
    serializer_class = TipsContentsSerializer(queryset)

    data = serializer_class.data

    return JsonResponse(data, safe=False)

  # POST: 実行
  def post(self, request, pk):

    print("request: ", request)
    print("request.data: ", request.data)

    queryset = TipsContents.objects.get(id=pk)

    serializer_class = TipsContentsSerializer(queryset, data=request.data)
    if serializer_class.is_valid():
      serializer_class.save()
      return JsonResponse(serializer_class.data, status=201)

    return JsonResponse(serializer_class.errors, status=400)

# Tips: 削除
@method_decorator(csrf_exempt, name='dispatch')
class tips_contents_delete(APIView):

  # GET: 確認用
  def get(self, request, pk):

    # 1件のみ取得
    queryset = TipsContents.objects.get(id=pk)
    serializer_class = TipsContentsSerializer(queryset)

    data = serializer_class.data

    return JsonResponse(data, safe=False)

  # POST: 実行
  def post(self, request, pk):

    print("request: ", request)
    print("request.data: ", request.data)

    queryset = TipsContents.objects.get(id=pk)
    queryset.delete()

    return JsonResponse({
      "message": "delete success",
    }, status=201)


```

前回と同じく、CSRF回避のための設定を接頭につけています。
- 関数ベースViewの接頭に `@csrf_exempt` を追加
- クラスベースViewの接頭に `@method_decorator(csrf_exempt, name='dispatch')` を追加

各Viewの変数として、 `self` , `request` の他urls.pyで設定したパスパラメータを追記している形としています。


```python:app/models.py
from django.db import models
  :

class TipsCategory(BaseMeta):
  id = models.AutoField(primary_key=True)
  tips_name = models.CharField(max_length=100)
  tips_path = models.CharField(max_length=100, null=True, default='tips')

  class Meta:
    db_table = 'tips_category'
    verbose_name_plural = 'Util_Tipsカテゴリ'

  def __str__(self):
    return self.tips_name
  
class TipsContents(BaseMeta):
  id = models.AutoField(primary_key=True)
  title = models.CharField(max_length=255)
  date = models.DateField()
  content = models.TextField()
  category = models.ForeignKey(TipsCategory, on_delete=models.PROTECT, null=True)

  class Meta:
    db_table = 'tips'
    verbose_name_plural = 'Tips_一覧'

  def __str__(self):
    return self.title
```

CRUDそれぞれで基本構成は変わらないので、モデルは `TipsContents` で統一しています。
`TipsCategory` は外部キーの参照用として使うのみで、フロント画面からユーザー操作ができないモデルです。


```python:app/serializers.py
from rest_framework import serializers
from .models import (
    :
  TipsContents,
)

class TipsContentsSerializer(serializers.ModelSerializer):
  # 外部キーのカテゴリーを取得する
  category = TipsCategorySerializer()

  class Meta:
    model = TipsContents
    fields = ('id', 'title', 'date', 'content', 'category', 'created_at', 'updated_at')

  def create(self, validated_data):
    # categoryは外部キーなので、tips_pathを取得して登録する
    validated_data['category'] = TipsCategory.objects.get(tips_path=validated_data['category'].get('tips_path'))

    return TipsContents.objects.create(**validated_data)

  def update(self, instance, validated_data):

    instance.title = validated_data.get('title', instance.title)
    instance.date = validated_data.get('date', instance.date)
    instance.content = validated_data.get('content', instance.content)
    # categoryは外部キーなので、tips_pathを取得して更新する
    instance.category = TipsCategory.objects.get(tips_path=validated_data.get('category').get('tips_path'))

    instance.save()
    return instance

  def delete(self, instance):
    instance.delete()
    return instance

```

今回の実装にあたりコアとなったのはserializerの部分でした。
当初 `class Meta` だけ記述した状態で設計を進めていたところ、このようなメッセージに当たりました。

> AssertionError: The `.update()` method does not support writable nested fields by default. Write an explicit `.update()` method for serializer `django_app.serializers.TipsContentsSerializer`, or set `read_only=True` on nested serializer fields.

シリアライザーのフィールドがnested（入れ子）になっている場合の更新処理をデフォルトではサポートしていないということで、解消するには明示的な `.update()` メソッドを書くか、ネストされたシリアライザフィールドに `read_only=True` の設定が必要という説明です。
今回は外部キーである `category` が該当しており、エラー文のUPDATEだけでなくCREATE, DELETEも該当するので合わせて実装しています。

各メソッドの流れとしては、基本的に以下の通りです。
- validated_data: フロントから取得したデータを格納
- instance: validated_dataから参照・整形したデータを格納
- 各々処理した後、instanceを返す

詳しくは、[DRF公式サイト](https://www.django-rest-framework.org/api-guide/serializers/#dealing-with-nested-objects)も合わせて参照ください。



### フロントエンド

多岐に渡るため、一例として特定のTipsを参照・更新する画面で説明します。

```src/features/tips/tipsEditSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  items: [],
};

const BASE_API_URL = "http://localhost:8000/api";

export const fetchGetTipsToEdit = createAsyncThunk(
  "tips_list",
  async (params) => {
    console.log("params: ", params);
    const connect_url = `${BASE_API_URL}/tips/update/${params.tips_id}`;
    console.log("connect_url: ", connect_url);

    const response = await axios.get(connect_url);
    return response.data;
  }
);

export const fetchUpdateTips = createAsyncThunk(
  "update_tips_list",
  async (data) => {

    const tips_id = data.category.id;
    const connect_url = `${BASE_API_URL}/tips/update/${tips_id}`;

    try {
      const response = await axios.post(connect_url, data);
      console.log("updateTips: ", response);
      return response.data;
    }
    catch (error) {
      console.log("updateTips_error: ", error);
    }
  }
);

// Slices
export const tipsDetailSlice = createSlice({
  name: "tips_detail",  // sliceの名前
  initialState: initialState,
  reducers: {},

  // 外部からのデータ取得
  extraReducers: (builder) => {
    // TODO: エラー発生時の処理も追加する
    builder
      .addCase(fetchGetTipsToEdit.pending, (state) => {
        console.log("pending..");
        return {
          ...state,
          isLoading: true,
        };
      })
      .addCase(fetchGetTipsToEdit.fulfilled, (state, action) => {
        console.log("fulfilled: ", action.payload);
        return {
          ...state,
          items: action.payload,
          isLoading: false,
        };
      })
      .addCase(fetchGetTipsToEdit.rejected, (state) => {
        console.log("rejected..");
        return {
          ...state,
          isLoading: false,
        };
      });
  },
});

// 各コンポーネントからstateを参照できるようにエクスポートをしておく
export default tipsDetailSlice.reducer;
```

非同期処理用のSliceとして以下を作成しています。
- fetchGetTipsToEdit: 編集するTipsの参照
- fetchUpdateTips: Tipsを更新する処理



```src/store/index.js
import { combineReducers } from 'redux';
import { configureStore } from "@reduxjs/toolkit";

// Reducers
  :
import tipsEditReducer from '../features/tips/tipsEditSlice';

const rootReducer = combineReducers({
    :
  tipsEditReducer,
});

// Store
const store = configureStore({
  reducer: rootReducer,
});

export default store;
```

storeでは作成したsliceをインポート、reducerとして定義します。


```src/BaseApp.js
import { Routes, Route, Link } from 'react-router-dom';
import TipsEdit from "./pages/tips/TipsEdit";

const BaseApp = () => {
  return (
    <div className="app">
      :
      <Routes>
        <Route path="/tips/edit/:tips_id" element={<TipsEdit />} />
      </Routes>
    </div>
  )
}
```


```src/pages/tips/TipsEdit.js
import React, { useState, useEffect } from 'react'
import Axios from 'axios'

import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import { fetchGetTipsToEdit, fetchUpdateTips } from '../../features/tips/tipsEditSlice'

const TipsEdit = () => {

  const currentTipsDetail = useSelector((state) => state.tipsDetailReducer.items);
  const isLoading = useSelector((state) => state.tipsDetailReducer.isLoading);
  const dispatch = useDispatch();

  const params = useParams();  // URLからパラメータを取得

  const [tipsState, setTipsState] = useState(currentTipsDetail);

  useEffect(() => {
    dispatch(fetchGetTipsToEdit(params));
  }, []);

  useEffect(() => {
    setTipsState(currentTipsDetail);
  }, [currentTipsDetail]);

  const handleSubmit = (e, tipsState) => {
    e.preventDefault();
      :
    dispatch(fetchUpdateTips(tipsState));

  }
    :
  return (
    <Container>
        :
      <Box>

          <form method='POST' onSubmit={e => {handleSubmit(e, tipsState)}}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableBody>
                  <TableRow >
                    <TableCell component="th" scope="row">
                      タイトル
                    </TableCell>
                    <TableCell align="right">
                      <TextField required id="outlined-basic" label="Required" variant="outlined"
                        value={tipsState.title}
                        onChange={e => setTipsState({...tipsState, title: e.target.value})}
                      />
                    </TableCell>
                  </TableRow>
                    :
                </TableBody>
              </Table>
            </TableContainer>

            <Box className='section-footer'>
              <Button variant="contained" color="primary" type='submit'>
                Tipsを作成する
              </Button>
            </Box>
          </form>
        </Box>

    </Container>
  )
}

export default TipsEdit
```

※コンポーネント設計はMUIを使っていますが、説明は省略します。
画面コンポーネントでは `useParams()` を使ってアクセスしたURLのパラメータを取得します。
読み込み時に `fetchGetTipsToEdit(params)` が実行されるのですが、その中の `params.tips_id` を参照したURLを `axios.get` でバックエンド側のAPIエンドポイントとしてアクセスしている流れになります。

またデータ更新時にはフォームのボタンを押したタイミングで `fetchUpdateTips` が実行され、APIエンドポイントは先ほどと同じですが `axios.post` で送信データも引数としてアクセスしています。



## 参考文献

- Django REST Framework: Serializer

https://www.django-rest-framework.org/api-guide/serializers/#dealing-with-nested-objects

- DRFのSerializer

https://qiita.com/shitikakei/items/bf9471fb0e606db5ee15




