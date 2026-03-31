const config = require('./config');

// 获取本地城市天气数据的 api
const LocalWeatherApi = config.api.localWeather;
// 通过城市 adCode 作为参数获取城市天气数据的 api
const CityWeatherApi = config.api.cityWeather;
// 将从腾讯地图城市选择器获取的6位数的 adCode 转换获取10位数的 adCode
const qweatherCityApi = config.api.qweatherCity;
const lifeIndexNames = config.lifeIndexNames;

/**
 * 加载获取天气数据
 *
 * @param cityAdCode 城市代码
 * @param callback 回调函数
 */
function getWeatherData(cityAdCode, callback) {
    const WeatherApi = (cityAdCode && cityAdCode !== config.defaultCity)
        ? CityWeatherApi + cityAdCode
        : LocalWeatherApi;

    wx.request({
        url: WeatherApi,
        success: res => {
            if (!res.data || res.statusCode !== 200) {
                return;
            }
            const weatherData = parseWeatherData(res.data);
            // 回调函数实现同步调用
            typeof callback === "function" && callback(cityAdCode, weatherData);
        },
        fail: error => {
            console.error('获取天气数据失败:', error);
        }
    });
}

/**
 * 获取生活指数信息
 * @param data 天气数据
 */
function getLifeIndexInfo(data) {
    let lifeIndexInfo = [];
    for (let lifeIndexKey in data.life.info) {
        let name = lifeIndexNames[lifeIndexKey];
        if (name !== undefined) {
            lifeIndexInfo.push({
                key: lifeIndexKey,
                name: name,
                icon: 'https://p0.ssl.qhimg.com/d/f239f0e2/' + lifeIndexKey + '.png'
            });
        }
    }
    /*
        获取生活指数conf.key，name，icon
        key: 来获取life.info里生活指数信息
     */
    data.life['lifeIndexInfo'] = lifeIndexInfo;
}

/**
 *从api中获取数据并解析为展示的数据
 *
 * @param data 从api中获取数据
 * @returns {*} 解析的展示的数据
 */
function parseWeatherData(data) {
    data.realtime.weather.icon = getWeatherIcon(data.realtime.weather.img);
    for (let i = 0; i < data.weather.length; i++) {
        data.weather[i].shortDate = getShortDate(data.weather[i].date);
        data.weather[i].day_icon = getWeatherIcon(data.weather[i].info.day[0]);
        data.weather[i].night_icon = getWeatherIcon(data.weather[i].info.night[0]);
    }
    getLifeIndexInfo(data);
    return data;
}

/**
 * 获取照片地址
 *
 * @param pictureNo 照片的代码
 * @returns {string} 照片的api地址
 */
function getWeatherIcon(pictureNo) {
    if (pictureNo === '7' || pictureNo === '07' || pictureNo === '09' || pictureNo === '9' || pictureNo === '21') {
        pictureNo = '08';
    }
    // api里照片名都是两位数，所以需要转换照片名
    if (pictureNo.length === 1) {
        pictureNo = '0' + pictureNo;
    }
    return 'https://p0.ssl.qhimg.com/d/f239f0e2/' + pictureNo + '.png'
}

/**
 * 转换日期格式
 *
 * @param oldDate 需要被转换的日期
 * @returns {string} 新日期
 */
function getShortDate(oldDate) {
    let date = new Date(Date.parse(oldDate));
    let now = new Date();
    let newDate = (date.getMonth() + 1) + "/" + date.getDate();
    // 如果oldDate的日期是今天的日期就转换为中文"今天"
    if (now.getDate() === date.getDate()) {
        newDate = "今天";
    }
    return newDate;
}

/**
 * 将从腾讯地图城市选择器获取的6位数的 adCode 转换获取10位数的 adCode
 * @param city_id
 * @param callback
 */
function convertCityAdCode(city_id, callback) {
    wx.request({
        url: qweatherCityApi + city_id,
        data: {},
        success: function (res) {
            if (res.statusCode !== 200 || res.data.length === 0) {
                return;
            }
            callback(res.data.location[0].id)
        }
    })
}

module.exports = {
    getWeatherData: getWeatherData,
    convertCityAdCode: convertCityAdCode
}
