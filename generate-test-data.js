const testProducts = [
  {
    name: "iPhone 15 Pro",
    description: "最新款iPhone，搭载A17 Pro芯片，钛金属机身，专业级摄影系统",
    price: 7999.00,
    category: "数码电子",
    featured: true,
    lang: "zh"
  },
  {
    name: "MacBook Air M3",
    description: "轻薄便携的笔记本电脑，M3芯片强劲性能，全天候电池续航",
    price: 8999.00,
    category: "数码电子",
    featured: true,
    lang: "zh"
  },
  {
    name: "AirPods Pro 3",
    description: "主动降噪无线耳机，空间音频，自适应通透模式",
    price: 1899.00,
    category: "数码电子",
    featured: false,
    lang: "zh"
  },
  {
    name: "Nike Air Jordan 1",
    description: "经典篮球鞋，真皮材质，舒适透气，街头时尚必备",
    price: 1299.00,
    category: "服装鞋帽",
    featured: true,
    lang: "zh"
  },
  {
    name: "Adidas Stan Smith",
    description: "简约白色小白鞋，经典设计，百搭时尚，舒适日常穿着",
    price: 599.00,
    category: "服装鞋帽",
    featured: false,
    lang: "zh"
  },
  {
    name: "UNIQLO 优衣库T恤",
    description: "100%纯棉材质，柔软舒适，多色可选，基础百搭款",
    price: 79.00,
    category: "服装鞋帽",
    featured: false,
    lang: "zh"
  },
  {
    name: "戴森V15无绳吸尘器",
    description: "强劲吸力，激光探测，智能显示屏，深度清洁家居",
    price: 3999.00,
    category: "家居生活",
    featured: true,
    lang: "zh"
  },
  {
    name: "小米空气净化器Pro",
    description: "高效过滤PM2.5，智能APP控制，静音运行，守护家人健康",
    price: 1299.00,
    category: "家居生活",
    featured: false,
    lang: "zh"
  },
  {
    name: "宜家MALM床架",
    description: "简约北欧风格，实木材质，储物空间大，适合现代卧室",
    price: 899.00,
    category: "家居生活",
    featured: false,
    lang: "zh"
  },
  {
    name: "YSL圣罗兰口红",
    description: "经典正红色，丝绒质地，持久不脱色，彰显女性魅力",
    price: 320.00,
    category: "美妆护肤",
    featured: true,
    lang: "zh"
  },
  {
    name: "兰蔻小黑瓶精华",
    description: "抗衰老精华液，改善肌肤质地，提亮肤色，紧致肌肤",
    price: 1080.00,
    category: "美妆护肤",
    featured: false,
    lang: "zh"
  },
  {
    name: "雅诗兰黛小棕瓶",
    description: "修护精华，深层滋养，改善细纹，焕发年轻光彩",
    price: 1280.00,
    category: "美妆护肤",
    featured: false,
    lang: "zh"
  },
  {
    name: "《原神》周边手办",
    description: "精美PVC手办，细节还原，收藏价值高，动漫爱好者必备",
    price: 399.00,
    category: "文娱用品",
    featured: false,
    lang: "zh"
  },
  {
    name: "Switch游戏机",
    description: "任天堂便携式游戏机，丰富游戏库，随时随地畅玩",
    price: 2099.00,
    category: "文娱用品",
    featured: true,
    lang: "zh"
  },
  {
    name: "Kindle阅读器",
    description: "电子墨水屏，护眼阅读，超长续航，海量图书资源",
    price: 899.00,
    category: "文娱用品",
    featured: false,
    lang: "zh"
  },
  {
    name: "蓝山咖啡豆",
    description: "牙买加进口，浓郁香醇，精品级别，咖啡爱好者首选",
    price: 168.00,
    category: "食品饮料",
    featured: true,
    lang: "zh"
  },
  {
    name: "日本和牛A5级",
    description: "顶级雪花牛肉，肉质鲜嫩，入口即化，高端美食体验",
    price: 1888.00,
    category: "食品饮料",
    featured: true,
    lang: "zh"
  },
  {
    name: "茅台酒",
    description: "中国名酒，53度浓香型，收藏级白酒，商务宴请佳品",
    price: 2999.00,
    category: "食品饮料",
    featured: false,
    lang: "zh"
  },
  {
    name: "Tesla Model 3车载充电器",
    description: "专用快充设备，安全可靠，智能温控，便携设计",
    price: 1299.00,
    category: "汽车用品",
    featured: false,
    lang: "zh"
  },
  {
    name: "米其林轮胎",
    description: "高性能轮胎，抓地力强，静音舒适，安全耐用",
    price: 899.00,
    category: "汽车用品",
    featured: false,
    lang: "zh"
  }
];

// 生成SQL插入语句
function generateProductInserts() {
  let productInserts = [];
  let translationInserts = [];
  
  testProducts.forEach((product, index) => {
    const productId = index + 1;
    
    // 产品基础信息
    productInserts.push(
      `INSERT INTO products (id, price, featured, category) VALUES (${productId}, ${product.price}, ${product.featured ? 1 : 0}, '${product.category}');`
    );
    
    // 产品翻译信息
    translationInserts.push(
      `INSERT INTO product_translations (product_id, language, name, description) VALUES (${productId}, '${product.lang}', '${product.name.replace(/'/g, "''")}', '${product.description.replace(/'/g, "''")}');`
    );
  });
  
  return [...productInserts, ...translationInserts];
}

// 生成测试用户
function generateTestUsers() {
  return [
    "INSERT INTO users (id, email, password) VALUES (1, 'test@example.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f');", // password: secret123
    "INSERT INTO users (id, email, password) VALUES (2, 'admin@example.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f');", // password: secret123
    "INSERT INTO users (id, email, password) VALUES (3, 'customer@example.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f');" // password: secret123
  ];
}

// 生成完整的SQL文件内容
function generateSeedSQL() {
  const users = generateTestUsers();
  const products = generateProductInserts();
  
  const sql = [
    "-- 测试数据种子文件",
    "-- 密码统一为: secret123",
    "",
    "-- 插入测试用户",
    ...users,
    "",
    "-- 插入测试商品",
    ...products,
    ""
  ].join('\n');
  
  return sql;
}

// 输出SQL内容
console.log(generateSeedSQL());