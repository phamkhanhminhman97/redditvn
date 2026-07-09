-- Initial quality subreddits for the content pipeline.
-- Apply locally:  pnpm db:seed:local   (idempotent via INSERT OR IGNORE on unique name)
INSERT OR IGNORE INTO subreddits
  (id, name, display_name, category, description, enabled, min_upvotes, allow_nsfw, fetch_limit, sort, time_filter, created_at)
VALUES
  (lower(hex(randomblob(16))), 'AskReddit',          'Hỏi đáp',            'hoi-dap',       'Những câu hỏi thú vị và câu trả lời hay từ cộng đồng Reddit', 1, 5000, 0, 8, 'top', 'week', unixepoch()*1000),
  (lower(hex(randomblob(16))), 'tifu',               'Hôm nay tôi ngu ngốc', 'tifu',        'Những pha tự làm khó mình dở khóc dở cười',                   1, 3000, 0, 5, 'top', 'week', unixepoch()*1000),
  (lower(hex(randomblob(16))), 'relationship_advice','Chuyện tình cảm',    'tinh-cam',      'Tâm sự và lời khuyên về các mối quan hệ',                     1, 2000, 0, 5, 'top', 'week', unixepoch()*1000),
  (lower(hex(randomblob(16))), 'todayilearned',      'Hôm nay tôi biết',   'kien-thuc',     'Những sự thật thú vị ít người biết',                         1, 8000, 0, 6, 'top', 'week', unixepoch()*1000),
  (lower(hex(randomblob(16))), 'Showerthoughts',     'Suy nghĩ vẩn vơ',    'suy-ngam',      'Những suy nghĩ bất chợt khiến bạn phải gật gù',               1, 8000, 0, 6, 'top', 'week', unixepoch()*1000),
  (lower(hex(randomblob(16))), 'LifeProTips',        'Mẹo hay cuộc sống',  'meo-hay',       'Những mẹo nhỏ giúp cuộc sống dễ dàng hơn',                   1, 5000, 0, 5, 'top', 'week', unixepoch()*1000),
  (lower(hex(randomblob(16))), 'nosleep',            'Truyện kinh dị',     'kinh-di',       'Truyện kinh dị tự sáng tác đáng sợ',                         1, 2000, 0, 4, 'top', 'month', unixepoch()*1000);
