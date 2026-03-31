// 配置文件
module.exports = {
    // API 配置
    api: {
        localWeather: 'https://open.onebox.so.com/Dataapi?&query=%E5%A4%A9%E6%B0%94&type=weather&ip=&src=soindex&d=pc&url=weather',
        cityWeather: 'https://open.onebox.so.com/Dataapi?callback=&query=%E5%8C%97%E4%BA%AC%E5%B8%82%E5%8C%97%E4%BA%AC%E6%B5%B7%E6%B7%80%E5%A4%A9%E6%B0%94&type=weather&ip=&src=soindex&d=pc&url=http%253A%252F%252Fcdn.weather.hao.360.cn%252Fsed_api_weather_info.php%253Fapp%253DguideEngine%2526fmt%253Djson%2526code%253D',
        qweatherCity: 'https://geoapi.qweather.com/v2/city/lookup?key=8cbf558f85dd40ff86f528b2370236b8&location='
    },

    // 生活指数配置
    lifeIndexNames: {
        diaoyu: "钓鱼",
        xiche: "行车",
        yundong: "运动",
        daisan: "带伞",
        ganmao: "感冒",
        ziwaixian: "紫外线",
        guomin: "过敏",
        chuanyi: "穿衣"
    },

    // 默认城市
    defaultCity: 'local_adCode'
};