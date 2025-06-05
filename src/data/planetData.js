// src/data/planetsData.js

const planets = [
  {
    id: 'mercury',
    name: 'Sao Thủy',
    image: '/solar-system-threejs/assets/mercury-map.jpg',
    description: 'Sao Thủy là hành tinh nhỏ nhất và gần Mặt Trời nhất trong Hệ Mặt Trời. Nó không có vệ tinh tự nhiên và có bề mặt đầy miệng núi lửa.',
    size: '4,879 km',
    moons: 0,
    distanceFromSun: '0.39 AU',
    orbitalPeriod: '88 ngày Trái Đất'
  },
  {
    id: 'venus',
    name: 'Sao Kim',
    image: '/solar-system-threejs/assets/venus-map.jpg',
    description: 'Sao Kim là hành tinh thứ hai tính từ Mặt Trời, thường được gọi là "ngôi sao Mai" hoặc "ngôi sao Hôm". Nó có bầu khí quyển dày đặc và rất nóng.',
    size: '12,104 km',
    moons: 0,
    distanceFromSun: '0.72 AU',
    orbitalPeriod: '225 ngày Trái Đất'
  },
  {
    id: 'earth',
    name: 'Trái Đất',
    image: '/solar-system-threejs/assets/earth-map-1.jpg',
    description: 'Trái Đất là hành tinh thứ ba tính từ Mặt Trời và là nơi duy nhất có sự sống được biết đến. Khoảng 71% bề mặt được bao phủ bởi nước.',
    size: '12,742 km',
    moons: 1,
    distanceFromSun: '1 AU',
    orbitalPeriod: '365.25 ngày Trái Đất'
  },
  {
    id: 'mars',
    name: 'Sao Hỏa',
    image: '/solar-system-threejs/assets/mars-map.jpg',
    description: 'Sao Hỏa là hành tinh thứ tư tính từ Mặt Trời và thường được gọi là "Hành tinh Đỏ" do bề mặt giàu oxit sắt. Nó có hai vệ tinh nhỏ.',
    size: '6,779 km',
    moons: 2,
    distanceFromSun: '1.52 AU',
    orbitalPeriod: '687 ngày Trái Đất'
  },
  {
    id: 'jupiter',
    name: 'Sao Mộc',
    image: '/solar-system-threejs/assets/jupiter-map.jpg',
    description: 'Sao Mộc là hành tinh lớn nhất trong Hệ Mặt Trời, một hành tinh khí khổng lồ. Nó nổi tiếng với Vết Đỏ Lớn, một cơn bão khổng lồ.',
    size: '139,820 km',
    moons: 95,
    distanceFromSun: '5.2 AU',
    orbitalPeriod: '11.86 năm Trái Đất'
  },
  {
    id: 'saturn',
    name: 'Sao Thổ',
    image: '/solar-system-threejs/assets/saturn-map.jpg',
    description: 'Sao Thổ là hành tinh thứ sáu từ Mặt Trời, nổi tiếng nhất với hệ thống vành đai tuyệt đẹp và phức tạp, chủ yếu được tạo thành từ băng và đá.',
    size: '116,460 km',
    moons: 146, 
    distanceFromSun: '9.58 AU',
    orbitalPeriod: '29.45 năm Trái Đất'
  },
  {
    id: 'uranus',
    name: 'Sao Thiên Vương',
    image: '/solar-system-threejs/assets/uranus-map.jpg',
    description: 'Sao Thiên Vương là một hành tinh khổng lồ băng giá, có một trục quay nghiêng đáng kể, gần như song song với mặt phẳng quỹ đạo của nó.',
    size: '50,724 km',
    moons: 27,
    distanceFromSun: '19.22 AU',
    orbitalPeriod: '84 năm Trái Đất'
  },
  {
    id: 'neptune',
    name: 'Sao Hải Vương',
    image: '/solar-system-threejs/assets/neptune-map.jpg',
    description: 'Sao Hải Vương là hành tinh thứ tám và xa nhất được biết đến từ Mặt Trời trong Hệ Mặt Trời. Nó là một hành tinh khí khổng lồ màu xanh.',
    size: '49,244 km',
    moons: 14,
    distanceFromSun: '30.05 AU',
    orbitalPeriod: '164.79 năm Trái Đất'
  },

];

const clickSound = new Audio('/solar-system-threejs/assets/click.mp3');

export default planets;