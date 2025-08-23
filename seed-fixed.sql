-- Clear existing data in the correct order to avoid foreign key constraints
PRAGMA foreign_keys = OFF;

DELETE FROM product_translations;
DELETE FROM category_translations;
DELETE FROM products;
DELETE FROM categories;

PRAGMA foreign_keys = ON;

-- Insert Categories
INSERT INTO categories (id) VALUES
(1),
(2),
(3);

-- Insert Category Translations
INSERT INTO category_translations (category_id, language, name) VALUES
(1, 'en', 'Amulets & Talismans'),
(1, 'zh', '符咒与护身符'),
(2, 'en', 'Ritual Implements'),
(2, 'zh', '科仪法器'),
(3, 'en', 'Protection & Warding'),
(3, 'zh', '镇宅与辟邪');

-- Insert Products (with single price field in USD, matching current table structure)
INSERT INTO products (id, name, description, price, featured, category_id) VALUES
(1, 'Lightning-Struck Jujube Wood Peace Amulet', 'A powerful amulet crafted from jujube wood', 12.25, 1, 1),
(2, 'Hand-Carved Peach Wood Sword', 'A traditional Taoist ritual sword', 17.65, 1, 2),
(3, 'Natural Calabash Gourd for Blessings', 'A natural, sun-dried calabash gourd', 11.03, 0, 3),
(4, 'Taoist Five Thunders Ritual Seal', 'Carved from fine boxwood ritual seal', 35.66, 0, 2),
(5, 'Purple Sandalwood Prayer Beads Bracelet', 'Crafted from premium purple sandalwood', 23.29, 1, 1),
(6, 'Taiyi Saviour Tianzun Protection Talisman', 'A sacred talisman blessed with protection', 8.12, 0, 3);

-- Insert Product Translations (using product_id as the foreign key column name)
INSERT INTO product_translations (product_id, language, name, description) VALUES
(1, 'en', 'Lightning-Struck Jujube Wood Peace Amulet', 'A powerful amulet crafted from jujube wood that has been naturally struck by lightning. It is believed to absorb the pure Yang energy of the heavens, offering immense protection against negative forces and bringing peace and good fortune to its bearer.'),
(1, 'zh', '雷击枣木平安扣', '采自天然雷击枣木，经九天雷火淬炼，蕴含至刚至阳之气。此平安扣能镇压邪祟、驱散阴霾，常年佩戴可护佑周全，招来福运，是不可多得的护身法宝。'),
(2, 'en', 'Hand-Carved Peach Wood Sword', 'A traditional Taoist ritual sword, hand-carved from a single block of aged peach wood. Peach wood is renowned for its ability to ward off evil. This sword is ideal for home protection, dispelling negative energy, and as a tool in spiritual practices.'),
(2, 'zh', '手工雕刻桃木剑', '取整块百年桃木，由资深道家匠人手工雕刻而成。桃木自古为辟邪之木，此剑悬挂于室，可斩断邪祟，净化磁场，亦可用于科仪法事，是镇宅护身的上佳之选。'),
(3, 'en', 'Natural Calabash Gourd for Blessings', 'A natural, sun-dried calabash gourd, a classic symbol in Taoism for absorbing negative qi and storing blessings. Placing it in your home or office is said to improve Feng Shui, promote health, and attract prosperity.'),
(3, 'zh', '天然开口福禄葫芦', '天然生长，自然晾晒而成。葫芦谐音"福禄"，在道家文化中是吸纳秽气、汇聚福泽的宝物。置于家中或办公室，可调整风水，化煞生旺，庇佑家人安康，事业顺遂。'),
(4, 'en', 'Taoist Five Thunders Ritual Seal', 'Carved from fine boxwood, this is a replica of a traditional Five Thunders Seal (五雷号令印). It is an essential implement for advanced practitioners to command spiritual forces, consecrate talismans, and perform high-level rituals for protection and authority.'),
(4, 'zh', '道家五雷号令法印', '精选黄杨木雕刻，复刻传统"五雷号令"印。此印为道家高功法师行法所用，能号令雷部神将，敕召符咒，具有极高的权威与辟邪能力。适合专业修行者或收藏家供奉。'),
(5, 'en', 'Purple Sandalwood Prayer Beads Bracelet', 'Crafted from premium purple sandalwood, each bead is carefully polished to perfection. This 108-bead bracelet is traditionally used in Taoist meditation and prayer. The aromatic sandalwood helps calm the mind, enhance spiritual focus, and attract positive energy while providing protection from negative influences.'),
(5, 'zh', '小叶紫檀念珠手串', '选用上等小叶紫檀精制而成，珠粒饱满圆润，手工打磨至光滑如镜。此款108颗念珠手串为道家修行必备，檀香幽雅，有宁神静心、开启智慧之效。长期佩戴可聚集正气，抵御邪祟，增进福运。'),
(6, 'en', 'Taiyi Saviour Tianzun Protection Talisman', 'A sacred talisman blessed with the protection of Taiyi Saviour Tianzun, hand-drawn with cinnabar ink on yellow paper by accomplished Taoist masters. This powerful amulet is specifically designed to ward off disasters, heal ailments, and bring salvation in times of crisis. Perfect for carrying in wallet or placing under pillow.'),
(6, 'zh', '太乙救苦天尊护身符', '由高功道长亲手绘制，朱砂黄纸，加持太乙救苦天尊慈悲神力。此符专为救难解厄而制，能消灾免难、疗病救苦、逢凶化吉。随身携带或置于枕下，危难时刻必有神佑，是保命护身的珍贵法符。');