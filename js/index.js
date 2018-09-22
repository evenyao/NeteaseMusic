$(function(){
  //请求数据更改首页下方歌曲列表
  $.get('/NeteaseMusic/songs.json').done(function(response){
    let items = response
    items.forEach(function(i){
      let $li = $(`
      <li>
        <a href="/NeteaseMusic/html/song.html?id=${i.id}">
          <h3>${i.name}</h3>
          <p>
            <svg class="sq">
              <use xlink:href="#icon-sq"></use>
            </svg>
            ${i.anthor}-${i.cd}</p>
            <svg class="playsong">
              <use xlink:href="#icon-bofang"></use>
            </svg>
          </a>
      </li>
          `)
      $('.songList').append($li)
    })
    $('#newMusicLoading').remove()
  })

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
      return //作品为写死的固定页面 不用请求
      $.get('../page2.json').done(function(response){
        console.log(response)
        //请求完成之后，将其写入DOM，填充页面
        $li.text(response.content)
        //并且标记已经请求过
        $li.attr('data-download','yes')
      })
    }else if(index === 2 ){
      return //作品为写死的固定页面 不用请求
      $.get('../page3.json').done(function(response){
        //请求完成之后，将其写入DOM，填充页面
        $li.text(response.content)
        //并且标记已经请求过
        $li.attr('data-download','yes')
      })
    }
  })

  
  //声明一个格式化搜索字符串的函数 titleCase，该函数功能为自动格式化空格之后每个单词首字母为大写，便于匹配歌曲曲库当中的歌曲名，v1.1新增
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
    let value = titleCase($input.val().trim()) //得到input value，在这里调用函数 titleCase 格式化搜索字符串
    if( value === ''){return}

    //如果800毫秒内用户再次输入，清空定时器，再次等待用户输入
    if(timer){
      clearTimeout(timer)
    }

    //定时器，等待用户输入时间，该时间过后，才发送搜索请求
    timer = setTimeout(function(){
      search(value).then(function(result){
        timer = undefined //搜索执行后，清空timer

        //v1.1新增搜索歌曲跳转功能
        if(result.length !== 0){
          let newResult = result.map(function(r){
            return r
          })
          // console.log(newResult[0])
          let i = newResult[0]  //取到歌曲信息的类数组对象
          let $div = $(`
          <div>
            <a href="/NeteaseMusic/html/song.html?id=${i.id}">
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
          { "id": 1, "name":"Guardians Inferno", "anthor":"David Hasselhoff", "cd":"Guardians of the Galaxy Vol. 2" },
          { "id": 2, "name":"月儿圆", "anthor":"李佳隆", "cd":"月儿圆" },
          { "id": 3, "name":"星球坠落", "anthor":"艾热/李佳隆", "cd":"中国新说唱 第3期" },
          { "id": 4, "name":"Where Will You Go", "anthor":"Babyface", "cd":"Tender Lover" },
          { "id": 5, "name":"Someday", "anthor":"IU", "cd":"DreamHigh OST" },
          { "id": 6, "name":"Last Reunion", "anthor":"EpicMusicVn", "cd":"Epicmusicvn Series" },
          { "id": 7, "name":"千与千寻", "anthor":"久石让", "cd":"千与千寻" },
          { "id": 8, "name":"あなたがいた森", "anthor":"樹海", "cd":"あなたがいた森" },
          { "id": 9, "name":"デート", "anthor":"RADWIMPS", "cd":"君の名は。" }
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

})
