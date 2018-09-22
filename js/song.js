$(function(){

  //location.search 搭配正则 取歌曲的"?id"，获取歌曲url
  let id = parseInt(location.search.match(/\bid=([^&]*)/)[1],10)

  $.get('../songs.json').done(function(response){
    let songs = response

    //取歌曲id 并生成提取url，下面播放的时候可以调用  
    
    //使用 filter 方法，匹配 当前筛选出id一致的数组值赋值为song
    let song = songs.filter(function(s){
      return s.id === id
    })
    // console.log(song[0])
    // 取出各项数据
    let {url,name,lyric,anthor,cover,bg} = song[0]

    initPlayer(url)
    initText(name, lyric, anthor, cover, bg)
  })


  // 初始化播放页内容函数
  function initText(name, lyric, anthor, cover, bg){
    $('.song-description > h1').text(name + " - " + anthor)
    $('.cover').attr('src',cover);
    $('.page').css({
      "display": "flex",
      "flex-direction": "column",
      "height": "100vh",
      "background":`transparent url(${bg}) no-repeat center`,
      "background-size": "cover"
    })
    parseLyric(lyric)
  }


  // 初始化播放器函数
  function initPlayer(url){
    let audio = document.createElement('audio')
    audio.src = url
    audio.autoplay = true
    $('.disc-container').addClass('playing')
    
    //微信解除禁止自动播放的限制
    document.addEventListener("WeixinJSBridgeReady", function (){
      audio.play()
    }, false);

    //点击歌曲封面，暂停歌曲，并让play按钮显出，碟片停止转动
    $('.cover').on('click',function(){
      audio.pause()
      $('.play').addClass('active')
      $('.cover').addClass('active')
      $('.light').addClass('active')
    })
    //点击play按钮，继续播放，并使碟片继续转动
    $('.play').on('click',function(){
      audio.play()
      $('.play').removeClass('active')
      $('.cover').removeClass('active')
      $('.light').removeClass('active')
    })

    //键盘空格控制音乐暂停播放
    // $(document).keydown(function(e){
    //   if(!e) var e = window.event;
    //   if(e.keyCode == 32){
    //     if($('.play').hasClass('active')){
    //       audio.play()
    //       $('.play').removeClass('active')
    //       $('.cover').removeClass('active')
    //       $('.light').removeClass('active')
    //     }else{
    //       audio.pause()
    //       $('.play').addClass('active')
    //       $('.cover').addClass('active')
    //       $('.light').addClass('active')
    //     }
    //   }
    // })

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
      //console.log(time)
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

})
