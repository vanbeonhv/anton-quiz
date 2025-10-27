# Requirements Document

## Introduction

Cải thiện giao diện người dùng của scoreboard và Recent Scores bằng cách thay thế icon cột "Rank" bằng huy chương và thêm avatar người dùng bên cạnh tên, tương tự như topbar để tạo trải nghiệm nhất quán và hấp dẫn hơn.

## Glossary

- **Scoreboard_System**: Hệ thống bảng xếp hạng hiển thị thứ hạng người dùng
- **Recent_Scores**: Phần hiển thị điểm số gần đây trên dashboard
- **Medal_Icons**: Biểu tượng huy chương (🥇🥈🥉) thay thế cho số thứ hạng
- **User_Avatar**: Hình đại diện người dùng hiển thị bên cạnh tên
- **Topbar**: Thanh điều hướng trên cùng của ứng dụng

## Requirements

### Requirement 1: Medal Icons for Top Rankings

**User Story:** Là một người dùng, tôi muốn thấy huy chương thay vì số thứ hạng cho top 3 người dùng trong scoreboard, để tạo cảm giác thành tựu và hấp dẫn hơn.

#### Acceptance Criteria

1. WHEN tôi xem scoreboard THEN Scoreboard_System SHALL hiển thị huy chương vàng (🥇) cho người dùng xếp hạng 1
2. WHEN tôi xem scoreboard THEN Scoreboard_System SHALL hiển thị huy chương bạc (🥈) cho người dùng xếp hạng 2  
3. WHEN tôi xem scoreboard THEN Scoreboard_System SHALL hiển thị huy chương đồng (🥉) cho người dùng xếp hạng 3
4. WHEN tôi xem scoreboard THEN Scoreboard_System SHALL hiển thị số thứ hạng (#4, #5, etc.) cho người dùng từ hạng 4 trở xuống

### Requirement 2: Medal Icons for Recent Scores

**User Story:** Là một người dùng, tôi muốn thấy huy chương trong phần Recent Scores trên dashboard, để có trải nghiệm nhất quán với scoreboard chính.

#### Acceptance Criteria

1. WHEN tôi xem Recent Scores THEN Recent_Scores SHALL hiển thị Medal_Icons cho top 3 thứ hạng
2. WHEN một quiz attempt có thứ hạng 1 THEN Recent_Scores SHALL hiển thị huy chương vàng (🥇)
3. WHEN một quiz attempt có thứ hạng 2 THEN Recent_Scores SHALL hiển thị huy chương bạc (🥈)
4. WHEN một quiz attempt có thứ hạng 3 THEN Recent_Scores SHALL hiển thị huy chương đồng (🥉)

### Requirement 3: User Avatars in Scoreboard

**User Story:** Là một người dùng, tôi muốn thấy avatar của mình và người khác trong scoreboard, để dễ nhận diện và tạo cảm giác cá nhân hóa hơn.

#### Acceptance Criteria

1. WHEN tôi xem scoreboard THEN Scoreboard_System SHALL hiển thị User_Avatar bên cạnh tên người dùng
2. WHEN một người dùng có GitHub avatar THEN Scoreboard_System SHALL hiển thị GitHub avatar của họ
3. WHEN một người dùng không có avatar THEN Scoreboard_System SHALL hiển thị avatar mặc định với chữ cái đầu của email
4. WHEN tôi xem scoreboard THEN User_Avatar SHALL có kích thước nhất quán và bo tròn giống như Topbar

### Requirement 4: User Avatars in Recent Scores

**User Story:** Là một người dùng, tôi muốn thấy avatar trong phần Recent Scores, để có trải nghiệm nhất quán với scoreboard và topbar.

#### Acceptance Criteria

1. WHEN tôi xem Recent Scores THEN Recent_Scores SHALL hiển thị User_Avatar bên cạnh tên người dùng
2. WHEN tôi xem Recent Scores THEN User_Avatar SHALL có cùng style và kích thước như trong scoreboard
3. WHEN tôi xem Recent Scores THEN User_Avatar SHALL hiển thị đúng avatar của người dùng tương ứng với quiz attempt
4. WHEN Recent Scores hiển thị quiz attempt của tôi THEN Recent_Scores SHALL hiển thị avatar của tôi

### Requirement 5: Consistent Avatar Styling

**User Story:** Là một người dùng, tôi muốn avatar hiển thị nhất quán về style và kích thước trên tất cả các phần của ứng dụng, để tạo trải nghiệm thống nhất.

#### Acceptance Criteria

1. WHEN tôi xem bất kỳ phần nào có User_Avatar THEN Scoreboard_System SHALL sử dụng cùng component avatar
2. WHEN User_Avatar được hiển thị THEN Scoreboard_System SHALL áp dụng cùng kích thước (32px) như Topbar
3. WHEN User_Avatar được hiển thị THEN Scoreboard_System SHALL áp dụng cùng border-radius (rounded-full) như Topbar
4. WHEN User_Avatar load thất bại THEN Scoreboard_System SHALL hiển thị fallback avatar với chữ cái đầu