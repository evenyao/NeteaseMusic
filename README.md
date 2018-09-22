# 移动端网易云音乐 项目
使用 jQuery 重构移动端网易云音乐 

- 预览地址：https://evenyao.github.io/NeteaseMusic/
- 移动端预览请扫描二维码（推荐使用微信或者QQ扫描）：

![](https://img-1257191344.cos.ap-chengdu.myqcloud.com/WechatIMG1716.png)

## 简要功能介绍
- 主要由 `index`、`playlist` 和 `song` 三个页面构成
- 主页音乐为 `ajax` 请求 `json` 获取的数据，`playlist` 和 主页 tab页面 2中 为相同的歌曲曲目 (数据复用)
- 主页 tab 3 包含的歌曲搜索功能，可以搜索 主页 和 歌单 里面包含的几首曲目的歌曲名，得到结果点击可跳转至播放页面 `song`
- `song` 页面为歌曲播放页面，含有 `Lyric` 歌词匹配功能

## 关于版本

### 2018.8.18
v0.1: song 页面样式、功能与逻辑基本完成

### 2018.8.19
v0.2: 添加 index 首页，完成首页第一个 tab 板块 推荐音乐

v0.3: 完成 song 页面的 js，实现 Lyric 歌词 功能

### 2018.8.20
v1.0: 基本功能实现完成。部分bug待修复。

### 2018.8.21
v1.1: 实现歌曲搜索，得到结果点击可跳转到音乐功能，并增添搜索字符格式化优化

v1.2: 歌曲播放页的改动，给微信做了专门的函数来实现自动播放

# 关于项目中重点
## 样式布局
- 相对单位 vw 的使用
- line-height 的使用
- Flex 布局 flex-direction: column / justify-content: space-between
- css3 特效 transition: transform 0.3s

## 页面相关与功能实现
### 首页 tab 组件和 请求方法
tab 页的其他页面 该项目中是固定的DOM，按照下面代码，可以实现 `ajax` 动态获取
```JavaScript
//实现 tab 组件
$('.siteNav').on('click','ol.tabItems>li',function(e){
  let $li = $(e.currentTarget).addClass('active')
  $li.siblings().removeClass('active')
  let index = $li.index()
  $li.trigger('tabChange',index)  //自定义事件 tabChange
  $('.tabContent > li').eq(index).addClass('active').siblings().removeClass('active')
})

//定义 tabChange 事件
$('.siteNav').on('tabChange',function(e,index){
  let $li = $('.tabContent > li').eq(index)
  //先判断是否请求过页面数据，如果请求过，则不再请求
  if($li.attr('data-download') === 'yes'){
    return
  }
  if(index === 1){
    $.get('/page2.json').done(function(response){
      console.log(response)
      //请求完成之后，将其写入DOM，填充页面
      $li.text(response.content)
      //并且标记已经请求过
      $li.attr('data-download','yes')
    })
  }else if(index === 2 ){
    $.get('/page3.json').done(function(response){
      //请求完成之后，将其写入DOM，填充页面
      $li.text(response.content)
      //并且标记已经请求过
      $li.attr('data-download','yes')
    })
  }
})
```

### tab 搜索页的难点
在没有后端的情况下，模拟搜索延迟，并利用函数节流、定时器刷新等优化搜索功能

```JavaScript
//声明一个格式化搜索字符串的函数 titleCase，该函数功能为自动格式化空格之后每个单词首字母为大写，便于匹配歌曲曲库当中的歌曲名
function titleCase(s) {
var i, ss = s.toLowerCase().split(/\s+/);
for (i = 0; i < ss.length; i++) {
    ss[i] = ss[i].slice(0, 1).toUpperCase() + ss[i].slice(1);
}
return ss.join(' ');
}


let timer = undefined
//监听 input 搜索的输入
$('#searchSong').on('input',function(e){
  let $input = $(e.currentTarget)  //得到input元素
  let value = titleCase($input.val().trim())  //得到input value，在这里调用函数 titleCase 格式化搜索字符串
  if( value === ''){return}

  //如果800毫秒内用户再次输入，清空定时器，再次等待用户输入
  if(timer){
    clearTimeout(timer)
  }

  //定时器，等待用户输入时间，该时间过后，才发送搜索请求
  timer = setTimeout(function(){
    search(value).then(function(result){
      timer = undefined //搜索执行后，清空timer
      if(result.length !== 0){
        let newResult = result.map(function(r){
          return r
        })
        let i = newResult[0]  //取到歌曲信息的类数组对象
        console.log(i)
        let $div = $(`
        <div>
          <a href="/html/song.html?id=${i.id}">
              <p>${i.anthor} - ${i.name}</p>
            </a>
        </div>
            `)
        $('#output').html($div)   //将搜索结果展示在下方并可以点击跳转至歌曲

      }else{
        $('#output').text('没有结果')
      }
    })
  },800)
})

//模拟假搜索引擎
function search(keyword){
  console.log('搜索'+ keyword)
  return new Promise(function(resolve, reject){
    var database = [
      { "id": 1, "name":"あなたがいた森" , "anthor":"樹海" , "cd":"あなたがいた森" },
      { "id": 2, "name":"千与千寻", "anthor":"久石让", "cd":"千与千寻" },
      { "id": 3, "name":"デート", "anthor":"RADWIMPS", "cd":"君の名は。" },
      { "id": 4, "name":"Where Will You Go", "anthor":"Babyface", "cd":"Tender Lover" },
      { "id": 5, "name":"Someday", "anthor":"IU", "cd":"DreamHigh OST" },
      { "id": 6, "name":"Last Reunion", "anthor":"EpicMusicVn", "cd":"Epicmusicvn Series" }
    ]
    let result = database.filter(function(item){
      return item.name.indexOf(keyword) >= 0
    })
    //制造的一个假的后台搜索时间来返回搜索结果
    setTimeout(function(){
      console.log('搜索到'+ keyword + '的结果')
      resolve(result)
    },(Math.random()*200 + 1000))
  })
}
```


### song页面 黑胶碟片
使用一张左右带光晕效果的透明 png 和一张黑色圆环的 png 重叠而成

### 碟片旋转效果
使用 css3 `@keyframes`
特别注意 歌曲暂停时的碟片旋转效果
实现方法如下:
```CSS
/* 申明一个animation */
@keyframes circle {
  0% {
    /* 0% 的时候是0° */
    transform: rotate(0deg);
  }
  100% {
    /* 100% 的时候是360° */
    transform: rotate(360deg);
  }
}

/* 碟片 暂停/播放 控制样式 */
.disc-container.playing .light,
.disc-container.playing .cover {
  /* 当在播放的时候；设置animation转动 20s一个360°周期转动 不停止 且线性速率 */
  animation: circle 20s infinite linear;
  /* 设置 animation-play-state 正常状态下转动 */
  animation-play-state: running;
}
.disc-container.playing .light.active,
.disc-container.playing .cover.active {
  /* 设置 animation-play-state active 状态下停止转动，用来暂停的时候添加样式 */
  animation-play-state: paused;
}
```
该方法在 safari 上有无法 paused 的显示bug
`@keyframes`具体参考 https://developer.mozilla.org/zh-CN/docs/Web/CSS/@keyframes

### 歌词的获取
利用 `ajax`、数组方法`split` `map`、正则`match`
利用 jQuery `attr`、`appendTo`
等方法实现，具体如下：

```JavaScript
$.get('/lyric.json').done(function(object){
  let lyric = object.lyric
  let array = lyric.split('\n')

  let regex = /^\[(.+)\](.*)$/
  array = array.map(function(string,index){
    let matches = string.match(regex)
    if(matches){
      return {time: matches[1],words: matches[2]}
    }
  })

  let $lyric = $('.lyric')
  array.map(function(object){
    //如果object不存在， return
    if(!object){
      return
    }
    let $p = $('<p/>')  //生成p标签
    $p.attr('data-time',object.time).text(object.words)  //操作p标签，加时间和歌词内容
    $p.appendTo($lyric.children('.lines')) //加到div中
  })
})
```

### 动态歌词效果实现
使用正则格式化`json`格式的 lyric 歌词，然后使用`setInterval`让对应时间歌曲与歌词匹配
利用歌词到屏幕顶部的高度差值，使用css中的`transform`，让歌词显现
```JavaScript
setInterval(function(){
  let seconds = audio.currentTime
  let minutes = ~~(seconds / 60)
  let left = seconds - minutes * 60
  let time = `${pad(minutes)}:${pad(left)}`
  let $lines = $('.lines>p')
  let $whichLine
  //歌词显示逻辑
  for (let i = 0; i < $lines.length; i++) {
    let currentLineTime = $lines.eq(i).attr('data-time')  //当前行的时间
    let nextLineTime = $lines.eq(i+1).attr('data-time')  //下一行的时间
    if( $lines.eq(i+1).length !== 0 && currentLineTime < time && nextLineTime > time){
      $whichLine = $lines.eq(i)
      break
    }
  }
  if($whichLine){
    $whichLine.addClass('active').prev().removeClass('active')  //添加active样式，并给上一行移除样式
    let top = $whichLine.offset().top    //歌词行到顶部高度
    let linesTop = $('.lines').offset().top     //lines到顶部的高度
    let delta = top - linesTop - $('.lyric').height()/3      //高度差值
    $('.lines').css('transform',`translateY(-${delta}px)`)
  }
  console.log(time)
},500)
}

//时间垫片函数
function pad(number){
return number >= 10 ? number + '' : '0' + number
}

//格式化歌词函数
function parseLyric(lyric){
let array = lyric.split('\n')
let regex = /^\[(.+)\](.*)$/
array = array.map(function(string,index){
  let matches = string.match(regex)
  if(matches){
    return {time: matches[1],words: matches[2]}
  }
})

let $lyric = $('.lyric')
array.map(function(object){
  //如果object不存在， return
  if(!object){
    return
  }
  let $p = $('<p/>')  //生成p标签
  $p.attr('data-time',object.time).text(object.words)  //操作p标签，加时间和歌词内容
  $p.appendTo($lyric.children('.lines')) //加到div中
})
}
```

### v1.2 版本解决的歌曲自动播放的问题
由于 ios 乔布斯下了死命令，禁止浏览器自动播放任何媒体类文件，
所以会出现 ios 浏览器 / ios设备下 微信点开页面时 必须让用户自身完成音乐播放的初始操作的情况，所以统一制作成了必须通过手势点击播放的效果。
safari 浏览器暂无解决的方法，但是ios 微信端可以采用下面函数进行优化。

在安卓手机上则不会出现，ios 微信端通过以下函数实现解除 媒体自动播放的限制
```JavaScript
    //微信解除禁止自动播放的限制
    document.addEventListener("WeixinJSBridgeReady", function (){
      audio.play()
    }, false);

```

### 监控键盘空格触发音乐 暂停 / 播放 (如果可能)
非移动端考虑到的因素，我们也把该功能加入进去
```JavaScript
//键盘空格控制音乐暂停播放
$(document).keydown(function(e){
  if(!e) var e = window.event;
  if(e.keyCode == 32){
    if($('.play').hasClass('active')){
      audio.play()
      $('.play').removeClass('active')
      $('.cover').removeClass('active')
      $('.light').removeClass('active')
    }else{
      audio.pause()
      $('.play').addClass('active')
      $('.cover').addClass('active')
      $('.light').addClass('active')
    }
  }
})
```

## 关于 audio 的相关方法
参考之前所做的音乐播放器页面作品中的README
介绍了常用的 `audioObject` 方法
https://github.com/evenyao/music-player
