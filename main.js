//INDEX//
//Properties//
let books = [];
let index = 0;
let maxResults = 40;
let googleError = "Request error";
let loggedIn = false;
//End Of Properties//
//Classes//
class Book {
  id = "";   
  constructor(
    googleBookId,
    title,
    categories,
    authors,
    publishedDate,
    description,
    thumbnail,
    //imageLinks,
    smallThumbnail
  ) {
    this.googleBookId = googleBookId; 
    this.title = title;
    this.categories = categories;
    this.authors = authors;
    this.publishedDate = publishedDate;
    this.description = description;
    this.thumbnail = thumbnail;
    this.smallThumbnail = smallThumbnail;
    this.hasAlt = false;
  }
}
//End of Classes//
//Index Functions//
function getDataFromGoogleBooksAPI(queryParameter) {
  index = 0; //variavel que controla o livro actual
  $.get(
    `https://www.googleapis.com/books/v1/volumes?q=${queryParameter}&maxResults=${maxResults}&index=${index}`
  )
    .done((googleData) => {
      //metodo done, acerta a resulação da promessa
      if (googleData) {
        //se houver data (google data is a response)
        /* index += maxResults; */
        console.log(googleData);
        prepareData(googleData.items); //evoca prepareData, passando um array de items que é uma propriedade da resposta
      }
    })
    .fail((googleError) => {
      //se a resposta vier vazia entao faz log da mensage de erro
      console.log(googleError);
    });
}

function prepareData(googleData) {
  //admitindo que há resposta(linha 36), esta funçao é evocada e recebe o array de items
  for (const googleBook of googleData) {
    //iterar pelo array de items utilizando a variavel googleBook que representa o item actual em cada iteração

    console.log(googleBook);
    let hasAlt = true;
    let thumbnail = "LeatherCover.jpg";
    let smallThumbnail = "LeatherCover.jpg";
    if (googleBook.hasOwnProperty("volumeInfo")) {
      if (googleBook.volumeInfo.hasOwnProperty("imageLinks")) {
        if (googleBook.volumeInfo.imageLinks.hasOwnProperty("thumbnail")) {
          thumbnail = googleBook.volumeInfo.imageLinks.thumbnail;
          hasAlt = false;
        }
      }
    }

    if (googleBook.hasOwnProperty("volumeInfo")) {
      if (googleBook.volumeInfo.hasOwnProperty("imageLinks")) {
        if (googleBook.volumeInfo.imageLinks.hasOwnProperty("smallThumbnail")) {
          smallThumbnail = googleBook.volumeInfo.imageLinks.smallThumbnail;
          hasAlt = false;
        }
      }
    }

    let book = new Book( //cria uma nova instancia da classe Book, evoca o construtor por parametros, e passa'lhe como parametros o que está no livro iterado(googleBook)
      googleBook.id,    //book id
      googleBook.volumeInfo.title,
      googleBook.volumeInfo.categories,
      googleBook.volumeInfo.authors,
      googleBook.volumeInfo.publishedDate,
      googleBook.volumeInfo.description,
      thumbnail,
      smallThumbnail
    );

    books.push(book); //faz push da nova instancia de Book, para dentro do array de books
  }
  renderCard(books); // evoca a renderCard, passando como parametro o meu array de books, metodo que renderiza as cards
}


$("#search-btn").click(function () {
  let queryParam = $("#user-input").val();
  if (queryParam != null || queryParam != "") {
    books = [];
    getDataFromGoogleBooksAPI(queryParam);
  }
});

$("#disliked-book").click(function () {
  books.splice(index, 1); //sai do array de books,no index actual, na quantidade 1
  renderCard(books); //volta a fazer render da card, passando'lhe o mesmo array, sem o elemento removido(removed in place)
});

$("#liked-book").click(function () {
  //faz push para a api
  let insertedBookIndex = wishListBooks.push(books[index]) - 1; //faz push do meu livro no index actual para o array whishListBooks
 
  addBook(insertedBookIndex);

  index++; //incrementa o iterador, para que na proxima evocação de renderCard, o iterador corresponda ao proximo livro, e não ao actual(sendo o actual o que eu mandei para a whishListBooks)
  renderCard(books);
});

