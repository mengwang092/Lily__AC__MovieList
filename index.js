(function () {
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const data = []

  const dataPanel = document.getElementById('data-panel')
  const searchForm = document.getElementById('search')
  const searchInput = document.getElementById('search-input')

  const pagination = document.getElementById('pagination')
  const ITEM_PER_PAGE = 12
  let paginationData = []

  // 新增：事件監聽 切換 layout style
  const viewSwitcher = document.getElementById('viewSwitcher')
  // 頁碼控制
  let page = 1
  // layout style 控制：
  // 原本的卡片風格 (card) 為 0 
  // 新增的列表風格 (lsit) 為 1
  // 兩者數值相符時改變 layout
  let layoutStyle = 0
  let cardStyle = 0
  let listStyle = 1

  axios.get(INDEX_URL).then((response) => {
    data.push(...response.data.results)
    getTotalPages(data)
    // displayDataList(data)
    getPageData(page, data)
  }).catch((err) => console.log(err))

  // listen to data panel
  dataPanel.addEventListener('click', (event) => {
    if (event.target.matches('.btn-show-movie')) {
      showMovie(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
      console.log(event.target.dataset.id)
      addFavoriteItem(event.target.dataset.id)
    }
  })

  // listen to search form submit event
  searchForm.addEventListener('submit', event => {
    event.preventDefault()
    let input = searchInput.value.toLowerCase()
    let results = data.filter(
      movie => movie.title.toLowerCase().includes(input)
    )
    console.log(results)
    // displayDataList(results)
    getTotalPages(results)
    getPageData(page, results)
  })

  // 新增：事件監聽 切換 layout style
  // Listen to viewSwitcher event
  viewSwitcher.addEventListener('click',event => {
    if ( event.target.matches('.fa-bars') ){
      layoutStyle = listStyle
      getPageData(page)
      console.log('should be list')
    } else if ( event.target.matches('.fa-th') ){
      layoutStyle = cardStyle
      getPageData(page)
      console.log('should be card')
    }
  })


  function displayDataList (data) {
    let htmlContent = ''
    data.forEach(function (item, index) {
      // 新增：切換 layout style
      if ( layoutStyle === cardStyle ) {
        // 移除外層 class : col 改為 row，僅為改變排版方式
        document.getElementById('data-panel').classList.remove('col')
        document.getElementById('data-panel').classList.add('row')
        htmlContent += `
          <div class="col-sm-3">
            <div class="card mb-2">
              <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
              <div class="card-body movie-item-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <!-- "More" button -->
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
                <!-- favorite button --> 
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        `
      } else if ( layoutStyle === listStyle ) {
        // 移除外層 class : row 改為 col，僅為改變排版方式
        document.getElementById('data-panel').classList.remove('row')
        document.getElementById('data-panel').classList.add('col')
        htmlContent += `
          <div class="item">
            <div class="item__body">
              <div class="card-body movie-item-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <!-- "More" button -->
              <div class="item__footer">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
                <!-- favorite button --> 
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        `
      }
    })
    dataPanel.innerHTML = htmlContent
  }

  function showMovie (id) {
    // get elements
    const modalTitle = document.getElementById('show-movie-title')
    const modalImage = document.getElementById('show-movie-image')
    const modalDate = document.getElementById('show-movie-date')
    const modalDescription = document.getElementById('show-movie-description')

    // set request url
    const url = INDEX_URL + id
    console.log(url)

    // send request to show api
    axios.get(url).then(response => {
      const data = response.data.results
      console.log(data)

      // insert data into modal ui
      modalTitle.textContent = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = `${data.description}`
    })
  }

  function addFavoriteItem (id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      alert(`${movie.title} is already in your favorite list.`)
    } else {
      list.push(movie)
      alert(`Added ${movie.title} to your favorite list!`)
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }
  
    // listen to pagination click event
  pagination.addEventListener('click', event => {
    console.log(event.target.dataset.page)
    if (event.target.tagName === 'A') {
      getPageData(event.target.dataset.page)
    }
  })

  function getTotalPages (data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }

  function getPageData (pageNum, data) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    displayDataList(pageData)
  }
})()
