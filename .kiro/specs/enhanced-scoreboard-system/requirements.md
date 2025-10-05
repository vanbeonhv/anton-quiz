# Requirements Document

## Introduction

Chúng ta cần cải tiến hệ thống scoreboard và topic để tạo trải nghiệm giống LeetCode. Thay vì topic hiện tại hoạt động như quiz container, topic sẽ trở thành tags cho từng câu hỏi riêng lẻ. Scoreboard sẽ có hai metrics chính: điểm daily quiz và tổng số câu hỏi đã trả lời đúng.

## Requirements

### Requirement 1: Topic System Redesign

**User Story:** Là một người dùng, tôi muốn các câu hỏi có thể được gắn nhiều tag/topic khác nhau, để tôi có thể luyện tập theo chủ đề cụ thể giống như LeetCode.

#### Acceptance Criteria

1. WHEN tôi xem một câu hỏi THEN hệ thống SHALL hiển thị các tag/topic liên quan đến câu hỏi đó
2. WHEN tôi tạo câu hỏi mới THEN hệ thống SHALL cho phép tôi gắn nhiều tag cho câu hỏi
3. WHEN tôi lọc câu hỏi theo tag THEN hệ thống SHALL hiển thị tất cả câu hỏi có tag đó
4. IF một câu hỏi có nhiều tag THEN hệ thống SHALL hiển thị tất cả tag của câu hỏi đó

### Requirement 2: Independent Question System

**User Story:** Là một người dùng, tôi muốn có thể trả lời từng câu hỏi độc lập thay vì phải làm cả quiz, để tôi có thể luyện tập linh hoạt hơn.

#### Acceptance Criteria

1. WHEN tôi truy cập trang câu hỏi THEN hệ thống SHALL hiển thị danh sách tất cả câu hỏi có thể làm độc lập
2. WHEN tôi chọn một câu hỏi THEN hệ thống SHALL cho phép tôi trả lời ngay lập tức
3. WHEN tôi trả lời một câu hỏi THEN hệ thống SHALL lưu kết quả và cập nhật thống kê
4. WHEN tôi hoàn thành một câu hỏi THEN hệ thống SHALL hiển thị kết quả và cho phép chuyển sang câu hỏi khác

### Requirement 3: Enhanced Scoreboard System

**User Story:** Là một người dùng, tôi muốn xem scoreboard với hai metrics riêng biệt: điểm daily quiz và tổng số câu hỏi đã trả lời đúng, để tôi có thể theo dõi tiến độ học tập của mình.

#### Acceptance Criteria

1. WHEN tôi truy cập scoreboard THEN hệ thống SHALL hiển thị hai bảng xếp hạng riêng biệt
2. WHEN tôi xem bảng xếp hạng daily quiz THEN hệ thống SHALL hiển thị điểm tích lũy từ daily quiz của tất cả người dùng
3. WHEN tôi xem bảng xếp hạng câu hỏi THEN hệ thống SHALL hiển thị tổng số câu hỏi đã trả lời đúng của tất cả người dùng
4. WHEN tôi trả lời daily quiz THEN hệ thống SHALL cộng điểm vào cả hai bảng xếp hạng
5. WHEN tôi trả lời câu hỏi độc lập THEN hệ thống SHALL chỉ cộng vào bảng xếp hạng câu hỏi

### Requirement 4: Daily Quiz Points System

**User Story:** Là một người dùng, tôi muốn chỉ daily quiz mới cho điểm để tạo động lực làm daily quiz hàng ngày, trong khi vẫn có thể luyện tập tự do với các câu hỏi độc lập.

#### Acceptance Criteria

1. WHEN tôi hoàn thành daily quiz THEN hệ thống SHALL tính điểm dựa trên số câu trả lời đúng
2. WHEN tôi trả lời câu hỏi độc lập THEN hệ thống SHALL KHÔNG tính điểm daily
3. WHEN tôi xem profile THEN hệ thống SHALL hiển thị tổng điểm daily và tổng câu hỏi đã trả lời đúng
4. IF tôi trả lời daily quiz THEN hệ thống SHALL cộng cả điểm daily và số câu hỏi đã trả lời đúng

### Requirement 5: Question Filtering and Navigation

**User Story:** Là một người dùng, tôi muốn có thể lọc và tìm kiếm câu hỏi theo tag để luyện tập theo chủ đề cụ thể.

#### Acceptance Criteria

1. WHEN tôi truy cập trang câu hỏi THEN hệ thống SHALL hiển thị danh sách tất cả tag có sẵn
2. WHEN tôi chọn một tag THEN hệ thống SHALL lọc và hiển thị chỉ các câu hỏi có tag đó
3. WHEN tôi tìm kiếm câu hỏi THEN hệ thống SHALL cho phép tìm kiếm theo nội dung câu hỏi hoặc tag
4. WHEN tôi xem một câu hỏi THEN hệ thống SHALL hiển thị trạng thái đã trả lời hay chưa

### Requirement 6: User Progress Tracking

**User Story:** Là một người dùng, tôi muốn theo dõi tiến độ học tập của mình qua các metrics khác nhau để đánh giá sự tiến bộ.

#### Acceptance Criteria

1. WHEN tôi truy cập profile THEN hệ thống SHALL hiển thị tổng số câu hỏi đã trả lời đúng
2. WHEN tôi truy cập profile THEN hệ thống SHALL hiển thị tổng điểm daily quiz
3. WHEN tôi truy cập profile THEN hệ thống SHALL hiển thị số ngày liên tiếp làm daily quiz
4. WHEN tôi truy cập profile THEN hệ thống SHALL hiển thị thống kê theo từng tag/topic
5. WHEN tôi xem thống kê tag THEN hệ thống SHALL hiển thị số câu hỏi đã trả lời đúng/tổng số câu hỏi cho mỗi tag