function renderCard(books) {
  //função que faz render das cards, recebendo como argumento o meu array books
  let googleBookId = "";
  let image; //variavel auxiliar para guardar o que está na propriedade thumbnail/smallThumbnail do book no index actual
  let title = "No Title Available";
  let authors = "No Author Available";
  let description = "No Description Available";
  let categories = "No Genre Available";
  let publishedDate = "No Published Date Available";

  $(".left").html(""); //limpa a section da imagem, para depois voltar a renderizar os dados no novo book
  $(".right").html(""); //limpa a section da descrição
  if (books[index].authors !== "") {
    authors = books[index].authors;
  }
  if (typeof books[index].title !== "undefined") {
    title = books[index].title;
  }
  if (typeof books[index].description !== "undefined") {
    description = books[index].description;
  }
  if (typeof books[index].categories !== "undefined") {
    categories = books[index].categories;
  }
  if (typeof books[index].publishedDate !== "undefined") {
    publishedDate = books[index].publishedDate;
  }
  if (typeof books[index].thumbnail !== "undefined") {
    //se no meu array de books, na posiçao actual, na propriedade do meu objecto chamada thumbnail, se for diferente de null, entao mostra a imagem que vem da api
    image = books[index].thumbnail;
    hasAlt = false;
  } else if (books[index].smallThumbnail !== "undefined") {
    image = books[index].smallThumbnail;
  } else {
    image = "LeatherCover.jpg";
  }
  if(typeof books[index].googleBookId !== "undefined") {
    googleBookId = books[index].googleBookId;
  }

  //renderização das sections
  $(".left").append(
    `   
        <img src="${image}" />          
    `
  );
  $(".right").append(
    `
    <div class="card-body">
          <p id="bookName" class="card-title" alt="">Title: ${title}</p>
          <p id="authors" alt="">Author: ${authors}</p>
         
          <p id="publishedDate" alt="">Date: ${publishedDate} </p>
          <p id="categories" alt="">Genre: ${categories}</p>
           <div class="description-scroll">
          <p id="description" alt=""> Description: 
            ${description}
          </p>  
          </div>
          <div class="buy-container">
         <a href="https://books.google.pt/books?id=${googleBookId}" id="link" class="btn buttons" target="_blank">
            Buy here
          </a>
          </div>
        </div>
      `
  );

  //animação da nav           (scroll é um evento)
  $(document).scroll(function () {
    //console.log($(window).scrollTop());
    let topAxis = $(window).scrollTop(); //window é o body, windom tem um metodo scrollTop(), que nos retorna a coordenada em Y do scroll
    if (topAxis >= 90) {
      $("nav").addClass("fixed");
      $("nav").removeClass("static");
    } else {
      // <=90
      $("nav").addClass("static");
      $("nav").removeClass("fixed");
    }
  });
}
$(document).ready(function () {
  getDataFromGoogleBooksAPI(null);
});
//End of Index Functions//

//WISHLIST//

//Properties//
let wishListBooks = [];
//End Of Properties//
//Classes//
//End of Classes//
//Wishlist Functions//
$("#wishlist-anchor").click(function () {
  // esconde a classcard-wrapper, mostra a tabela onclick na ancora whishlist
  renderWishlist(wishListBooks);
  $("#wishlist-space").removeClass("display-none");
  $("#card-wrapper").addClass("display-none");
});

function renderWishlist(wishListBooks) {
  //se houver livros na whishlist,itera pelo array e faz render da tabela com as propriedades escolhidas
  $(".clear-book").remove();
  if (wishListBooks.length) {
    wishListBooks.forEach((book) => {
      $("#wishlist-table").append(
        `
        
          <tr class="clear-book">
            <td> <button type="button" class="btn buttons btn-danger" onclick="removeBook(this)" value="${wishListBooks.indexOf(
              book
            )}"> Delete </button> </td>
          <td>${book.title}</td>
          <td>${book.authors}</td>
          <td>${book.publishedDate}</td>
        </tr>
        
      `
      );
    });
  }
}

function removeBook(removeBtn) {
  //remove livros da whishlist on button click
  console.log(removeBtn.val);
  let indexToRemove = removeBtn.value;
  deleteBookById(wishListBooks[indexToRemove]);
  wishListBooks.splice(indexToRemove, 1);
  renderWishlist(wishListBooks); //volta  fazer render ta tabela com os restantes livros
}

$("#wishlist-anchor").click(function () {
  $("#tinder-wrapper").addClass("d-none");
  $("#whishlist-wrapper").removeClass("d-none");
  displayBackToTopBtn();
});

$("#back-to-top").click(function () {
  $("#whishlist-wrapper").addClass("d-none");
  $("#tinder-wrapper").removeClass("d-none");
});

//End of Wishlist Functions//

//Scroll back to top button//
let btn = $("#back-to-top");
$("#back-to-top").click(function () {
  $("#whishlist-wrapper").addClass("d-none");
  $("#tinder-wrapper").removeClass("d-none");
  displayBackToTopBtn();
});

$(window).scroll(function () {
  if ($(window).scrollTop() > 300) {
    btn.addClass("show");
  } else {
    btn.removeClass("show");
  }
});

function displayBackToTopBtn() {
  if (!$("#whishlist-wrapper").hasClass("d-none")) {
    btn.addClass("show");
  } else {
    btn.removeClass("show");
  }
}

$("#logo").click(function () {
  $("#user-input").val("");
  $("#whishlist-wrapper").addClass("d-none");
  $("#tinder-wrapper").removeClass("d-none");
});

$("#logout").click(function () {
  $("#username-input").val("");
  $("#password-input").val("");
});

btn.on("click", function (e) {
  e.preventDefault();
  $("html, body").animate({ scrollTop: 0 }, "300");
});
//Scroll back to top button//

//Login Functions
