ALTER TABLE ratings
ADD CONSTRAINT unique_user_store UNIQUE (user_id, store_id);
