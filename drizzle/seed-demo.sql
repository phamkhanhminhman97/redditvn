-- Demo published content for local UI development. Apply: pnpm db:seed:demo:local
INSERT OR IGNORE INTO posts
  (id, reddit_id, subreddit, category, source_url, reddit_author, reddit_score, reddit_num_comments,
   reddit_created_at, post_type, nsfw, title_en, title_vi, body_en, body_vi, status, slug, view_count,
   translation_model, translated_at, published_at, created_at, updated_at)
VALUES
  ('demo-post-0001', 'demo001', 'AskReddit', 'hoi-dap',
   'https://www.reddit.com/r/AskReddit/comments/demo001/',
   'curious_mind', 45200, 1300, unixepoch()*1000, 'text', 0,
   'What is a small habit that completely changed your life?',
   'Thói quen nhỏ nào đã thay đổi hoàn toàn cuộc đời bạn?',
   'For me it was waking up 30 minutes earlier...',
   'Với mình, đó là việc dậy sớm hơn 30 phút mỗi ngày.' || char(10) || char(10) || 'Ban đầu nghe có vẻ chẳng đáng gì, nhưng 30 phút yên tĩnh đó — không điện thoại, không email — đã thay đổi cả cách mình bắt đầu một ngày. Mình pha một tách cà phê, ngồi nhìn ra cửa sổ, và lên kế hoạch cho ngày hôm đó.' || char(10) || char(10) || 'Sau ba tháng, mình nhận ra mình bình tĩnh hơn hẳn, ít vội vàng hơn, và làm được nhiều việc hơn. Đôi khi thứ thay đổi cuộc đời không phải là một cú nhảy vọt, mà là một thói quen nhỏ lặp lại mỗi ngày.',
   'published', 'thoi-quen-nho-nao-da-thay-doi-hoan-toan-cuoc-doi-ban-demo001', 342,
   'claude-sonnet-5', unixepoch()*1000, unixepoch()*1000, unixepoch()*1000, unixepoch()*1000),

  ('demo-post-0002', 'demo002', 'tifu', 'tifu',
   'https://www.reddit.com/r/tifu/comments/demo002/',
   'sleepy_dev', 28900, 540, unixepoch()*1000, 'text', 0,
   'TIFU by replying-all to the entire company',
   'Hôm nay tôi ngu ngốc vì bấm "trả lời tất cả" cho cả công ty',
   'So this happened this morning...',
   'Chuyện xảy ra sáng nay.' || char(10) || char(10) || 'Sếp gửi một email thông báo cho toàn bộ 400 nhân viên. Mình định nhắn riêng cho đồng nghiệp ngồi cạnh: "Ông này lại nói dài dòng nữa rồi 😩". Nhưng thay vì bấm Reply, mình bấm Reply All.' || char(10) || char(10) || 'Ba giây sau, điện thoại mình rung liên tục. Cả công ty đã nhận được. Có người thả tim, có người gửi meme, và sếp thì... chỉ trả lời đúng một câu: "Cảm ơn góp ý, tôi sẽ nói ngắn hơn." Chưa bao giờ mình muốn độn thổ đến thế.',
   'published', 'hom-nay-toi-ngu-ngoc-vi-bam-tra-loi-tat-ca-demo002', 501,
   'claude-sonnet-5', unixepoch()*1000, unixepoch()*1000, unixepoch()*1000, unixepoch()*1000);

INSERT OR IGNORE INTO reddit_comments
  (id, post_id, reddit_comment_id, parent_reddit_id, reddit_author, reddit_score, body_en, body_vi, depth, rank, created_at)
VALUES
  (lower(hex(randomblob(16))), 'demo-post-0001', 'dc1', 't3_demo001', 'earlybird_92', 8900,
   'Waking up early and doing light exercise.',
   'Dậy sớm và tập vài động tác nhẹ. Nghe thì sáo rỗng, nhưng thực sự hiệu quả một cách khó tin.', 0, 0, unixepoch()*1000),
  (lower(hex(randomblob(16))), 'demo-post-0001', 'dc2', 't3_demo001', 'quiet_reader', 5400,
   'Reading 10 pages every night.',
   'Đọc 10 trang sách mỗi tối trước khi ngủ. Một năm là được 12–15 cuốn mà chẳng thấy áp lực gì.', 0, 1, unixepoch()*1000),
  (lower(hex(randomblob(16))), 'demo-post-0002', 'dc3', 't3_demo002', 'been_there', 6100,
   'We have all been there my friend.',
   'Ai trong chúng ta cũng từng có một khoảnh khắc như vậy thôi, đừng lo 😂', 0, 0, unixepoch()*1000);
