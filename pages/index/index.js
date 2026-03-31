//index.js
const api = require('../../libs/api');

// 时间格式化函数
function formatTime(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return '--:--';
    try {
        // 从 "20230512140000" 格式转换为 "HH:MM"
        const year = timeStr.substring(0, 4);
        const month = timeStr.substring(4, 6);
        const day = timeStr.substring(6, 8);
        const hour = timeStr.substring(8, 10);
        const minute = timeStr.substring(10, 12);

        // 如果是当前日期，只显示时间；如果是未来日期，显示日期+时间
        const now = new Date();
        const currentDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

        if (year + month + day === currentDate) {
            return `${hour}:${minute}`;
        } else {
            return `${month}/${day} ${hour}:${minute}`;
        }
    } catch (e) {
        console.error('时间格式化错误:', e);
        return '--:--';
    }
}

Page({
    data: {
        citySelected: [],
        weatherData: {},
        topCity: {},
        current: 0,
        isLoading: false,
        hasError: false,
        errorMessage: ''
    },

    /**
     * 时间格式化过滤器
     */
    formatTime: function (timeStr) {
        return formatTime(timeStr);
    },

    /**
     * 显示天气管理页面
     */
    showDetailPage: function (event) {
        const cityAdCode = event.currentTarget.dataset.city_code || '';
        if (!cityAdCode) return;

        wx.navigateTo({
            url: '../detail/detail?city_code=' + cityAdCode
        });
    },

    /**
     * 显示城市管理页面
     */
    showSettingPage: function () {
        wx.navigateTo({
            url: '../setting/setting'
        });
    },
    /**
     * 更新首页顶部的显示的城市信息
     * @param event 事件发生后返回的数据
     */
    updateTopCity: function (event) {
        let citySelected = wx.getStorageSync('citySelected');
        let weatherData = wx.getStorageSync('weatherData');
        let topCity = {
            left: "",
            center: "",
            right: "",
        };

        // 获取轮播图中页面的索引
        let current = event.detail.current;
        wx.setStorageSync('currentPage', current);
        try {
            if (citySelected[current - 1] !== undefined) {
                topCity.left = weatherData[citySelected[current - 1]].realtime.city_name;
            }
        } catch (e) {
            console.error(e.message)
        }
        try {
            topCity.center = weatherData[citySelected[current]].realtime.city_name;
        } catch (e) {
            console.error(e.message)
        }
        try {
            if (citySelected[current + 1] !== undefined) {
                topCity.right = weatherData[citySelected[current + 1]].realtime.city_name;
            }
        } catch (e) {
            console.error(e.message)
        }

        this.setData({
            topCity: topCity,
        })
    },


    /**
     * 获取本地城市adCode和天气数据或者更新天气数据所有城市的天气数据
     */
    onLoad: function () {
        let defaultCityAdCode = "local_adCode";
        let citySelected = wx.getStorageSync('citySelected') || [];
        let weatherData = wx.getStorageSync('weatherData') || {};
        let that = this;
        if (citySelected.length === 0) {
            citySelected.unshift("local_adCode");
            wx.setStorageSync('citySelected', citySelected);
        }
        if (weatherData.length === 0) {
            api.getWeatherData(defaultCityAdCode, function (cityAdCode, data) {
                weatherData[cityAdCode] = data;
                wx.setStorageSync('weatherData', weatherData);
                that.setHomeData([cityAdCode], weatherData);
            });
        } else {
            this.updateWeatherData();
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        const citySelected = wx.getStorageSync('citySelected') || [];
        const weatherData = wx.getStorageSync('weatherData') || {};

        if (citySelected.length === 0) {
            // 如果没有城市数据，显示错误信息
            this.setData({
                hasError: true,
                errorMessage: '请先添加城市'
            });
        } else {
            this.setHomeData(citySelected, weatherData);
            this.setData({ hasError: false });
        }

        wx.setStorageSync('isDetail', false);
    },

    /**
     * 隐藏错误提示
     */
    hideError() {
        this.setData({ hasError: false, errorMessage: '' });
    },

    /**
     * 更新已管理城市的天气数据
     */
    updateWeatherData() {
        const citySelected = wx.getStorageSync('citySelected') || [];
        const that = this;

        // 设置加载状态
        this.setData({ isLoading: true, hasError: false });

        let completedCount = 0;
        const totalCount = citySelected.length;

        citySelected.forEach(cityAdCode => {
            api.getWeatherData(cityAdCode, (code, data) => {
                const weatherData = wx.getStorageSync('weatherData') || {};
                weatherData[code] = data;
                wx.setStorageSync('weatherData', weatherData);

                completedCount++;
                if (completedCount === totalCount) {
                    that.setHomeData(citySelected, weatherData);
                    that.setData({ isLoading: false });
                    wx.stopPullDownRefresh();
                }
            });
        });

        // 设置超时处理
        setTimeout(() => {
            if (this.data.isLoading) {
                this.setData({
                    isLoading: false,
                    hasError: true,
                    errorMessage: '数据加载超时，请检查网络连接'
                });
                wx.stopPullDownRefresh();
            }
        }, 10000);
    },

    /**
     * 下拉刷新处理
     */
    onPullDownRefresh() {
        this.updateWeatherData();
    },

    /**
     * 获取城市名称，添加错误处理
     * @param citySelected 城市列表
     * @param weatherData 天气数据
     * @param index 城市索引
     */
    getCityName(citySelected, weatherData, index) {
        try {
            return citySelected[index] ? weatherData[citySelected[index]].realtime.city_name : "";
        } catch (e) {
            console.error('获取城市名称错误：', e.message);
            return "";
        }
    },

    /**
     * 设置主页数据
     * @param citySelected 已经被管理的城市信息
     * @param weatherData 天气信息
     */
    setHomeData: function (citySelected, weatherData) {
        const isDetail = wx.getStorageSync("isDetail") || false;

        if (!isDetail) {
            const currentPage = wx.getStorageSync('currentPage') || 0;
            const topCity = {
                left: this.getCityName(citySelected, weatherData, currentPage - 1),
                center: this.getCityName(citySelected, weatherData, currentPage),
                right: this.getCityName(citySelected, weatherData, currentPage + 1)
            };

            this.setData({
                weatherData: weatherData,
                topCity: topCity,
                citySelected: citySelected,
            });
        }
    },
})
