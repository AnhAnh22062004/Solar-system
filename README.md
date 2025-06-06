# Solar System (Three.js)

<p align="center">
   <img src="./public/preview.png" alt="preview.png" />
</p>

Dự án Solar System là một mô phỏng đơn giản của tám hành tinh (Pluto không còn được coi là hành tinh) quay quanh Mặt Trời. Dự án này được lấy cảm hứng từ một khách hàng mà tôi đã làm việc cùng. Đây là một ví dụ về việc sử dụng [Three.js](https://threejs.org/) để tạo ra các hoạt động đồ họa thú vị. Thêm thông tin về cách xây dựng dự án này có thể được tìm thấy trong [bài viết này](https://dev.to/cookiemonsterdev/solar-system-with-threejs-3fe0).

## Tài nguyên

Hầu hết tất cả các texture đều được lấy từ trang [Planetary Pixel Emporium](https://planetpixelemporium.com/index.php), ngoại trừ texture của vành đai hành tinh và các ngôi sao. Bạn có thể thay thế chúng bằng các texture khác mà bạn thấy phù hợp hơn.

## Hướng dẫn nhanh

### 1. Cài đặt các phụ thuộc

Chạy lệnh sau để cài đặt các phụ thuộc cần thiết cho dự án:

```sh
npm install
```

### 2. Chạy ứng dụng

Sau khi cài đặt xong, bạn có thể chạy ứng dụng bằng lệnh:

```sh
npm run dev
```

### 3. Các tính năng nổi bật

- **Mô phỏng Hệ Mặt Trời**: Hiển thị tám hành tinh quay quanh Mặt Trời với các quỹ đạo và tốc độ khác nhau.
- **Thông tin hành tinh**: Khi nhấp vào hành tinh, thông tin chi tiết về hành tinh đó sẽ được hiển thị, bao gồm tên, hình ảnh, mô tả, kích thước, số vệ tinh, khoảng cách từ Mặt Trời và chu kỳ quỹ đạo.
- **So sánh hành tinh**: Cho phép người dùng so sánh hai hành tinh với nhau.
- **Xem gần**: Tính năng cho phép người dùng phóng to vào hành tinh để xem chi tiết hơn.
- **Hiệu ứng va chạm**: Hiệu ứng hạt và âm thanh khi các hành tinh lại gần nhau, tạo cảm giác tương tác sinh động.

## Cách sử dụng

1. Mở trình duyệt và truy cập vào địa chỉ mà ứng dụng đang chạy (thường là `http://localhost:3000`).
2. Sử dụng chuột để tương tác với các hành tinh, nhấp vào chúng để xem thông tin chi tiết.
3. Sử dụng các nút để so sánh hành tinh hoặc xem gần hơn.

## Ghi chú

Nếu bạn gặp bất kỳ vấn đề nào trong quá trình cài đặt hoặc chạy ứng dụng, hãy kiểm tra lại các bước cài đặt hoặc tham khảo tài liệu của [Three.js](https://threejs.org/docs/index.html#manual/en/introduction/Introduction) để biết thêm thông tin.

<div id="audio-controls" style="position: fixed; top: 10px; right: 10px; background: rgba(0, 0, 0, 0.7); padding: 10px; border-radius: 5px; z-index: 1000;">
    <button id="mute-btn">Tắt âm thanh</button>
    <input type="range" id="volume-slider" min="0" max="1" step="0.1" value="1" style="margin-left: 10px;">
</div>

<script>
// Khởi tạo âm thanh
const clickSound = new Audio('/solar-system-threejs/assets/click.mp3');
clickSound.volume = 1; // Đặt âm lượng mặc định

// Lấy các phần tử điều khiển âm thanh
const muteButton = document.getElementById('mute-btn');
const volumeSlider = document.getElementById('volume-slider');

// Xử lý sự kiện khi nhấn nút tắt/mở âm thanh
muteButton.addEventListener('click', () => {
    if (clickSound.volume > 0) {
        clickSound.volume = 0; // Tắt âm thanh
        muteButton.textContent = 'Bật âm thanh'; // Thay đổi văn bản nút
    } else {
        clickSound.volume = volumeSlider.value; // Bật âm thanh
        muteButton.textContent = 'Tắt âm thanh'; // Thay đổi văn bản nút
    }
});

// Xử lý sự kiện khi điều chỉnh thanh trượt âm lượng
volumeSlider.addEventListener('input', (event) => {
    clickSound.volume = event.target.value; // Cập nhật âm lượng
    if (clickSound.volume > 0) {
        muteButton.textContent = 'Tắt âm thanh'; // Cập nhật văn bản nút
    } else {
        muteButton.textContent = 'Bật âm thanh'; // Cập nhật văn bản nút
    }
});

// Hàm xử lý nhấp chuột vào hành tinh
function onPointerDown(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(planetMeshes, true);

    if (intersects.length > 0) {
        clickSound.currentTime = 0; // Đặt lại thời gian phát
        clickSound.play(); // Phát âm thanh
        // ... existing code to show planet info ...
    }
}
</script>

