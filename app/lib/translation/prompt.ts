// System prompt sets RedditVN's translator persona: natural, localized Vietnamese
// that keeps the tone/humor of the original rather than a literal machine rendering.
export const TRANSLATION_SYSTEM_PROMPT = `Bạn là biên dịch viên kỳ cựu của RedditVN — chuyên dịch bài đăng và bình luận Reddit sang tiếng Việt cho độc giả Việt Nam.

Nguyên tắc:
- Dịch THOÁT Ý, tự nhiên như người Việt viết; KHÔNG dịch máy word-by-word.
- Giữ đúng giọng điệu, cảm xúc, cái hài và cái "twist" của bản gốc.
- Bản địa hóa thành ngữ/cách nói cho hợp người Việt, nhưng KHÔNG bịa thêm hay bỏ bớt nội dung.
- Giữ nguyên tên riêng, tên người dùng (u/...), tên subreddit (r/...), và thuật ngữ không có từ tương đương.
- Giữ format markdown, xuống dòng và danh sách như bản gốc.
- Chọn ngôi xưng hô phù hợp ngữ cảnh câu chuyện (tôi/mình/anh/cô/họ...).
- KHÔNG thêm lời bình, tiêu đề hay ghi chú của riêng bạn; KHÔNG tự kiểm duyệt nội dung.
- Nếu một trường bản gốc rỗng, trả về chuỗi rỗng cho trường đó.

Chỉ trả kết quả đúng theo định dạng JSON được yêu cầu, không kèm giải thích.`;

export interface PostToTranslate {
	subreddit: string;
	titleEn: string;
	bodyEn: string;
}

export function buildPostUserContent(input: PostToTranslate): string {
	return [
		`Subreddit nguồn: r/${input.subreddit}`,
		"",
		"### Tiêu đề (English)",
		input.titleEn,
		"",
		"### Nội dung (English)",
		input.bodyEn.trim() || "(bài không có nội dung văn bản)",
		"",
		'Dịch sang tiếng Việt: "title_vi" cho tiêu đề, "body_vi" cho nội dung.',
	].join("\n");
}

export interface CommentToTranslate {
	id: string;
	author?: string;
	bodyEn: string;
}

export function buildCommentsUserContent(
	comments: readonly CommentToTranslate[],
): string {
	const blocks = comments
		.map((c, i) => {
			const meta = c.author ? `id: ${c.id}, tác giả: ${c.author}` : `id: ${c.id}`;
			return `--- Bình luận #${i + 1} (${meta}) ---\n${c.bodyEn}`;
		})
		.join("\n\n");
	return [
		'Dịch từng bình luận Reddit sau sang tiếng Việt. Trả về mảng "comments", mỗi phần tử gồm "id" (GIỮ NGUYÊN) và "body_vi".',
		"",
		blocks,
	].join("\n");
}
