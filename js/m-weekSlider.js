/**************************************************************
***************************************************************
==name: WeekSlider
==description: 用原生javascript实现的水平滑动翻页选择周日历的组件
==author: DL
==tip: 暂时仅支持手机端
==params: weekSliderEl: 日历容器
          showMonth: 是否显示当前周属于哪年那月
          changeCallback: 切换回调
          weekClickHandle: 点击某一天回调
**************************************************************
**************************************************************/


WeekSlider = function (options) {

    /*******************************************
    ==默认参数
    *******************************************/
    const defaultOptions  = {
        weekSliderEl: 'WeekSlider',
        showMonth: false,
        changeCallback: function () {},
        weekClickHandle: null
    }
    /*******************************************
    ==参数合并
    *******************************************/
    this.opts = Object.assign({}, defaultOptions, options)
    this.el = document.getElementById(this.opts.weekSliderEl)
    this.sliders = null
    this.monthEl = null
    this.start = {}
    this.end = {}
    this.pos = {}
    this.direction = null
    this.current = 1
    this.leftNum = 2
    this.rightNum = -2
    this.init()
}
WeekSlider.prototype = {
    /*******************************************
    ==初始化方法
    *******************************************/
    init: function () {
        var _this = this
        this.createSliders()
        const eventNames = ['touchstart', 'touchmove', 'touchend']
        eventNames.map((eventName) => {
            this.el.addEventListener(eventName, this[eventName].bind(this), false)
        })

        for (var i = 0; i < 3; i++) {
            this.el.querySelector('.sliders').children[i].innerHTML = this.buildWeekHtml(i-1)
        }

        if (this.opts.showMonth) {
            this.setMonth()
        }

        /**
        *weekClickHandle
        **/
        if (typeof this.opts.weekClickHandle === 'function') {
            this.el.addEventListener(
                'click',
                function (e) {
                    var target = e.target
                    var date = target.dataset.date
                    _this.opts.weekClickHandle(date)
                },
                false
            )
        }

    },

    /*******************************************
    ==创建滑动块
    *******************************************/
    createSliders: function () {
        this.sliders = document.createElement('div')
        this.sliders.classList.add('sliders')
        let sliderHtml = ''
        for (var i = 0; i < 3; i++) {
            sliderHtml += i === this.current ? '<div class="item active"></div>' : '<div class="item"></div>'
        }
        this.sliders.innerHTML = sliderHtml
        this.el.appendChild(this.sliders)

        if (this.opts.showMonth) {
            this.monthEl = document.createElement('div')
            this.monthEl.classList.add('month')
            this.el.insertBefore(this.monthEl, this.sliders)
        }

    },

    /*******************************************
    ==计算滑动角度
    *******************************************/
    getAngle: function (x, y) {
        return Math.atan2(y, x) * 180 / Math.PI;
    },

    /*******************************************
    ==判断是左滑还是右滑
    *******************************************/
    getTouchDir: function (posx, posy) {
        if (Math.abs(posx) > 20) {//滑动距离
            var angle = this.getAngle(posx, posy)
            if (angle >= -45 && angle <= 45) {//向右
                this.direction = 'right'
            } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {//向左
                this.direction = 'left'
            }
        }
    },

    /*******************************************
    ==touchstart事件处理程序
    *******************************************/
    touchstart: function (e) {
        var touches = e.touches[0]
        this.start.x = touches.pageX
        this.start.y = touches.pageY
    },

    /*******************************************
    ==touchmove事件处理程序
    *******************************************/
    touchmove: function (e) {
        var touches = e.touches[0]
        this.end.x = touches.pageX
        this.end.y = touches.pageY

        this.pos.width = this.end.x - this.start.x
        this.pos.height = this.end.y - this.start.y

        this.sliders.children[this.current].style.webkitTransform = 'translate3d('+ this.pos.width +'px, 0px, 0px)'
        this.sliders.children[this.current].style.opacity = 1-Math.abs(this.pos.width)/300
    },

    /*******************************************
    ==touchend事件处理程序
    *******************************************/
    touchend: function (e) {
        var touches = e.changedTouches[0]
        this.end.x = touches.pageX
        this.end.y = touches.pageY
        this.pos.width = this.end.x - this.start.x
        this.pos.height = this.end.y - this.start.y
        this.getTouchDir(this.pos.width, this.pos.height)

        var showCssText = 'transform: translate3d(0px, 0px, 0px); -webkit-transform: translate3d(0px, 0px, 0px); opacity: 1'
        var hideCssText = ''
        var nextIndex
        if (this.direction === 'left') hideCssText = 'transform: translate3d(-100%, 0px, 0px); -webkit-transform: translate3d(-100%, 0px, 0px); opacity: 0'
        if (this.direction === 'right') hideCssText = 'transform: translate3d(100%, 0px, 0px); -webkit-transform: translate3d(100%, 0px, 0px); opacity: 0'



        if (this.direction === 'left') {
            this.sliders.children[this.current].style.cssText = hideCssText
            this.sliders.children[++this.current].style.cssText = showCssText
            var weekItem = document.createElement('div')
            weekItem.setAttribute('class', 'item')
            weekItem.style.webkitTransform = 'translate3d(100%, 0px, 0px)'
            weekItem.innerHTML = this.buildWeekHtml(this.leftNum++)
            this.rightNum++
            this.sliders.appendChild(weekItem)
            this.current = 1
            this.sliders.removeChild(this.sliders.children[0])
        }else if (this.direction === 'right') {
            this.sliders.children[this.current].style.cssText = hideCssText
            this.sliders.children[--this.current].style.cssText = showCssText
            var weekItem = document.createElement('div')
            weekItem.setAttribute('class', 'item')
            weekItem.style.webkitTransform = 'translate3d(-100%, 0px, 0px)'
            weekItem.innerHTML = this.buildWeekHtml(this.rightNum--)
            this.leftNum--
            this.sliders.insertBefore(weekItem, this.sliders.children[0])
            this.current = 1
            this.sliders.removeChild(this.sliders.children[this.sliders.children.length-1])
        } else {
            this.sliders.children[this.current].style.webkitTransform = 'translate3d(0px, 0px, 0px)'
            this.sliders.children[this.current].style.opacity = 1
        }


        if (this.direction === 'left' || this.direction === 'right') {
            this.direction = null
            if (this.opts.showMonth) {
                this.setMonth()
            }
            if (typeof this.opts.changeCallback === 'function') {
                this.opts.changeCallback()
            }
        }

    },

    /*******************************************
    ==设置月份，当this.opts.showMonth === true,才调用
    *******************************************/
    setMonth: function () {
        var nowMonth
        if (this.sliders.children[1].querySelector('.sign')) {
            nowMonth = this.sliders.children[1].querySelector('.sign').getAttribute('data-date')
        } else {
            nowMonth = this.sliders.children[1].querySelector('.today').getAttribute('data-date')
        }
        this.monthEl.innerHTML = nowMonth.split('-')[0] + '年' + nowMonth.split('-')[1] + '月'
    },

    /*******************************************
    ==获取周所对应的日期
    *******************************************/
    getWeek: function (date) {
        var weekText = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        var dateOfToday = date ? new Date(date).getTime() : new Date().getTime()
        var dayOfToday = date ? (new Date(date).getDay() + 7) % 7 : (new Date().getDay() + 7) % 7
        var daysOfThisWeek = Array.from(new Array(7))
          .map( (_, i) => {
            var date = new Date(dateOfToday + (i - dayOfToday) * 1000 * 60 * 60 * 24)
            var cls = ''
            if (date.getFullYear() === new Date().getFullYear() && date.getMonth() === new Date().getMonth() && date.getDate() === new Date().getDate()) {
                cls = 'today'
            }else if (date.getDay() === dayOfToday) {
                cls = 'sign'
            }
            return {
                date: date.getFullYear() + '-' + this.repairZero(date.getMonth() + 1) + '-' + this.repairZero(date.getDate()),
                week: weekText[date.getDay()],
                cls: cls
            }
          })
          return daysOfThisWeek
     },

     /*******************************************
     ==创建周对应的日期DOM结构
     *******************************************/
     buildWeekHtml: function (index) {
             var time = new Date().getTime() + (7*24*60*60*1000) * index
             var str = ''
             var weeks = this.getWeek(time)
             for (var k = 0; k < weeks.length; k++) {
                 str += '<div class="day"><a data-date="'+ weeks[k].date +'" class="'+ weeks[k].cls +'" href="javascript:;">'+ weeks[k].week +'<br><strong data-date="'+ weeks[k].date +'">'+ weeks[k].date.split('-')[2] + '</strong></a></div>'
             }
             return str
     },

     /*******************************************
     ==小于两位数补全0的
     *******************************************/
     repairZero: function (num) {
         return num < 10 ? '0' + num : num
     }
}
