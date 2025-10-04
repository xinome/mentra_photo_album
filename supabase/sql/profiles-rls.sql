-- profilesテーブルのRLS設定

-- RLS有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 自分のプロファイルのみ参照可能
CREATE POLICY profiles_select ON public.profiles
FOR SELECT
USING (user_id = auth.uid());

-- 自分のプロファイルのみ更新可能
CREATE POLICY profiles_update ON public.profiles
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 自分のプロファイルのみ挿入可能
CREATE POLICY profiles_insert ON public.profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 自分のプロファイルのみ削除可能
CREATE POLICY profiles_delete ON public.profiles
FOR DELETE
USING (user_id = auth.uid());
