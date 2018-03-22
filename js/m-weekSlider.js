WeekSlider = function (el, monthEl) {
    this.start = {}
    this.end = {}
    this.pos = {}
    this.el = el
    this.monthEl = monthEl
    this.direction = 'left'
    this.current = 1
    this.leftNum = 2
    this.rightNum = -2
    this.init()
}
WeekSlider.prototype = {
    init: function () {
        this.el.children[this.current].style.webkitTransform = 'translate3d(0px, 0px, 0px)'
        this.el.children[this.current].style.opacity = 1

        this.el.addEventListener('touchstart', this.touchstart.bind(this), false)
        this.el.addEventListener('touchmove', this.touchmove.bind(this), false)
        this.el.addEventListener('touchend', this.touchend.bind(this), false)

        for (var i = 0; i < this.el.children.length; i++) {
            this.el.children[i].innerHTML = this.buildWeekHtml(i-1)
        }
        this.setMonth()
    },


    touchstart: function (e) {
        var touches = e.touches[0]
        this.start.x = touches.pageX
        this.start.y = touches.pageY
    },

    touchmove: function (e) {
        var touches = e.touches[0]
        this.end.x = touches.pageX
        this.end.y = touches.pageY

        this.pos.width = this.end.x - this.start.x
        this.pos.height = this.end.y - this.start.y
        this.direction = this.pos.width < 0 ? 'left' : 'right'
        this.el.children[this.current].style.webkitTransform = 'translate3d('+ this.pos.width +'px, 0px, 0px)'
        this.el.children[this.current].style.opacity = 1-Math.abs(this.pos.width)/300
    },

    touchend: function (e) {
        if (Math.abs(this.pos.width) >= 50) {
            if (this.direction === 'left') {
                this.el.children[this.current].style.webkitTransform = 'translate3d(-100%, 0px, 0px)'
                this.el.children[this.current].style.opacity = 0
                this.el.children[++this.current].style.webkitTransform = 'translate3d(0px, 0px, 0px)'
                this.el.children[this.current].style.opacity = 1
                var weekItem = document.createElement('div')
                weekItem.setAttribute('class', 'item')
                weekItem.setAttribute('type', 'new')
                weekItem.style.webkitTransform = 'translate3d(100%, 0px, 0px)'
                weekItem.innerHTML = this.buildWeekHtml(this.leftNum++)
                this.rightNum++
                this.el.appendChild(weekItem)
                this.current = 1
                this.el.removeChild(this.el.children[0])
            }else if (this.direction === 'right') {
                this.el.children[this.current].style.webkitTransform = 'translate3d(100%, 0px, 0px)'
                this.el.children[this.current].style.opacity = 0
                this.el.children[--this.current].style.webkitTransform = 'translate3d(0px, 0px, 0px)'
                this.el.children[this.current].style.opacity = 1
                var weekItem = document.createElement('div')
                weekItem.setAttribute('class', 'item')
                weekItem.setAttribute('type', 'new')
                weekItem.style.webkitTransform = 'translate3d(-100%, 0px, 0px)'
                weekItem.innerHTML = this.buildWeekHtml(this.rightNum--)
                this.leftNum--
                this.el.insertBefore(weekItem, this.el.children[0])
                this.current = 1
                this.el.removeChild(this.el.children[this.el.children.length-1])
            } else {
                this.el.children[this.current].style.webkitTransform = 'translate3d(0px, 0px, 0px)'
                this.el.children[this.current].style.opacity = 1
            }
            this.pos.width = 0

            this.setMonth()

        }else{
            this.el.children[this.current].style.webkitTransform = 'translate3d(0px, 0px, 0px)'
            this.el.children[this.current].style.opacity = 1
        }
    },

    setMonth: function () {
        var nowMonth
        if (this.el.children[1].querySelector('.sign')) {
            nowMonth = this.el.children[1].querySelector('.sign').getAttribute('data-date')
        } else {
            nowMonth = this.el.children[1].querySelector('.today').getAttribute('data-date')
        }
        this.monthEl.innerHTML = nowMonth.split('-')[0] + '年' + nowMonth.split('-')[1] + '月'
    },

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

     buildWeekHtml: function (index) {
             var time = new Date().getTime() + (7*24*60*60*1000) * index
             var str = ''
             var weeks = this.getWeek(time)
             for (var k = 0; k < weeks.length; k++) {
                 str += '<div class="day"><a data-date="'+ weeks[k].date +'" class="'+ weeks[k].cls +'" href="javascript:;">'+ weeks[k].week +'<br><strong>'+ weeks[k].date.split('-')[2] + '</strong></a></div>'
             }
             return str
     },

     /*******************************************
     **小于两位数补全0的
     *******************************************/
     repairZero: function (num) {
         return num < 10 ? '0' + num : num
     }
}
