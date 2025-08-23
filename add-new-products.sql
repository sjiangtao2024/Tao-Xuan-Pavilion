-- 增量添加新商品，不删除现有数据
-- 先检查并添加缺失的分类（如果需要）

-- 添加新商品（ID 5和6）
INSERT OR IGNORE INTO products (id, name, description, price, featured, category_id) VALUES
(5, 'Purple Sandalwood Prayer Beads Bracelet', 'Crafted from premium purple sandalwood', 23.29, 1, 1),
(6, 'Taiyi Saviour Tianzun Protection Talisman', 'A sacred talisman blessed with protection', 8.12, 0, 3);

-- 添加新商品的翻译信息
INSERT OR IGNORE INTO product_translations (product_id, language, name, description) VALUES
(5, 'en', 'Purple Sandalwood Prayer Beads Bracelet', 'Crafted from premium purple sandalwood, each bead is carefully polished to perfection. This 108-bead bracelet is traditionally used in Taoist meditation and prayer. The aromatic sandalwood helps calm the mind, enhance spiritual focus, and attract positive energy while providing protection from negative influences.'),
(5, 'zh', '小叶紫檀念珠手串', '选用上等小叶紫檀精制而成，珠粒饱满圆润，手工打磨至光滑如镜。此款108颗念珠手串为道家修行必备，檀香幽雅，有宁神静心、开启智慧之效。长期佩戴可聚集正气，抵御邪祟，增进福运。'),
(6, 'en', 'Taiyi Saviour Tianzun Protection Talisman', 'A sacred talisman blessed with the protection of Taiyi Saviour Tianzun, hand-drawn with cinnabar ink on yellow paper by accomplished Taoist masters. This powerful amulet is specifically designed to ward off disasters, heal ailments, and bring salvation in times of crisis. Perfect for carrying in wallet or placing under pillow.'),
(6, 'zh', '太乙救苦天尊护身符', '由高功道长亲手绘制，朱砂黄纸，加持太乙救苦天尊慈悲神力。此符专为救难解厄而制，能消灾免难、疗病救苦、逢凶化吉。随身携带或置于枕下，危难时刻必有神佑，是保命护身的珍贵法符。');

-- 验证插入结果
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_translations FROM product_translations;