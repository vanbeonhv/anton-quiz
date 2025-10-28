/**
 * Sắp xếp lẫn lộn (Shuffle) các phần tử trong một mảng sử dụng thuật toán Fisher-Yates.
 * Đảm bảo tính ngẫu nhiên đều (uniform randomness) và hiệu suất O(n).
 * * @param {Array} array Mảng cần được xáo trộn.
 * @returns {Array} Mảng đã được xáo trộn.
 */

const questionArray = require("./questionArray")

function simpleShuffle(array) {
    let currentIndex = array.length, randomIndex;

    // Lặp cho đến khi không còn phần tử để xáo trộn.
    while (currentIndex !== 0) {

        // Chọn ngẫu nhiên một phần tử còn lại.
        // Math.random() trả về [0, 1), nhân với currentIndex để có [0, currentIndex).
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // Hoán đổi (swap) phần tử hiện tại với phần tử ngẫu nhiên được chọn.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }

    return array;
}


// Thực hiện xáo trộn
const shuffledArray = simpleShuffle(questionArray);

// Export kết quả ra JSON file
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'shuffled-questions.json');
fs.writeFileSync(outputPath, JSON.stringify(shuffledArray, null, 2), 'utf8');

console.log(`Đã xuất ${shuffledArray.length} câu hỏi đã xáo trộn ra file: ${outputPath}`);