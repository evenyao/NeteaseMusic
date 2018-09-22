$(function(){
  //请求数据更改首页下方歌曲列表
  $.get('/NeteaseMusic/songs.json').done(function(response){
    let items = response
    items.forEach(function(i){
      let $li = $(`
      <li>
        <a href="/song.html?id=${i.id}">
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
  })
})
